import { useEffect, useReducer, useState, type ReactNode } from "react";
import { ActionIcon, Box, Button, Center, Group, Loader, Progress, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconX } from "@tabler/icons-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { QuestionView } from "../components/QuestionView";
import { ResultScreen } from "../components/ResultScreen";
import { randomMessage } from "../lib/gameMessages";
import { gamesListPath, parseGameOptions } from "../lib/gameOptions";
import { gameReducer, initialProgress, isLastQuestion } from "../lib/gameReducer";
import { clearStoredGame, loadStoredGame, saveStoredGame } from "../lib/gameStorage";
import { useFinishGame, useStartGame, useSubmitAnswer } from "../queries";

export function GamePage() {
  const navigate = useNavigate();
  const gameId = Number(useParams().gameId);
  const { language: currentLanguage } = useLanguage();
  const [searchParams] = useSearchParams();

  // Fixed for the whole visit: the session was started with them, later changes are ignored.
  const [setup] = useState(() => ({ language: currentLanguage, options: parseGameOptions(searchParams) }));
  // Reload resumes the stored copy; arriving from the games list (which clears it) starts fresh.
  const [stored] = useState(() => loadStoredGame(gameId));

  const start = useStartGame(gameId, setup.language, setup.options, stored === null && Number.isInteger(gameId));
  const session = stored?.session ?? start.data;
  const [progress, dispatch] = useReducer(gameReducer, stored?.progress ?? initialProgress);
  const [footerMessage, setFooterMessage] = useState(() => randomMessage("initial"));
  const answer = useSubmitAnswer(gameId);
  const finish = useFinishGame();
  const listPath = gamesListPath(setup.options);

  // Keep the reload copy in sync while the game runs.
  useEffect(() => {
    if (session && finish.isIdle) saveStoredGame(gameId, { session, progress });
  }, [gameId, session, progress, finish.isIdle]);

  function leave() {
    clearStoredGame(gameId);
    navigate(listPath);
  }

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

  if (!Number.isInteger(gameId)) {
    return <MessageScreen message="This game doesn't exist." onBack={leave} />;
  }
  if (finish.data) {
    return (
      <Screen>
        <ResultScreen result={finish.data} onFinish={leave} />
      </Screen>
    );
  }
  if (finish.isPending || (!session && start.isPending)) {
    return (
      <Screen>
        <Loader size="lg" />
      </Screen>
    );
  }
  if (finish.isError) {
    return (
      <MessageScreen title="Couldn't load your result" message={finish.error.message} onBack={leave}>
        <Button variant="default" onClick={finishGame}>
          Try again
        </Button>
      </MessageScreen>
    );
  }
  if (!session) {
    return <MessageScreen title="Couldn't start the game" message={start.error?.message} onBack={leave} />;
  }
  if (session.questions.length === 0) {
    return <MessageScreen message="There are no words to practice right now." onBack={leave} />;
  }

  const questionCount = session.questions.length;
  const index = Math.min(progress.index, questionCount - 1);
  const question = session.questions[index];

  function handleCheck() {
    if (!session) return;
    answer.mutate(
      { session_id: session.session_id, word_id: question.id, answer: progress.answer.trim() },
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
            question={question}
            progress={progress}
            onAnswerChange={(value) => dispatch({ type: "answerChanged", answer: value })}
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

function Screen({ children }: { children: ReactNode }) {
  return (
    <Center mih="100vh" px="md">
      {children}
    </Center>
  );
}

function MessageScreen({
  title,
  message,
  onBack,
  children,
}: {
  title?: string;
  message?: string;
  onBack: () => void;
  children?: ReactNode;
}) {
  return (
    <Screen>
      <Stack align="center" gap="md" maw={420}>
        {title && <Text fw={600}>{title}</Text>}
        {message && (
          <Text c="dimmed" ta="center">
            {message}
          </Text>
        )}
        <Group>
          {children}
          <Button onClick={onBack}>Back to games</Button>
        </Group>
      </Stack>
    </Screen>
  );
}
