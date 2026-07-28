"use client";

import { Conversation, Project } from "@/lib/types";
import { BackIcon, StarIcon } from "@/components/ui/icons";
import { styles } from "@/components/ui/styles";

export default function ConversationList({
  conversations,
  favorites = [],
  activeId,
  selectedProject,
  onSelect,
  onDelete,
  onBack,
}: {
  conversations: Conversation[];
  favorites?: Conversation[];
  activeId: string | null;
  selectedProject: Project | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      {selectedProject && (
        <button onClick={onBack} className={styles.sidebar.backButton}>
          <BackIcon />
          {selectedProject.name}
        </button>
      )}

      {favorites.length > 0 && (
        <>
          <div className={styles.sidebar.sectionLabel}>Favorites</div>
          <div className={[styles.sidebar.rowList, "mb-3"].join(" ")}>
            {favorites.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={styles.sidebar.row(c.id === activeId)}
              >
                <span className={styles.sidebar.rowLabelWithIcon}>
                  <StarIcon filled />
                  <span className="truncate">{c.title}</span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                  className={styles.sidebar.rowDelete}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className={styles.sidebar.sectionLabel}>Recents</div>
      <div className={styles.sidebar.rowList}>
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={styles.sidebar.row(c.id === activeId)}
          >
            <span className={styles.sidebar.rowLabel}>{c.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              className={styles.sidebar.rowDelete}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
