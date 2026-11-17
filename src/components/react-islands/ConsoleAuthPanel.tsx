import ConsoleAuthForm from "@/components/react-islands/ConsoleAuthForm";
import { useLocale } from "@/lib/use-locale";

export default function ConsoleAuthPanel() {
  const { t } = useLocale();
  return (
    <>
      <div className="auth-panel__intro bold-page-header">
        <p className="font-sans text-label-sm font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
          {t("console.login.eyebrow")}
        </p>
        <h1>{t("console.login.title")}</h1>
        <p>{t("console.login.subtitle")}</p>
      </div>
      <ConsoleAuthForm />
    </>
  );
}