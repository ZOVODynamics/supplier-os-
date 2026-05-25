"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { deleteProject } from "@/server/projects";

export function DeleteProjectButton({ id }: { id: string }) {
  return (
    <form
      action={deleteProject}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "Delete this project? This action cannot be undone.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" disabled={pending}>
      {pending ? "Deleting…" : "Delete project"}
    </Button>
  );
}
