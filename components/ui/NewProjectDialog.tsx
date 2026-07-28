"use client";

import { useState } from "react";
import { createProject } from "@/components/api/projects";
import { Project } from "@/lib/types";
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
    <div className={styles.dialog.overlay} onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className={styles.dialog.panel}
      >
        <div className={styles.dialog.title}>New project</div>

        <div className={styles.dialog.fieldGroup}>
          <label className={styles.dialog.label}>Name</label>
          <input
            autoFocus
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className={styles.dialog.input}
          />
        </div>

        <div className={styles.dialog.fieldGroup}>
          <label className={styles.dialog.label}>
            Description (optional) — standing instructions applied to every chat in this project
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            placeholder="What is this project about?"
            className={styles.dialog.textarea}
          />
        </div>

        {error && <p className={styles.dialog.error}>{error}</p>}

        <div className={styles.dialog.actions}>
          <div onClick={onClose} className={styles.dialog.cancelBtn}>
            Cancel
          </div>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className={styles.dialog.submitBtn(!submitting && !!name.trim())}
          >
            {submitting ? "Creating…" : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
}
