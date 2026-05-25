import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { EditProjectForm } from "@/components/projects/edit-project-form";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getProject } from "@/server/projects";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const project = await getProject(params.id);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/projects"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Back to projects
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">
            {project.name}
          </h1>
          <Badge tone={project.status === "active" ? "success" : "muted"}>
            {project.status}
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          Created {formatDate(project.created_at)} · Updated{" "}
          {formatDate(project.updated_at)}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-slate-900">
          Project details
        </h2>
        <p className="text-xs text-slate-500">
          Update the project name, description, or status.
        </p>
        <div className="mt-5">
          <EditProjectForm project={project} />
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-card">
        <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-xs text-slate-500">
          Deleting a project is permanent and cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteProjectButton id={project.id} />
        </div>
      </div>
    </div>
  );
}
