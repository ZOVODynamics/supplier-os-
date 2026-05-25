import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { listProjects } from "@/server/projects";

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const projects = await listProjects();
  const active = projects.filter((p) => p.status === "active").length;
  const archived = projects.length - active;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome back
            {user.user_metadata?.full_name
              ? `, ${String(user.user_metadata.full_name).split(" ")[0]}`
              : ""}
          </h1>
          <p className="text-sm text-slate-500">
            Here&apos;s a snapshot of your supplier projects.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>New project</Button>
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total projects" value={projects.length} />
        <Stat label="Active" value={active} />
        <Stat label="Archived" value={archived} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent projects
          </h2>
          <Link
            href="/dashboard/projects"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            View all
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            You haven&apos;t created any projects yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {projects.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/dashboard/projects/${p.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-900">{p.name}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(p.updated_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
