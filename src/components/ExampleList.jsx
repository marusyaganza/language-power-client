import { Stack, Paper, Text } from '@mantine/core';

function ExampleList({ examples }) {
    if (!examples?.length) return null;

    return (
        <Stack gap="xs">
            {examples.map(({ text, translation }, i) => (
                <Paper key={i} p="sm" radius="md" bg="blue.0">
                    <Text size="sm">
                        {text}
                        {translation && (
                            <Text span c="dimmed" fs="italic">
                                {' '}({translation})
                            </Text>
                        )}
                    </Text>
                </Paper>
            ))}
        </Stack>
    );
}

export default ExampleList;