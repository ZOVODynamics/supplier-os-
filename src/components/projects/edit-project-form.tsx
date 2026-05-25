"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProject, type ActionResult } from "@/server/projects";
import type { ProjectRow } from "@/types/database";

const initialState: ActionResult | null = null;

export function EditProjectForm({ project }: { project: ProjectRow }) {
  const [state, formAction] = useFormState(updateProject, initialState);
  const [saved, setSaved] = useState(false);
  const fieldErrors = state && !state.ok ? state.fieldErrors ?? {} : {};

  useEffect(() => {
    if (state?.ok) {
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={project.id} />
      <div className="space-y-1">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={project.name}
        />
        {fieldErrors.name ? (
          <p className="text-sm text-red-600">{fieldErrors.name}</p>
        ) : null}
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={project.description ?? ""}
        />
        {fieldErrors.description ? (
          <p className="text-sm text-red-600">{fieldErrors.description}</p>
        ) : null}
      </div>
      <div className="space-y-1">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={project.status}
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {state && !state.ok && !Object.keys(fieldErrors).length ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-emerald-700" role="status">
          Saved.
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}
