import { Fragment } from "react";
import { Group, Stack, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { settingsTimeline, type GameSettingsFormValues } from "../lib/gameSettingsForm";
import classes from "./SettingsTimeline.module.css";

interface SettingsTimelineProps {
  values: GameSettingsFormValues;
}

/** Live preview of the form: New word → 15 min → 1 day → Learned → every 6+ days. */
export function SettingsTimeline({ values }: SettingsTimelineProps) {
  const { steps, graduating, lapse } = settingsTimeline(values);
  const every = graduating ? `every ${graduating}+` : "every …";
  const firstStep = steps[0] ?? "the first step";
  const summary = ["New word", ...steps, "learned", every].join(", then ");

  return (
    <Stack gap={6} p="sm" className={classes.root}>
      <span className="app-label">How a new word comes back</span>
      <Group gap={6} wrap="wrap" role="img" aria-label={summary}>
        <span className={classes.text}>New word</span>
        {steps.map((step, i) => (
          <Fragment key={i}>
            <IconArrowRight size={14} className={classes.arrow} aria-hidden />
            <span className={`${classes.chip} ${classes.step}`}>{step}</span>
          </Fragment>
        ))}
        <IconArrowRight size={14} className={classes.arrow} aria-hidden />
        <span className={`${classes.chip} ${classes.learned}`}>Learned</span>
        <IconArrowRight size={14} className={classes.arrow} aria-hidden />
        <span className={classes.text}>{every}</span>
      </Group>
      <Text size="xs" c="dimmed" ff="var(--app-font-ui)">
        A wrong answer while learning starts it over at {firstStep}.{" "}
        {values.strictMode
          ? `Forgetting a learned word starts it over at ${firstStep} too.`
          : lapse
            ? `Forget a word right after it's learned and it comes back in ${lapse}. Each time you forget it, the wait is halved, but never below 1 day.`
            : "Forgetting a learned word halves its wait, but never below 1 day."}
      </Text>
    </Stack>
  );
}
