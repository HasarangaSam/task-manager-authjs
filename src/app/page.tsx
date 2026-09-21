import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
              TM
            </div>
            <span className="text-base font-bold text-slate-900">
              Task Manager
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline-block text-sm text-slate-600">
                  {user.name || user.email}
                  <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {user.role}
                  </span>
                </span>
                <Link
                  href={isAdmin ? "/admin" : "/dashboard"}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {isAdmin ? "Admin Panel" : "Dashboard"} &rarr;
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900 hover:bg-slate-100"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm mb-6">
            Next.js 16 • Auth.js v5 • MongoDB
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Task management with production-ready authentication
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-7 text-slate-600">
            A full-stack application demonstrating credentials login, Google OAuth,
            active session invalidation on password reset, role-based access control,
            and an administrative panel.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go to {isAdmin ? "Admin Panel" : "Dashboard"} &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Feature Summary Cards */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Architecture Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Authentication
                </div>
                <div className="mt-2 text-base font-bold text-slate-900">
                  Dual Providers
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Email and password authentication with bcrypt 12-round salt hashing, plus one-click Google OAuth via Auth.js.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Session Security
                </div>
                <div className="mt-2 text-base font-bold text-slate-900">
                  Session Invalidation
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Tracks a database `sessionVersion` on each JWT check, immediately revoking active sessions across devices upon password reset.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Authorization
                </div>
                <div className="mt-2 text-base font-bold text-slate-900">
                  Role-Based Access
                </div>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Strict USER and ADMIN separation. Admins have a dedicated dashboard to moderate users and platform tasks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Capabilities */}
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Implemented Features
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Secure Password Reset</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Cryptographic 32-byte tokens hashed with SHA-256 before storage. 15-minute TTL index cleans up expired tokens in MongoDB.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Server-Bound Ownership</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                All task CRUD operations extract user identity directly from the verified session, preventing unauthorized data modification.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Task Lifecycle Management</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Create, update, search, filter by status (To Do, In Progress, Completed), and sort tasks by priority.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Admin Control Panel</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                View platform statistics, promote or demote user roles, and delete user accounts with cascading task cleanup.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">Enumeration Protection</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Password recovery returns generic success messages to prevent attackers from discovering registered user emails.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-900">MongoDB Adapter</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Official adapter handles OAuth accounts and persistent sessions while coexisting with Mongoose-managed data models.
              </p>
            </div>
          </div>
        </section>

        {/* Tech Stack Strip */}
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
              Technologies Used
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                "Next.js 16 (App Router)",
                "Auth.js v5",
                "MongoDB",
                "Mongoose",
                "TypeScript",
                "Tailwind CSS v4",
                "Zod",
                "bcrypt",
                "Nodemailer",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>Task Manager — Built with Next.js 16 & Auth.js v5</div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-800 transition">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-slate-800 transition">
              Register
            </Link>
            <Link href="/forgot-password" className="hover:text-slate-800 transition">
              Reset password
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
