import type { ReactNode } from "react";
import { Alert, Button, PasswordInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { Credentials } from "../schemas";
import { AuthCard } from "./AuthCard";

interface AuthFormProps {
  title: string;
  submitLabel: string;
  onSubmit: (credentials: Credentials) => void;
  isPending: boolean;
  error: Error | null;
  /** Extra password rule, e.g. signup's length limits. Login passes none: the server only answers 401. */
  validatePassword?: (password: string) => string | null;
  /** Shown under the form, e.g. a link to the other auth page. */
  footer?: ReactNode;
}

export function AuthForm({ title, submitLabel, onSubmit, isPending, error, validatePassword, footer }: AuthFormProps) {
  const form = useForm<Credentials>({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (validatePassword ? validatePassword(value) : null),
    },
  });

  return (
    <AuthCard title={title} footer={footer}>
      {error && (
        <Alert color="rose" variant="light" icon={<IconAlertTriangle size={18} />} mb="md">
          {error.message}
        </Alert>
      )}
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput label="Email" required {...form.getInputProps("email")} />
        <PasswordInput label="Password" required mt="sm" {...form.getInputProps("password")} />
        <Button type="submit" fullWidth mt="lg" loading={isPending} mod={{ "hover-fill": "signal" }}>
          {submitLabel}
        </Button>
      </form>
    </AuthCard>
  );
}
