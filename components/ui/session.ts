"use client";

import { createContext, useContext } from "react";
import { AuthSession } from "@/components/api/auth";

export const SessionContext = createContext<AuthSession | null>(null);

export function useSession(): AuthSession | null {
  return useContext(SessionContext);
}
