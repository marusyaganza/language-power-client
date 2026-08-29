// src/components/WordCard.jsx
import { useState } from 'react'
import {
    Card, Group, Stack, Text, Badge, ActionIcon, Image, Box, Menu, List,
} from '@mantine/core'
import ExampleList from './ExampleList'
import {
    IconVolume, IconBookmark, IconDotsVertical, IconChevronDown, IconChevronUp,
    IconEdit, IconTrash,
} from '@tabler/icons-react'

const STEM_PREVIEW_COUNT = 5

export function WordCard({ word, onSave, onEdit, onDelete }) {
    const [showAllStems, setShowAllStems] = useState(false)

    const visibleStems = showAllStems ? word.stems : word.stems.slice(0, STEM_PREVIEW_COUNT)
    const hasMoreStems = word.stems.length > STEM_PREVIEW_COUNT

    function playAudio() {
        if (!word.audio_url) return
        new Audio(word.audio_url).play()
    }

    return (
        <Card withBorder radius="md" p="lg" pos="relative">
            {/* Corner action buttons */}
            <Box pos="absolute" top={8} right={8}>
                <Group gap={4}>
                    <ActionIcon variant="subtle" onClick={() => onSave?.(word)} aria-label="Save to vocabulary" disabled={word.saved}>
                        <IconBookmark size={18} />
                    </ActionIcon>
                    <Menu shadow="md" width={160}>
                        <Menu.Target>
                            <ActionIcon variant="subtle" aria-label="More options">
                                <IconDotsVertical size={18} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => onEdit?.(word)}>
                                Edit
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => onDelete?.(word)}
                            >
                                Delete
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Box>

            <Group align="flex-start" justify="space-between" wrap="nowrap" gap="lg">
                {/* Left: main content */}
                <Stack gap="sm" style={{ flex: 1, minWidth: 0 }}>
                    {/* Top row: name, fl, transcription, audio */}
                    <Group gap="xs" align="baseline" wrap="wrap">
                        <Text fw={700} size="lg">{word.name}</Text>
                        {word.fl && (
                            <Text size="sm" c="dimmed" fs="italic">{word.fl}</Text>
                        )}
                        {word.transcription && (
                            <Text size="sm" c="dimmed">/{word.transcription}/</Text>
                        )}
                        {word.audio_url && (
                            <ActionIcon variant="subtle" size="sm" onClick={playAudio} aria-label="Play pronunciation">
                                <IconVolume size={16} />
                            </ActionIcon>
                        )}
                    </Group>

                    {/* Definitions (examples assumed inline within each string for now) */}
                    <List type="ordered" size="sm" spacing={4}>
                        {word.defs.map((def, i) => (
                            <List.Item key={i}>{def}</List.Item>
                        ))}
                    </List>

                    {/* Stems with show more/less */}
                    {word.stems.length > 0 && (
                        <Group gap={6} align="center" wrap="wrap">
                            {visibleStems.map((stem, i) => (
                                <Badge key={i} variant="light" size="sm">
                                    {stem}
                                </Badge>
                            ))}
                            {hasMoreStems && (
                                <ActionIcon
                                    variant="transparent"
                                    size="sm"
                                    onClick={() => setShowAllStems((v) => !v)}
                                    aria-label={showAllStems ? 'Show fewer forms' : 'Show more forms'}
                                >
                                    {showAllStems ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                                </ActionIcon>
                            )}
                        </Group>
                    )}
                    {word?.examples?.length > 0 && (
                        <Group gap="xs" wrap="wrap">
                            <Text size="xs" fw={600} c="dimmed" tt="uppercase">Examples</Text>
                            <ExampleList examples={word.examples} />
                        </Group>
                    )}
                </Stack>
                {/* Right: image, only if present */}
                {word.image_url && (
                    <Image
                        src={word.image_url}
                        alt={word.name}
                        w={100}
                        h={100}
                        radius="sm"
                        fit="cover"
                        style={{ flexShrink: 0 }}
                    />
                )}
            </Group>
        </Card>
    )
}