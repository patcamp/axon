"use client";

import { useState } from "react";
import { createProject } from "@/components/api/projects";
import { Project } from "@/lib/types";
import Button from "@/components/ui/common/Button";
import TextField from "@/components/ui/common/TextField";
import { styles } from "@/components/ui/styles";

export default function NewProjectDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (project: Project) => void;
}) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);

    const { data, error: err } = await createProject(name.trim(), instructions.trim());
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    if (data) onCreated(data);
  }

  return (
    <div className={styles.dialog.overlay}>
      <form onSubmit={handleSubmit} className={styles.dialog.panel}>
        <h2 className={styles.dialog.title}>New project</h2>

        <label className={styles.dialog.label}>Name</label>
        <TextField
          autoFocus
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Trip planning"
          className="mb-4"
        />

        <label className={styles.dialog.label}>
          Standing instructions — applied to every chat in this project
        </label>
        <textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={6}
          placeholder="e.g. Always answer in metric units. Keep responses under 100 words."
          className={styles.dialog.textarea}
        />

        {error && <p className={styles.dialog.error}>{error}</p>}

        <div className={styles.dialog.actions}>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitting || !name.trim()}>
            {submitting ? "Creating…" : "Create project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
