"use client";

import { useEffect, useState } from "react";
import { getSession, onAuthChange, AuthSession } from "@/components/api/auth";
import { SessionContext } from "@/components/ui/session";
import { ThemeProvider } from "@/components/ui/theme";
import AuthScreen from "@/components/ui/AuthScreen";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
    return onAuthChange(setSession);
  }, []);

  if (loading) return null;
  if (!session) return <AuthScreen />;

  return (
    <SessionContext.Provider value={session}>
      <ThemeProvider>
        <div className="h-dvh">{children}</div>
      </ThemeProvider>
    </SessionContext.Provider>
  );
}
