import type { z } from "zod";
import { config } from "@/config";
import { ApiError, formatIssuePath, messageFromErrorBody } from "./errors";

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
      credentials: "include",
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
    throw new ApiError("http", messageFromErrorBody(errorBody, fallback), response.status, errorBody);
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

function buildUrl(path: string, query?: QueryParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) params.set(key, String(value));
  }
  const search = params.toString();
  return `${config.apiBaseUrl}${path}${search ? `?${search}` : ""}`;
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
