/**
 * middleware.js
 * Description: Runs before matched requests reach a page and enforces two
 * access levels: (1) any page under a protected path requires a logged-in
 * session, and (2) admin-only pages additionally require role === "admin".
 * Employees who try to reach an admin page are redirected to /dashboard
 * rather than allowed through, which is the actual authorization check -
 * the UI hiding buttons is only a convenience, this middleware is the
 * enforcement point.
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_ONLY_PREFIXES = ["/departments"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) =>
      pathname.startsWith(p)
    );

    if (isAdminOnly && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Returning true means "let withAuth's inner middleware run";
      // returning false redirects unauthenticated users to the login page.
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employees/:path*",
    "/departments/:path*",
    "/leave-requests/:path*",
  ],
};
