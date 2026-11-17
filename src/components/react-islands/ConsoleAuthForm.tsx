import { useMemo, useState } from "react";
import { staffLogin } from "@/lib/auth-client";
import { DEFAULT_DIAL_CODE, PHONE_DIAL_CODES } from "@/lib/phone-codes";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

function stripPhone(value: string): string {
  return value.replace(/\s/g, "");
}

export default function ConsoleAuthForm() {
  const { t } = useLocale();
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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

  const isValid = !phoneError && !passwordError;
  const showError = (field: string, error: string | null) => (touched[field] && error ? error : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ phone: true, password: true });
    setSubmitError(null);
    if (!isValid) return;
    setSubmitting(true);
    const result = await staffLogin(dialCode, stripPhone(phone), password);
    if (!result.ok) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }
    window.location.href = withBase("/console");
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-field">
        <label htmlFor="staff-dial-code" className="auth-label">
          {t("auth.countryCode")}
        </label>
        <div className="auth-phone-row">
          <select
            id="staff-dial-code"
            className="auth-input auth-select"
            value={dialCode}
            onChange={(e) => setDialCode(e.target.value)}
          >
            {PHONE_DIAL_CODES.map((code) => (
              <option key={code.value} value={code.value}>
                {code.label}
              </option>
            ))}
          </select>
          <input
            id="staff-phone"
            type="tel"
            className="auth-input auth-phone-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
            placeholder={t("auth.phone")}
          />
        </div>
        {showError("phone", phoneError) && <p className="auth-error">{phoneError}</p>}
      </div>
      <div className="auth-field">
        <label htmlFor="staff-password" className="auth-label">
          {t("auth.password")}
        </label>
        <input
          id="staff-password"
          type="password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, password: true }))}
        />
        {showError("password", passwordError) && <p className="auth-error">{passwordError}</p>}
      </div>
      {submitError && (
        <p className="auth-error auth-error--submit" role="alert">
          {submitError}
        </p>
      )}
      <button type="submit" className="auth-submit" disabled={!isValid || submitting}>
        {submitting ? t("auth.wait") : t("console.login.submit")}
      </button>
    </form>
  );
}