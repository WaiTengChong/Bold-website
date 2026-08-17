const USERS_KEY = "bold_users";
const SESSION_KEY = "bold_session";

export type UserRole = "member" | "admin";

export type StoredUser = {
  dialCode: string;
  phone: string;
  /** ponytail: plain text demo only — hash server-side + JWT when a backend exists */
  password: string;
  role?: UserRole;
};

export type Session = {
  dialCode: string;
  phone: string;
  role: UserRole;
};

/** Demo admin: +852 88888888 / admin1234 — not listed in public nav */
export const DEMO_ADMIN = {
  dialCode: "852",
  phone: "88888888",
  password: "admin1234",
} as const;

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

export function ensureAdminSeed(): void {
  if (typeof localStorage === "undefined") return;
  const users = readUsers();
  const exists = users.some(
    (u) => u.dialCode === DEMO_ADMIN.dialCode && u.phone === DEMO_ADMIN.phone,
  );
  if (exists) return;
  users.push({ ...DEMO_ADMIN, role: "admin" });
  writeUsers(users);
}

function roleOf(user: StoredUser): UserRole {
  return user.role === "admin" ? "admin" : "member";
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
  users.push({ dialCode, phone, password, role: "member" });
  writeUsers(users);
  writeSession({ dialCode, phone, role: "member" });
  return { ok: true };
}

export function login(
  dialCode: string,
  phone: string,
  password: string,
): { ok: true; role: UserRole } | { ok: false; error: string } {
  ensureAdminSeed();
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

export function isAdmin(): boolean {
  return getSession()?.role === "admin";
}
