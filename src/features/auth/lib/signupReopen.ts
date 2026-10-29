// The demo's daily signup cap resets at midnight UTC (the backend counts accounts per UTC day).

/** The next midnight UTC after `now`: when a full day's signups open again. */
export function nextUtcMidnight(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

interface FormatOptions {
  /** Defaults to the visitor's locale and timezone; set in tests. */
  locale?: string;
  timeZone?: string;
}

/** When signup reopens, in the visitor's own time: "today at 8:00 PM" or "tomorrow at 1:00 AM". */
export function formatSignupReopen(now: Date, { locale, timeZone }: FormatOptions = {}): string {
  const reopen = nextUtcMidnight(now);
  // en-CA formats dates as YYYY-MM-DD, so two local dates compare as strings.
  const localDate = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
  const day = localDate.format(reopen) === localDate.format(now) ? "today" : "tomorrow";
  const time = new Intl.DateTimeFormat(locale, { timeZone, hour: "numeric", minute: "2-digit" }).format(reopen);
  return `${day} at ${time}`;
}
