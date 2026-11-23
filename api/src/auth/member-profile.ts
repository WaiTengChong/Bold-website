export type MemberGender = "male" | "female" | "other" | "prefer_not";
export type PreferredLanguage = "zh" | "en";

export type MemberRow = {
  id: string;
  dial_code: string;
  phone: string;
  password_hash: string;
  surname: string;
  given_name: string;
  date_of_birth: Date | null;
  gender: MemberGender | null;
  email: string;
  preferred_language: PreferredLanguage | null;
  consent_email: boolean;
  consent_whatsapp: boolean;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: Date;
};

const GENDER_ALIASES: Record<string, MemberGender> = {
  male: "male",
  female: "female",
  other: "other",
  prefer_not: "prefer_not",
  男: "male",
  女: "female",
  其他: "other",
  不願透露: "prefer_not",
};

export function parseGender(raw: unknown): MemberGender | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const key = raw.trim();
  return GENDER_ALIASES[key] ?? GENDER_ALIASES[key.toLowerCase()] ?? null;
}

export function memberToPublic(row: MemberRow) {
  const dob =
    row.date_of_birth instanceof Date
      ? row.date_of_birth.toISOString().slice(0, 10)
      : row.date_of_birth
        ? String(row.date_of_birth).slice(0, 10)
        : null;
  return {
    id: row.id,
    dialCode: row.dial_code,
    phone: row.phone,
    surname: row.surname,
    givenName: row.given_name,
    dateOfBirth: dob,
    gender: row.gender,
    email: row.email,
    preferredLanguage: row.preferred_language,
    consentEmail: row.consent_email,
    consentWhatsapp: row.consent_whatsapp,
    emergencyContactName: row.emergency_contact_name ?? "",
    emergencyContactPhone: row.emergency_contact_phone ?? "",
    createdAt: row.created_at.toISOString(),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertValidEmail(email: string): void {
  if (!EMAIL_RE.test(email)) throw new Error("invalid_email");
}

export function assertValidIsoDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("invalid_date");
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) throw new Error("invalid_date");
}

/** Runnable self-check: `npx tsx api/src/auth/member-profile.ts` */
declare const require: NodeRequire;
declare const module: NodeModule;
if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(msg);
  };
  assert(parseGender("男") === "male", "gender zh male");
  assert(parseGender("prefer_not") === "prefer_not", "gender en");
  assert(parseGender("???") === null, "gender invalid");
  assertValidEmail("a@b.co");
  try {
    assertValidEmail("bad");
    throw new Error("email should fail");
  } catch {
    /* expected */
  }
  console.log("member-profile self-check ok");
}