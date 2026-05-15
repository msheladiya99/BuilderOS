import { z } from "zod";

export const createOwnerSchema = z.object({
  unitId: z.string().uuid().optional(),
  name: z.string().min(2).max(255),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian mobile"),
  email: z.string().email().optional().or(z.literal("")),
  aadhaarNo: z.string().length(12).regex(/^\d{12}$/).optional().or(z.literal("")),
  panNo: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
});

export const updateOwnerSchema = createOwnerSchema.partial();

export const updateKycStatusSchema = z.object({
  kycStatus: z.enum(["pending", "submitted", "verified", "rejected"]),
  kycNotes: z.string().max(1000).optional(),
});

export const ownerDocumentSchema = z.object({
  docType: z.enum(["aadhaar", "pan", "photo", "agreement", "other"]),
  fileUrl: z.string().url(),
  fileName: z.string().max(255).optional(),
});

export const ownerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  kycStatus: z.enum(["pending", "submitted", "verified", "rejected"]).optional(),
  unitId: z.string().uuid().optional(),
});
