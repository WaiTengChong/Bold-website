import EventCard from "@/components/react-islands/EventCard";
import { CLUB_EVENTS, featuredHomeEvent } from "@/lib/events-data";
import { useLocale } from "@/lib/use-locale";

export default function EventsPage() {
  const { t } = useLocale();
  const featured = featuredHomeEvent();
  const rest = CLUB_EVENTS.filter((e) => e.id !== featured.id);

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile pb-stack-xl pt-stack-md md:px-margin-desktop md:pt-stack-lg">
      <header className="mb-stack-lg text-center">
        <span className="mb-2 block font-sans text-label-sm font-semibold uppercase tracking-[0.35em] text-on-surface-variant">
          {t("events.page.eyebrow")}
        </span>
        <h1 className="font-display text-headline-lg-mobile uppercase text-primary md:text-display-md">{t("events.page.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl font-sans text-body-md font-light text-on-surface-variant">{t("events.page.subtitle")}</p>
        <p className="mt-4 inline-block border border-primary/30 bg-primary-container/40 px-4 py-2 font-sans text-label-sm text-on-primary-container">
          {t("events.page.demoNote")}
        </p>
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
