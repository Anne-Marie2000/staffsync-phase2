"use client";

/**
 * components/Navbar.js
 * Description: Top navigation bar. Shows different links depending on
 * whether a user is logged in and their role - Departments is hidden from
 * non-admins as a UI convenience (the middleware is what actually enforces
 * the restriction if someone navigates there directly).
 */

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="text-lg font-bold text-brand-600">
          StaffSync
        </Link>

        {status === "authenticated" && (
          <div className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <Link href="/dashboard" className="hover:text-brand-600">
              Dashboard
            </Link>
            <Link href="/employees" className="hover:text-brand-600">
              Employees
            </Link>
            {session.user.role === "admin" && (
              <Link href="/departments" className="hover:text-brand-600">
                Departments
              </Link>
            )}
            <Link href="/leave-requests" className="hover:text-brand-600">
              Leave Requests
            </Link>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
              {session.user.name} · {session.user.role}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
