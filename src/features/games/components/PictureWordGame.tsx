import type { GamePlayerProps } from "../lib/gamePlayer";
import { gameSessionSchema, pictureWordQuestionSchema } from "../schemas";
import { DefinitionNote } from "./DefinitionNote";
import { ImagePrompt } from "./ImagePrompt";
import { TypedAnswerGame } from "./TypedAnswerGame";

const sessionSchema = gameSessionSchema(pictureWordQuestionSchema);

/** PictureWord Blitz (`image`): look at the picture, type the word. */
export function PictureWordGame(props: GamePlayerProps) {
  return (
    <TypedAnswerGame
      {...props}
      sessionSchema={sessionSchema}
      renderPrompt={(question) => <ImagePrompt url={question.question} alt={question.alt} />}
      renderFeedback={(question) => <DefinitionNote def={question.additional_info.def} />}
    />
  );
}
