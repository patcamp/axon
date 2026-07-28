"use client";

import { styles } from "./styles";

export default function Composer({
  value,
  onChange,
  onSend,
  disabled,
  barClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  // The bordered/rounded bar look differs slightly between the empty
  // state and the pinned conversation composer — see styles.chat.
  barClassName: string;
}) {
  const hasText = value.trim().length > 0;

  return (
    <div className={barClassName}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        rows={3}
        placeholder="Message Axon..."
        className={styles.chat.textarea}
      />
      <button
        onClick={onSend}
        disabled={disabled || !hasText}
        className={styles.chat.sendBtn(hasText && !disabled)}
      >
        Send
      </button>
    </div>
  );
}
