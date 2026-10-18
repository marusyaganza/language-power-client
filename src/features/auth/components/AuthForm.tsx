import { Alert, Button, Paper, PasswordInput, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Credentials } from "../schemas";

interface AuthFormProps {
  title: string;
  submitLabel: string;
  onSubmit: (credentials: Credentials) => void;
  isPending: boolean;
  error: Error | null;
}

export function AuthForm({ title, submitLabel, onSubmit, isPending, error }: AuthFormProps) {
  const form = useForm<Credentials>({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length >= 8 ? null : "Password must be at least 8 characters"),
    },
  });

  return (
    <Paper maw={400} mx="auto" mt="xl" p="lg" withBorder>
      <Title order={3} mb="md">
        {title}
      </Title>
      {error && (
        <Alert color="red" mb="md">
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
    </Paper>
  );
}
