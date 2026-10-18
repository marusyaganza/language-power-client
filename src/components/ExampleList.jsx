import { Stack, Text } from '@mantine/core';

function ExampleList({ examples }) {
    if (!examples?.length) return null;

    return (
        <Stack gap={6}>
            {examples.map(({ text, translation }, i) => (
                <Text
                    key={i}
                    size="sm"
                    pl="sm"
                    style={{ borderLeft: '2px solid var(--app-accent)' }}
                >
                    {text}
                    {translation && (
                        <Text span c="dimmed">
                            {' '}— {translation}
                        </Text>
                    )}
                </Text>
            ))}
        </Stack>
    );
}

export default ExampleList;
