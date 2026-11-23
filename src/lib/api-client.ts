const MEMBER_TOKEN_KEY = "bold_member_api_token";
const STAFF_TOKEN_KEY = "bold_staff_api_token";

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

export function getMemberApiToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(MEMBER_TOKEN_KEY);
}

export function setMemberApiToken(token: string): void {
  localStorage.setItem(MEMBER_TOKEN_KEY, token);
}

export function clearMemberApiToken(): void {
  localStorage.removeItem(MEMBER_TOKEN_KEY);
}

export function getStaffApiToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(STAFF_TOKEN_KEY);
}

export function setStaffApiToken(token: string): void {
  localStorage.setItem(STAFF_TOKEN_KEY, token);
}

export function clearStaffApiToken(): void {
  localStorage.removeItem(STAFF_TOKEN_KEY);
}

/** @deprecated use getMemberApiToken */
export function getApiToken(): string | null {
  return getMemberApiToken();
}

/** @deprecated use setMemberApiToken */
export function setApiToken(token: string): void {
  setMemberApiToken(token);
}

/** @deprecated use clearMemberApiToken */
export function clearApiToken(): void {
  clearMemberApiToken();
}

async function fetchWithToken<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
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

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchWithToken<T>(path, getMemberApiToken(), init);
}

export async function staffApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchWithToken<T>(path, getStaffApiToken(), init);
}