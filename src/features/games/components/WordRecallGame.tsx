import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, wordRecallQuestionSchema } from "../schemas";
import { AnswerGame } from "./AnswerGame";
import { DefinitionsPrompt } from "./DefinitionsPrompt";
import { TextAnswer } from "./TextAnswer";

const sessionSchema = gameSessionSchema(wordRecallQuestionSchema);

/** WordRecall (`type_word`): read the definitions, type the word. */
export function WordRecallGame(props: GamePlayerProps) {
  return (
    <AnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <DefinitionsPrompt definitions={question.question} />}
      renderAnswer={(input) => <TextAnswer {...input} />}
    />
  );
}
