import {
  apiEnabled,
  apiFetch,
  clearMemberApiToken,
  clearStaffApiToken,
  getMemberApiToken,
  setMemberApiToken,
  setStaffApiToken,
  staffApiFetch,
  ApiError,
} from "@/lib/api-client";

const USERS_KEY = "bold_users";
const MEMBER_SESSION_KEY = "bold_member_session";
const STAFF_SESSION_KEY = "bold_staff_session";

export type MemberGender = "male" | "female" | "other" | "prefer_not";
export type PreferredLanguage = "zh" | "en";

export type MemberProfile = {
  accountType: "member";
  dialCode: string;
  phone: string;
  role: "member";
  surname: string;
  givenName: string;
  dateOfBirth: string | null;
  gender: MemberGender | null;
  email: string;
  preferredLanguage: PreferredLanguage | null;
  consentEmail: boolean;
  consentWhatsapp: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

export type StaffSession = {
  accountType: "staff";
  dialCode: string;
  phone: string;
  role: "admin" | "staff";
  surname: string;
  givenName: string;
  email: string;
};

export type SignupFields = {
  surname: string;
  givenName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  preferredLanguage?: PreferredLanguage;
  consentEmail?: boolean;
  consentWhatsapp?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
};

export type StoredUser = {
  dialCode: string;
  phone: string;
  password: string;
  role?: "member";
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

function writeMemberSession(session: MemberProfile): void {
  localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));
}

function writeStaffSession(session: StaffSession): void {
  localStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
}

/** No-op when API is enabled — accounts live in PostgreSQL only. */
export function ensureAdminSeed(): void {
  if (apiEnabled()) return;
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
  fields: SignupFields,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (apiEnabled()) {
    try {
      const res = await apiFetch<{ accessToken: string; user: MemberProfile }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ dialCode, phone, password, ...fields }),
      });
      setMemberApiToken(res.accessToken);
      writeMemberSession(res.user);
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
  writeMemberSession({
    accountType: "member",
    dialCode,
    phone,
    role: "member",
    surname: fields.surname,
    givenName: fields.givenName,
    dateOfBirth: fields.dateOfBirth,
    gender: fields.gender as MemberGender,
    email: fields.email,
    preferredLanguage: fields.preferredLanguage ?? null,
    consentEmail: Boolean(fields.consentEmail),
    consentWhatsapp: Boolean(fields.consentWhatsapp),
    emergencyContactName: fields.emergencyContactName ?? "",
    emergencyContactPhone: fields.emergencyContactPhone ?? "",
  });
  return { ok: true };
}

export async function memberLogin(
  dialCode: string,
  phone: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (apiEnabled()) {
    try {
      const res = await apiFetch<{ accessToken: string; user: MemberProfile }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ dialCode, phone, password }),
      });
      setMemberApiToken(res.accessToken);
      writeMemberSession(res.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: apiErrorMessage(err) };
    }
  }

  const users = readUsers();
  const match = users.find((u) => u.dialCode === dialCode && u.phone === phone && u.password === password);
  if (!match) {
    return { ok: false, error: "Invalid phone number or password." };
  }
  writeMemberSession({
    accountType: "member",
    dialCode,
    phone,
    role: "member",
    surname: "",
    givenName: "",
    dateOfBirth: null,
    gender: null,
    email: "",
    preferredLanguage: null,
    consentEmail: false,
    consentWhatsapp: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  return { ok: true };
}

export async function staffLogin(
  dialCode: string,
  phone: string,
  password: string,
): Promise<{ ok: true; role: StaffSession["role"] } | { ok: false; error: string }> {
  if (apiEnabled()) {
    try {
      const res = await staffApiFetch<{ accessToken: string; user: StaffSession }>("/auth/staff/login", {
        method: "POST",
        body: JSON.stringify({ dialCode, phone, password }),
      });
      setStaffApiToken(res.accessToken);
      writeStaffSession(res.user);
      return { ok: true, role: res.user.role };
    } catch (err) {
      return { ok: false, error: apiErrorMessage(err) };
    }
  }

  return { ok: false, error: "Staff login requires API mode." };
}

/** @deprecated use memberLogin — kept for existing imports */
export async function login(
  dialCode: string,
  phone: string,
  password: string,
): Promise<{ ok: true; role: "member" } | { ok: false; error: string }> {
  const result = await memberLogin(dialCode, phone, password);
  if (!result.ok) return result;
  return { ok: true, role: "member" };
}

export function memberLogout(): void {
  if (apiEnabled() && getMemberApiToken()) {
    void apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
  }
  clearMemberApiToken();
  localStorage.removeItem(MEMBER_SESSION_KEY);
}

export function staffLogout(): void {
  clearStaffApiToken();
  localStorage.removeItem(STAFF_SESSION_KEY);
}

export function logout(): void {
  memberLogout();
}

export function getMemberSession(): MemberProfile | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(MEMBER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MemberProfile;
    if (parsed.accountType !== "member") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getStaffSession(): StaffSession | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaffSession;
    if (parsed.accountType !== "staff") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Legacy session shape for booking flow */
export function getSession(): { dialCode: string; phone: string; role: "member" } | null {
  const m = getMemberSession();
  if (!m) return null;
  return { dialCode: m.dialCode, phone: m.phone, role: "member" };
}

export async function hydrateMemberSession(): Promise<MemberProfile | null> {
  if (!apiEnabled() || !getMemberApiToken()) return getMemberSession();
  try {
    const me = await apiFetch<MemberProfile>("/auth/me");
    writeMemberSession(me);
    return me;
  } catch {
    clearMemberApiToken();
    localStorage.removeItem(MEMBER_SESSION_KEY);
    return null;
  }
}

export async function hydrateSession(): Promise<ReturnType<typeof getSession>> {
  const m = await hydrateMemberSession();
  if (!m) return null;
  return { dialCode: m.dialCode, phone: m.phone, role: "member" };
}

export async function updateMemberProfile(
  patch: Partial<Omit<SignupFields, "gender">> & { gender?: string },
): Promise<{ ok: true; profile: MemberProfile } | { ok: false; error: string }> {
  if (!apiEnabled()) {
    const cur = getMemberSession();
    if (!cur) return { ok: false, error: "Not signed in." };
    const next = { ...cur, ...patch, gender: (patch.gender as MemberGender) ?? cur.gender };
    writeMemberSession(next);
    return { ok: true, profile: next };
  }
  try {
    const profile = await apiFetch<MemberProfile>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    writeMemberSession(profile);
    return { ok: true, profile };
  } catch (err) {
    return { ok: false, error: apiErrorMessage(err) };
  }
}

export function isMemberLoggedIn(): boolean {
  return Boolean(getMemberSession()) || Boolean(getMemberApiToken());
}

export function isStaffLoggedIn(): boolean {
  return Boolean(getStaffSession());
}

export function isAdmin(): boolean {
  return getStaffSession()?.role === "admin";
}

export function isStaff(): boolean {
  const role = getStaffSession()?.role;
  return role === "admin" || role === "staff";
}