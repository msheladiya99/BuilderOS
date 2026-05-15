import { z } from "zod";

export const createUnitSchema = z.object({
  projectId: z.string().uuid(),
  unitNo: z.string().min(1).max(50),
  type: z.string().max(50).optional(),
  floor: z.coerce.number().int().optional(),
  tower: z.string().max(50).optional(),
  areaSqft: z.coerce.number().min(0).optional(),
  status: z.enum(["available", "booked", "sold", "reserved", "blocked"]).default("available"),
  basePrice: z.coerce.number().min(0).optional(),
});

export const updateUnitSchema = createUnitSchema.partial().omit({ projectId: true });

export const unitListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  projectId: z.string().uuid().optional(),
  status: z.enum(["available", "booked", "sold", "reserved", "blocked"]).optional(),
});
