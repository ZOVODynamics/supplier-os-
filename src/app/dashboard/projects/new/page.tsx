import Link from "next/link";
import type { Metadata } from "next";

import { CreateProjectForm } from "@/components/projects/create-project-form";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/projects"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← Back to projects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          New project
        </h1>
        <p className="text-sm text-slate-500">
          Give your project a clear name and a short description.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-card">
        <CreateProjectForm />
      </div>
    </div>
  );
}
