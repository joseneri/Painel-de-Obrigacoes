type QueryValue = string | number | boolean | null | undefined;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
    public readonly correlationId?: string,
    public readonly traceId?: string
  ) {
    super(message);
  }
}

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5280";

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${apiBaseUrl}${path}`);
  const requestCorrelationId = createCorrelationId();

  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "X-Correlation-ID": requestCorrelationId,
      ...(options.body ? { "Content-Type": "application/json" } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const payload = await readErrorPayload(response);
    const ids = readResponseIds(response, requestCorrelationId);
    throw new ApiError(
      resolveErrorMessage(payload, response.statusText),
      response.status,
      payload,
      ids.correlationId,
      ids.traceId
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function createCorrelationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readResponseIds(response: Response, fallbackCorrelationId: string) {
  return {
    correlationId: response.headers.get("X-Correlation-ID") ?? fallbackCorrelationId,
    traceId: response.headers.get("X-Trace-ID") ?? undefined
  };
}

async function readErrorPayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function resolveErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const data = payload as { detail?: string; title?: string; errors?: Record<string, string[]> };
    const firstValidation = data.errors && Object.values(data.errors).flat()[0];
    return firstValidation ?? data.detail ?? data.title ?? fallback;
  }

  return fallback;
}
