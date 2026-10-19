import type { GamePlayerProps } from "../lib/gamePlayer";
import { definifyQuestionSchema, gameSessionSchema } from "../schemas";
import { AnswerGame } from "./AnswerGame";
import { ChoiceAnswer } from "./ChoiceAnswer";
import { DefinitionsPrompt } from "./DefinitionsPrompt";

const sessionSchema = gameSessionSchema(definifyQuestionSchema);

/** Definify (`select_word`): read the definitions, pick the word. */
export function DefinifyGame(props: GamePlayerProps) {
  return (
    <AnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <DefinitionsPrompt definitions={question.question} />}
      renderAnswer={(input, question) => <ChoiceAnswer {...input} options={question.options} label="Words" />}
      // The options mark the correct one.
      showCorrectAnswer={false}
    />
  );
}
