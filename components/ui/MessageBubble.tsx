import Markdown from "./Markdown";
import { ChatMessage } from "./chatTypes";
import { styles } from "./styles";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? styles.chat.rowUser : styles.chat.rowAssistant}>
      <div className={isUser ? styles.chat.bubbleUser : styles.chat.bubbleAssistant}>
        {!isUser && message.content ? (
          <Markdown content={message.content} />
        ) : (
          message.content || <span className={styles.chat.cursor} />
        )}
      </div>
    </div>
  );
}
