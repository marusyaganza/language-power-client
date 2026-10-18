import { Container, Stack, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { WordForm } from "../components/WordForm";
import { emptyWordForm, toWordCreate, usesTranslations } from "../lib/wordForm";
import { useCreateWord } from "../queries";

export function NewWordPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const create = useCreateWord();

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={2}>Add a new word</Title>
        <WordForm
          mode="create"
          initialValues={emptyWordForm()}
          showTranslations={usesTranslations(language)}
          submitLabel="Save word"
          isPending={create.isPending}
          onSubmit={(values) =>
            create.mutate(toWordCreate(values, language), { onSuccess: () => navigate("/words/vocabulary") })
          }
        />
      </Stack>
    </Container>
  );
}
