import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Container, Stack, Text, TextInput, SegmentedControl, Pagination, Group, Button,
    Skeleton, Alert, Paper, ActionIcon, Tooltip, useMatches,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import {
    IconSearch, IconPlus, IconAlertTriangle, IconBooks,
    IconSortAscending, IconSortDescending, IconSortAscendingLetters, IconSortDescendingLetters,
} from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { WordCard } from '../components/WordCard'
import { EditWordModal } from '../components/EditWordModal'
import { PageHeader } from '../components/PageHeader'
import { fetchVocabulary } from '../api/vocabulary'
import { useDeleteWord } from '../hooks/useDeleteWord'
import { useLanguage } from '../context/LanguageContext'
import classes from './VocabularyPage.module.css'

const SORT_OPTIONS = [
    { value: 'created_at', label: 'Date added' },
    { value: 'name', label: 'Name' },
]

// Each field starts in its natural direction; sort_order is always sent explicitly.
const DEFAULT_SORT_ORDER = { created_at: 'desc', name: 'asc' }

const SORT_ORDER_LABELS = {
    created_at: { desc: 'Newest first', asc: 'Oldest first' },
    name: { asc: 'A → Z', desc: 'Z → A' },
}

const SORT_ORDER_ICONS = {
    created_at: { asc: IconSortAscending, desc: IconSortDescending },
    name: { asc: IconSortAscendingLetters, desc: IconSortDescendingLetters },
}

export function VocabularyPage() {
    const [search, setSearch] = useState('')
    const [debouncedSearch] = useDebouncedValue(search, 300)
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState(DEFAULT_SORT_ORDER.created_at)
    const [editingWord, setEditingWord] = useState(null)
    const paginationSiblings = useMatches({ base: 0, sm: 1 })
    const { language, SUPPORTED_LANGUAGES } = useLanguage()
    const languageLabel = SUPPORTED_LANGUAGES.find((l) => l.value === language)?.label ?? language

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['vocabulary', debouncedSearch, page, sortBy, sortOrder, language],
        queryFn: () => fetchVocabulary({ query: debouncedSearch, page, sortBy, sortOrder, language }),
        placeholderData: (prev) => prev,
    })

    function handleSearchChange(value) {
        setSearch(value)
        setPage(1) // reset to page 1 whenever the filter changes
    }

    function handleSortChange(value) {
        setSortBy(value)
        setSortOrder(DEFAULT_SORT_ORDER[value])
        setPage(1)
    }

    function handleSortOrderToggle() {
        setSortOrder((order) => (order === 'asc' ? 'desc' : 'asc'))
        setPage(1)
    }

    const sortOrderLabel = SORT_ORDER_LABELS[sortBy][sortOrder]
    const SortOrderIcon = SORT_ORDER_ICONS[sortBy][sortOrder]

    const { mutate: removeWord } = useDeleteWord()

    function handleDelete(word) {
        modals.openConfirmModal({
            title: 'Delete word',
            children: <Text size="sm">Remove "{word.name}" from your vocabulary?</Text>,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'scarlet' },
            onConfirm: () => removeWord(word.id),
        })
    }

    const rangeStart = data ? (data.page - 1) * data.page_size + 1 : 0
    const rangeEnd = data ? rangeStart + data.items.length - 1 : 0

    return (
        <Container size="md" py="xl">
            <Stack gap="xl">
                <PageHeader
                    kicker={`Vocabulary · ${languageLabel}`}
                    title="Your words"
                    description={
                        data
                            ? `${data.total} saved ${data.total === 1 ? 'word' : 'words'}, ready for practice.`
                            : 'Everything you have saved, in one place.'
                    }
                />

                <Group gap="sm" wrap="wrap">
                    <TextInput
                        placeholder="Search your vocabulary"
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => handleSearchChange(e.currentTarget.value)}
                        style={{ flex: 1, minWidth: 220 }}
                        aria-label="Search your vocabulary"
                    />
                    <SegmentedControl
                        data={SORT_OPTIONS}
                        value={sortBy}
                        onChange={handleSortChange}
                        aria-label="Sort by"
                    />
                    <Tooltip label={`${sortOrderLabel} · click to reverse`}>
                        <ActionIcon
                            size="input-sm"
                            variant="default"
                            className={classes.sortToggle}
                            onClick={handleSortOrderToggle}
                            aria-label={`Sort order: ${sortOrderLabel}. Reverse order`}
                        >
                            <SortOrderIcon size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Button component={Link} to="/words/new" leftSection={<IconPlus size={16} />}>
                        Add word
                    </Button>
                </Group>

                {data && data.total > 0 && (
                    <Group justify="space-between" className="app-label">
                        <span>
                            Showing {rangeStart}–{rangeEnd} of {data.total}
                        </span>
                        {data.total_pages > 1 && <span>Page {data.page} / {data.total_pages}</span>}
                    </Group>
                )}

                {isLoading && (
                    <Stack gap="lg">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} height={160} radius="sm" />
                        ))}
                    </Stack>
                )}

                {isError && (
                    <Alert color="rose" variant="light" icon={<IconAlertTriangle size={18} />} title="Couldn't load vocabulary">
                        {error.message}
                    </Alert>
                )}

                {data && data.items.length === 0 && (
                    <Paper withBorder p="xl" className="app-frame" style={{ borderColor: 'var(--app-border)' }}>
                        <Stack align="center" gap="sm">
                            <IconBooks size={32} color="var(--app-signal)" />
                            <Text ta="center">
                                {debouncedSearch
                                    ? `No saved words matching "${debouncedSearch}".`
                                    : "You haven't saved any words yet."}
                            </Text>
                            {!debouncedSearch && (
                                <Button component={Link} to="/words/search" variant="light">
                                    Find words to save
                                </Button>
                            )}
                        </Stack>
                    </Paper>
                )}

                <Stack gap="lg">
                    {data?.items.map((word) => (
                        <WordCard
                            key={word.id}
                            word={word}
                            onEdit={setEditingWord}
                            onDelete={handleDelete}
                        />
                    ))}
                </Stack>

                {data && data.total_pages > 1 && (
                    <Group justify="center">
                        <Pagination
                            value={page}
                            onChange={setPage}
                            total={data.total_pages}
                            siblings={paginationSiblings}
                        />
                    </Group>
                )}
            </Stack>
            <EditWordModal
                word={editingWord}
                opened={!!editingWord}
                onClose={() => setEditingWord(null)}
            />
        </Container>
    )
}
