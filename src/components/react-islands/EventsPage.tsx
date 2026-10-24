import EventCard from "@/components/react-islands/EventCard";
import { CLUB_EVENTS, featuredHomeEvent } from "@/lib/events-data";
import { useLocale } from "@/lib/use-locale";

export default function EventsPage() {
  const { t } = useLocale();
  const featured = featuredHomeEvent();
  const rest = CLUB_EVENTS.filter((e) => e.id !== featured.id);

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile pb-stack-xl pt-stack-md md:px-margin-desktop md:pt-stack-lg">
      <header className="bold-page-header mb-stack-lg">
        <h1>{t("events.page.title")}</h1>
        <p>{t("events.page.subtitle")}</p>
        <p className="bold-demo-badge">{t("events.page.demoNote")}</p>
      </header>

      <section className="mb-stack-xl">
        <h2 className="mb-stack-md font-display text-headline-sm uppercase text-primary md:text-headline-lg">
          {t("events.page.featuredLabel")}
        </h2>
        <div className="max-w-4xl">
          <EventCard event={featured} t={t} variant="hero" />
        </div>
      </section>

      <section>
        <h2 className="mb-stack-md font-display text-headline-sm uppercase text-primary md:text-headline-lg">
          {t("events.page.upcomingLabel")}
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((event) => (
            <EventCard key={event.id} event={event} t={t} variant="grid" />
          ))}
        </div>
      </section>
    </div>
  );
}
