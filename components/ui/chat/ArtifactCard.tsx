"use client";

import { useState } from "react";
import { ArtifactLang, artifactTitle } from "./artifacts";
import ArtifactModal from "./ArtifactModal";
import { CodeIcon } from "@/components/ui/icons";
import { styles } from "@/components/ui/styles";

function formatMeta(lang: ArtifactLang, source: string, generating: boolean) {
  if (generating) return "Generating…";
  const label = lang === "jsx" ? "React" : "HTML";
  const kb = source.length / 1024;
  return `${label} · ${kb >= 1 ? `${kb.toFixed(1)} KB` : `${source.split("\n").length} lines`} · Click to preview`;
}

export default function ArtifactCard({
  lang,
  source,
  generating,
}: {
  lang: ArtifactLang;
  source: string;
  generating: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => !generating && setOpen(true)}
        disabled={generating}
        className={styles.artifact.card(generating)}
      >
        <span className={styles.artifact.cardIcon}>
          <CodeIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className={[styles.artifact.cardTitle, "block"].join(" ")}>
            {artifactTitle(lang, source)}
          </span>
          <span className={styles.artifact.cardMeta}>
            {formatMeta(lang, source, generating)}
          </span>
        </span>
        {generating && (
          <span className="flex gap-1">
            <span className="axon-dot" />
            <span className="axon-dot" />
            <span className="axon-dot" />
          </span>
        )}
      </button>

      {open && <ArtifactModal lang={lang} source={source} onClose={() => setOpen(false)} />}
    </>
  );
}
