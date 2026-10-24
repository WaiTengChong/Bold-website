import { useEffect, useState } from "react";
import { loadSiteContent } from "@/lib/site-content";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

export default function SiteHero() {
  const { t } = useLocale();
  const [hero, setHero] = useState(() => loadSiteContent().hero);

  useEffect(() => {
    setHero(loadSiteContent().hero);
  }, []);

  return (
    <section
      className="grid min-h-[min(720px,calc(100dvh-5rem))] w-full max-w-full grid-cols-1 lg:grid-cols-12"
      aria-label="Hero"
    >
      <div className="flex min-w-0 flex-col justify-end bg-tertiary px-margin-mobile py-stack-md text-left lg:col-span-5 lg:px-margin-desktop lg:py-stack-lg">
        <p className="mb-3 max-w-full font-sans text-body-md font-light text-on-tertiary-container">
          {t("hero.brand")}
        </p>
        <h1 className="mb-stack-md max-w-[14ch] min-w-0 font-display text-[clamp(2.5rem,8vw,4.5rem)] uppercase leading-[0.95] text-on-tertiary">
          {t("hero.line1")} {t("hero.line2")}
        </h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href={withBase("/booking")} className="bold-btn-primary w-full sm:w-auto">
            {t("hero.cta")}
          </a>
          <a href={withBase("/membership")} className="bold-text-link px-1 py-2">
            {t("header.join")}
          </a>
        </div>
      </div>
      <div className="relative min-h-[280px] min-w-0 lg:col-span-7 lg:min-h-0">
        <img
          src={hero.imageSrc}
          alt={hero.imageAlt}
          className="absolute inset-0 h-full w-full object-cover"
          width={2000}
          height={1333}
          fetchPriority="high"
          decoding="async"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-tertiary/80 via-tertiary/10 to-transparent lg:from-tertiary/40"
          aria-hidden
        />
      </div>
    </section>
  );
}
