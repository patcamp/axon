"use client";

import { useState } from "react";
import { signIn, signUp } from "@/components/api/auth";
import Button from "@/components/ui/common/Button";
import TextField from "@/components/ui/common/TextField";
import { styles } from "@/components/ui/styles";

export default function AuthScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === "signin") {
      const err = await signIn(email, password);
      if (err) setError(err);
    } else {
      const { error: err, needsConfirmation } = await signUp(email, password);
      if (err) setError(err);
      else if (needsConfirmation) setInfo("Check your email to confirm your account, then sign in.");
    }

    setSubmitting(false);
  }

  return (
    <main className={styles.auth.wrap}>
      <form onSubmit={handleSubmit} className={styles.auth.panel}>
        <div className={styles.auth.headerRow}>
          <span className={styles.sidebar.headerDot} />
          <h1 className={styles.sidebar.headerTitle}>Axon</h1>
        </div>

        <h2 className={styles.auth.heading}>
          {mode === "signin" ? "Sign in" : "Create an account"}
        </h2>

        <div className={styles.auth.fieldGroup}>
          <TextField
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <TextField
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>

        {error && <p className={styles.auth.error}>{error}</p>}
        {info && <p className={styles.auth.info}>{info}</p>}

        <Button type="submit" fullWidth disabled={submitting} className="mt-4">
          {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </Button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className={styles.auth.toggle}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}
