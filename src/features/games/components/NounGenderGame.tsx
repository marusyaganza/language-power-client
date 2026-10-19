import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, nounGenderQuestionSchema } from "../schemas";
import { AnswerGame } from "./AnswerGame";
import { GenderAnswer } from "./GenderAnswer";
import { WordPrompt } from "./WordPrompt";

const sessionSchema = gameSessionSchema(nounGenderQuestionSchema);

/** Noun Gender (`gender`): see the noun, tick its gender (or both). */
export function NounGenderGame(props: GamePlayerProps) {
  return (
    <AnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <WordPrompt word={question.question} />}
      renderAnswer={(input, question) => (
        <GenderAnswer
          {...input}
          options={question.options}
          language={props.language}
          label={`Gender of ${question.question}`}
        />
      )}
      // The tiles mark the correct genders.
      showCorrectAnswer={false}
    />
  );
}
