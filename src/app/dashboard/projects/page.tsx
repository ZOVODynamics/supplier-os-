import Link from "next/link";
import type { Metadata } from "next";

import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { listProjects } from "@/server/projects";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500">
            {projects.length} {projects.length === 1 ? "project" : "projects"} in
            total.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>New project</Button>
        </Link>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking suppliers and engagements."
          action={
            <Link href="/dashboard/projects/new">
              <Button>Create project</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
