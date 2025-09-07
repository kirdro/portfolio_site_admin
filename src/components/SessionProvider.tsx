"use client";

import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

// Обертка для SessionProvider из next-auth
export function AuthProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}