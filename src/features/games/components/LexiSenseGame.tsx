import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, lexiSenseQuestionSchema } from "../schemas";
import { AnswerGame } from "./AnswerGame";
import { ChoiceAnswer } from "./ChoiceAnswer";
import { WordPrompt } from "./WordPrompt";

const sessionSchema = gameSessionSchema(lexiSenseQuestionSchema);

/** LexiSense (`select_def`): see the word, pick its definition. */
export function LexiSenseGame(props: GamePlayerProps) {
  return (
    <AnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <WordPrompt word={question.question} />}
      renderAnswer={(input, question) => (
        <ChoiceAnswer {...input} options={question.options} label={`Definitions of ${question.question}`} />
      )}
      // The options mark the correct one.
      showCorrectAnswer={false}
    />
  );
}
