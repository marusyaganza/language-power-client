import type { z } from "zod";
import { ApiError, formatIssuePath, messageFromErrorBody } from "./errors";

/** Same-origin in every environment: Netlify (prod) and Vite (dev) proxy /api/* to the backend. */
const API_BASE = "/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Query values that are null or undefined are left out of the URL. */
export type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: HttpMethod;
  query?: QueryParams;
  /** Serialized as JSON. */
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Calls the API and validates the response with `schema`.
 * Pass `schema: null` when the response body isn't used (e.g. 204, or a logout acknowledgement); it is not read.
 * Throws ApiError for HTTP errors, network failures and responses that don't match the schema.
 */
export function apiFetch<S extends z.ZodType>(
  path: string,
  options: RequestOptions & { schema: S },
): Promise<z.output<S>>;
export function apiFetch(path: string, options: RequestOptions & { schema: null }): Promise<void>;
export async function apiFetch(
  path: string,
  { method = "GET", query, body, signal, schema }: RequestOptions & { schema: z.ZodType | null },
): Promise<unknown> {
  const request = `${method} ${path}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    // Let React Query see cancellations as cancellations.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("network", "Can't reach the server. Check your connection and try again.", null, error);
  }

  if (!response.ok) {
    const errorBody = await readJson(response);
    const fallback = `Request failed (${response.status})`;
    const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
    throw new ApiError("http", messageFromErrorBody(errorBody, fallback), response.status, errorBody, retryAfter);
  }

  if (schema === null) return;

  const data = await readJson(response);
  const result = schema.safeParse(data);
  if (!result.success) {
    const [issue] = result.error.issues;
    const message = `Unexpected response from ${request}: ${issue.message} at ${formatIssuePath(issue.path)}`;
    if (import.meta.env.DEV) console.error(message, result.error.issues);
    throw new ApiError("contract", message, response.status, result.error.issues);
  }
  return result.data;
}

/** `Retry-After` is either a number of seconds or an HTTP date; returns seconds, or null if absent or invalid. */
export function parseRetryAfter(header: string | null): number | null {
  if (header === null || header.trim() === "") return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds);
  const date = Date.parse(header);
  if (Number.isNaN(date)) return null;
  return Math.max(0, Math.ceil((date - Date.now()) / 1000));
}

function buildUrl(path: string, query?: QueryParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return `${API_BASE}${path}${search ? `?${search}` : ""}`;
}

/** Parses a JSON body; returns undefined for empty or non-JSON bodies. */
async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
