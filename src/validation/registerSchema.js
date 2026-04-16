import { z } from "zod";

// ─── Shared base fields ────────────────────────────────────────────────────────
const baseFields = {
  full_name: z.string().min(1, "Full name is required"),
  // username: z
  //   .string()
  //   .min(3, "Username must be at least 3 characters")
  //   .max(50, "Username must be at most 50 characters")
  //   .regex(
  //     /^[a-z0-9-]+$/,
  //     "Only lowercase letters, numbers and hyphens allowed",
  //   ),
  email: z.string().email("Enter a valid email"),
  bio: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string(),
  terms_accept: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms & conditions" }),
  }),
  role: z.string().optional(),
};

// ─── Seller Schema ─────────────────────────────────────────────────────────────
export const sellerRegisterSchema = z
  .object({
    ...baseFields,
    service_area: z.string().min(1, "Service area is required"),
    contact_number: z
      .string()
      .min(7, "Enter a valid contact number")
      .max(20, "Number too long"),
    whatsapp_number: z
      .string()
      .min(7, "Enter a valid WhatsApp number")
      .max(20, "Number too long"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// ─── Customer Schema ───────────────────────────────────────────────────────────
export const customerRegisterSchema = z
  .object({
    ...baseFields,
    contact_number: z
      .string()
      .min(7, "Enter a valid contact number")
      .max(20, "Number too long"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// ─── Legacy combined schema (kept for backward compat) ────────────────────────
export const registerSchema = sellerRegisterSchema;
