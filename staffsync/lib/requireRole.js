/**
 * lib/requireRole.js
 * Description: Small helper used at the top of API route handlers to check
 * that a request comes from a logged-in user, and optionally that the
 * user's role is in an allowed list. Centralizing this logic avoids
 * repeating the same session-check boilerplate in every route file.
 * Inputs: allowedRoles - array of role strings that may proceed (omit to
 * only require "logged in", any role).
 * Output: { session, error } - error is a NextResponse to return early, or
 * null if the caller is authorized.
 */

import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";

export async function requireRole(allowedRoles = null) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return {
      session,
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }

  return { session, error: null };
}
