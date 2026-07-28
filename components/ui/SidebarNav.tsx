"use client";

import { ChatIcon, FolderIcon } from "./icons";
import { styles } from "./styles";

export type SidebarView = "chats" | "projects";

export default function SidebarNav({
  view,
  onSelectChats,
  onSelectProjects,
}: {
  view: SidebarView;
  onSelectChats: () => void;
  onSelectProjects: () => void;
}) {
  return (
    <nav className={styles.sidebar.nav}>
      <button onClick={onSelectChats} className={styles.sidebar.navItem(view === "chats")}>
        <ChatIcon className="text-muted" />
        Chats
      </button>
      <button onClick={onSelectProjects} className={styles.sidebar.navItem(view === "projects")}>
        <FolderIcon className="text-muted" />
        Projects
      </button>
    </nav>
  );
}
