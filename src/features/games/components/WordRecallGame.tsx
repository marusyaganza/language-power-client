import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, wordRecallQuestionSchema } from "../schemas";
import { DefinitionsPrompt } from "./DefinitionsPrompt";
import { TypedAnswerGame } from "./TypedAnswerGame";

const sessionSchema = gameSessionSchema(wordRecallQuestionSchema);

/** WordRecall (`type_word`): read the definitions, type the word. */
export function WordRecallGame(props: GamePlayerProps) {
  return (
    <TypedAnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <DefinitionsPrompt definitions={question.question} />}
    />
  );
}
