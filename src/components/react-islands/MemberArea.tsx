import { useEffect, useMemo, useState } from "react";
import { apiEnabled, apiFetch } from "@/lib/api-client";
import {
  getMemberSession,
  hydrateMemberSession,
  isMemberLoggedIn,
  memberLogout,
  updateMemberProfile,
  type MemberProfile,
} from "@/lib/auth-client";
import type { MessageKey } from "@/lib/i18n";
import { DEFAULT_DIAL_CODE, PHONE_DIAL_CODES } from "@/lib/phone-codes";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

type Booking = {
  id: string;
  date: string;
  time: string;
  courtId: number;
  guestLabel: string;
};

const GENDER_OPTIONS: { value: string; key: MessageKey }[] = [
  { value: "male", key: "auth.gender.male" },
  { value: "female", key: "auth.gender.female" },
  { value: "other", key: "auth.gender.other" },
  { value: "prefer_not", key: "auth.gender.preferNot" },
];

export default function MemberArea() {
  const { t } = useLocale();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"bookings" | "profile">("bookings");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [surname, setSurname] = useState("");
  const [givenName, setGivenName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    void (async () => {
      const session = await hydrateMemberSession();
      if (!isMemberLoggedIn() || !session) {
        window.location.replace(withBase("/login"));
        return;
      }
      setProfile(session);
      setSurname(session.surname);
      setGivenName(session.givenName);
      setDateOfBirth(session.dateOfBirth ?? "");
      setGender(session.gender ?? "");
      setEmail(session.email);

      if (apiEnabled()) {
        try {
          const mine = await apiFetch<Booking[]>("/bookings/mine");
          setBookings(mine);
        } catch {
          setBookings([]);
        }
      }
      setReady(true);
    })();
  }, []);

  const phoneLabel = useMemo(() => {
    const p = profile ?? getMemberSession();
    if (!p) return "";
    const entry = PHONE_DIAL_CODES.find((c) => c.value === p.dialCode);
    const code = entry ? t(entry.labelKey) : `+${p.dialCode}`;
    return `${code} ${p.phone}`;
  }, [profile, t]);

  const saveProfile = async () => {
    setSaveMsg(null);
    setSaveErr(null);
    setSaving(true);
    const result = await updateMemberProfile({
      surname: surname.trim(),
      givenName: givenName.trim(),
      dateOfBirth,
      gender,
      email: email.trim(),
    });
    setSaving(false);
    if (!result.ok) {
      setSaveErr(result.error);
      return;
    }
    setProfile(result.profile);
    setSaveMsg(t("member.profile.saved"));
  };

  if (!ready) {
    return (
      <section className="cut-surface-page">
        <p className="font-sans text-body-md text-on-surface-variant">{t("auth.wait")}</p>
      </section>
    );
  }

  return (
    <section className="cut-surface-page">
      <div className="member-shell">
        <header className="bold-page-header mb-stack-md">
          <p className="font-sans text-label-sm font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
            {t("member.eyebrow")}
          </p>
          <h1>{t("member.title")}</h1>
          <p>
            {profile?.surname}
            {profile?.givenName ? ` ${profile.givenName}` : ""} · {phoneLabel}
          </p>
        </header>

      <div className="member-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "bookings"}
          className={`member-tab${tab === "bookings" ? " member-tab--active" : ""}`}
          onClick={() => setTab("bookings")}
        >
          {t("member.tab.bookings")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "profile"}
          className={`member-tab${tab === "profile" ? " member-tab--active" : ""}`}
          onClick={() => setTab("profile")}
        >
          {t("member.tab.profile")}
        </button>
      </div>

      {tab === "bookings" && (
        <div className="member-panel">
          <div className="mb-stack-sm flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-title-lg uppercase text-on-surface">{t("member.bookings.heading")}</h2>
            <a href={withBase("/booking")} className="bold-text-link">
              {t("member.bookings.new")}
            </a>
          </div>
          {bookings.length === 0 ? (
            <p className="font-sans text-body-md text-on-surface-variant">{t("member.bookings.empty")}</p>
          ) : (
            <ul className="member-booking-list">
              {bookings.map((b) => (
                <li key={b.id} className="member-booking-row">
                  <span className="font-display text-title-md text-primary">
                    {t("booking.courtLabel", { n: String(b.courtId) })}
                  </span>
                  <span className="font-sans text-body-md">
                    {b.date} · {b.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="member-panel">
          <form className="auth-form auth-form--profile" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="auth-form-section">
            <legend className="auth-form-section__title">{t("member.tab.profile")}</legend>
          <div className="auth-field">
            <label className="auth-label">{t("auth.phone")}</label>
            <input className="auth-input" value={phoneLabel} disabled readOnly />
            <p className="font-sans text-label-sm text-on-surface-variant">{t("member.profile.phoneLocked")}</p>
          </div>
          <div className="auth-field-row">
            <div className="auth-field auth-field--half">
              <label className="auth-label">{t("auth.surname")}</label>
              <input className="auth-input" value={surname} onChange={(e) => setSurname(e.target.value)} />
            </div>
            <div className="auth-field auth-field--half">
              <label className="auth-label">{t("auth.givenName")}</label>
              <input className="auth-input" value={givenName} onChange={(e) => setGivenName(e.target.value)} />
            </div>
          </div>
          <div className="auth-field-row">
            <div className="auth-field auth-field--half">
              <label className="auth-label">{t("auth.dateOfBirth")}</label>
              <input
                type="date"
                className="auth-input"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="auth-field auth-field--half">
              <label className="auth-label">{t("auth.gender")}</label>
              <select className="auth-input auth-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.key)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-label">{t("auth.email")}</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          </fieldset>
          <div className="auth-form__footer">
            {saveErr && (
              <p className="auth-error" role="alert">
                {saveErr}
              </p>
            )}
            {saveMsg && <p className="font-sans text-body-sm text-primary">{saveMsg}</p>}
            <button type="button" className="auth-submit" disabled={saving} onClick={() => void saveProfile()}>
              {saving ? t("auth.wait") : t("member.profile.save")}
            </button>
          </div>
          </form>
        </div>
      )}

        <div className="member-panel__actions">
          <button
            type="button"
            className="bold-btn-outline min-h-12 px-5 py-3"
            onClick={() => {
              memberLogout();
              window.dispatchEvent(new Event("bold-auth-change"));
              window.location.href = withBase("/");
            }}
          >
            {t("member.logout")}
          </button>
        </div>
      </div>
    </section>
  );
}