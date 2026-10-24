import NewsCard from "@/components/react-islands/NewsCard";
import {
  CLUB_NEWS,
  isNewsPublished,
  newsImageOverride,
  resolveFeaturedNews,
} from "@/lib/news-data";
import { loadSiteContent, newsImageOverrides, publishedNewsIds } from "@/lib/site-content";
import { useLocale } from "@/lib/use-locale";
import { useEffect, useMemo, useState } from "react";

export default function NewsPage() {
  const { t } = useLocale();
  const [publishedIds, setPublishedIds] = useState<Set<string>>(() => publishedNewsIds(loadSiteContent()));
  const [imageOverrides, setImageOverrides] = useState<Map<string, string>>(() => newsImageOverrides(loadSiteContent()));

  useEffect(() => {
    const content = loadSiteContent();
    setPublishedIds(publishedNewsIds(content));
    setImageOverrides(newsImageOverrides(content));
  }, []);

  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      const details = el.querySelector("details");
      if (details) details.open = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [publishedIds]);

  const featured = useMemo(() => resolveFeaturedNews(publishedIds), [publishedIds]);
  const rest = useMemo(
    () => CLUB_NEWS.filter((n) => isNewsPublished(n.id, publishedIds) && n.id !== featured.id),
    [publishedIds, featured.id],
  );

  const publishedCount = CLUB_NEWS.filter((n) => isNewsPublished(n.id, publishedIds)).length;

  if (publishedCount === 0) {
    return (
      <div className="mx-auto w-full max-w-container-max px-margin-mobile pb-stack-xl pt-stack-md md:px-margin-desktop md:pt-stack-lg">
        <p className="text-center font-sans text-body-md text-on-surface-variant">{t("news.page.empty")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile pb-stack-xl pt-stack-md md:px-margin-desktop md:pt-stack-lg">
      <header className="bold-page-header mb-stack-lg">
        <h1>{t("news.page.title")}</h1>
        <p>{t("news.page.subtitle")}</p>
        <p className="bold-demo-badge">{t("news.page.demoNote")}</p>
      </header>

      <section className="mb-stack-xl">
        <h2 className="mb-stack-md font-display text-headline-sm uppercase text-primary md:text-headline-lg">
          {t("news.page.featuredLabel")}
        </h2>
        <div className="max-w-4xl">
          <NewsCard
            article={featured}
            t={t}
            imageSrc={newsImageOverride(featured.id, imageOverrides)}
            variant="hero"
          />
        </div>
      </section>

      {rest.length > 0 && (
        <section>
          <h2 className="mb-stack-md font-display text-headline-sm uppercase text-primary md:text-headline-lg">
            {t("news.page.moreLabel")}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                t={t}
                imageSrc={newsImageOverride(article.id, imageOverrides)}
                variant="grid"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
