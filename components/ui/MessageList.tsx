"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./chatTypes";
import MessageBubble from "./MessageBubble";
import { styles } from "./styles";

export default function MessageList({ messages }: { messages: ChatMessage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  return (
    <div ref={scrollRef} className={styles.chat.scrollArea}>
      <div className={styles.chat.messagesInner}>
        {messages.length === 0 && (
          <div className={styles.chat.emptyState}>Ask anything to get started.</div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
      </div>
    </div>
  );
}
