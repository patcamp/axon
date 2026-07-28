"use client";

import { Project } from "@/lib/types";
import { FolderIcon } from "@/components/ui/icons";
import { styles } from "@/components/ui/styles";

export default function ProjectList({
  projects,
  onSelect,
  onDelete,
}: {
  projects: Project[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <>
      <div className={styles.sidebar.sectionLabel}>Projects</div>
      {projects.length === 0 && <p className={styles.sidebar.emptyText}>No projects yet.</p>}
      <div className={styles.sidebar.rowList}>
        {projects.map((p) => (
          <div key={p.id} onClick={() => onSelect(p.id)} className={styles.sidebar.row(false)}>
            <span className={styles.sidebar.rowLabelWithIcon}>
              <FolderIcon />
              {p.name}
            </span>
            {!p.is_builtin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(p.id);
                }}
                className={styles.sidebar.rowDelete}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
