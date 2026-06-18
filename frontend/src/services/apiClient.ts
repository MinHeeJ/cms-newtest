const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, API_BASE_URL || window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(buildUrl(path, options.query), {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers
    },
    body: typeof options.body === "string" || isFormData || options.body === undefined ? (options.body as BodyInit | undefined) : JSON.stringify(options.body)
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as T & { code?: string; message?: string; error?: string };
  if (!response.ok) {
    throw new ApiClientError(response.status, payload.code ?? "REQUEST_ERROR", payload.message ?? payload.error ?? "요청을 처리하지 못했습니다.");
  }

  return payload;
}
