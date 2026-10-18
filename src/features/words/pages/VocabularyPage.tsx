import { useState } from "react";
import {
  ActionIcon,
  Button,
  Container,
  Group,
  Pagination,
  Paper,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
  useMatches,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconBooks,
  IconPlus,
  IconSearch,
  IconSortAscending,
  IconSortAscendingLetters,
  IconSortDescending,
  IconSortDescendingLetters,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { PageHeader } from "@/shared/components/PageHeader";
import { QueryState } from "@/shared/components/QueryState";
import { EditWordModal } from "../components/EditWordModal";
import { WordCard } from "../components/WordCard";
import { useDeleteWord, useVocabulary } from "../queries";
import type { SortOrder, VocabularySortBy, Word } from "../schemas";
import classes from "./VocabularyPage.module.css";

const SORT_OPTIONS: { value: VocabularySortBy; label: string }[] = [
  { value: "created_at", label: "Date added" },
  { value: "name", label: "Name" },
];

// Each field starts in its natural direction; sort_order is always sent explicitly.
const DEFAULT_SORT_ORDER: Record<VocabularySortBy, SortOrder> = { created_at: "desc", name: "asc" };

const SORT_ORDER_LABELS: Record<VocabularySortBy, Record<SortOrder, string>> = {
  created_at: { desc: "Newest first", asc: "Oldest first" },
  name: { asc: "A → Z", desc: "Z → A" },
};

const SORT_ORDER_ICONS = {
  created_at: { asc: IconSortAscending, desc: IconSortDescending },
  name: { asc: IconSortAscendingLetters, desc: IconSortDescendingLetters },
} satisfies Record<VocabularySortBy, Record<SortOrder, unknown>>;

export function VocabularyPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<VocabularySortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>(DEFAULT_SORT_ORDER.created_at);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const paginationSiblings = useMatches({ base: 0, sm: 1 });
  const { language, SUPPORTED_LANGUAGES } = useLanguage();
  const languageLabel = SUPPORTED_LANGUAGES.find((l) => l.value === language)?.label ?? language;

  const vocabulary = useVocabulary({
    language,
    query: debouncedSearch,
    page,
    sort_by: sortBy,
    sort_order: sortOrder,
  });
  const { data } = vocabulary;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1); // reset to page 1 whenever the filter changes
  }

  function handleSortChange(value: string) {
    const field = value as VocabularySortBy;
    setSortBy(field);
    setSortOrder(DEFAULT_SORT_ORDER[field]);
    setPage(1);
  }

  function handleSortOrderToggle() {
    setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
    setPage(1);
  }

  const sortOrderLabel = SORT_ORDER_LABELS[sortBy][sortOrder];
  const SortOrderIcon = SORT_ORDER_ICONS[sortBy][sortOrder];

  const { mutate: removeWord } = useDeleteWord();

  function handleDelete(word: Word) {
    const wordId = word.id;
    if (wordId == null) return; // saved words always have an id
    modals.openConfirmModal({
      title: "Delete word",
      children: <Text size="sm">Remove "{word.name}" from your vocabulary?</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "scarlet" },
      onConfirm: () => removeWord(wordId),
    });
  }

  const rangeStart = data ? (data.page - 1) * data.page_size + 1 : 0;
  const rangeEnd = data ? rangeStart + data.items.length - 1 : 0;

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <PageHeader
          kicker={`Vocabulary · ${languageLabel}`}
          title="Your words"
          description={
            data
              ? `${data.total} saved ${data.total === 1 ? "word" : "words"}, ready for practice.`
              : "Everything you have saved, in one place."
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
          <SegmentedControl data={SORT_OPTIONS} value={sortBy} onChange={handleSortChange} aria-label="Sort by" />
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
            {data.total_pages > 1 && (
              <span>
                Page {data.page} / {data.total_pages}
              </span>
            )}
          </Group>
        )}

        <QueryState
          query={vocabulary}
          loading={
            <Stack gap="lg">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={160} radius="sm" />
              ))}
            </Stack>
          }
          errorTitle="Couldn't load vocabulary"
          isEmpty={(page) => page.items.length === 0}
          empty={
            <Paper withBorder p="xl" className="app-frame" style={{ borderColor: "var(--app-border)" }}>
              <Stack align="center" gap="sm">
                <IconBooks size={32} color="var(--app-signal)" />
                <Text ta="center">
                  {debouncedSearch ? `No saved words matching "${debouncedSearch}".` : "You haven't saved any words yet."}
                </Text>
                {!debouncedSearch && (
                  <Button component={Link} to="/words/search" variant="light">
                    Find words to save
                  </Button>
                )}
              </Stack>
            </Paper>
          }
        >
          {({ items, total_pages }) => (
            <>
              <Stack gap="lg">
                {items.map((word) => (
                  <WordCard key={word.id} word={word} onEdit={setEditingWord} onDelete={handleDelete} />
                ))}
              </Stack>

              {total_pages > 1 && (
                <Group justify="center">
                  <Pagination value={page} onChange={setPage} total={total_pages} siblings={paginationSiblings} />
                </Group>
              )}
            </>
          )}
        </QueryState>
      </Stack>
      <EditWordModal word={editingWord} opened={!!editingWord} onClose={() => setEditingWord(null)} />
    </Container>
  );
}
