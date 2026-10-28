import type { AuthConfig } from "../schemas";

/**
 * The lines of the "This is a demo" notice, or null when this deployment isn't a demo.
 * A deployment is a demo when the backend limits accounts or searches, or mocks the dictionary.
 */
export function demoNoticeItems(config: AuthConfig): string[] | null {
  const { use_mocks, searches_per_language, account_ttl_hours } = config;
  if (!use_mocks && searches_per_language === null && account_ttl_hours === null) return null;

  const items: string[] = [];
  if (use_mocks) {
    items.push("The dictionary is a sample, so search works for a fixed list of words. Search for anything to see them.");
  } else if (searches_per_language !== null) {
    items.push(
      `Search uses a live dictionary, so each account gets ${plural(searches_per_language, "search", "searches")} per language.`,
    );
  }
  items.push("Any email address works. We never send emails.");
  if (account_ttl_hours !== null) {
    items.push(`Accounts and their data are deleted after ${plural(account_ttl_hours, "hour", "hours")}.`);
  }
  return items;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}
