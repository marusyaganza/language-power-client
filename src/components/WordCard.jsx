// src/components/WordCard.jsx
import { useState } from 'react'
import { Card, Group, Stack, Text, ActionIcon, Image, Tooltip, UnstyledButton } from '@mantine/core'
import {
    IconVolume, IconBookmark, IconBookmarkFilled, IconEdit, IconTrash,
} from '@tabler/icons-react'
import ExampleList from './ExampleList'
import classes from './WordCard.module.css'

const STEM_PREVIEW_COUNT = 5

function pad(n) {
    return String(n).padStart(2, '0')
}

export function WordCard({ word, onSave, onEdit, onDelete, isSaving }) {
    const [showAllStems, setShowAllStems] = useState(false)

    const visibleStems = showAllStems ? word.stems : word.stems.slice(0, STEM_PREVIEW_COUNT)
    const hiddenStemCount = word.stems.length - STEM_PREVIEW_COUNT

    function playAudio() {
        if (!word.audio_url) return
        new Audio(word.audio_url).play().catch(() => {})
    }

    return (
        <Card p="lg" className={`app-frame ${classes.card}`}>
            <Group align="flex-start" justify="space-between" wrap="nowrap" gap="lg">
                <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="sm" align="center" wrap="wrap">
                        <Text component="h3" m={0} className={classes.name}>{word.name}</Text>
                        {word.fl && <span className={classes.tag}>{word.fl}</span>}
                        {word.gender && <span className={classes.tag}>{word.gender}</span>}
                        {word.transcription && (
                            <span className={classes.transcription}>/{word.transcription}/</span>
                        )}
                        {word.audio_url && (
                            <ActionIcon variant="subtle" size="sm" onClick={playAudio} aria-label="Play pronunciation">
                                <IconVolume size={16} />
                            </ActionIcon>
                        )}
                    </Group>

                    <ol className={classes.defs}>
                        {word.defs.map((def, i) => (
                            <li key={i} className={classes.def}>
                                <span className={classes.defIndex}>{pad(i + 1)}</span>
                                <Text size="md">{def}</Text>
                            </li>
                        ))}
                    </ol>

                    {word.examples?.length > 0 && (
                        <Stack gap={6}>
                            <span className="app-label">Examples</span>
                            <ExampleList examples={word.examples} />
                        </Stack>
                    )}

                    {(word.stems.length > 0 || onSave || onEdit || onDelete) && (
                        <Group justify="space-between" align="center" wrap="wrap" gap="xs" className={classes.footer}>
                            <Group gap={6} wrap="wrap">
                                {visibleStems.map((stem, i) => (
                                    <span key={i} className={classes.stem}>{stem}</span>
                                ))}
                                {hiddenStemCount > 0 && (
                                    <UnstyledButton
                                        className="app-label"
                                        onClick={() => setShowAllStems((v) => !v)}
                                    >
                                        {showAllStems ? 'less' : `+${hiddenStemCount} forms`}
                                    </UnstyledButton>
                                )}
                            </Group>

                            <Group gap={4} ml="auto">
                                {onSave && (
                                    <Tooltip label={word.saved ? 'In your vocabulary' : 'Save to vocabulary'}>
                                        <ActionIcon
                                            variant={word.saved ? 'light' : 'subtle'}
                                            color={word.saved ? 'olive' : 'gray'}
                                            disabled={isSaving}
                                            onClick={word.saved ? undefined : () => onSave(word)}
                                            aria-label={word.saved ? 'Already saved' : 'Save to vocabulary'}
                                        >
                                            {word.saved ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                                {onEdit && (
                                    <Tooltip label="Edit">
                                        <ActionIcon variant="subtle" onClick={() => onEdit(word)} aria-label="Edit word">
                                            <IconEdit size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                                {onDelete && (
                                    <Tooltip label="Delete">
                                        <ActionIcon
                                            variant="subtle"
                                            color="scarlet"
                                            onClick={() => onDelete(word)}
                                            aria-label="Delete word"
                                        >
                                            <IconTrash size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </Group>
                        </Group>
                    )}
                </Stack>

                {word.img_url && (
                    <Image
                        src={word.img_url}
                        alt={word.name}
                        w={{ base: 88, sm: 160 }}
                        h={{ base: 88, sm: 160 }}
                        radius="sm"
                        fit="cover"
                        className={classes.image}
                    />
                )}
            </Group>
        </Card>
    )
}
