const USERS_KEY = "bold_users";
const SESSION_KEY = "bold_session";

export type StoredUser = {
  dialCode: string;
  phone: string;
  /** ponytail: plain text demo only — hash server-side + JWT when a backend exists */
  password: string;
};

export type Session = {
  dialCode: string;
  phone: string;
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

function userKey(dialCode: string, phone: string): string {
  return `${dialCode}:${phone}`;
}

export function signup(
  dialCode: string,
  phone: string,
  password: string,
): { ok: true } | { ok: false; error: string } {
  const users = readUsers();
  const key = userKey(dialCode, phone);
  if (users.some((u) => userKey(u.dialCode, u.phone) === key)) {
    return { ok: false, error: "An account with this phone number already exists." };
  }
  users.push({ dialCode, phone, password });
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ dialCode, phone } satisfies Session));
  return { ok: true };
}

export function login(
  dialCode: string,
  phone: string,
  password: string,
): { ok: true } | { ok: false; error: string } {
  const users = readUsers();
  const match = users.find(
    (u) => u.dialCode === dialCode && u.phone === phone && u.password === password,
  );
  if (!match) {
    return { ok: false, error: "Invalid phone number or password." };
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ dialCode, phone } satisfies Session));
  return { ok: true };
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): Session | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
