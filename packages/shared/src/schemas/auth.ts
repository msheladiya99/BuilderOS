import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  subdomain: z.string().min(2).max(63).optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d{6}$/),
  subdomain: z.string().min(2).max(63).optional(),
});

export const createCompanySchema = z.object({
  name: z.string().min(2).max(255),
  subdomain: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, hyphens only"),
  gstNo: z.string().max(15).optional(),
  planCode: z.string().default("starter"),
});
