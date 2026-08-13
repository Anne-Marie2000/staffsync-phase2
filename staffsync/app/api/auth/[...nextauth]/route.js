/**
 * app/api/auth/[...nextauth]/route.js
 * Description: Wires up NextAuth's built-in handler using our shared
 * authOptions. This single route handles login, logout, session, and CSRF
 * endpoints (e.g. /api/auth/signin, /api/auth/session).
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
