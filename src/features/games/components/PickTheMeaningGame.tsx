import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, pickTheMeaningQuestionSchema } from "../schemas";
import { AnswerGame } from "./AnswerGame";
import { ChoiceAnswer } from "./ChoiceAnswer";
import { WordPrompt } from "./WordPrompt";

const sessionSchema = gameSessionSchema(pickTheMeaningQuestionSchema);

/** Pick the Meaning (`select_def`): see the word, pick its definition. */
export function PickTheMeaningGame(props: GamePlayerProps) {
  return (
    <AnswerGame
      {...props}
      sessionSchema={sessionSchema}
      // The question shows the word, so hearing it gives nothing away.
      autoPlay="start"
      renderPrompt={(question) => <WordPrompt word={question.question} />}
      renderAnswer={(input, question) => (
        <ChoiceAnswer {...input} options={question.options} label={`Definitions of ${question.question}`} />
      )}
      // The options mark the correct one.
      showCorrectAnswer={false}
    />
  );
}
