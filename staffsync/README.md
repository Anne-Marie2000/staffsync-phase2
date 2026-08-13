# StaffSync — Employee Management System

CPRG-306-B Web Development 2 — Phase 2 (Development & Implementation)
Team: Ziya Mahesaniya, Sagal Mohamed, Anne-Marie Dorscht

## Tech Stack (updated for Phase 2)

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Frontend       | React (via Next.js App Router), Tailwind CSS |
| Backend/API    | Next.js Route Handlers (REST, async) |
| Auth           | NextAuth (Credentials provider, JWT sessions, role-based) |
| Database       | MongoDB (Mongoose ODM)              |

> **Note on architecture change:** Phase 1 originally proposed a separate
> Express API with PostgreSQL/Prisma. Phase 2's requirements call for
> MongoDB, so the backend now uses Next.js API routes talking to MongoDB
> via Mongoose, with NextAuth wired directly into the same app. The
> three-tier separation (presentation / application logic / data) is
> preserved — presentation is the React pages, application logic is the
> `app/api/*` route handlers, and data persistence is MongoDB.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a MongoDB Atlas cluster** (free tier is enough) and get its
   connection string.

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in `MONGODB_URI` and generate a `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Seed the database** with an admin and employee test account:
   ```bash
   npm run seed
   ```
   This creates:
   - Admin login: `admin@staffsync.test` / `Admin1234!`
   - Employee login: `employee@staffsync.test` / `Employee1234!`

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 — you'll be redirected to `/login`.

## Project Structure

```
app/
  api/
    auth/[...nextauth]/   NextAuth handler (login/logout/session)
    auth/signup/           Public sign-up endpoint
    employees/              GET (list/search/filter), POST (create)
    employees/[id]/         GET, PUT, DELETE
    departments/             GET (list w/ headcount), POST (create)
    departments/[id]/       PUT, DELETE
    leave-requests/         GET (role-scoped), POST (submit)
    leave-requests/[id]/   PUT (approve/reject), DELETE (withdraw)
  dashboard/               Summary stats + recent employees + dept chart
  employees/                Directory: search, filter, add (admin)
  employees/[id]/          Profile view/edit
  departments/               Admin-only department management
  leave-requests/            Submit (employee) / approve-reject (admin)
  login/, signup/            Auth pages
components/                 Reusable React components (Navbar, tables, forms)
lib/                        mongodb.js, authOptions.js, requireRole.js
models/                     Mongoose schemas: User, Employee, Department, LeaveRequest
middleware.js                Route protection (auth + admin-only pages)
scripts/seed.js              Test data bootstrap script
```

## Access Levels

- **Employee** (default role on sign-up): view/search employee directory,
  view & edit their own profile fields, submit and view their own leave
  requests.
- **Admin**: everything an employee can do, plus create/delete employees,
  manage departments, and approve/reject any leave request.

Authorization is enforced in two places for defense in depth:
1. `middleware.js` blocks page navigation to admin-only routes.
2. Every API route re-checks the session role server-side before touching
   the database (see `lib/requireRole.js`), since middleware alone doesn't
   protect a route if it's called directly.

## Concurrency

All API routes and the Mongoose connection helper (`lib/mongodb.js`) use
`async`/`await` throughout, and the connection is cached across requests so
multiple simultaneous requests don't each open a new database connection.
