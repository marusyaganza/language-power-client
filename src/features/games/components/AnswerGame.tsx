import { useEffect, useEffectEvent, useReducer, useState, type ReactNode } from "react";
import { ActionIcon, Box, Button, Flex, Group, Loader, Modal, Progress, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconVolume, IconVolumeOff, IconX } from "@tabler/icons-react";
import { z } from "zod";
import { useCurrentUser } from "@/features/auth";
import { useGameAudio, type GameAudio } from "../hooks/useGameAudio";
import { autoPlayUrl, type AutoPlayMoment } from "../lib/gameAudio";
import { randomMessage } from "../lib/gameMessages";
import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameProgressSchema, gameReducer, initialProgress, isLastQuestion } from "../lib/gameReducer";
import { clearStoredGame, loadStoredGame, saveStoredGame } from "../lib/gameStorage";
import {
  isSessionExpired,
  SESSION_EXPIRED_TITLE,
  sessionExpiredMessage,
  type ExpiredDuring,
} from "../lib/sessionExpiry";
import { useGameResult, useStartGame, useSubmitAnswer } from "../queries";
import type { Feedback } from "../lib/gameReducer";
import type { AnswerQuestion, GameSession } from "../schemas";
import { GameMessage } from "./GameMessage";
import { GameScreen } from "./GameScreen";
import { QuestionView } from "./QuestionView";
import { ResultScreen } from "./ResultScreen";
import classes from "./AnswerGame.module.css";

/** What an answer input (text field, options, …) gets from the game. */
export interface AnswerInputProps {
  value: string;
  onChange: (answer: string) => void;
  /** The grade once checked; the input is read-only from then on. */
  feedback: Feedback | null;
  /** 0 for the first question, e.g. to show a how-to hint there only. */
  questionIndex: number;
}

interface AnswerGameProps<Q extends AnswerQuestion> extends GamePlayerProps {
  /** This game's session format. Keep it stable (define it at module level). */
  sessionSchema: z.ZodType<GameSession<Q>>;
  /** What the player answers, shown above the input. Sound goes through `audio`, the game's one player. */
  renderPrompt: (question: Q, audio: GameAudio) => ReactNode;
  /** Where the player answers. The answer is sent exactly as the input reports it. */
  renderAnswer: (input: AnswerInputProps, question: Q) => ReactNode;
  /** False when the answer input marks the correct answer itself. */
  showCorrectAnswer?: boolean;
  /** Extra details shown with the feedback once the question is answered. */
  renderFeedback?: (question: Q) => ReactNode;
  /** When the word's audio plays on its own (unless muted). Defaults to `feedback`. */
  autoPlay?: AutoPlayMoment;
}

/**
 * Plays a game with one graded answer per question. Such games differ only in the prompt,
 * the answer input and the feedback details; the session flow is the same.
 */
export function AnswerGame<Q extends AnswerQuestion>({
  gameId,
  language,
  options,
  onLeave,
  sessionSchema,
  renderPrompt,
  renderAnswer,
  showCorrectAnswer,
  renderFeedback,
  autoPlay = "feedback",
}: AnswerGameProps<Q>) {
  // Reload resumes the stored copy; arriving from the games list (which clears it) starts fresh.
  const [stored] = useState(() =>
    loadStoredGame(gameId, z.object({ session: sessionSchema, progress: gameProgressSchema })),
  );

  const start = useStartGame(gameId, language, options, sessionSchema, stored === null);
  const session = stored?.session ?? start.data;
  const [progress, dispatch] = useReducer(gameReducer, stored?.progress ?? initialProgress);
  const [footerMessage, setFooterMessage] = useState(() => randomMessage("initial"));
  /** Set once the backend has dropped the session; the game stops and explains before leaving. */
  const [expiredMessage, setExpiredMessage] = useState<string | null>(null);
  const answer = useSubmitAnswer();
  const result = useGameResult();
  const { data: user } = useCurrentUser();
  const audio = useGameAudio(user?.id);

  // Play the word on its own. Depends on the URL, not on `answered`: a `start` game doesn't replay
  // on feedback, a `feedback` game starts once answered, muting stops it, and a new question stops the last.
  const currentQuestion = session?.questions[Math.min(progress.index, session.questions.length - 1)];
  const playUrl = autoPlayUrl({
    moment: autoPlay,
    answered: progress.feedback !== null,
    muted: audio.muted,
    audioUrl: currentQuestion?.additional_info.audio_url,
  });
  const playOnItsOwn = useEffectEvent((url: string) => audio.play(url));
  const stopAudio = useEffectEvent(() => audio.stop());
  useEffect(() => {
    if (!playUrl) return;
    playOnItsOwn(playUrl);
    return () => stopAudio();
  }, [playUrl, progress.index]);

  // Keep the reload copy in sync while the game runs.
  useEffect(() => {
    if (session && result.isIdle && expiredMessage === null) saveStoredGame(gameId, { session, progress });
  }, [gameId, session, progress, result.isIdle, expiredMessage]);

  // The backend dropped the session (20 minutes without an answer). Stop the game and say what was saved:
  // every graded answer is, an answer sent after expiry isn't. A reload must not resume it.
  function stopIfExpired(during: ExpiredDuring) {
    return (error: Error) => {
      if (!isSessionExpired(error)) return;
      const savedAnswers = progress.index + (progress.feedback ? 1 : 0);
      clearStoredGame(gameId);
      setExpiredMessage(sessionExpiredMessage(during, savedAnswers));
    };
  }

  function finishGame() {
    if (!session) return;
    result.mutate(session.session_id, { onSuccess: () => clearStoredGame(gameId), onError: stopIfExpired("result") });
  }

  function confirmFinish() {
    modals.openConfirmModal({
      title: "Finish the game?",
      children: (
        <Text size="sm">You'll see your result now. Questions you haven't answered will count as not answered.</Text>
      ),
      labels: { confirm: "Finish game", cancel: "Keep playing" },
      onConfirm: finishGame,
    });
  }

  if (result.data) {
    return (
      <GameScreen>
        <ResultScreen result={result.data} onFinish={onLeave} />
      </GameScreen>
    );
  }
  if (result.isPending || (!session && start.isPending)) {
    return (
      <GameScreen>
        <Loader size="lg" />
      </GameScreen>
    );
  }
  // An expired session stays on the question, under the timeout modal, instead of this retry screen.
  if (result.isError && !isSessionExpired(result.error)) {
    return (
      <GameMessage title="Couldn't load your result" message={result.error.message} onBack={onLeave}>
        <Button variant="default" onClick={finishGame}>
          Try again
        </Button>
      </GameMessage>
    );
  }
  if (!session) {
    return <GameMessage title="Couldn't start the game" message={start.error?.message} onBack={onLeave} />;
  }
  if (session.questions.length === 0) {
    return <GameMessage message="There are no words to practice right now." onBack={onLeave} />;
  }

  const questionCount = session.questions.length;
  const index = Math.min(progress.index, questionCount - 1);
  const question = session.questions[index];

  function handleCheck() {
    if (!session) return;
    answer.mutate(
      { sessionId: session.session_id, word_id: question.id, answer: progress.answer },
      {
        onSuccess: (response) => {
          dispatch({ type: "graded", response });
          setFooterMessage(randomMessage(response.grade === "wrong" ? "error" : "success"));
        },
        onError: stopIfExpired("answer"),
      },
    );
  }

  function handleContinue() {
    if (isLastQuestion(progress, questionCount)) finishGame();
    else dispatch({ type: "next" });
  }

  return (
    <Flex direction="column" mih="100vh">
      <Group gap="md" align="center" wrap="nowrap" px="lg" pt="lg">
        <Progress
          value={(index / questionCount) * 100}
          size="md"
          radius="xl"
          style={{ flex: 1 }}
          aria-label={`Question ${index + 1} of ${questionCount}`}
        />
        <Tooltip label={audio.muted ? "Sound off: nothing plays or loads on its own" : "Sound on"}>
          <ActionIcon
            variant="subtle"
            onClick={audio.toggleMuted}
            size="lg"
            aria-label={audio.muted ? "Turn sound on" : "Mute sound"}
            aria-pressed={audio.muted}
          >
            {audio.muted ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
          </ActionIcon>
        </Tooltip>
        <ActionIcon variant="subtle" onClick={confirmFinish} size="lg" aria-label="Finish game">
          <IconX size={20} />
        </ActionIcon>
      </Group>

      {/* Top-aligned, not centered: feedback grows below the question instead of moving it. */}
      <Flex justify="center" px="md" pt={{ base: "xl", sm: 64 }} pb="xl" style={{ flex: 1 }}>
        <Box maw={420} w="100%">
          <QuestionView
            task={session.task}
            prompt={renderPrompt(question, audio)}
            answerInput={renderAnswer(
              {
                value: progress.answer,
                onChange: (value) => dispatch({ type: "answerChanged", answer: value }),
                feedback: progress.feedback,
                questionIndex: index,
              },
              question,
            )}
            showCorrectAnswer={showCorrectAnswer}
            info={question.additional_info}
            feedbackDetails={renderFeedback?.(question)}
            onPlayAudio={audio.play}
            showAudioBeforeAnswer={autoPlay === "start"}
            progress={progress}
            onCheck={handleCheck}
            onContinue={handleContinue}
            isChecking={answer.isPending}
            checkError={isSessionExpired(answer.error) ? null : answer.error}
          />
        </Box>
      </Flex>

      <footer className={classes.footer}>
        <Text ta="center" fs="italic">
          {footerMessage}
        </Text>
      </footer>

      <Modal
        opened={expiredMessage !== null}
        onClose={onLeave}
        title={SESSION_EXPIRED_TITLE}
        withCloseButton={false}
        closeOnClickOutside={false}
        centered
      >
        <Text size="sm">{expiredMessage}</Text>
        <Group justify="flex-end" mt="lg">
          <Button onClick={onLeave} data-autofocus>
            Back to games
          </Button>
        </Group>
      </Modal>
    </Flex>
  );
}
