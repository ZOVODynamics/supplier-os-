"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  projectCreateSchema,
  projectIdSchema,
  projectUpdateSchema,
} from "@/lib/validation";
import type { ProjectRow } from "@/types/database";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrorsFrom(
  error: import("zod").ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.errors) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function listProjects(): Promise<ProjectRow[]> {
  await requireUser();
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load projects: ${error.message}`);
  }
  return (data ?? []) as ProjectRow[];
}

export async function getProject(id: string): Promise<ProjectRow | null> {
  await requireUser();
  const parsed = projectIdSchema.safeParse({ id });
  if (!parsed.success) return null;

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load project: ${error.message}`);
  }
  return (data as ProjectRow | null) ?? null;
}

export async function createProject(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = projectCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Could not create project.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${(data as { id: string }).id}`);
}

export async function updateProject(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireUser();

  const parsed = projectUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    status: formData.get("status") ?? "active",
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${parsed.data.id}`);
  return { ok: true };
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireUser();

  const parsed = projectIdSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) {
    throw new Error("Invalid project id.");
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}
