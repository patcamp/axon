"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AccessToken } from "@/lib/types";
import { generateAndStoreToken, listTokens, deleteToken } from "@/components/api/tokens";
import Button from "@/components/ui/common/Button";
import { styles } from "@/components/ui/styles";

export default function CodePage() {
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [origin, setOrigin] = useState("");
  const [originCopied, setOriginCopied] = useState(false);

  useEffect(() => {
    refreshTokens();
    setOrigin(window.location.origin);
  }, []);

  async function refreshTokens() {
    const { data } = await listTokens();
    setTokens(data);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setCopied(false);
    const { token, error: err } = await generateAndStoreToken();
    setGenerating(false);
    if (err) {
      setError(err);
      return;
    }
    setNewToken(token);
    refreshTokens();
  }

  async function handleCopy() {
    if (!newToken) return;
    await navigator.clipboard.writeText(newToken);
    setCopied(true);
  }

  async function handleRevoke(id: string) {
    await deleteToken(id);
    refreshTokens();
  }

  async function handleCopyOrigin() {
    await navigator.clipboard.writeText(origin);
    setOriginCopied(true);
  }

  return (
    <div className={styles.code.page}>
      <Link href="/" className={styles.code.backLink}>
        ← Back to chat
      </Link>

      <h1 className={styles.code.heading}>Code</h1>
      <p className={styles.code.subheading}>
        Connect the Axon VS Code extension to this account using a personal access token.
      </p>

      <div className={styles.code.card}>
        <h2 className={styles.code.cardTitle}>Access tokens</h2>
        <p className={styles.code.cardBody}>
          Paste a token into the extension's settings so it can reach your account. Tokens are
          shown once at creation — if you lose one, revoke it and generate a new one.
        </p>

        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating…" : "Generate access token"}
        </Button>

        {error && <p className={styles.code.error}>{error}</p>}

        {newToken && (
          <div className={styles.code.tokenBox}>
            <span className={styles.code.tokenValue}>{newToken}</span>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
        {newToken && (
          <p className={styles.code.tokenWarning}>
            This is the only time this token will be shown — copy it now.
          </p>
        )}

        <div className={`${styles.code.list} mt-6`}>
          {tokens.length === 0 && <p className={styles.code.emptyText}>No tokens yet.</p>}
          {tokens.map((t) => (
            <div key={t.id} className={styles.code.listRow}>
              <div>
                <div>{t.name}</div>
                <div className={styles.code.listMeta}>
                  Created {new Date(t.created_at).toLocaleDateString()}
                  {t.last_used_at &&
                    ` · Last used ${new Date(t.last_used_at).toLocaleDateString()}`}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRevoke(t.id)}>
                Revoke
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.code.card}>
        <h2 className={styles.code.cardTitle}>VS Code extension</h2>
        <p className={styles.code.cardBody}>
          Chat with your codebase from VS Code — edits are applied automatically, with a changelog
          and per-turn undo.
        </p>

        <a
          href="/downloads/axon-assistant.vsix"
          download
          className={[styles.button.base, styles.button.variant.outline, styles.button.size.md].join(
            " "
          )}
        >
          Download extension (.vsix)
        </a>

        <ol className={`${styles.code.stepList} mt-6`}>
          <li>
            Open the Command Palette in VS Code and run{" "}
            <strong>Extensions: Install from VSIX…</strong>, then select the downloaded file.
          </li>
          <li>
            Open Settings and search for <strong>Axon</strong>.
          </li>
          <li>
            Set <strong>axon.backendUrl</strong> to this deployment's URL:
            <div className={`${styles.code.originBox} mt-2`}>
              <span className={styles.code.tokenValue}>{origin}</span>
              <Button variant="outline" size="sm" onClick={handleCopyOrigin}>
                {originCopied ? "Copied" : "Copy"}
              </Button>
            </div>
          </li>
          <li>
            Set <strong>axon.token</strong> to a token generated above.
          </li>
          <li>
            Run <strong>Axon: Open Assistant</strong> from the Command Palette.
          </li>
        </ol>
      </div>
    </div>
  );
}
