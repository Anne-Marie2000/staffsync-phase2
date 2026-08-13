"use client";

/**
 * app/providers.js
 * Description: Wraps the app in NextAuth's SessionProvider so any client
 * component can call useSession()/signIn()/signOut() from "next-auth/react".
 */

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
