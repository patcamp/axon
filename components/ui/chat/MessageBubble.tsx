import Markdown from "./Markdown";
import { ChatMessage } from "./chatTypes";
import { styles } from "@/components/ui/styles";

export default function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (!isUser && !message.content) {
    // Awaiting the first token: 3 pulsing dots, styled like an assistant bubble.
    return (
      <div className={styles.chat.rowAssistant}>
        <div className={styles.chat.thinkingBubble}>
          <div className="axon-dot" style={{ animationDelay: "0s" }} />
          <div className="axon-dot" style={{ animationDelay: "0.15s" }} />
          <div className="axon-dot" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className={isUser ? styles.chat.rowUser : styles.chat.rowAssistant}>
      <div className={isUser ? styles.chat.bubbleUser : styles.chat.bubbleAssistant}>
        {isUser ? message.content : <Markdown content={message.content} />}
      </div>
    </div>
  );
}
