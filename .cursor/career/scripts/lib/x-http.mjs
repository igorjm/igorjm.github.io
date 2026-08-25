import { getAccessToken } from "./x-auth.mjs";
import { X_API_BASE } from "./x-paths.mjs";

/**
 * Authenticated request against the X API.
 *
 * Resolves relative paths against `X_API_BASE`, parses the body as JSON when
 * possible and turns non-2xx responses into errors prefixed with `label`.
 */
export async function xApiFetch(path, options = {}, { label = "X API" } = {}) {
  const token = await getAccessToken();
  const url = path.startsWith("http") ? path : `${X_API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after") ?? "60";
    throw new Error(`Rate limited. Retry after ${retryAfter}s`);
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`${label} ${res.status}: ${JSON.stringify(data)}`);
  }

  return data;
}
