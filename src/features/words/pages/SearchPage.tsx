import { Anchor, Button, Container, Group, Paper, Stack, Text } from "@mantine/core";
import { IconMoodConfuzed, IconPlus } from "@tabler/icons-react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { QueryState } from "@/shared/components/QueryState";
import { SearchBar } from "../components/SearchBar";
import { WordCard } from "../components/WordCard";
import { useSaveWord, useWordSearch } from "../queries";

export function SearchPage() {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const search = useWordSearch(query, language);
  const { mutate: save, isPending: isSaving } = useSaveWord();

  function handleSearch(newQuery: string) {
    setSearchParams({ query: newQuery });
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        {/* Remount when the URL query changes (suggestion click, back/forward) so the input follows it. */}
        <SearchBar key={query} initialQuery={query} onSearch={handleSearch} />
        <Group justify="flex-end">
          <Button
            component={Link}
            to="/words/new"
            variant="subtle"
            mod={{ "hover-fill": "rose" }}
            leftSection={<IconPlus size={16} />}
          >
            Can't find it? Add your own word
          </Button>
        </Group>

        <QueryState
          query={search}
          errorTitle="Search failed"
          isEmpty={(data) => data.words.length === 0 && data.suggestions.length === 0}
          empty={
            <Text c="dimmed" ta="center">
              No results found for "{query}".
            </Text>
          }
        >
          {({ words, suggestions }) => (
            <>
              {suggestions.length > 0 && (
                <Paper withBorder radius="md" p="md">
                  <Group gap="xs" mb="xs">
                    <IconMoodConfuzed size={20} />
                    <Text fw={600}>"{query}" doesn't quite ring a bell — maybe one of these?</Text>
                  </Group>
                  <Group gap="xs">
                    {suggestions.map((suggestion, i) => (
                      <Anchor key={i} onClick={() => handleSearch(suggestion)} underline="hover" size="sm">
                        {suggestion}
                        {i < suggestions.length - 1 && ","}
                      </Anchor>
                    ))}
                  </Group>
                </Paper>
              )}

              <Stack gap="lg">
                {words.map((word) => (
                  <WordCard key={word.uuid ?? word.name} word={word} onSave={save} isSaving={isSaving} />
                ))}
              </Stack>
            </>
          )}
        </QueryState>
      </Stack>
    </Container>
  );
}
