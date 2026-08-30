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
    <section className="relative min-h-[90dvh] w-full max-w-full overflow-hidden bg-primary" aria-label="Hero">
      <img
        src={hero.imageSrc}
        alt={hero.imageAlt}
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        width={2000}
        height={1333}
        fetchPriority="high"
        decoding="async"
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-end px-margin-mobile pb-stack-lg text-center"
        style={{ background: "linear-gradient(0deg, rgba(0,21,13,0.8) 0%, rgba(0,21,13,0) 50%)" }}
      >
        <p className="mb-2 max-w-full font-display text-headline-lg-mobile tracking-[0.12em] text-on-primary sm:tracking-[0.2em] md:text-headline-lg">
          {t("hero.brand")}
        </p>
        <h1 className="mb-stack-md max-w-full px-1 font-display text-[clamp(2.25rem,11vw,3rem)] uppercase leading-tight text-on-primary md:text-display-lg">
          {t("hero.line1")}
          <br />
          {t("hero.line2")}
        </h1>
        <a
          href={withBase("/booking")}
          className="w-full max-w-md bg-primary-container px-margin-mobile py-6 font-display text-headline-sm uppercase tracking-widest text-on-primary transition-all hover:opacity-90 active:scale-95"
        >
          {t("hero.cta")}
        </a>
      </div>
    </section>
  );
}
