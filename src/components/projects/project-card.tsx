import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ProjectRow } from "@/types/database";

export function ProjectCard({ project }: { project: ProjectRow }) {
  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group block rounded-lg border border-slate-200 bg-white p-5 shadow-card transition-colors hover:border-brand-300"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-brand-700">
          {project.name}
        </h3>
        <Badge tone={project.status === "active" ? "success" : "muted"}>
          {project.status}
        </Badge>
      </div>
      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-slate-600">
        {project.description?.trim() || "No description yet."}
      </p>
      <p className="mt-4 text-xs text-slate-500">
        Updated {formatDate(project.updated_at)}
      </p>
    </Link>
  );
}
