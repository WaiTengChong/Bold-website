const TOKEN_KEY = "bold_api_token";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function apiEnabled(): boolean {
  const base = import.meta.env.PUBLIC_API_BASE;
  return typeof base === "string" && base.trim().length > 0;
}

export function apiBaseUrl(): string {
  return String(import.meta.env.PUBLIC_API_BASE ?? "")
    .trim()
    .replace(/\/$/, "");
}

export function getApiToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setApiToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearApiToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getApiToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers, credentials: "include" });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const msg = body?.message;
    const text = Array.isArray(msg) ? msg[0] : typeof msg === "string" ? msg : res.statusText;
    throw new ApiError(res.status, text || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}