import { useMemo, useState } from "react";
import { login, signup } from "@/lib/auth-client";
import { DEFAULT_DIAL_CODE, PHONE_DIAL_CODES } from "@/lib/phone-codes";
import { withBase } from "@/lib/utils";

type Mode = "login" | "signup";

type Props = {
  mode: Mode;
};

function stripPhone(value: string): string {
  return value.replace(/\s/g, "");
}

function validatePhone(phone: string): string | null {
  const digits = stripPhone(phone);
  if (!digits) return "Phone number is required.";
  if (!/^\d+$/.test(digits)) return "Phone number must contain digits only.";
  if (digits.length < 6 || digits.length > 15) return "Phone number must be 6–15 digits.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export default function AuthForm({ mode }: Props) {
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const phoneError = useMemo(() => validatePhone(phone), [phone]);
  const passwordError = useMemo(() => validatePassword(password), [password]);
  const confirmError = useMemo(() => {
    if (mode !== "signup") return null;
    if (!confirmPassword) return "Please confirm your password.";
    if (confirmPassword !== password) return "Passwords do not match.";
    return null;
  }, [mode, confirmPassword, password]);

  const isValid =
    !phoneError && !passwordError && (mode === "login" || !confirmError);

  const showError = (field: string, error: string | null) =>
    touched[field] && error ? error : null;

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ phone: true, password: true, confirmPassword: true });
    setSubmitError(null);
    if (!isValid) return;

    setSubmitting(true);
    const digits = stripPhone(phone);
    const result =
      mode === "signup"
        ? signup(dialCode, digits, password)
        : login(dialCode, digits, password);

    if (!result.ok) {
      setSubmitError(result.error);
      setSubmitting(false);
      return;
    }

    window.location.href = withBase("/booking");
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-field">
        <label htmlFor="auth-dial-code" className="auth-label">
          Country code
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
            placeholder="Phone number"
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
          Password
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
            Confirm password
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
            aria-describedby={
              showError("confirmPassword", confirmError) ? "auth-confirm-error" : undefined
            }
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
        {submitting ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
      </button>

      <p className="auth-crosslink">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <a href={withBase("/signup")} className="auth-crosslink__link">
              Sign up
            </a>
          </>
        ) : (
          <>
            Already a member?{" "}
            <a href={withBase("/login")} className="auth-crosslink__link">
              Log in
            </a>
          </>
        )}
      </p>
    </form>
  );
}
