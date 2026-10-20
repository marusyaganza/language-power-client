import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, listenAndTypeQuestionSchema } from "../schemas";
import { AnswerGame } from "./AnswerGame";
import { AudioPrompt } from "./AudioPrompt";
import { DefinitionNote } from "./DefinitionNote";
import { TextAnswer } from "./TextAnswer";

const sessionSchema = gameSessionSchema(listenAndTypeQuestionSchema);

/** Listen & Type (`audio`): listen to the word, type it. */
export function ListenAndTypeGame(props: GamePlayerProps) {
  return (
    <AnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question, audio) => <AudioPrompt url={question.question} audio={audio} />}
      renderAnswer={(input) => <TextAnswer {...input} />}
      renderFeedback={(question) => <DefinitionNote def={question.additional_info.def} />}
    />
  );
}
