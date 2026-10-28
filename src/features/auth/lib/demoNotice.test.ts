import { describe, expect, it } from "vitest";
import type { AuthConfig } from "../schemas";
import { demoNoticeItems } from "./demoNotice";

const personal: AuthConfig = {
  signup_enabled: false,
  signup_open_today: false,
  use_mocks: false,
  account_ttl_hours: null,
  searches_per_language: null,
};
const demo: AuthConfig = {
  signup_enabled: true,
  signup_open_today: true,
  use_mocks: false,
  account_ttl_hours: 24,
  searches_per_language: 10,
};

describe("demoNoticeItems", () => {
  it("shows nothing without limits or mocks", () => {
    expect(demoNoticeItems(personal)).toBeNull();
  });

  it("describes the demo's limits from the config", () => {
    expect(demoNoticeItems(demo)).toEqual([
      "Search uses a live dictionary, so each account gets 10 searches per language.",
      "Any email address works. We never send emails.",
      "Accounts and their data are deleted after 24 hours.",
    ]);
  });

  it("uses the singular for 1", () => {
    expect(demoNoticeItems({ ...demo, account_ttl_hours: 1, searches_per_language: 1 })).toEqual([
      "Search uses a live dictionary, so each account gets 1 search per language.",
      "Any email address works. We never send emails.",
      "Accounts and their data are deleted after 1 hour.",
    ]);
  });

  it("leaves out a limit that isn't set", () => {
    expect(demoNoticeItems({ ...demo, searches_per_language: null })).toEqual([
      "Any email address works. We never send emails.",
      "Accounts and their data are deleted after 24 hours.",
    ]);
  });

  it("describes the sample dictionary in mock mode", () => {
    expect(demoNoticeItems({ ...personal, use_mocks: true })).toEqual([
      "The dictionary is a sample, so search works for a fixed list of words. Search for anything to see them.",
      "Any email address works. We never send emails.",
    ]);
  });
});
