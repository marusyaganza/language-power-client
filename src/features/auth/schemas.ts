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
  /** The dictionary is mocked: the demo deployment. */
  use_mocks: z.boolean(),
});
export type AuthConfig = z.infer<typeof authConfigSchema>;

// LoginRequest / UserCreate
export interface Credentials {
  email: string;
  password: string;
}
