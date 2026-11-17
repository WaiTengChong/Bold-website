import { useMemo, useState } from "react";
import { login, signup, type SignupFields } from "@/lib/auth-client";
import type { MessageKey } from "@/lib/i18n";
import { DEFAULT_DIAL_CODE, PHONE_DIAL_CODES } from "@/lib/phone-codes";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

type Mode = "login" | "signup";

const GENDER_OPTIONS: { value: string; key: MessageKey }[] = [
  { value: "male", key: "auth.gender.male" },
  { value: "female", key: "auth.gender.female" },
  { value: "other", key: "auth.gender.other" },
  { value: "prefer_not", key: "auth.gender.preferNot" },
];

function stripPhone(value: string): string {
  return value.replace(/\s/g, "");
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const { t } = useLocale();
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [surname, setSurname] = useState("");
  const [givenName, setGivenName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"" | "zh" | "en">("");
  const [consentEmail, setConsentEmail] = useState(false);
  const [consentWhatsapp, setConsentWhatsapp] = useState(false);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const phoneError = useMemo(() => {
    const digits = stripPhone(phone);
    if (!digits) return t("auth.err.phoneRequired");
    if (!/^\d+$/.test(digits)) return t("auth.err.phoneDigits");
    if (digits.length < 6 || digits.length > 15) return t("auth.err.phoneLength");
    return null;
  }, [phone, t]);

  const passwordError = useMemo(() => {
    if (!password) return t("auth.err.passwordRequired");
    if (password.length < 8) return t("auth.err.passwordLength");
    return null;
  }, [password, t]);

  const confirmError = useMemo(() => {
    if (mode !== "signup") return null;
    if (!confirmPassword) return t("auth.err.confirmRequired");
    if (confirmPassword !== password) return t("auth.err.confirmMatch");
    return null;
  }, [mode, confirmPassword, password, t]);

  const surnameError = useMemo(() => {
    if (mode !== "signup") return null;
    if (!surname.trim()) return t("auth.err.surnameRequired");
    return null;
  }, [mode, surname, t]);

  const givenNameError = useMemo(() => {
    if (mode !== "signup") return null;
    if (!givenName.trim()) return t("auth.err.givenNameRequired");
    return null;
  }, [mode, givenName, t]);

  const dobError = useMemo(() => {
    if (mode !== "signup") return null;
    if (!dateOfBirth) return t("auth.err.dobRequired");
    return null;
  }, [mode, dateOfBirth, t]);

  const genderError = useMemo(() => {
    if (mode !== "signup") return null;
    if (!gender) return t("auth.err.genderRequired");
    return null;
  }, [mode, gender, t]);

  const emailError = useMemo(() => {
    if (mode !== "signup") return null;
    const val = email.trim();
    if (!val) return t("auth.err.emailRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return t("auth.err.emailInvalid");
    return null;
  }, [mode, email, t]);

  const isValid =
    !phoneError &&
    !passwordError &&
    (mode === "login" ||
      (!confirmError &&
        !surnameError &&
        !givenNameError &&
        !dobError &&
        !genderError &&
        !emailError));

  const showError = (field: string, error: string | null) => (touched[field] && error ? error : null);

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      phone: true,
      password: true,
      confirmPassword: true,
      surname: true,
      givenName: true,
      dateOfBirth: true,
      gender: true,
      email: true,
    });
    setSubmitError(null);
    if (!isValid) return;

    setSubmitting(true);
    const digits = stripPhone(phone);
    const result =
      mode === "signup"
        ? await signup(dialCode, digits, password, {
            surname: surname.trim(),
            givenName: givenName.trim(),
            dateOfBirth,
            gender,
            email: email.trim(),
            preferredLanguage: preferredLanguage || undefined,
            consentEmail,
            consentWhatsapp,
            emergencyContactName: emergencyContactName.trim() || undefined,
            emergencyContactPhone: emergencyContactPhone.trim() || undefined,
          } satisfies SignupFields)
        : await login(dialCode, digits, password);

    if (!result.ok) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    window.location.href = withBase(mode === "signup" ? "/login" : "/account");
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {mode === "signup" ? (
        <fieldset className="auth-form-section">
          <legend className="auth-form-section__title">{t("auth.section.required")}</legend>
          <div className="auth-field-row">
            <div className="auth-field auth-field--half">
              <label htmlFor="auth-surname" className="auth-label">
                {t("auth.surname")}
              </label>
              <input
                id="auth-surname"
                className="auth-input"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                onBlur={() => markTouched("surname")}
                autoComplete="family-name"
                aria-invalid={!!showError("surname", surnameError)}
              />
              {showError("surname", surnameError) && (
                <p className="auth-error" role="alert">
                  {surnameError}
                </p>
              )}
            </div>
            <div className="auth-field auth-field--half">
              <label htmlFor="auth-given-name" className="auth-label">
                {t("auth.givenName")}
              </label>
              <input
                id="auth-given-name"
                className="auth-input"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                onBlur={() => markTouched("givenName")}
                autoComplete="given-name"
                aria-invalid={!!showError("givenName", givenNameError)}
              />
              {showError("givenName", givenNameError) && (
                <p className="auth-error" role="alert">
                  {givenNameError}
                </p>
              )}
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="auth-dial-code" className="auth-label">
              {t("auth.countryCode")}
            </label>
            <div className="auth-phone-row">
              <select
                id="auth-dial-code"
                className="auth-input auth-select"
                value={dialCode}
                onChange={(e) => setDialCode(e.target.value)}
                autoComplete="tel-country-code"
              >
                {PHONE_DIAL_CODES.map((code) => (
                  <option key={code.value} value={code.value}>
                    {code.label}
                  </option>
                ))}
              </select>
              <input
                id="auth-phone"
                type="tel"
                className="auth-input auth-phone-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => markTouched("phone")}
                autoComplete="tel-national"
                placeholder={t("auth.phone")}
                aria-invalid={!!showError("phone", phoneError)}
              />
            </div>
            {showError("phone", phoneError) && (
              <p className="auth-error" role="alert">
                {phoneError}
              </p>
            )}
          </div>
          <div className="auth-field-row">
            <div className="auth-field auth-field--half">
              <label htmlFor="auth-dob" className="auth-label">
                {t("auth.dateOfBirth")}
              </label>
              <input
                id="auth-dob"
                type="date"
                className="auth-input"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                onBlur={() => markTouched("dateOfBirth")}
                aria-invalid={!!showError("dateOfBirth", dobError)}
              />
              {showError("dateOfBirth", dobError) && (
                <p className="auth-error" role="alert">
                  {dobError}
                </p>
              )}
            </div>
            <div className="auth-field auth-field--half">
              <label htmlFor="auth-gender" className="auth-label">
                {t("auth.gender")}
              </label>
              <select
                id="auth-gender"
                className="auth-input auth-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                onBlur={() => markTouched("gender")}
                aria-invalid={!!showError("gender", genderError)}
              >
                <option value="">{t("auth.gender.choose")}</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.key)}
                  </option>
                ))}
              </select>
              {showError("gender", genderError) && (
                <p className="auth-error" role="alert">
                  {genderError}
                </p>
              )}
            </div>
          </div>
          <div className="auth-field">
            <label htmlFor="auth-email" className="auth-label">
              {t("auth.email")}
            </label>
            <input
              id="auth-email"
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => markTouched("email")}
              autoComplete="email"
              aria-invalid={!!showError("email", emailError)}
            />
            {showError("email", emailError) && (
              <p className="auth-error" role="alert">
                {emailError}
              </p>
            )}
          </div>
        </fieldset>
      ) : (
        <div className="auth-field">
          <label htmlFor="auth-dial-code" className="auth-label">
            {t("auth.countryCode")}
          </label>
          <div className="auth-phone-row">
            <select
              id="auth-dial-code"
              className="auth-input auth-select"
              value={dialCode}
              onChange={(e) => setDialCode(e.target.value)}
              autoComplete="tel-country-code"
            >
              {PHONE_DIAL_CODES.map((code) => (
                <option key={code.value} value={code.value}>
                  {code.label}
                </option>
              ))}
            </select>
            <input
              id="auth-phone"
              type="tel"
              className="auth-input auth-phone-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => markTouched("phone")}
              autoComplete="tel-national"
              placeholder={t("auth.phone")}
              aria-invalid={!!showError("phone", phoneError)}
            />
          </div>
          {showError("phone", phoneError) && (
            <p className="auth-error" role="alert">
              {phoneError}
            </p>
          )}
        </div>
      )}

      {mode === "signup" ? (
        <fieldset className="auth-form-section">
          <legend className="auth-form-section__title">{t("auth.section.password")}</legend>
          <div className="auth-field">
            <label htmlFor="auth-password" className="auth-label">
              {t("auth.password")}
            </label>
            <input
              id="auth-password"
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => markTouched("password")}
              autoComplete="new-password"
              aria-invalid={!!showError("password", passwordError)}
            />
            {showError("password", passwordError) && (
              <p className="auth-error" role="alert">
                {passwordError}
              </p>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="auth-confirm-password" className="auth-label">
              {t("auth.confirmPassword")}
            </label>
            <input
              id="auth-confirm-password"
              type="password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => markTouched("confirmPassword")}
              autoComplete="new-password"
              aria-invalid={!!showError("confirmPassword", confirmError)}
            />
            {showError("confirmPassword", confirmError) && (
              <p className="auth-error" role="alert">
                {confirmError}
              </p>
            )}
          </div>
        </fieldset>
      ) : (
        <div className="auth-field">
          <label htmlFor="auth-password" className="auth-label">
            {t("auth.password")}
          </label>
          <input
            id="auth-password"
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => markTouched("password")}
            autoComplete="current-password"
            aria-invalid={!!showError("password", passwordError)}
          />
          {showError("password", passwordError) && (
            <p className="auth-error" role="alert">
              {passwordError}
            </p>
          )}
        </div>
      )}

      {mode === "signup" && (
        <fieldset className="auth-form-section auth-form-section--optional">
          <legend className="auth-form-section__title">{t("auth.optionalSection")}</legend>
          <p className="auth-form-section__hint">{t("auth.optionalHint")}</p>
          <div className="auth-field">
            <label htmlFor="auth-lang" className="auth-label">
              {t("auth.preferredLanguage")}
            </label>
            <select
              id="auth-lang"
              className="auth-input auth-select"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value as "" | "zh" | "en")}
            >
              <option value="">{t("auth.lang.unset")}</option>
              <option value="zh">{t("auth.lang.zh")}</option>
              <option value="en">{t("auth.lang.en")}</option>
            </select>
          </div>
          <fieldset className="auth-field auth-field--plain">
            <legend className="auth-label">{t("auth.consentLegend")}</legend>
            <label className="auth-check">
              <input type="checkbox" checked={consentEmail} onChange={(e) => setConsentEmail(e.target.checked)} />
              {t("auth.consentEmail")}
            </label>
            <label className="auth-check">
              <input
                type="checkbox"
                checked={consentWhatsapp}
                onChange={(e) => setConsentWhatsapp(e.target.checked)}
              />
              {t("auth.consentWhatsapp")}
            </label>
          </fieldset>
          <div className="auth-field-row">
            <div className="auth-field auth-field--half">
              <label htmlFor="auth-ec-name" className="auth-label">
                {t("auth.emergencyName")}
              </label>
              <input
                id="auth-ec-name"
                className="auth-input"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
              />
            </div>
            <div className="auth-field auth-field--half">
              <label htmlFor="auth-ec-phone" className="auth-label">
                {t("auth.emergencyPhone")}
              </label>
              <input
                id="auth-ec-phone"
                type="tel"
                className="auth-input"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
              />
            </div>
          </div>
        </fieldset>
      )}

      {submitError && (
        <p className="auth-error auth-error--submit" role="alert">
          {submitError}
        </p>
      )}

      <button type="submit" className="auth-submit" disabled={!isValid || submitting}>
        {submitting ? t("auth.wait") : mode === "login" ? t("auth.login") : t("auth.signup")}
      </button>

      <p className="auth-crosslink">
        {mode === "login" ? (
          <>
            {t("auth.noAccount")}{" "}
            <a href={withBase("/signup")} className="auth-crosslink__link">
              {t("auth.signUpLink")}
            </a>
          </>
        ) : (
          <>
            {t("auth.hasAccount")}{" "}
            <a href={withBase("/login")} className="auth-crosslink__link">
              {t("auth.logInLink")}
            </a>
          </>
        )}
      </p>
    </form>
  );
}