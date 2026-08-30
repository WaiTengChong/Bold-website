import AuthForm from "@/components/react-islands/AuthForm";
import { useLocale } from "@/lib/use-locale";

type Mode = "login" | "signup";

export default function AuthPanel({ mode }: { mode: Mode }) {
  const { t } = useLocale();
  const eyebrow = mode === "login" ? t("auth.login.eyebrow") : t("auth.signup.eyebrow");
  const title = mode === "login" ? t("auth.login.title") : t("auth.signup.title");
  const subtitle = mode === "login" ? t("auth.login.subtitle") : t("auth.signup.subtitle");

  return (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-container-max items-center justify-center overflow-x-hidden px-margin-mobile py-stack-lg md:px-margin-desktop">
      <div className="auth-panel w-full max-w-md min-w-0 overflow-hidden border border-outline-variant/40 bg-surface-container-lowest p-margin-mobile md:p-10">
        <span className="mb-3 block font-sans text-label-sm font-semibold uppercase tracking-[0.4em] text-on-surface-variant">
          {eyebrow}
        </span>
        <h1 className="mb-2 font-display text-headline-lg-mobile uppercase text-primary md:text-display-md">{title}</h1>
        <p className="mb-stack-md font-sans text-body-md font-light text-on-surface-variant">{subtitle}</p>
        <AuthForm mode={mode} />
      </div>
    </section>
  );
}
