import { z } from "zod";

// GameOut
export const gameSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  game_type: z.string(),
  /** Saved words this game can use. */
  total_word_count: z.number(),
  /** Of those, words due for spaced-repetition practice now. */
  due_word_count: z.number(),
  /** When the next word becomes due; null when none is scheduled. */
  next_due_at: z.string().nullable(),
  /** Fewer words than this and the backend refuses to start the game (409). */
  min_word_count: z.number(),
});
export type Game = z.infer<typeof gameSchema>;

export const gamesSchema = z.array(gameSchema);

// GameMode
export type GameMode = "spaced" | "review";

// AnswerGrade
export const answerGradeSchema = z.enum(["wrong", "close", "correct"]);
export type AnswerGrade = z.infer<typeof answerGradeSchema>;

// ExampleItem
const exampleSchema = z.object({
  text: z.string(),
  translation: z.string().nullable().optional(),
});

// QuestionAdditionalInfo — shown with the feedback after answering.
const questionInfoSchema = z.object({
  audio_url: z.string().nullable().optional(),
  img_url: z.string().nullable().optional(),
  examples: z.array(exampleSchema).nullable().optional(),
  def: z.string().nullable().optional(),
});
export type QuestionInfo = z.infer<typeof questionInfoSchema>;

// QuestionOut, as the typed-answer games send it. `question` differs per game, so each game extends this.
const typedAnswerQuestionSchema = z.object({
  id: z.number(),
  additional_info: questionInfoSchema,
});
export type TypedAnswerQuestion = z.infer<typeof typedAnswerQuestionSchema>;

/** WordRecall (`type_word`): up to 3 definitions. */
export const wordRecallQuestionSchema = typedAnswerQuestionSchema.extend({ question: z.array(z.string()) });
export type WordRecallQuestion = z.infer<typeof wordRecallQuestionSchema>;

/** WordEcho (`audio`): the URL of the word's pronunciation. */
export const wordEchoQuestionSchema = typedAnswerQuestionSchema.extend({ question: z.string() });
export type WordEchoQuestion = z.infer<typeof wordEchoQuestionSchema>;

/** PictureWord Blitz (`image`): the URL of a picture of the word. */
export const pictureWordQuestionSchema = typedAnswerQuestionSchema.extend({
  question: z.string(),
  /** The picture's alt text: a clue like WordRecall's first definition, never the word itself. */
  alt: z.string().nullable().optional(),
});
export type PictureWordQuestion = z.infer<typeof pictureWordQuestionSchema>;

// GameSessionOut — the envelope the games send; the shape of `questions` is up to each game.
export function gameSessionSchema<Q extends z.ZodType>(questionSchema: Q) {
  return z.object({
    task: z.string(),
    session_id: z.string(),
    questions: z.array(questionSchema),
  });
}
export interface GameSession<Q> {
  task: string;
  session_id: string;
  questions: Q[];
}

// AnswerRequest
export interface AnswerRequest {
  session_id: string;
  word_id: number;
  answer: string;
}

// AnswerResponse
export const answerResponseSchema = z.object({
  grade: answerGradeSchema,
  correct_answer: z.string().nullable().optional(),
  session_complete: z.boolean(),
});
export type AnswerResponse = z.infer<typeof answerResponseSchema>;

// GameResultOut — `questions` (per-word breakdown) isn't used yet, so it isn't parsed.
export const gameResultSchema = z.object({
  total_words: z.number(),
  correct: z.number(),
  close: z.number(),
  wrong: z.number(),
  unanswered: z.number(),
  score_percent: z.number(),
});
export type GameResult = z.infer<typeof gameResultSchema>;
