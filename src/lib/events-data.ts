import type { MessageKey } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { withBase } from "@/lib/utils";

export type EventIcon = "trophy" | "users" | "dumbbell" | "sparkles" | "heart-pulse";

export type ClubEvent = {
  id: string;
  homepage?: boolean;
  featured?: boolean;
  imageSrc: string;
  imageAltKey: MessageKey;
  imagePosition?: string;
  icon: EventIcon;
  accent: "primary" | "container";
  ctaHref: string;
  keys: {
    date: MessageKey;
    time: MessageKey;
    title: MessageKey;
    blurb: MessageKey;
    venue: MessageKey;
    format: MessageKey;
    spots: MessageKey;
    cta: MessageKey;
  };
};

function eventKeys(slug: string): ClubEvent["keys"] {
  const base = `events.item.${slug}` as const;
  return {
    date: `${base}.date`,
    time: `${base}.time`,
    title: `${base}.title`,
    blurb: `${base}.blurb`,
    venue: `${base}.venue`,
    format: `${base}.format`,
    spots: `${base}.spots`,
    cta: `${base}.cta`,
  };
}

/** Demo program calendar — copy localized via i18n */
export const CLUB_EVENTS: ClubEvent[] = [
  {
    id: "pro-am",
    homepage: true,
    featured: true,
    imageSrc: PHOTOS.facilityCollage,
    imageAltKey: "events.item.proAm.imageAlt",
    imagePosition: "50% 15%",
    icon: "trophy",
    accent: "primary",
    ctaHref: withBase("/booking"),
    keys: eventKeys("proAm"),
  },
  {
    id: "mixer",
    homepage: true,
    imageSrc: PHOTOS.facilityInterior,
    imageAltKey: "events.item.mixer.imageAlt",
    imagePosition: "60% 40%",
    icon: "users",
    accent: "primary",
    ctaHref: withBase("/signup"),
    keys: eventKeys("mixer"),
  },
  {
    id: "clinic",
    homepage: true,
    imageSrc: PHOTOS.facilityCollage,
    imageAltKey: "events.item.clinic.imageAlt",
    imagePosition: "100% 0%",
    icon: "dumbbell",
    accent: "container",
    ctaHref: withBase("/booking"),
    keys: eventKeys("clinic"),
  },
  {
    id: "member-open",
    imageSrc: PHOTOS.facilityCollage,
    imageAltKey: "events.item.memberOpen.imageAlt",
    imagePosition: "0% 0%",
    icon: "sparkles",
    accent: "container",
    ctaHref: withBase("/membership"),
    keys: eventKeys("memberOpen"),
  },
  {
    id: "doubles-ladder",
    imageSrc: PHOTOS.facilityInterior,
    imageAltKey: "events.item.doubles.imageAlt",
    imagePosition: "30% 50%",
    icon: "trophy",
    accent: "primary",
    ctaHref: withBase("/booking"),
    keys: eventKeys("doubles"),
  },
  {
    id: "recovery-social",
    imageSrc: PHOTOS.facilityCollage,
    imageAltKey: "events.item.recovery.imageAlt",
    imagePosition: "50% 35%",
    icon: "heart-pulse",
    accent: "container",
    ctaHref: withBase("/booking"),
    keys: eventKeys("recovery"),
  },
];

export function featuredHomeEvent(): ClubEvent {
  return CLUB_EVENTS.find((e) => e.featured) ?? CLUB_EVENTS[0];
}

export function homepageSideEvents(): ClubEvent[] {
  return CLUB_EVENTS.filter((e) => e.homepage && !e.featured);
}

export function isHomepageEventVisible(id: string, hiddenIds: Set<string>): boolean {
  if (id === "pro-am") return true;
  return !hiddenIds.has(id);
}
