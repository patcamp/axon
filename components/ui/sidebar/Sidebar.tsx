"use client";

import { Conversation, Project } from "@/lib/types";
import { AuthSession } from "@/components/api/auth";
import SidebarHeader from "./SidebarHeader";
import SidebarNav, { SidebarView } from "./SidebarNav";
import ProjectList from "@/components/ui/projects/ProjectList";
import ConversationList from "./ConversationList";
import AccountFooter from "./AccountFooter";
import Button from "@/components/ui/common/Button";
import { PlusIcon } from "@/components/ui/icons";
import { styles } from "@/components/ui/styles";

export default function Sidebar({
  isOpen,
  onClose,
  session,
  sidebarView,
  sortedProjects,
  selectedProject,
  conversations,
  favoriteConversations,
  activeId,
  showingProjectList,
  onSelectChatsView,
  onSelectProjectsView,
  onNewChat,
  onNewProject,
  onSelectProject,
  onDeleteProject,
  onBackFromProject,
  onSelectConversation,
  onDeleteConversation,
  onSignOut,
}: {
  isOpen: boolean;
  onClose: () => void;
  session: AuthSession | null;
  sidebarView: SidebarView;
  sortedProjects: Project[];
  selectedProject: Project | null;
  conversations: Conversation[];
  favoriteConversations: Conversation[];
  activeId: string | null;
  showingProjectList: boolean;
  onSelectChatsView: () => void;
  onSelectProjectsView: () => void;
  onNewChat: () => void;
  onNewProject: () => void;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onBackFromProject: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onSignOut: () => void;
}) {
  return (
    <>
      {isOpen && <div className={styles.sidebar.backdrop} onClick={onClose} />}
      <aside className={styles.sidebar.container(isOpen)}>
        <SidebarHeader onClose={onClose} />

        <div className={styles.sidebar.newButtonWrap}>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={showingProjectList ? onNewProject : onNewChat}
          >
            <PlusIcon />
            {showingProjectList ? "New project" : "New chat"}
          </Button>
        </div>

        <SidebarNav
          view={sidebarView}
          onSelectChats={onSelectChatsView}
          onSelectProjects={onSelectProjectsView}
        />

        <div className={styles.sidebar.listSection}>
          {showingProjectList && (
            <ProjectList
              projects={sortedProjects}
              onSelect={onSelectProject}
              onDelete={onDeleteProject}
            />
          )}

          {(sidebarView === "chats" || selectedProject) && (
            <ConversationList
              conversations={conversations}
              favorites={sidebarView === "chats" ? favoriteConversations : []}
              activeId={activeId}
              selectedProject={selectedProject}
              onSelect={onSelectConversation}
              onDelete={onDeleteConversation}
              onBack={onBackFromProject}
            />
          )}
        </div>

        {session && <AccountFooter session={session} onSignOut={onSignOut} />}
      </aside>
    </>
  );
}
