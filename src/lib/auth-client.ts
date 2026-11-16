import { apiEnabled, apiFetch, clearApiToken, getApiToken, setApiToken, ApiError } from "@/lib/api-client";

const USERS_KEY = "bold_users";
const SESSION_KEY = "bold_session";

export type UserRole = "member" | "admin";

export type StoredUser = {
  dialCode: string;
  phone: string;
  password: string;
  role?: UserRole;
};

export type Session = {
  dialCode: string;
  phone: string;
  role: UserRole;
};

function readUsers(): StoredUser[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function writeSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** No-op when API is enabled — admin is seeded in PostgreSQL only. */
export function ensureAdminSeed(): void {
  if (apiEnabled()) return;
}

function roleOf(user: StoredUser): UserRole {
  return user.role === "admin" ? "admin" : "member";
}

function userKey(dialCode: string, phone: string): string {
  return `${dialCode}:${phone}`;
}

function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Something went wrong. Try again.";
}

export async function signup(
  dialCode: string,
  phone: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (apiEnabled()) {
    try {
      const res = await apiFetch<{ accessToken: string; user: Session }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ dialCode, phone, password }),
      });
      setApiToken(res.accessToken);
      writeSession(res.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: apiErrorMessage(err) };
    }
  }

  const users = readUsers();
  const key = userKey(dialCode, phone);
  if (users.some((u) => userKey(u.dialCode, u.phone) === key)) {
    return { ok: false, error: "An account with this phone number already exists." };
  }
  users.push({ dialCode, phone, password, role: "member" });
  writeUsers(users);
  writeSession({ dialCode, phone, role: "member" });
  return { ok: true };
}

export async function login(
  dialCode: string,
  phone: string,
  password: string,
): Promise<{ ok: true; role: UserRole } | { ok: false; error: string }> {
  if (apiEnabled()) {
    try {
      const res = await apiFetch<{ accessToken: string; user: Session }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ dialCode, phone, password }),
      });
      setApiToken(res.accessToken);
      writeSession(res.user);
      return { ok: true, role: res.user.role };
    } catch (err) {
      return { ok: false, error: apiErrorMessage(err) };
    }
  }

  const users = readUsers();
  const match = users.find(
    (u) => u.dialCode === dialCode && u.phone === phone && u.password === password,
  );
  if (!match) {
    return { ok: false, error: "Invalid phone number or password." };
  }
  const role = roleOf(match);
  writeSession({ dialCode, phone, role });
  return { ok: true, role };
}

export function logout(): void {
  if (apiEnabled() && getApiToken()) {
    void apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
  }
  clearApiToken();
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): Session | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return {
      dialCode: parsed.dialCode,
      phone: parsed.phone,
      role: parsed.role === "admin" ? "admin" : "member",
    };
  } catch {
    return null;
  }
}

export async function hydrateSession(): Promise<Session | null> {
  if (!apiEnabled() || !getApiToken()) return getSession();
  try {
    const me = await apiFetch<Session>("/auth/me");
    writeSession(me);
    return me;
  } catch {
    clearApiToken();
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function isAdmin(): boolean {
  return getSession()?.role === "admin";
}