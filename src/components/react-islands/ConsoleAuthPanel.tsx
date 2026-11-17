import ConsoleAuthForm from "@/components/react-islands/ConsoleAuthForm";
import { useLocale } from "@/lib/use-locale";

export default function ConsoleAuthPanel() {
  const { t } = useLocale();
  return (
  <>
      <span className="mb-3 block font-sans text-label-sm font-semibold uppercase tracking-[0.4em] text-on-surface-variant">
        {t("console.login.eyebrow")}
      </span>
      <h1 className="mb-2 font-display text-headline-lg-mobile uppercase text-primary md:text-display-md">
        {t("console.login.title")}
      </h1>
      <p className="mb-stack-md font-sans text-body-md font-light text-on-surface-variant">{t("console.login.subtitle")}</p>
      <ConsoleAuthForm />
  </>
  );
}