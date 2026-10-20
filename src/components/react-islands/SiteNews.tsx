import { useEffect, useMemo, useState } from "react";
import NewsCard from "@/components/react-islands/NewsCard";
import {
  CLUB_NEWS,
  homepageSideNews,
  isNewsPublished,
  newsImageOverride,
  resolveFeaturedNews,
} from "@/lib/news-data";
import { loadSiteContent, newsImageOverrides, publishedNewsIds } from "@/lib/site-content";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

export default function SiteNews() {
  const { t } = useLocale();
  const [publishedIds, setPublishedIds] = useState<Set<string>>(() => publishedNewsIds(loadSiteContent()));
  const [imageOverrides, setImageOverrides] = useState<Map<string, string>>(() => newsImageOverrides(loadSiteContent()));

  useEffect(() => {
    const content = loadSiteContent();
    setPublishedIds(publishedNewsIds(content));
    setImageOverrides(newsImageOverrides(content));
  }, []);

  const visible = useMemo(() => CLUB_NEWS.filter((n) => isNewsPublished(n.id, publishedIds)), [publishedIds]);

  const featured = useMemo(() => resolveFeaturedNews(publishedIds), [publishedIds]);
  const sideArticles = useMemo(
    () => homepageSideNews().filter((n) => isNewsPublished(n.id, publishedIds) && n.id !== featured.id),
    [publishedIds, featured.id],
  );

  if (visible.length === 0) return null;

  return (
    <section id="news" className="px-margin-mobile py-stack-lg md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-stack-md flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-headline-lg-mobile uppercase text-primary md:text-headline-lg">
            {t("news.title")}
          </h2>
          <a
            href={withBase("/news")}
            className="font-sans text-label-sm font-semibold uppercase text-primary underline underline-offset-4"
          >
            {t("news.viewAll")}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          <div className="lg:col-span-7">
            <NewsCard
              article={featured}
              t={t}
              imageSrc={newsImageOverride(featured.id, imageOverrides)}
              variant="hero"
              detailHref={withBase(`/news#${featured.id}`)}
            />
          </div>
          <div className="grid grid-cols-1 content-start gap-6 lg:col-span-5">
            {sideArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                t={t}
                imageSrc={newsImageOverride(article.id, imageOverrides)}
                variant="side"
                detailHref={withBase(`/news#${article.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
