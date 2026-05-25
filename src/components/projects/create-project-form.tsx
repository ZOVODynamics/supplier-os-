"use client";

import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject, type ActionResult } from "@/server/projects";

const initialState: ActionResult | null = null;

export function CreateProjectForm() {
  const [state, formAction] = useFormState(createProject, initialState);
  const fieldErrors =
    state && !state.ok ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          placeholder="Q1 supplier onboarding"
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
          placeholder="What is this project about?"
        />
        {fieldErrors.description ? (
          <p className="text-sm text-red-600">{fieldErrors.description}</p>
        ) : null}
      </div>
      {state && !state.ok && !Object.keys(fieldErrors).length ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
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
      {pending ? "Creating…" : "Create project"}
    </Button>
  );
}
