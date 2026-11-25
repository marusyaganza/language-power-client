import { useState, type KeyboardEvent } from "react";
import {
  ActionIcon,
  Alert,
  Anchor,
  AspectRatio,
  Button,
  Center,
  Image,
  Loader,
  Modal,
  SegmentedControl,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { isApiError } from "@/api/errors";
import { isComposingKey } from "@/shared/lib/ime";
import { useImageSearch, useImageSuggestions } from "../queries";
import type { ImageHit, ImageType } from "../schemas";
import classes from "./ImagePickerModal.module.css";

// The server's limit on a query (images/base.py MAX_QUERY_LENGTH, Pixabay's own).
const MAX_QUERY_LENGTH = 100;
const PAGE_SIZE = 12;

const TYPES: { value: ImageType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "photo", label: "Photos" },
  { value: "illustration", label: "Illustrations" },
];

interface ImagePickerModalProps {
  opened: boolean;
  onClose: () => void;
  /** The saved word whose image is being picked: its English meaning starts the search. */
  wordId: number;
  onPick: (hit: ImageHit, source: string) => void;
}

/**
 * Search the deployment's image source and pick one image. The search box starts with the word's English
 * meaning (from the server) and can be changed. Nothing is stored here: the pick is saved with the word.
 *
 * No <form> inside: this modal is rendered in a portal, but React still bubbles its events through the
 * word form around it, so a submit here would submit the word. Enter in the box searches instead.
 */
export function ImagePickerModal({ opened, onClose, wordId, onPick }: ImagePickerModalProps) {
  const suggestions = useImageSuggestions(wordId, opened);
  const suggested = suggestions.data?.query ?? "";
  // null until the user types or searches: until then, the suggestion.
  const [draft, setDraft] = useState<string | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [type, setType] = useState<ImageType>("all");
  const shownDraft = draft ?? suggested;
  const shownQuery = (query ?? suggested).trim();
  const search = useImageSearch(shownQuery, type, opened);

  const hits = search.data?.pages.flatMap((page) => page.items) ?? [];
  const source = search.data?.pages[0]?.source ?? "pixabay";

  function submit() {
    setQuery(shownDraft.trim());
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || isComposingKey(event)) return;
    event.preventDefault();
    event.stopPropagation(); // not up to the word form
    submit();
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Find an image" size="lg">
      <Stack gap="sm">
        <TextInput
          aria-label="Search for"
          placeholder={suggestions.isPending ? "Loading…" : "What to search for, in English"}
          value={shownDraft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAX_QUERY_LENGTH}
          rightSection={
            <ActionIcon variant="subtle" onClick={submit} aria-label="Search">
              <IconSearch size={16} />
            </ActionIcon>
          }
        />
        <SegmentedControl
          data={TYPES}
          value={type}
          onChange={(value) => setType(value as ImageType)}
          size="xs"
          fullWidth
        />

        <Results
          query={shownQuery}
          loadingSuggestion={suggestions.isPending}
          search={search}
          hits={hits}
          onPick={(hit) => {
            onPick(hit, source);
            onClose();
          }}
        />

        <Text size="xs" c="dimmed" ta="center">
          Images from{" "}
          <Anchor href="https://pixabay.com/" target="_blank" rel="noreferrer" inherit>
            Pixabay
          </Anchor>
        </Text>
      </Stack>
    </Modal>
  );
}

interface ResultsProps {
  query: string;
  loadingSuggestion: boolean;
  search: ReturnType<typeof useImageSearch>;
  hits: ImageHit[];
  onPick: (hit: ImageHit) => void;
}

function Results({ query, loadingSuggestion, search, hits, onPick }: ResultsProps) {
  if (loadingSuggestion) {
    return (
      <Center mih={120}>
        <Loader size="sm" />
      </Center>
    );
  }
  if (query === "") {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        Type what the picture should show, in English.
      </Text>
    );
  }
  if (search.isError) {
    const message =
      isApiError(search.error) && search.error.kind === "http" ? search.error.message : "Couldn't search for images";
    return (
      <Alert color="red" variant="light">
        <Stack gap="xs" align="flex-start">
          <Text size="sm">{message}</Text>
          <Button size="xs" variant="default" onClick={() => search.refetch()}>
            Try again
          </Button>
        </Stack>
      </Alert>
    );
  }
  if (search.isPending) {
    return (
      <SimpleGrid cols={{ base: 3, xs: 4 }} spacing="xs">
        {Array.from({ length: PAGE_SIZE }, (_, i) => (
          <AspectRatio key={i} ratio={4 / 3}>
            <Skeleton radius="sm" />
          </AspectRatio>
        ))}
      </SimpleGrid>
    );
  }
  if (hits.length === 0) {
    return (
      <Text size="sm" ta="center" py="xl">
        No images found for “{query}”. Try other words.
      </Text>
    );
  }
  return (
    <Stack gap="sm">
      <SimpleGrid cols={{ base: 3, xs: 4 }} spacing="xs">
        {hits.map((hit, i) => (
          <UnstyledButton
            key={hit.id}
            className={classes.thumb}
            onClick={() => onPick(hit)}
            aria-label={`Use image ${i + 1}${hit.author ? `, by ${hit.author}` : ""}`}
          >
            <AspectRatio ratio={4 / 3}>
              <Image src={hit.thumb_url} alt="" fit="cover" radius="sm" loading="lazy" />
            </AspectRatio>
          </UnstyledButton>
        ))}
      </SimpleGrid>
      {search.hasNextPage && (
        <Button variant="default" onClick={() => search.fetchNextPage()} loading={search.isFetchingNextPage}>
          More
        </Button>
      )}
    </Stack>
  );
}
