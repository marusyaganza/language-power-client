import { Text } from "@mantine/core";
import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, wordEchoQuestionSchema } from "../schemas";
import { AudioPrompt } from "./AudioPrompt";
import { TypedAnswerGame } from "./TypedAnswerGame";

const sessionSchema = gameSessionSchema(wordEchoQuestionSchema);

/** WordEcho (`audio`): listen to the word, type it. */
export function WordEchoGame(props: GamePlayerProps) {
  return (
    <TypedAnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <AudioPrompt url={question.question} />}
      // e.g. "hola means hello!, hi!"; it names the word, so it only shows after answering.
      renderFeedback={(question) =>
        question.additional_info.def && (
          <Text ta="center" mt="md">
            {question.additional_info.def}
          </Text>
        )
      }
    />
  );
}
