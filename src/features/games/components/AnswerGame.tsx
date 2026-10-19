import { useEffect, useReducer, useState, type ReactNode } from "react";
import { ActionIcon, Box, Button, Center, Group, Loader, Progress, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconX } from "@tabler/icons-react";
import { z } from "zod";
import { randomMessage } from "../lib/gameMessages";
import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameProgressSchema, gameReducer, initialProgress, isLastQuestion } from "../lib/gameReducer";
import { clearStoredGame, loadStoredGame, saveStoredGame } from "../lib/gameStorage";
import { useFinishGame, useStartGame, useSubmitAnswer } from "../queries";
import type { Feedback } from "../lib/gameReducer";
import type { AnswerQuestion, GameSession } from "../schemas";
import { GameMessage } from "./GameMessage";
import { GameScreen } from "./GameScreen";
import { QuestionView } from "./QuestionView";
import { ResultScreen } from "./ResultScreen";

/** What an answer input (text field, options, …) gets from the game. */
export interface AnswerInputProps {
  value: string;
  onChange: (answer: string) => void;
  /** The grade once checked; the input is read-only from then on. */
  feedback: Feedback | null;
}

interface AnswerGameProps<Q extends AnswerQuestion> extends GamePlayerProps {
  /** This game's session format. Keep it stable (define it at module level). */
  sessionSchema: z.ZodType<GameSession<Q>>;
  /** What the player answers, shown above the input. */
  renderPrompt: (question: Q) => ReactNode;
  /** Where the player answers. The answer is sent exactly as the input reports it. */
  renderAnswer: (input: AnswerInputProps, question: Q) => ReactNode;
  /** False when the answer input marks the correct answer itself. */
  showCorrectAnswer?: boolean;
  /** Extra details shown with the feedback once the question is answered. */
  renderFeedback?: (question: Q) => ReactNode;
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
}: AnswerGameProps<Q>) {
  // Reload resumes the stored copy; arriving from the games list (which clears it) starts fresh.
  const [stored] = useState(() =>
    loadStoredGame(gameId, z.object({ session: sessionSchema, progress: gameProgressSchema })),
  );

  const start = useStartGame(gameId, language, options, sessionSchema, stored === null);
  const session = stored?.session ?? start.data;
  const [progress, dispatch] = useReducer(gameReducer, stored?.progress ?? initialProgress);
  const [footerMessage, setFooterMessage] = useState(() => randomMessage("initial"));
  const answer = useSubmitAnswer(gameId);
  const finish = useFinishGame();

  // Keep the reload copy in sync while the game runs.
  useEffect(() => {
    if (session && finish.isIdle) saveStoredGame(gameId, { session, progress });
  }, [gameId, session, progress, finish.isIdle]);

  function finishGame() {
    if (!session) return;
    finish.mutate(session.session_id, { onSuccess: () => clearStoredGame(gameId) });
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

  if (finish.data) {
    return (
      <GameScreen>
        <ResultScreen result={finish.data} onFinish={onLeave} />
      </GameScreen>
    );
  }
  if (finish.isPending || (!session && start.isPending)) {
    return (
      <GameScreen>
        <Loader size="lg" />
      </GameScreen>
    );
  }
  if (finish.isError) {
    return (
      <GameMessage title="Couldn't load your result" message={finish.error.message} onBack={onLeave}>
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
      { session_id: session.session_id, word_id: question.id, answer: progress.answer },
      {
        onSuccess: (response) => {
          dispatch({ type: "graded", response });
          setFooterMessage(randomMessage(response.grade === "wrong" ? "error" : "success"));
        },
      },
    );
  }

  function handleContinue() {
    if (isLastQuestion(progress, questionCount)) finishGame();
    else dispatch({ type: "next" });
  }

  return (
    <Box mih="100vh">
      <Group gap={0} align="center" wrap="nowrap">
        <Progress value={(index / questionCount) * 100} radius={0} size="sm" style={{ flex: 1 }} />
        <ActionIcon variant="subtle" onClick={confirmFinish} size="lg" mx="sm" aria-label="Finish game">
          <IconX size={20} />
        </ActionIcon>
      </Group>

      <Center mih="calc(100vh - 80px)" px="md">
        <Box maw={420} w="100%">
          <QuestionView
            task={session.task}
            prompt={renderPrompt(question)}
            answerInput={renderAnswer(
              {
                value: progress.answer,
                onChange: (value) => dispatch({ type: "answerChanged", answer: value }),
                feedback: progress.feedback,
              },
              question,
            )}
            showCorrectAnswer={showCorrectAnswer}
            info={question.additional_info}
            feedbackDetails={renderFeedback?.(question)}
            progress={progress}
            onCheck={handleCheck}
            onContinue={handleContinue}
            isChecking={answer.isPending}
            checkError={answer.error}
          />
        </Box>
      </Center>

      <Text ta="center" fs="italic" size="sm" c="dimmed" py="md">
        {footerMessage}
      </Text>
    </Box>
  );
}
