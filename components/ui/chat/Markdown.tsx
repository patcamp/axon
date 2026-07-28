"use client";

import { isValidElement, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { asArtifactLang, findOpenFenceSource, isArtifact } from "./artifacts";
import ArtifactCard from "./ArtifactCard";

const staticComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-accent underline">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-hairline pl-3 text-muted last:mb-0">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => <h1 className="mb-2 text-base font-semibold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 text-base font-semibold">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 text-sm font-semibold">{children}</h3>,
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className || "");
    if (isBlock) {
      return (
        <code className={`${className ?? ""} block`}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-hairline px-2 py-1 text-xs font-medium text-muted">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border border-hairline px-2 py-1">{children}</td>,
};

// Pull the language and raw source back out of the <code> element that
// react-markdown hands the pre override.
function extractCodeChild(children: React.ReactNode): { lang?: string; raw: string } | null {
  const child = Array.isArray(children) ? children[0] : children;
  if (!isValidElement(child)) return null;
  const props = child.props as { className?: string; children?: React.ReactNode };
  const lang = /language-(\w+)/.exec(props.className ?? "")?.[1];
  const inner = props.children;
  const parts = Array.isArray(inner) ? inner : [inner];
  if (!parts.every((p) => typeof p === "string")) return null;
  return { lang, raw: (parts as string[]).join("").replace(/\n$/, "") };
}

export default function Markdown({
  content,
  streaming = false,
}: {
  content: string;
  streaming?: boolean;
}) {
  // While streaming, a trailing unclosed fence parses as a code block running
  // to end-of-document; its source lets the matching block render as a
  // "generating" artifact card instead of a growing wall of code.
  const openFenceSource = streaming ? findOpenFenceSource(content) : null;

  const components: Components = useMemo(
    () => ({
      ...staticComponents,
      pre: ({ children }) => {
        const extracted = extractCodeChild(children);
        if (extracted) {
          const artifactLang = asArtifactLang(extracted.lang);
          if (artifactLang) {
            const isOpenFence =
              openFenceSource !== null && extracted.raw.trim() === openFenceSource.trim();
            if (isOpenFence || isArtifact(extracted.lang, extracted.raw)) {
              return (
                <ArtifactCard lang={artifactLang} source={extracted.raw} generating={isOpenFence} />
              );
            }
          }
        }
        return (
          <pre className="mb-2 overflow-x-auto rounded-lg bg-black/30 p-3 font-mono text-[0.85em] last:mb-0">
            {children}
          </pre>
        );
      },
    }),
    [openFenceSource]
  );

  return (
    <div className="[&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
