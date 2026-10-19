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
    <section id="events" className="px-margin-mobile py-stack-lg md:px-margin-desktop">
      <div className="mx-auto max-w-container-max">
        <div className="mb-stack-md flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-headline-lg-mobile uppercase text-primary md:text-headline-lg">
            {t("events.title")}
          </h2>
          <a
            href={withBase("/events")}
            className="font-sans text-label-sm font-semibold uppercase text-primary underline underline-offset-4"
          >
            {t("events.viewAll")}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
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
