import { TextInput } from "@mantine/core";
import { GRADE_LABELS } from "../lib/gradeLabels";
import type { AnswerInputProps } from "./AnswerGame";
import classes from "./TextAnswer.module.css";

/** The player types the answer. */
export function TextAnswer({ value, onChange, feedback }: AnswerInputProps) {
  return (
    <TextInput
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      disabled={feedback !== null}
      data-grade={feedback?.grade}
      classNames={{ input: classes.answer }}
      aria-label="Your answer"
      // Always rendered, so the grade appearing doesn't push the button down.
      description={feedback ? GRADE_LABELS[feedback.grade] : "\u00a0"}
      inputWrapperOrder={["label", "input", "description", "error"]}
      size="md"
      autoFocus
      autoComplete="off"
      w="100%"
    />
  );
}
