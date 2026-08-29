import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Container, Stack, Text, Loader, Center, TextInput, Select, Pagination, Group,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconSearch } from '@tabler/icons-react'
import { WordCard } from '../components/WordCard'
import { fetchVocabulary } from '../api/vocabulary'
import { useDeleteWord } from '../hooks/useDeleteWord'

const SORT_OPTIONS = [
    { value: 'created_at', label: 'Recently added' },
    { value: 'name', label: 'Alphabetical' },
]

export function VocabularyPage() {
    const [search, setSearch] = useState('')
    const [debouncedSearch] = useDebouncedValue(search, 300)
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState('created_at')

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['vocabulary', debouncedSearch, page, sortBy],
        queryFn: () => fetchVocabulary({ query: debouncedSearch, page, sortBy }),
        placeholderData: (prev) => prev, // keep old page visible while refetching
    })

    function handleSearchChange(value) {
        setSearch(value)
        setPage(1) // reset to page 1 whenever the filter changes
    }

    function handleSortChange(value) {
        setSortBy(value)
        setPage(1)
    }

    const { mutate: removeWord } = useDeleteWord()

    function handleEdit(word) {
        notifications.show({ message: 'Editing words is coming soon', color: 'blue' })
    }

    function handleDelete(word) {
        modals.openConfirmModal({
            title: 'Delete word',
            children: <Text size="sm">Remove "{word.name}" from your vocabulary?</Text>,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => removeWord(word.id),
        })
    }

    return (
        <Container size="md" py="xl">
            <Stack gap="xl">
                <Group justify="space-between" wrap="wrap">
                    <TextInput
                        placeholder="Search your vocabulary..."
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => handleSearchChange(e.currentTarget.value)}
                        style={{ flex: 1, minWidth: 240 }}
                    />
                    <Select
                        data={SORT_OPTIONS}
                        value={sortBy}
                        onChange={handleSortChange}
                        allowDeselect={false}
                        w={200}
                    />
                </Group>

                {isLoading && (
                    <Center py="xl">
                        <Loader />
                    </Center>
                )}

                {isError && (
                    <Text c="red" ta="center">
                        {error.message}
                    </Text>
                )}

                {data && data.items.length === 0 && (
                    <Text c="dimmed" ta="center">
                        {debouncedSearch
                            ? `No saved words matching "${debouncedSearch}".`
                            : "You haven't saved any words yet."}
                    </Text>
                )}

                <Stack gap="lg">
                    {data?.items.map((word) => (
                        <WordCard
                            key={word.id}
                            word={word}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </Stack>

                {data && data.total_pages > 1 && (
                    <Center>
                        <Pagination
                            value={page}
                            onChange={setPage}
                            total={data.total_pages}
                        />
                    </Center>
                )}
            </Stack>
        </Container>
    )
}