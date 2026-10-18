// src/components/PageHeader.jsx
import { Group, Stack, Title, Text } from '@mantine/core'

export function PageHeader({ kicker, title, description, actions }) {
    return (
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
            <Stack gap={6} style={{ minWidth: 0 }}>
                {kicker && <span className="app-label">{kicker}</span>}
                <Title order={1} fz={{ base: 30, sm: 38 }} lh={1.1}>{title}</Title>
                {description && <Text c="dimmed">{description}</Text>}
            </Stack>
            {actions}
        </Group>
    )
}
