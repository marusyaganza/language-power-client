import type { AnswerGrade } from "../schemas";

/** How a grade is shown to the player. */
export const GRADE_LABELS: Record<AnswerGrade, string> = { correct: "Correct", close: "Almost", wrong: "Not quite" };
