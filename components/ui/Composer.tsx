"use client";

import Button from "./common/Button";
import { styles } from "./styles";

export default function Composer({
  value,
  onChange,
  onSend,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}) {
  return (
    <div className={styles.chat.composerWrap}>
      <div className={styles.chat.composerRow}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          placeholder="Message…  (Enter to send, Shift+Enter for a new line)"
          className={styles.chat.textarea}
        />
        <Button size="lg" onClick={onSend} disabled={disabled || !value.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
