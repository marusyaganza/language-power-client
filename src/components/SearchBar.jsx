// src/components/SearchBar.jsx
import { useState } from 'react'
import { TextInput, ActionIcon } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'

export function SearchBar({ onSearch, placeholder = 'Search a word...' }) {
    const [query, setQuery] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        const trimmed = query.trim()
        if (trimmed) onSearch(trimmed)
    }

    return (
        <form onSubmit={handleSubmit}>
            <TextInput
                size="md"
                radius="md"
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                placeholder={placeholder}
                rightSection={
                    <ActionIcon type="submit" variant="subtle" aria-label="Search">
                        <IconSearch size={18} />
                    </ActionIcon>
                }
            />
        </form>
    )
}