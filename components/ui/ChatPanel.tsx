import { Conversation, Project } from "@/lib/types";
import { ChatMessage } from "./chatTypes";
import MessageList from "./MessageList";
import Composer from "./Composer";
import ChatTitleMenu from "./ChatTitleMenu";
import { MenuIcon } from "./icons";
import { styles } from "./styles";

export default function ChatPanel({
  activeConversation,
  activeProject,
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
  return (
    <main className={styles.chat.main}>
      <header className={styles.chat.header}>
        <button onClick={onOpenMenu} className={styles.chat.menuButton}>
          <MenuIcon />
        </button>

        {activeConversation && (
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
        )}

        {activeProject && <span className={styles.chat.projectBadge}>{activeProject.name}</span>}
        <span className={styles.chat.status}>{isStreaming ? "thinking…" : "ready"}</span>
      </header>

      <MessageList messages={messages} />

      <Composer value={input} onChange={onInputChange} onSend={onSend} disabled={isStreaming} />
    </main>
  );
}
