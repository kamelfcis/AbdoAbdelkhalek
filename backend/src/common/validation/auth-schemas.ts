import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

/** Accept legacy `fitness` signup domain; persist as `online_football`. */
export const signupDomainSchema = z
  .enum(['fitness', 'squash'])
  .transform((v) => (v === 'fitness' ? ('online_football' as const) : v));

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  registeredFrom: signupDomainSchema.optional(),
});
