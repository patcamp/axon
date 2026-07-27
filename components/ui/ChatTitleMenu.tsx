"use client";

import { useState } from "react";
import { Conversation, Project } from "@/lib/types";
import { ChevronDownIcon, StarIcon, PencilIcon, FolderIcon, TrashIcon } from "./icons";
import { styles } from "./styles";

export default function ChatTitleMenu({
  conversation,
  projects,
  onRename,
  onToggleFavorite,
  onSetProject,
  onDelete,
}: {
  conversation: Conversation;
  projects: Project[];
  onRename: (title: string) => void;
  onToggleFavorite: () => void;
  onSetProject: (projectId: string | null) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showProjectSubmenu, setShowProjectSubmenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(conversation.title);

  function closeAll() {
    setOpen(false);
    setShowProjectSubmenu(false);
  }

  function commitRename() {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== conversation.title) onRename(trimmed);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={titleDraft}
        onChange={(e) => setTitleDraft(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitRename();
          if (e.key === "Escape") {
            setTitleDraft(conversation.title);
            setEditing(false);
          }
        }}
        className={styles.chat.titleInput}
      />
    );
  }

  return (
    <div className={styles.chat.titleWrap}>
      <button onClick={() => setOpen((o) => !o)} className={styles.chat.titleButton}>
        <span className="truncate">{conversation.title}</span>
        <ChevronDownIcon />
      </button>

      {open && (
        <>
          <div className={styles.menu.backdrop} onClick={closeAll} />
          <div className={[styles.menu.panel, styles.menu.panelBelow].join(" ")}>
            <button
              onClick={() => {
                onToggleFavorite();
                closeAll();
              }}
              className={styles.menu.item}
            >
              <StarIcon filled={conversation.is_favorite} />
              {conversation.is_favorite ? "Unstar" : "Star"}
            </button>

            <button
              onClick={() => {
                setTitleDraft(conversation.title);
                setEditing(true);
                setOpen(false);
              }}
              className={styles.menu.item}
            >
              <PencilIcon />
              Rename
            </button>

            <button onClick={() => setShowProjectSubmenu((s) => !s)} className={styles.menu.item}>
              <FolderIcon />
              Add to project
            </button>

            {showProjectSubmenu && (
              <div className={styles.menu.submenu}>
                {conversation.project_id && (
                  <button
                    onClick={() => {
                      onSetProject(null);
                      closeAll();
                    }}
                    className={styles.menu.item}
                  >
                    Remove from project
                  </button>
                )}
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSetProject(p.id);
                      closeAll();
                    }}
                    disabled={p.id === conversation.project_id}
                    className={styles.menu.item}
                  >
                    {p.name}
                  </button>
                ))}
                {projects.length === 0 && (
                  <p className={styles.sidebar.emptyText}>No projects yet.</p>
                )}
              </div>
            )}

            <button
              onClick={() => {
                onDelete();
                closeAll();
              }}
              className={styles.menu.itemDanger}
            >
              <TrashIcon />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
