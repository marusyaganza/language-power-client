import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Button, Paper, Title, Alert } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { signup } from "../api/auth";
import { useAuthConfig } from "../hooks/useAuthConfig";

export function SignUpPage() {
    const navigate = useNavigate();
    const { data: config, isLoading: configLoading } = useAuthConfig();
    const [error, setError] = useState(null);

    const form = useForm({
        initialValues: { email: "", password: "" },
        validate: {
            email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email"),
            password: (value) => (value.length >= 8 ? null : "Password must be at least 8 characters"),
        },
    });

    const mutation = useMutation({
        mutationFn: (values) =>
            signup(values.email, values.password),
        onSuccess: () => navigate("/login"),
        onError: (err) => setError(err.message),
    });

    if (configLoading) return null; // or a loading spinner

    if (!config?.signup_enabled) {
        return (
            <Paper maw={400} mx="auto" mt="xl" p="lg" withBorder>
                <Title order={3} mb="md">Sign up is currently closed</Title>
            </Paper>
        );
    }

    return (
        <Paper maw={400} mx="auto" mt="xl" p="lg" withBorder>
            <Title order={3} mb="md">Sign up</Title>
            {error && <Alert color="red" mb="md">{error}</Alert>}
            <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
                <TextInput label="Email" required {...form.getInputProps("email")} />
                <PasswordInput label="Password" required mt="sm" {...form.getInputProps("password")} />
                <Button type="submit" fullWidth mt="lg" loading={mutation.isPending}>
                    Sign up
                </Button>
            </form>
        </Paper>
    );
}