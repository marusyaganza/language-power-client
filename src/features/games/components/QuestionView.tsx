import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { ActionIcon, Alert, Box, Button, Group, Image, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPhoto, IconPlayerPlay } from "@tabler/icons-react";
import { ExampleList } from "@/shared/components/ExampleList";
import type { GameProgress } from "../lib/gameReducer";
import type { QuestionInfo } from "../schemas";
import classes from "./QuestionView.module.css";

const IMAGE_SIZE = 160;
/** Keeps an empty line's height, so text appearing there later doesn't move what's below. */
const BLANK = "\u00a0";

interface QuestionViewProps {
  task: string;
  /** What the player answers: the definitions, a sound to play, … */
  prompt: ReactNode;
  /** Where the player answers: a text input, options to pick from, … */
  answerInput: ReactNode;
  /** Show the expected answer above the task after a wrong answer. Off for inputs that mark it themselves. */
  showCorrectAnswer?: boolean;
  /** Shown with the feedback once the answer has been graded. */
  info: QuestionInfo;
  /** Game-specific details shown with the feedback, above the examples. */
  feedbackDetails?: ReactNode;
  /** Plays the word's audio when the player asks (the play button next to the task). */
  onPlayAudio: (url: string) => void;
  /** Offer the play button from the start, for games that already show the word. Otherwise it comes with the feedback. */
  showAudioBeforeAnswer: boolean;
  progress: GameProgress;
  onCheck: () => void;
  onContinue: () => void;
  isChecking: boolean;
  checkError: Error | null;
}

export function QuestionView({
  task,
  prompt,
  answerInput,
  showCorrectAnswer = true,
  info,
  feedbackDetails,
  onPlayAudio,
  showAudioBeforeAnswer,
  progress,
  onCheck,
  onContinue,
  isChecking,
  checkError,
}: QuestionViewProps) {
  const { answer, feedback } = progress;
  const examples = info.examples ?? [];
  const continueRef = useRef<HTMLButtonElement>(null);
  const [imageOpened, imageModal] = useDisclosure(false);

  // The answer input is disabled once graded, which drops focus; move it to Continue so Enter goes on.
  useEffect(() => {
    if (feedback) continueRef.current?.focus();
  }, [feedback]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (feedback) onContinue();
    else if (answer.trim()) onCheck();
  }

  const correctAnswer = showCorrectAnswer && feedback && feedback.grade !== "correct" ? feedback.correctAnswer : null;
  // Feedback-only bits keep their space from the start (hidden), so nothing moves when they appear.
  const hiddenUntilFeedback = feedback ? undefined : { visibility: "hidden" as const };

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <Stack align="center" gap="md">
        {info.img_url && (
          // Loaded (hidden) with the question, so it's ready when shown. Phones get a button instead.
          <Image
            src={info.img_url}
            w={IMAGE_SIZE}
            h={IMAGE_SIZE}
            fit="contain"
            radius="md"
            alt=""
            visibleFrom="sm"
            className={classes.image}
            style={hiddenUntilFeedback}
          />
        )}

        {showCorrectAnswer && (
          <span className={classes.correctAnswer} style={correctAnswer ? undefined : { visibility: "hidden" }}>
            {correctAnswer || BLANK}
          </span>
        )}

        <Group gap={6} justify="center">
          <Text fs="italic">{task}</Text>
          {info.audio_url && (
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => onPlayAudio(info.audio_url!)}
              aria-label="Play pronunciation"
              style={showAudioBeforeAnswer ? undefined : hiddenUntilFeedback}
            >
              <IconPlayerPlay size={14} />
            </ActionIcon>
          )}
          {info.img_url && (
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={imageModal.open}
              aria-label="Show picture"
              hiddenFrom="sm"
              style={hiddenUntilFeedback}
            >
              <IconPhoto size={14} />
            </ActionIcon>
          )}
        </Group>

        {prompt}

        <Box key={progress.index} w="100%">
          {/* keyed: a fresh input (and autofocus) for every question */}
          {answerInput}
        </Box>

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
          <Button type="submit" ref={continueRef}>
            Continue
          </Button>
        )}

        {feedback && feedbackDetails}

        {feedback && examples.length > 0 && (
          <Stack gap="xs" w="100%" className={classes.examples}>
            <span className="app-label">Examples</span>
            <ExampleList examples={examples} />
          </Stack>
        )}
      </Stack>

      {info.img_url && (
        <Modal opened={imageOpened} onClose={imageModal.close} title="Picture" centered>
          <Image src={info.img_url} fit="contain" mah="70vh" radius="md" alt="" className={classes.image} />
        </Modal>
      )}
    </form>
  );
}
