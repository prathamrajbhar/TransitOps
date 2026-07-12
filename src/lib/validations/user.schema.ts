/**
 * src/lib/validations/user.schema.ts
 * Zod schemas for user authentication and profile operations.
 */
import { z } from "zod";

/** Minimum password policy */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// ─── Login ────────────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Sign Up ──────────────────────────────────────────────────────
export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email address").trim().toLowerCase(),
  password: passwordSchema,
  organizationId: z.string().cuid("Invalid organization ID"),
  role: z
    .enum(["ADMIN", "MANAGER", "DISPATCHER", "DRIVER"])
    .default("DRIVER"),
});
export type SignupInput = z.infer<typeof SignupSchema>;

// ─── Profile Update ───────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─── Change Password ──────────────────────────────────────────────
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
