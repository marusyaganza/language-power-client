import { Modal } from "@mantine/core";
import { toWordUpdate, usesTranslations, wordToFormValues } from "../lib/wordForm";
import { useEditWord } from "../queries";
import type { Word } from "../schemas";
import { WordForm } from "./WordForm";

interface EditWordModalProps {
  /** The saved word to edit; null keeps the modal closed. */
  word: Word | null;
  onClose: () => void;
}

export function EditWordModal({ word, onClose }: EditWordModalProps) {
  const edit = useEditWord();
  const wordId = word?.id;

  return (
    <Modal opened={word !== null} onClose={onClose} title={word && `Edit "${word.name}"`} size="lg">
      {word && wordId != null && (
        <WordForm
          key={wordId} // fresh form state for each word
          mode="edit"
          initialValues={wordToFormValues(word)}
          showTranslations={usesTranslations(word.language)}
          submitLabel="Save"
          isPending={edit.isPending}
          onCancel={onClose}
          onSubmit={(values) =>
            edit.mutate({ wordId, changes: toWordUpdate(values, word.language) }, { onSuccess: onClose })
          }
        />
      )}
    </Modal>
  );
}
