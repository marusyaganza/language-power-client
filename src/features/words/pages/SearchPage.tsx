import { Button, Container, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconFlask, IconLanguage, IconMoodConfuzed, IconPlus } from "@tabler/icons-react";
import { Link, useSearchParams } from "react-router-dom";
import { isApiError } from "@/api/errors";
import { useLanguage } from "@/context/language";
import { QueryState } from "@/shared/components/QueryState";
import { paths } from "@/shared/paths";
import { QueryLinks } from "../components/QueryLinks";
import { SearchBar } from "../components/SearchBar";
import { SearchLimit } from "../components/SearchLimit";
import { WordCard } from "../components/WordCard";
import { useSaveWord, useWordSearch } from "../queries";
import classes from "./SearchPage.module.css";

export function SearchPage() {
  const { language, SUPPORTED_LANGUAGES } = useLanguage();
  const languageLabel = SUPPORTED_LANGUAGES.find((l) => l.value === language)?.label ?? language;
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
        <Group justify="space-between" gap="xs">
          <SearchLimit language={language} languageLabel={languageLabel} />
          <Button
            ml="auto"
            component={Link}
            to={paths.newWord}
            variant="subtle"
            mod={{ "hover-fill": "rose" }}
            leftSection={<IconPlus size={16} />}
          >
            <span className={classes.addWordPrefix}>Can't find it?&nbsp;</span>Add your own word
          </Button>
        </Group>

        {query === "" ? (
          <Paper withBorder p="xl" className="app-frame" style={{ borderColor: "var(--app-border)" }}>
            <Stack align="center" gap="xs">
              <IconLanguage size={32} color="var(--app-signal)" />
              <Title order={2} size="h4" ta="center">
                Search the {languageLabel} dictionary
              </Title>
              <Text c="dimmed" ta="center" maw={440}>
                Look up a word to see its definitions, examples and pronunciation, then save it to practise in games.
              </Text>
            </Stack>
          </Paper>
        ) : (
          <QueryState
            query={search}
            // 429s are the demo's search limits; their messages say which one.
            errorTitle={isApiError(search.error) && search.error.status === 429 ? "Search limit reached" : "Search failed"}
            isEmpty={(data) =>
              data.words.length === 0 && data.suggestions.length === 0 && data.mock_queries.length === 0
            }
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
        )}
      </Stack>
    </Container>
  );
}
