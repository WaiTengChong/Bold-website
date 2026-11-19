import AuthForm from "@/components/react-islands/AuthForm";
import { isMemberLoggedIn } from "@/lib/auth-client";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";
import { useEffect } from "react";

type Mode = "login" | "signup";

export default function AuthPanel({ mode }: { mode: Mode }) {
  const { t } = useLocale();

  useEffect(() => {
    if (isMemberLoggedIn()) {
      window.location.replace(withBase("/account"));
    }
  }, []);

  const eyebrow = mode === "login" ? t("auth.login.eyebrow") : t("auth.signup.eyebrow");
  const title = mode === "login" ? t("auth.login.title") : t("auth.signup.title");
  const subtitle = mode === "login" ? t("auth.login.subtitle") : t("auth.signup.subtitle");

  return (
    <section className="cut-surface-page cut-surface-page--auth">
      <div className="cut-surface-layout cut-surface-layout--auth">
        <div className="auth-panel auth-panel--split">
          <div className="auth-panel__intro bold-page-header">
            <p className="font-sans text-label-sm font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
              {eyebrow}
            </p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="auth-panel__form">
            <AuthForm mode={mode} />
          </div>
        </div>
      </div>
    </section>
  );
}
