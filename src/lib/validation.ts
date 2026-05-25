import { z } from "zod";

export const projectCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export const projectUpdateSchema = projectCreateSchema.extend({
  id: z.string().uuid(),
  status: z.enum(["active", "archived"]),
});

export const projectIdSchema = z.object({
  id: z.string().uuid(),
});

export const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

export const signupSchema = credentialsSchema.extend({
  fullName: z.string().trim().max(120).optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
