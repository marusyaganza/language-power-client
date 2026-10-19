import { describe, expect, it } from "vitest";
import { gameReducer, initialProgress, isLastQuestion, type GameProgress } from "./gameReducer";

const graded: GameProgress = {
  index: 1,
  answer: "tener",
  feedback: { grade: "close", correctAnswer: "tener", sessionComplete: false },
};

describe("gameReducer", () => {
  it("updates the answer while it hasn't been graded", () => {
    expect(gameReducer(initialProgress, { type: "answerChanged", answer: "ten" })).toEqual({
      ...initialProgress,
      answer: "ten",
    });
  });

  it("keeps a graded answer frozen", () => {
    expect(gameReducer(graded, { type: "answerChanged", answer: "changed" })).toBe(graded);
  });

  it("stores the grade from the backend", () => {
    const state = gameReducer(
      { ...initialProgress, answer: "tenr" },
      { type: "graded", response: { grade: "wrong", correct_answer: "tener", session_complete: true } },
    );
    expect(state).toEqual({
      index: 0,
      answer: "tenr",
      feedback: { grade: "wrong", correctAnswer: "tener", sessionComplete: true },
    });
  });

  it("defaults a missing correct answer to null", () => {
    const state = gameReducer(initialProgress, {
      type: "graded",
      response: { grade: "correct", session_complete: false },
    });
    expect(state.feedback?.correctAnswer).toBeNull();
  });

  it("moves to the next question with a clean answer", () => {
    expect(gameReducer(graded, { type: "next" })).toEqual({ index: 2, answer: "", feedback: null });
  });
});

describe("isLastQuestion", () => {
  it("is true on the last index", () => {
    expect(isLastQuestion({ ...initialProgress, index: 2 }, 3)).toBe(true);
    expect(isLastQuestion({ ...initialProgress, index: 1 }, 3)).toBe(false);
  });

  it("trusts the backend's session_complete", () => {
    expect(isLastQuestion({ ...graded, feedback: { ...graded.feedback!, sessionComplete: true } }, 10)).toBe(true);
  });
});
