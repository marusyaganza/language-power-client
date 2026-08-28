// src/pages/WordSearchPage.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Container, Stack, Text, Loader, Center } from '@mantine/core'
import { SearchBar } from '../components/SearchBar'
import { WordCard } from '../components/WordCard'
import { useLanguage } from '../context/LanguageContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function searchWord(query, language) {
    const res = await fetch(
        `${API_BASE}/words/search?query=${encodeURIComponent(query)}&language=${language}`, {
        credentials: "include",
    }
    )
    if (!res.ok) {
        if (res.status === 404) return []
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

export function WordSearchPage() {
    const { language } = useLanguage()
    const [submittedQuery, setSubmittedQuery] = useState(null)

    const { data: results, isLoading, isError, error } = useQuery({
        queryKey: ['wordSearch', submittedQuery, language],
        queryFn: () => searchWord(submittedQuery, language),
        enabled: !!submittedQuery,
    })

    return (
        <Container size="md" py="xl">
            <Stack gap="xl">
                <SearchBar onSearch={setSubmittedQuery} />

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

                {results && results.length === 0 && submittedQuery && (
                    <Text c="dimmed" ta="center">
                        No results found for "{submittedQuery}".
                    </Text>
                )}

                <Stack gap="lg">
                    {results?.map((word) => (
                        <WordCard key={word.uuid} word={word} />
                    ))}
                </Stack>
            </Stack>
        </Container>
    )
}