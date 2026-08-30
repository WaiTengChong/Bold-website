import { useLocale } from "@/lib/use-locale";

type Props = {
  className?: string;
  /** Dark-on-primary styling for admin header */
  variant?: "default" | "admin";
};

export default function LanguageToggle({ className = "", variant = "default" }: Props) {
  const { locale, setLocale, t } = useLocale();

  const base =
    variant === "admin"
      ? "font-label-sm text-label-sm tracking-widest uppercase transition-colors"
      : "font-sans text-[11px] font-medium uppercase tracking-wide sm:text-label-sm sm:tracking-widest";

  const active =
    variant === "admin" ? "text-on-primary font-bold" : "text-primary font-semibold";
  const idle =
    variant === "admin" ? "text-on-primary/50 hover:text-on-primary" : "text-on-surface-variant hover:text-primary";

  return (
    <div
      className={`flex shrink-0 items-center gap-1 ${className}`}
      role="group"
      aria-label={t("lang.label")}
    >
      <button
        type="button"
        className={`${base} ${locale === "en" ? active : idle}`}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
      >
        {t("lang.en")}
      </button>
      <span className={variant === "admin" ? "text-on-primary/30" : "text-on-surface-variant/40"} aria-hidden>
        /
      </span>
      <button
        type="button"
        className={`${base} ${locale === "zh" ? active : idle}`}
        aria-pressed={locale === "zh"}
        onClick={() => setLocale("zh")}
      >
        {t("lang.zh")}
      </button>
    </div>
  );
}
