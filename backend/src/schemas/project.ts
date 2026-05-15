import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2).max(255),
  type: z.enum(["residential", "commercial", "mixed"]).default("residential"),
  reraNo: z.string().max(50).optional(),
  location: z.string().optional(),
  status: z.enum(["planning", "active", "completed", "on_hold"]).default("active"),
  budget: z.coerce.number().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["planning", "active", "completed", "on_hold"]).optional(),
});
