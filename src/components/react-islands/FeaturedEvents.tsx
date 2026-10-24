import { useEffect, useMemo, useState } from "react";
import EventCard from "@/components/react-islands/EventCard";
import {
  featuredHomeEvent,
  homepageSideEvents,
  isHomepageEventVisible,
} from "@/lib/events-data";
import { loadSiteContent } from "@/lib/site-content";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

export default function FeaturedEvents() {
  const { t } = useLocale();
  const [featuredImageSrc, setFeaturedImageSrc] = useState<string | undefined>();
  const [hiddenSideIds, setHiddenSideIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const content = loadSiteContent();
    setFeaturedImageSrc(content.featured.imageSrc);
    const hidden = new Set<string>();
    for (const side of content.sideEvents) {
      if (!side.visible) hidden.add(side.id);
    }
    setHiddenSideIds(hidden);
  }, []);

  const featured = featuredHomeEvent();
  const sideEvents = useMemo(
    () => homepageSideEvents().filter((event) => isHomepageEventVisible(event.id, hiddenSideIds)),
    [hiddenSideIds],
  );

  return (
    <section id="events" className="bg-surface-container-low/60 px-margin-mobile py-stack-lg md:px-margin-desktop md:py-stack-xl">
      <div className="mx-auto max-w-container-max min-w-0">
        <div className="mb-stack-md flex flex-wrap items-end justify-between gap-3 border-b border-outline-variant/30 pb-4">
          <h2 className="bold-section-title">{t("events.title")}</h2>
          <a href={withBase("/events")} className="bold-text-link">
            {t("events.viewAll")}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          <div className="lg:col-span-7">
            <EventCard event={featured} t={t} imageSrc={featuredImageSrc} variant="hero" />
          </div>
          <div className="grid grid-cols-1 content-start gap-6 lg:col-span-5">
            {sideEvents.map((event) => (
              <EventCard key={event.id} event={event} t={t} variant="side" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
