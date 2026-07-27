"use client";

import { useState } from "react";
import { AuthSession } from "@/components/api/auth";
import { styles } from "./styles";

export default function AccountFooter({
  session,
  onSignOut,
}: {
  session: AuthSession;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const initials = session.user.email?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <div className="relative">
      {open && <div className={styles.menu.backdrop} onClick={() => setOpen(false)} />}

      <button onClick={() => setOpen((o) => !o)} className={styles.sidebar.footer}>
        <span className={styles.sidebar.avatar}>{initials}</span>
        <span className={styles.sidebar.email}>{session.user.email}</span>
      </button>

      {open && (
        <div className={[styles.menu.panel, styles.menu.panelAbove].join(" ")}>
          <p className={styles.menu.header}>{session.user.email}</p>
          <div className={styles.menu.divider} />
          <button
            onClick={() => {
              onSignOut();
              setOpen(false);
            }}
            className={styles.menu.item}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
