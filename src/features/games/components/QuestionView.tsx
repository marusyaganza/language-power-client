import type { FormEvent } from "react";
import { ActionIcon, Alert, Button, Group, Image, Stack, Text, TextInput } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { questionLines, type GameProgress } from "../lib/gameReducer";
import type { Question } from "../schemas";
import classes from "./QuestionView.module.css";

const GRADE_LABELS = { correct: "Correct", close: "Almost", wrong: "Not quite" } as const;

interface QuestionViewProps {
  task: string;
  question: Question;
  progress: GameProgress;
  onAnswerChange: (answer: string) => void;
  onCheck: () => void;
  onContinue: () => void;
  isChecking: boolean;
  checkError: Error | null;
}

export function QuestionView({
  task,
  question,
  progress,
  onAnswerChange,
  onCheck,
  onContinue,
  isChecking,
  checkError,
}: QuestionViewProps) {
  const { answer, feedback } = progress;
  const info = question.additional_info;
  const examples = info.examples ?? [];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (feedback) onContinue();
    else if (answer.trim()) onCheck();
  }

  function playAudio(url: string) {
    new Audio(url).play().catch(() => {});
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <Stack align="center" gap="md">
        {feedback && feedback.grade !== "correct" && feedback.correctAnswer && (
          <span className={classes.correctAnswer}>{feedback.correctAnswer}</span>
        )}

        <Group gap={6} justify="center">
          <Text fs="italic">{task}</Text>
          {feedback && info.audio_url && (
            <ActionIcon variant="subtle" size="sm" onClick={() => playAudio(info.audio_url!)} aria-label="Play pronunciation">
              <IconPlayerPlay size={14} />
            </ActionIcon>
          )}
        </Group>

        <Stack gap={4} align="center">
          {questionLines(question).map((line, i) => (
            <Text key={i} ta="center">
              🌟 {line}
            </Text>
          ))}
        </Stack>

        <TextInput
          key={progress.index} // fresh input (and autofocus) for every question
          value={answer}
          onChange={(e) => onAnswerChange(e.currentTarget.value)}
          disabled={feedback !== null}
          data-grade={feedback?.grade}
          classNames={{ input: classes.answer }}
          aria-label="Your answer"
          description={feedback ? GRADE_LABELS[feedback.grade] : undefined}
          inputWrapperOrder={["label", "input", "description", "error"]}
          size="md"
          autoFocus
          autoComplete="off"
          w="100%"
        />

        {checkError && (
          <Alert color="rose" variant="light" w="100%">
            {checkError.message}
          </Alert>
        )}

        {feedback === null ? (
          <Button type="submit" loading={isChecking} disabled={!answer.trim()}>
            Check
          </Button>
        ) : (
          <Button type="submit" autoFocus>
            Continue
          </Button>
        )}

        {feedback && examples.length > 0 && (
          <Stack gap={4} mt="md" style={{ alignSelf: "flex-start" }}>
            <Text size="sm" fw={600}>
              Examples
            </Text>
            {examples.map((ex, i) => (
              <Text key={i} size="sm" fs="italic" c="dimmed">
                {ex.text}
                {ex.translation && ` (${ex.translation})`}
              </Text>
            ))}
          </Stack>
        )}

        {feedback && info.img_url && <Image src={info.img_url} w={160} radius="md" mt="md" alt="" />}
      </Stack>
    </form>
  );
}
