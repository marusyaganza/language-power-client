import { useState, type FormEvent } from "react";
import { ActionIcon, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

interface SearchBarProps {
  /** Starting text. To follow outside changes (e.g. the URL), remount with a new `key`. */
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ initialQuery = "", onSearch, placeholder = "Search a word..." }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        size="md"
        radius="md"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        placeholder={placeholder}
        aria-label="Search a word"
        rightSection={
          <ActionIcon type="submit" variant="subtle" aria-label="Search">
            <IconSearch size={18} />
          </ActionIcon>
        }
      />
    </form>
  );
}
