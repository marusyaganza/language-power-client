import { Container, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/language";
import { paths } from "@/shared/paths";
import { WordForm } from "../components/WordForm";
import { emptyWordForm, toWordCreate, usesTranslations } from "../lib/wordForm";
import { useCreateWord } from "../queries";

export function NewWordPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const location = useLocation();
  const create = useCreateWord();

  // Back to where the user came from; a page opened directly ("default" key) has no app history to go back to.
  function leave() {
    if (location.key === "default") navigate(paths.vocabulary);
    else navigate(-1);
  }

  function handleCancel(isDirty: boolean) {
    if (!isDirty) return leave();
    modals.openConfirmModal({
      title: "Discard this word?",
      children: <Text size="sm">What you've entered will be lost.</Text>,
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "scarlet" },
      onConfirm: leave,
    });
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={2}>Add a new word</Title>
        <WordForm
          mode="create"
          language={language}
          initialValues={emptyWordForm()}
          showTranslations={usesTranslations(language)}
          submitLabel="Save word"
          isPending={create.isPending}
          onSubmit={(values) =>
            create.mutate(toWordCreate(values, language), { onSuccess: () => navigate(paths.vocabulary) })
          }
          onCancel={handleCancel}
        />
      </Stack>
    </Container>
  );
}
