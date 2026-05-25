import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getOptionalUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-brand-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white">
            S
          </span>
          <span>Supplier OS</span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard">
              <Button size="sm">Open dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 text-center sm:py-24">
        <span className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-700">
          Build 1 · Foundation
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          The operating system for your supplier projects.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          Sign in, spin up a project, and keep every supplier engagement in one
          place. Built on a production-grade Next.js + Supabase stack so you
          can grow it however you need.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link href={user ? "/dashboard" : "/signup"}>
            <Button size="lg">
              {user ? "Open your dashboard" : "Create your account"}
            </Button>
          </Link>
          <Link href={user ? "/dashboard/projects" : "/login"}>
            <Button size="lg" variant="secondary">
              {user ? "View projects" : "I already have an account"}
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid w-full grid-cols-1 gap-6 text-left sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-card"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Supplier OS</span>
          <span>Next.js · Supabase · Tailwind</span>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Secure by default",
    body: "Row Level Security in Postgres makes sure each user only sees their own projects.",
  },
  {
    title: "Built to scale",
    body: "App Router + Server Actions give you a clean separation between UI and data without an extra API layer.",
  },
  {
    title: "Open foundation",
    body: "Standard Next.js, Tailwind, and Supabase — extend it with the modules your team needs.",
  },
];
