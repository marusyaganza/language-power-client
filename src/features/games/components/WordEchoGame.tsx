import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, wordEchoQuestionSchema } from "../schemas";
import { AnswerGame } from "./AnswerGame";
import { AudioPrompt } from "./AudioPrompt";
import { DefinitionNote } from "./DefinitionNote";
import { TextAnswer } from "./TextAnswer";

const sessionSchema = gameSessionSchema(wordEchoQuestionSchema);

/** WordEcho (`audio`): listen to the word, type it. */
export function WordEchoGame(props: GamePlayerProps) {
  return (
    <AnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <AudioPrompt url={question.question} />}
      renderAnswer={(input) => <TextAnswer {...input} />}
      renderFeedback={(question) => <DefinitionNote def={question.additional_info.def} />}
    />
  );
}
