"use client";

import { useEffect, useMemo, useState } from "react";
import { ArtifactLang, artifactTitle, buildSrcDoc } from "./artifacts";
import { styles } from "@/components/ui/styles";

export default function ArtifactModal({
  lang,
  source,
  onClose,
}: {
  lang: ArtifactLang;
  source: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const srcDoc = useMemo(() => buildSrcDoc(lang, source), [lang, source]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function copy() {
    navigator.clipboard.writeText(source);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={styles.artifact.overlay} onClick={onClose}>
      <div className={styles.artifact.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.artifact.header}>
          <div className={styles.artifact.headerTitle}>{artifactTitle(lang, source)}</div>
          <div className={styles.artifact.tabRow}>
            <button
              onClick={() => setTab("preview")}
              className={styles.artifact.tab(tab === "preview")}
            >
              Preview
            </button>
            <button onClick={() => setTab("code")} className={styles.artifact.tab(tab === "code")}>
              Code
            </button>
          </div>
          <button onClick={copy} className={styles.artifact.copyBtn}>
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={onClose} className={styles.artifact.closeBtn}>
            ✕
          </button>
        </div>

        <div className={styles.artifact.body}>
          {tab === "preview" ? (
            // allow-scripts without allow-same-origin: generated JS runs in an
            // opaque origin and cannot reach the app's session or DOM.
            <iframe
              sandbox="allow-scripts"
              srcDoc={srcDoc}
              title="Artifact preview"
              className={styles.artifact.iframe}
            />
          ) : (
            <pre className={styles.artifact.codeScroll}>{source}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
