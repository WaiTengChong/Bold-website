import { useEffect, useState } from "react";
import { loadSiteContent, publishedNews, type NewsItem } from "@/lib/site-content";

export default function SiteNews() {
  const [items, setItems] = useState<NewsItem[]>(() => publishedNews(loadSiteContent()));

  useEffect(() => {
    setItems(publishedNews(loadSiteContent()));
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="news" className="px-margin-mobile py-stack-lg md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <h2 className="mb-stack-md font-display text-headline-lg-mobile uppercase text-primary md:text-headline-lg">
          Club News
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="border border-[#E5E7EB] bg-surface-container-lowest p-6">
              <p className="font-sans text-label-sm font-semibold uppercase text-on-surface-variant">{item.date}</p>
              <h3 className="mt-2 font-display text-headline-sm uppercase text-primary">{item.title}</h3>
              <p className="mt-2 font-sans text-body-md font-light text-on-surface-variant">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
