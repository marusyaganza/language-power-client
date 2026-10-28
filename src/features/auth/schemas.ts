import { z } from "zod";

// UserOut
export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
});
export type User = z.infer<typeof userSchema>;

// GET /auth/config
export const authConfigSchema = z.object({
  signup_enabled: z.boolean(),
  /** False when signups are off or today's new accounts are all taken. */
  signup_open_today: z.boolean(),
  /** The dictionary is mocked: local development only. */
  use_mocks: z.boolean(),
  /** How long an account lives before it's deleted; null when accounts are kept (personal). */
  account_ttl_hours: z.number().nullable(),
  /** Dictionary searches each account gets per language; null when unlimited (personal). */
  searches_per_language: z.number().nullable(),
});
export type AuthConfig = z.infer<typeof authConfigSchema>;

// LoginRequest / UserCreate
export interface Credentials {
  email: string;
  password: string;
}
