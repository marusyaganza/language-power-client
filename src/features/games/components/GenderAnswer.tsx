import { Stack, Text } from "@mantine/core";
import { IconCheck, IconCircleCheckFilled, IconX } from "@tabler/icons-react";
import { decodeGenderAnswer, genderOptionResult, toggleGender, type GenderOptionResult } from "../lib/genderAnswer";
import { genderArticle, genderLabel } from "../lib/genderArticles";
import { GRADE_LABELS } from "../lib/gradeLabels";
import type { AnswerInputProps } from "./AnswerGame";
import shared from "./answerOption.module.css";
import classes from "./GenderAnswer.module.css";

interface GenderAnswerProps extends AnswerInputProps {
  /** The genders to tick, as the backend sends them ("masculine", "feminine"). */
  options: string[];
  /** The study language; picks the articles shown ("el", "la"). */
  language: string;
  /** Names the group for screen readers, e.g. "Gender of ballena". */
  label: string;
}

const RESULT_TEXT: Record<GenderOptionResult, string> = {
  correct: "Correct",
  missed: "Correct, not ticked",
  wrong: "Wrong",
};

/**
 * The player ticks one gender or several (a noun can take both). Native checkboxes, visually hidden,
 * inside tiles that show the language's article, or the gender's name where there is none.
 */
export function GenderAnswer({ value, onChange, feedback, questionIndex, options, language, label }: GenderAnswerProps) {
  const ticked = decodeGenderAnswer(value);
  const expected = feedback
    ? feedback.grade === "correct"
      ? ticked
      : decodeGenderAnswer(feedback.correctAnswer ?? "")
    : [];

  return (
    <Stack gap="sm" align="center">
      <fieldset className={`${shared.group} ${classes.tiles}`} disabled={feedback !== null}>
        <legend className={shared.visuallyHidden}>{label}</legend>
        {options.map((gender, i) => {
          const article = genderArticle(language, gender);
          const isTicked = ticked.includes(gender);
          const result = feedback ? genderOptionResult(gender, ticked, expected) : undefined;
          return (
            <label key={gender} className={`${shared.card} ${classes.tile}`} data-result={result}>
              <input
                type="checkbox"
                value={gender}
                checked={isTicked}
                onChange={() => onChange(toggleGender(value, gender, options))}
                className={shared.visuallyHidden}
                autoFocus={i === 0}
              />
              <span className={classes.badge} aria-hidden>
                {result === "wrong" ? (
                  <IconX size={20} />
                ) : result ? (
                  <IconCheck size={20} />
                ) : isTicked ? (
                  <IconCircleCheckFilled size={22} />
                ) : (
                  <span className={classes.ring} />
                )}
              </span>
              {article ? (
                <>
                  <span className={classes.article}>{article}</span>
                  <span className={classes.name}>{genderLabel(gender)}</span>
                </>
              ) : (
                <span className={classes.nameOnly}>{genderLabel(gender)}</span>
              )}
              {result && <span className={shared.visuallyHidden}>{RESULT_TEXT[result]}</span>}
            </label>
          );
        })}
      </fieldset>

      {/* Always rendered, so the grade appearing doesn't push the button down. */}
      <Text size="sm" ff="var(--app-font-ui)" c="dimmed">
        {feedback ? GRADE_LABELS[feedback.grade] : questionIndex === 0 ? "Tick both if the word takes either." : "\u00a0"}
      </Text>
    </Stack>
  );
}
