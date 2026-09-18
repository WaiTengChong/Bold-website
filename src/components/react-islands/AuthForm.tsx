import { useEffect, useMemo, useState } from "react";
import { ensureAdminSeed, login, signup } from "@/lib/auth-client";
import type { MessageKey } from "@/lib/i18n";
import { DEFAULT_DIAL_CODE, PHONE_DIAL_CODES } from "@/lib/phone-codes";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
};

function stripPhone(value: string): string {
  return value.replace(/\s/g, "");
}

export default function AuthForm({ mode }: Props) {
  const { t } = useLocale();
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ensureAdminSeed();
  }, []);

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

  const isValid = !phoneError && !passwordError && (mode === "login" || !confirmError);

  const showError = (field: string, error: string | null) => (touched[field] && error ? error : null);

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ phone: true, password: true, confirmPassword: true });
    setSubmitError(null);
    if (!isValid) return;

    setSubmitting(true);
    const digits = stripPhone(phone);
    const result = mode === "signup" ? signup(dialCode, digits, password) : login(dialCode, digits, password);

    if (!result.ok) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    const dest = mode === "login" && "role" in result && result.role === "admin" ? "/console" : "/booking";
    window.location.href = withBase(dest);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
            aria-describedby={showError("phone", phoneError) ? "auth-phone-error" : undefined}
          />
        </div>
        {showError("phone", phoneError) && (
          <p id="auth-phone-error" className="auth-error" role="alert">
            {phoneError}
          </p>
        )}
      </div>

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
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          aria-invalid={!!showError("password", passwordError)}
          aria-describedby={showError("password", passwordError) ? "auth-password-error" : undefined}
        />
        {showError("password", passwordError) && (
          <p id="auth-password-error" className="auth-error" role="alert">
            {passwordError}
          </p>
        )}
      </div>

      {mode === "signup" && (
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
            aria-describedby={showError("confirmPassword", confirmError) ? "auth-confirm-error" : undefined}
          />
          {showError("confirmPassword", confirmError) && (
            <p id="auth-confirm-error" className="auth-error" role="alert">
              {confirmError}
            </p>
          )}
        </div>
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
