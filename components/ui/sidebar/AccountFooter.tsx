"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthSession } from "@/components/api/auth";
import { styles } from "@/components/ui/styles";

export default function AccountFooter({
  session,
  onSignOut,
}: {
  session: AuthSession;
  onSignOut: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const initials = session.user.email?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <div className={styles.sidebar.footerWrap}>
      {open && <div className={styles.menu.backdrop} onClick={() => setOpen(false)} />}

      {open && (
        <div className={[styles.menu.panel, styles.menu.panelAbove, "w-full"].join(" ")}>
          <p className={styles.menu.header}>{session.user.email}</p>
          <div className={styles.menu.divider} />
          <button
            onClick={() => {
              router.push("/settings");
              setOpen(false);
            }}
            className={styles.menu.item}
          >
            Settings
          </button>
          <button
            onClick={() => {
              onSignOut();
              setOpen(false);
            }}
            className={styles.menu.itemDanger}
          >
            Sign out
          </button>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} className={styles.sidebar.footerRow}>
        <span className={styles.sidebar.avatar}>{initials}</span>
        <span className={styles.sidebar.email}>{session.user.email}</span>
      </button>
    </div>
  );
}
