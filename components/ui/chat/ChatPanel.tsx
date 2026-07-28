import { Conversation, Project } from "@/lib/types";
import { ChatMessage } from "./chatTypes";
import MessageList from "./MessageList";
import Composer from "./Composer";
import ChatTitleMenu from "./ChatTitleMenu";
import ProjectDetail from "@/components/ui/projects/ProjectDetail";
import { MenuIcon } from "@/components/ui/icons";
import { styles } from "@/components/ui/styles";

export default function ChatPanel({
  activeConversation,
  activeProject,
  viewedProject,
  onBackToProjects,
  projects,
  isStreaming,
  messages,
  input,
  onInputChange,
  onSend,
  onOpenMenu,
  onRenameConversation,
  onToggleFavorite,
  onSetConversationProject,
  onDeleteConversation,
}: {
  activeConversation: Conversation | null;
  activeProject: Project | null;
  viewedProject: Project | null;
  onBackToProjects: () => void;
  projects: Project[];
  isStreaming: boolean;
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onOpenMenu: () => void;
  onRenameConversation: (id: string, title: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onSetConversationProject: (id: string, projectId: string | null) => void;
  onDeleteConversation: (id: string) => void;
}) {
  const headerTitle = activeConversation
    ? activeConversation.title
    : viewedProject
      ? viewedProject.name
      : "New chat";

  return (
    <main className={styles.chat.main}>
      <header className={styles.chat.header}>
        <button onClick={onOpenMenu} className={styles.chat.menuButton}>
          <MenuIcon />
        </button>

        {activeConversation ? (
          <ChatTitleMenu
            conversation={activeConversation}
            projects={projects}
            onRename={(title) => onRenameConversation(activeConversation.id, title)}
            onToggleFavorite={() =>
              onToggleFavorite(activeConversation.id, activeConversation.is_favorite)
            }
            onSetProject={(projectId) => onSetConversationProject(activeConversation.id, projectId)}
            onDelete={() => onDeleteConversation(activeConversation.id)}
          />
        ) : (
          <div className={styles.chat.headerTitle}>{headerTitle}</div>
        )}

        {activeProject && <span className={styles.chat.projectBadge}>{activeProject.name}</span>}

        <span className={styles.chat.statusWrap}>
          <span className={styles.chat.statusDot} />
          {isStreaming ? "thinking…" : "ready"}
        </span>
      </header>

      {viewedProject ? (
        <ProjectDetail project={viewedProject} onBack={onBackToProjects} />
      ) : !activeConversation ? (
        <div className={styles.chat.emptyWrap}>
          <div className={styles.chat.emptyHeading}>What can I help with?</div>
          <div className={styles.chat.emptyComposerOuter}>
            <Composer
              value={input}
              onChange={onInputChange}
              onSend={onSend}
              disabled={isStreaming}
              barClassName={styles.chat.emptyComposerInner}
            />
          </div>
        </div>
      ) : (
        <>
          <MessageList messages={messages} isStreaming={isStreaming} />
          <div className={styles.chat.composerWrap}>
            <Composer
              value={input}
              onChange={onInputChange}
              onSend={onSend}
              disabled={isStreaming}
              barClassName={styles.chat.composerInner}
            />
          </div>
        </>
      )}
    </main>
  );
}
