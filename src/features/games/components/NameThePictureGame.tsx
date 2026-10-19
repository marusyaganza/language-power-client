import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, nameThePictureQuestionSchema } from "../schemas";
import { AnswerGame } from "./AnswerGame";
import { DefinitionNote } from "./DefinitionNote";
import { ImagePrompt } from "./ImagePrompt";
import { TextAnswer } from "./TextAnswer";

const sessionSchema = gameSessionSchema(nameThePictureQuestionSchema);

/** Name the Picture (`image`): look at the picture, type the word. */
export function NameThePictureGame(props: GamePlayerProps) {
  return (
    <AnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <ImagePrompt url={question.question} alt={question.alt} />}
      renderAnswer={(input) => <TextAnswer {...input} />}
      renderFeedback={(question) => <DefinitionNote def={question.additional_info.def} />}
    />
  );
}
