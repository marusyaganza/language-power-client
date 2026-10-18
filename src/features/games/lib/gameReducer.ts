// Progress through a game session: the typed answer, the grade once checked, and which question is shown.
import { z } from "zod";
import { answerGradeSchema, type AnswerResponse, type Question } from "../schemas";

export const feedbackSchema = z.object({
  grade: answerGradeSchema,
  correctAnswer: z.string().nullable(),
  /** The backend says this was the last question. */
  sessionComplete: z.boolean(),
});
export type Feedback = z.infer<typeof feedbackSchema>;

export const gameProgressSchema = z.object({
  index: z.number().int().min(0),
  answer: z.string(),
  feedback: feedbackSchema.nullable(),
});
export type GameProgress = z.infer<typeof gameProgressSchema>;

export const initialProgress: GameProgress = { index: 0, answer: "", feedback: null };

export type GameAction =
  | { type: "answerChanged"; answer: string }
  | { type: "graded"; response: AnswerResponse }
  | { type: "next" };

export function gameReducer(state: GameProgress, action: GameAction): GameProgress {
  switch (action.type) {
    case "answerChanged":
      // The answer is frozen once it has been graded.
      return state.feedback ? state : { ...state, answer: action.answer };
    case "graded":
      return {
        ...state,
        feedback: {
          grade: action.response.grade,
          correctAnswer: action.response.correct_answer ?? null,
          sessionComplete: action.response.session_complete,
        },
      };
    case "next":
      return { index: state.index + 1, answer: "", feedback: null };
  }
}

/** Whether "Continue" should finish the game instead of moving to the next question. */
export function isLastQuestion(progress: GameProgress, questionCount: number): boolean {
  return progress.feedback?.sessionComplete === true || progress.index + 1 >= questionCount;
}

/** A question's prompt lines; some game types send a list of definitions, others a single string. */
export function questionLines(question: Question): string[] {
  return Array.isArray(question.question) ? question.question : [question.question];
}
