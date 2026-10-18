import { Button, Container, Group, Stack, Text } from "@mantine/core";
import { IconFlask, IconMoodConfuzed, IconPlus } from "@tabler/icons-react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/language";
import { QueryState } from "@/shared/components/QueryState";
import { paths } from "@/shared/paths";
import { QueryLinks } from "../components/QueryLinks";
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
            to={paths.newWord}
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
          isEmpty={(data) => data.words.length === 0 && data.suggestions.length === 0 && data.mock_queries.length === 0}
          empty={
            <Text c="dimmed" ta="center">
              No results found for "{query}".
            </Text>
          }
        >
          {({ words, suggestions, mock_queries }) => (
            <>
              {mock_queries.length > 0 && (
                <QueryLinks
                  icon={<IconFlask size={20} />}
                  title={`"${query}" isn't available in demo mode`}
                  description="The dictionary is mocked for this demo, so search only works for these words:"
                  queries={mock_queries}
                  onSelect={handleSearch}
                />
              )}

              {suggestions.length > 0 && (
                <QueryLinks
                  icon={<IconMoodConfuzed size={20} />}
                  title={`"${query}" doesn't quite ring a bell — maybe one of these?`}
                  queries={suggestions}
                  onSelect={handleSearch}
                />
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
