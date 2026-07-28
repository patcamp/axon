export type ArtifactLang = "html" | "jsx";

const ARTIFACT_LANGS = ["html", "jsx"] as const;

export function asArtifactLang(lang: string | undefined): ArtifactLang | null {
  return ARTIFACT_LANGS.includes(lang as ArtifactLang) ? (lang as ArtifactLang) : null;
}

// Small inline snippets (a few lines of html in an explanation) should stay
// ordinary code blocks; only substantial documents earn a preview card.
export function isArtifact(lang: string | undefined, source: string): boolean {
  if (!asArtifactLang(lang)) return false;
  return (
    source.length >= 400 ||
    source.split("\n").length >= 12 ||
    /<!DOCTYPE|<html/i.test(source)
  );
}

export function artifactTitle(lang: ArtifactLang, source: string): string {
  const title = /<title[^>]*>([^<]+)<\/title>/i.exec(source)?.[1]?.trim();
  if (title) return title;
  const h1 = /<h1[^>]*>([^<]+)<\/h1>/i.exec(source)?.[1]?.trim();
  if (h1) return h1;
  return lang === "jsx" ? "React component" : "Interactive preview";
}

const HTML_SHELL = (body: string) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${body}</body></html>`;

export function buildSrcDoc(lang: ArtifactLang, source: string): string {
  if (lang === "html") {
    return /^\s*(<!DOCTYPE|<html)/i.test(source) ? source : HTML_SHELL(source);
  }

  // jsx: React 18 UMD + Babel standalone inside the sandboxed frame. The
  // </script> escape stops model output from terminating the babel tag.
  const escaped = source.replace(/<\/script/gi, "<\\/script");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
<style>body{margin:0;font-family:system-ui,sans-serif}#__err{color:#b91c1c;font-family:monospace;font-size:13px;padding:16px;white-space:pre-wrap}</style>
</head>
<body>
<div id="root"></div>
<script>
window.addEventListener("error", function (e) {
  var el = document.getElementById("__err") || document.body.appendChild(Object.assign(document.createElement("pre"), { id: "__err" }));
  el.textContent = String(e.message || e.error);
});
</script>
<script type="text/babel" data-presets="react">
${escaped}
if (!document.getElementById("root").hasChildNodes()) {
  var __C = typeof App !== "undefined" ? App : typeof Component !== "undefined" ? Component : null;
  if (__C) ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(__C));
}
</script>
</body>
</html>`;
}

// While a response is still streaming, the trailing code fence may not be
// closed yet. An odd number of fence lines means the last one is open;
// return the source after it so the matching block can render as
// "generating". CommonMark allows ``` or ~~~ with up to 3 spaces of indent.
export function findOpenFenceSource(content: string): string | null {
  const fenceRe = /^ {0,3}(```|~~~)/gm;
  let count = 0;
  let lastIndex = -1;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(content))) {
    count++;
    lastIndex = m.index;
  }
  if (count % 2 === 0 || lastIndex === -1) return null;
  const afterFence = content.slice(lastIndex);
  const newline = afterFence.indexOf("\n");
  return newline === -1 ? "" : afterFence.slice(newline + 1);
}
