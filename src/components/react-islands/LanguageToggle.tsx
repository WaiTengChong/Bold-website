import { useLocale } from "@/lib/use-locale";

type Props = {
  className?: string;
  /** Dark-on-primary styling for admin header */
  variant?: "default" | "admin";
};

export default function LanguageToggle({ className = "", variant = "default" }: Props) {
  const { locale, setLocale, t } = useLocale();

  const shell =
    variant === "admin"
      ? "border-on-primary/20 bg-on-primary/10 hover:border-on-primary/50 hover:bg-on-primary/20"
      : "border-outline-variant/60 bg-surface-container-lowest hover:border-primary hover:bg-surface-container-low hover:shadow-sm";

  const base =
    "cursor-pointer rounded-none px-2 py-1 font-sans text-[11px] font-medium uppercase tracking-wide transition-all sm:text-label-sm sm:tracking-widest";

  const active =
    variant === "admin"
      ? "bg-on-primary-container text-on-primary shadow-sm"
      : "bg-primary text-on-primary shadow-sm";
  const idle =
    variant === "admin"
      ? "text-on-primary/60 hover:bg-on-primary/15 hover:text-on-primary"
      : "text-on-surface-variant hover:bg-primary/10 hover:text-primary";

  return (
    <div
      className={`group/lang flex shrink-0 items-center gap-0.5 border px-1 py-0.5 transition-all duration-150 ${shell} ${className}`}
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
      <span
        className={variant === "admin" ? "text-on-primary/25 select-none" : "text-outline-variant/50 select-none"}
        aria-hidden
      >
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
