import { useId } from "react";
import { Stack, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { GRADE_LABELS } from "../lib/gradeLabels";
import type { AnswerInputProps } from "./AnswerGame";
import classes from "./ChoiceAnswer.module.css";

interface ChoiceAnswerProps extends AnswerInputProps {
  options: string[];
  /** Names the group for screen readers, e.g. "Definitions of wheel". */
  label: string;
}

type OptionResult = "correct" | "wrong";

/**
 * The player picks one option. Native radios, visually hidden, inside clickable cards:
 * one tab stop, arrow keys to move, Enter to check.
 */
export function ChoiceAnswer({ value, onChange, feedback, options, label }: ChoiceAnswerProps) {
  const name = useId();

  function resultOf(option: string): OptionResult | undefined {
    if (!feedback) return undefined;
    const correct = feedback.grade === "wrong" ? feedback.correctAnswer : value;
    if (option === correct) return "correct";
    if (option === value) return "wrong";
    return undefined;
  }

  return (
    <Stack gap="sm" align="center">
      <fieldset className={classes.group} disabled={feedback !== null}>
        <legend className={classes.visuallyHidden}>{label}</legend>
        {options.map((option, i) => {
          const result = resultOf(option);
          return (
            <label key={option} className={classes.option} data-result={result}>
              <input
                type="radio"
                name={name}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                className={classes.visuallyHidden}
                // Focus only, a radio isn't selected by focusing it.
                autoFocus={value ? value === option : i === 0}
              />
              <Text component="span" size="sm" style={{ flex: 1 }}>
                {option}
              </Text>
              {result === "correct" && <IconCheck size={18} aria-hidden />}
              {result === "wrong" && <IconX size={18} aria-hidden />}
              {result && <span className={classes.visuallyHidden}>{result === "correct" ? "Correct answer" : "Your answer"}</span>}
            </label>
          );
        })}
      </fieldset>

      {feedback && (
        <Text size="sm" ff="var(--app-font-ui)" c="dimmed">
          {GRADE_LABELS[feedback.grade]}
        </Text>
      )}
    </Stack>
  );
}
