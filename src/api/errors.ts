import { z } from "zod";

/**
 * - http: the server answered with a non-2xx status
 * - network: the request never got a response (offline, CORS, server down)
 * - contract: the response didn't match the schema the client expects
 */
export type ApiErrorKind = "http" | "network" | "contract";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status, or null when no response was received. */
  readonly status: number | null;
  /** Raw error body (http) or zod issues (contract), for debugging. */
  readonly details: unknown;

  constructor(kind: ApiErrorKind, message: string, status: number | null, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.details = details;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

// FastAPI sends `detail` as a string (HTTPException) or a list of validation errors (422).
const validationIssueSchema = z.object({
  loc: z.array(z.union([z.string(), z.number()])),
  msg: z.string(),
});
const detailSchema = z.union([z.string(), z.array(validationIssueSchema)]);

/** Turns a FastAPI error body into a readable message, or returns `fallback`. */
export function messageFromErrorBody(body: unknown, fallback: string): string {
  const parsed = z.object({ detail: detailSchema }).safeParse(body);
  if (!parsed.success) return fallback;

  const { detail } = parsed.data;
  if (typeof detail === "string") return detail;
  if (detail.length === 0) return fallback;

  return detail
    .map(({ loc, msg }) => {
      // loc starts with where the value came from ("body", "query"), then the field name.
      const field = loc.slice(1).join(".");
      return field ? `${field}: ${msg}` : msg;
    })
    .join("; ");
}

/** Formats a zod path like ["games", 0, "due_word_count"] as "games[0].due_word_count". */
export function formatIssuePath(path: readonly PropertyKey[]): string {
  if (path.length === 0) return "(root)";
  return path
    .map((key, i) => (typeof key === "number" ? `[${key}]` : `${i === 0 ? "" : "."}${String(key)}`))
    .join("");
}

/**
 * Whether an error from a request is worth reporting to error tracking: a bug on either side,
 * not an expected answer. 4xx are part of the API, network errors mean the user is offline, and
 * 503 is the backend's "dictionary unavailable", an outage of the third-party API it uses.
 * Anything that isn't an ApiError was thrown by client code, so it's a bug.
 */
export function shouldReport(error: unknown): boolean {
  if (!isApiError(error)) return true;
  switch (error.kind) {
    case "contract":
      return true;
    case "network":
      return false;
    case "http":
      return error.status !== null && error.status >= 500 && error.status !== 503;
  }
}
