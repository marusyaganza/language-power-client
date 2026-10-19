import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, wordEchoQuestionSchema } from "../schemas";
import { AudioPrompt } from "./AudioPrompt";
import { DefinitionNote } from "./DefinitionNote";
import { TypedAnswerGame } from "./TypedAnswerGame";

const sessionSchema = gameSessionSchema(wordEchoQuestionSchema);

/** WordEcho (`audio`): listen to the word, type it. */
export function WordEchoGame(props: GamePlayerProps) {
  return (
    <TypedAnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <AudioPrompt url={question.question} />}
      renderFeedback={(question) => <DefinitionNote def={question.additional_info.def} />}
    />
  );
}
