import { Button, Group, Image, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowBackUp, IconPhotoSearch } from "@tabler/icons-react";
import { useAuthConfig } from "@/features/auth";
import { HelpLabel } from "@/shared/components/HelpLabel";
import { isOptionalUrl } from "../lib/wordForm";
import type { ImageHit } from "../schemas";
import { ImagePickerModal } from "./ImagePickerModal";

const HELP =
  "Search for a picture of the word and pick one. A copy is kept with the word when you click Save; " +
  "nothing is kept until you save.";

interface ImageChooserProps {
  wordId: number;
  /** The image link in the form now. */
  imgUrl: string;
  /** A picked image not saved yet: its preview link. */
  preview: string | null;
  onPick: (hit: ImageHit, source: string) => void;
  /** Back to the image the word had before picking. */
  onUndo: () => void;
}

/**
 * "Add image" / "Change image" on the edit form, where the server offers image search. Shows the word's
 * current image, or the picked one. Draws nothing where image search is off.
 */
export function ImageChooser({ wordId, imgUrl, preview, onPick, onUndo }: ImageChooserProps) {
  const { data: config } = useAuthConfig();
  const [opened, { open, close }] = useDisclosure(false);

  if (!config?.image_search) return null;

  const current = imgUrl.trim() && isOptionalUrl(imgUrl) ? imgUrl.trim() : null;
  const shown = preview ?? current;

  return (
    <Stack gap={6}>
      <HelpLabel label="Image" help={HELP} />
      {shown && <Image src={shown} alt="" h={160} w="auto" maw="100%" fit="contain" radius="sm" />}
      <Group gap="xs">
        <Button variant={shown ? "default" : "filled"} leftSection={<IconPhotoSearch size={16} />} onClick={open}>
          {shown ? "Change image" : "Add image"}
        </Button>
        {preview !== null && (
          <Button variant="subtle" leftSection={<IconArrowBackUp size={16} />} onClick={onUndo}>
            Undo
          </Button>
        )}
      </Group>
      {preview !== null && (
        <Text size="xs" c="dimmed">
          New image from Pixabay: kept when you save.
        </Text>
      )}
      <ImagePickerModal opened={opened} onClose={close} wordId={wordId} onPick={onPick} />
    </Stack>
  );
}
