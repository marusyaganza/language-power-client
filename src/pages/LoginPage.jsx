import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { TextInput, PasswordInput, Button, Paper, Title, Alert } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";

export function LoginPage() {
    const navigate = useNavigate();
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
            login(values.email, values.password),
        onSuccess: () => navigate("/words/search"),
        onError: (err) => setError(err.message),
    });

    return (
        <Paper maw={400} mx="auto" mt="xl" p="lg" withBorder>
            <Title order={3} mb="md">Log in</Title>
            {error && <Alert color="red" mb="md">{error}</Alert>}
            <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
                <TextInput label="Email" required {...form.getInputProps("email")} />
                <PasswordInput label="Password" required mt="sm" {...form.getInputProps("password")} />
                <Button type="submit" fullWidth mt="lg" loading={mutation.isPending} mod={{ 'hover-fill': 'signal' }}>
                    Log in
                </Button>
            </form>
        </Paper>
    );
}