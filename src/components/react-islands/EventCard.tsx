import { Dumbbell, HeartPulse, Sparkles, Trophy, Users } from "lucide-react";
import type { ClubEvent, EventIcon } from "@/lib/events-data";
import type { MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Translate = (key: MessageKey) => string;

const ICONS: Record<EventIcon, typeof Users> = {
  trophy: Trophy,
  users: Users,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
};

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-sans text-label-sm font-medium text-on-surface-variant">{label}</dt>
      <dd className="mt-0.5 font-sans text-body-md font-light text-on-surface">{value}</dd>
    </div>
  );
}

type EventCardProps = {
  event: ClubEvent;
  t: Translate;
  imageSrc?: string;
  variant: "hero" | "side" | "grid";
};

export default function EventCard({ event, t, imageSrc, variant }: EventCardProps) {
  const Icon = ICONS[event.icon];
  const src = imageSrc ?? event.imageSrc;
  const title = t(event.keys.title);
  const blurb = t(event.keys.blurb);

  if (variant === "hero") {
    return (
      <article className="bold-card flex h-full flex-col overflow-hidden">
        <div className="relative h-56 overflow-hidden sm:h-64 md:h-72">
          <img
            src={src}
            alt={t(event.imageAltKey)}
            className="h-full w-full object-cover grayscale transition-[filter] duration-700 hover:grayscale-0"
            style={event.imagePosition ? { objectPosition: event.imagePosition } : undefined}
            width={1200}
            height={800}
            loading="lazy"
          />
          <span className="absolute top-4 left-4 bg-primary px-3 py-1 font-sans text-label-sm font-medium text-on-primary">
            {t(event.keys.date)}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6 md:p-8 lg:p-10">
          <p className="font-sans text-label-md text-on-surface-variant">{t(event.keys.time)}</p>
          <h3 className="mt-2 font-display text-headline-sm uppercase text-primary md:text-headline-lg">{title}</h3>
          <p className="mt-3 font-sans text-body-md font-light leading-relaxed text-on-surface-variant">{blurb}</p>
          <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-outline-variant/30 pt-6 sm:grid-cols-2">
            <MetaRow label={t("events.meta.venue")} value={t(event.keys.venue)} />
            <MetaRow label={t("events.meta.format")} value={t(event.keys.format)} />
            <MetaRow label={t("events.meta.spots")} value={t(event.keys.spots)} />
          </dl>
          <div className="mt-auto pt-6">
            <a href={event.ctaHref} className="bold-btn-outline">
              {t(event.keys.cta)}
            </a>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "side") {
    return (
      <article className="bold-card flex min-w-0 flex-col overflow-hidden bg-surface-container-lowest shadow-none">
        <div className="relative h-36 overflow-hidden sm:h-40">
          <img
            src={src}
            alt={t(event.imageAltKey)}
            className="h-full w-full object-cover"
            style={event.imagePosition ? { objectPosition: event.imagePosition } : undefined}
            width={800}
            height={400}
            loading="lazy"
          />
          <div
            className={cn(
              "absolute bottom-0 left-0 flex size-12 items-center justify-center sm:size-14",
              event.accent === "primary" ? "bg-primary text-on-primary" : "bg-primary-container text-primary",
            )}
          >
            <Icon className="size-6 sm:size-7" aria-hidden />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <p className="font-sans text-label-sm text-on-surface-variant">
            <span className="block">{t(event.keys.date)}</span>
            <span className="block">{t(event.keys.time)}</span>
          </p>
          <h3 className="mt-1 font-display text-headline-sm uppercase leading-tight text-primary">{title}</h3>
          <p className="mt-2 line-clamp-3 font-sans text-body-md font-light text-on-surface-variant">{blurb}</p>
          <ul className="mt-3 space-y-1 font-sans text-label-sm text-on-surface-variant">
            <li>
              <span className="font-medium text-on-surface-variant">{t("events.meta.venue")}: </span>
              {t(event.keys.venue)}
            </li>
            <li>
              <span className="font-medium text-on-surface-variant">{t("events.meta.format")}: </span>
              {t(event.keys.format)}
            </li>
            <li>
              <span className="font-medium text-on-surface-variant">{t("events.meta.spots")}: </span>
              {t(event.keys.spots)}
            </li>
          </ul>
          <a
            href={event.ctaHref}
            className="bold-text-link mt-4 inline-flex self-start"
          >
            {t(event.keys.cta)}
          </a>
        </div>
      </article>
    );
  }

  return (
    <article className="bold-card flex h-full flex-col overflow-hidden bg-surface-container-lowest shadow-none">
      <div className="relative h-44 overflow-hidden">
        <img
          src={src}
          alt={t(event.imageAltKey)}
          className="h-full w-full object-cover"
          style={event.imagePosition ? { objectPosition: event.imagePosition } : undefined}
          width={800}
          height={440}
          loading="lazy"
        />
        <span className="absolute top-3 left-3 bg-primary px-2.5 py-0.5 font-sans text-label-sm font-semibold uppercase text-on-primary">
          {t(event.keys.date)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center",
              event.accent === "primary" ? "bg-primary text-on-primary" : "bg-primary-container text-primary",
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="font-sans text-label-sm font-semibold uppercase text-on-surface-variant">{t(event.keys.time)}</p>
            <h3 className="mt-0.5 font-display text-headline-sm uppercase text-primary">{title}</h3>
          </div>
        </div>
        <p className="mt-3 font-sans text-body-md font-light text-on-surface-variant">{blurb}</p>
        <dl className="mt-4 grid gap-2 font-sans text-label-sm text-on-surface-variant">
          <div>
            <span className="font-medium text-on-surface-variant">{t("events.meta.venue")}: </span>
            {t(event.keys.venue)}
          </div>
          <div>
            <span className="font-medium text-on-surface-variant">{t("events.meta.format")}: </span>
            {t(event.keys.format)}
          </div>
          <div>
            <span className="font-medium text-on-surface-variant">{t("events.meta.spots")}: </span>
            {t(event.keys.spots)}
          </div>
        </dl>
        <a href={event.ctaHref} className="bold-btn-outline mt-5">
          {t(event.keys.cta)}
        </a>
      </div>
    </article>
  );
}
