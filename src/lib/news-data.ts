import type { MessageKey } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { withBase } from "@/lib/utils";

export type NewsCategory = "club" | "facility" | "retail" | "membership";

export type ClubNewsArticle = {
  id: string;
  homepage?: boolean;
  featured?: boolean;
  category: NewsCategory;
  imageSrc: string;
  imageAltKey: MessageKey;
  imagePosition?: string;
  ctaHref: string;
  keys: {
    date: MessageKey;
    category: MessageKey;
    title: MessageKey;
    excerpt: MessageKey;
    body: MessageKey;
    cta: MessageKey;
    readMore: MessageKey;
  };
};

function articleKeys(slug: string): ClubNewsArticle["keys"] {
  const base = `news.item.${slug}` as const;
  return {
    date: `${base}.date`,
    category: `${base}.category`,
    title: `${base}.title`,
    excerpt: `${base}.excerpt`,
    body: `${base}.body`,
    cta: `${base}.cta`,
    readMore: `${base}.readMore`,
  };
}

/** Demo club updates — copy localized via i18n */
export const CLUB_NEWS: ClubNewsArticle[] = [
  {
    id: "court-hours",
    homepage: true,
    featured: true,
    category: "club",
    imageSrc: PHOTOS.facilityInterior,
    imageAltKey: "news.item.courtHours.imageAlt",
    imagePosition: "50% 30%",
    ctaHref: withBase("/booking"),
    keys: articleKeys("courtHours"),
  },
  {
    id: "pro-shop",
    homepage: true,
    category: "retail",
    imageSrc: PHOTOS.facilityCollage,
    imageAltKey: "news.item.proShop.imageAlt",
    imagePosition: "50% 35%",
    ctaHref: withBase("/#life"),
    keys: articleKeys("proShop"),
  },
  {
    id: "recovery-suite",
    homepage: true,
    category: "facility",
    imageSrc: PHOTOS.facilityCollage,
    imageAltKey: "news.item.recoverySuite.imageAlt",
    imagePosition: "100% 35%",
    ctaHref: withBase("/membership"),
    keys: articleKeys("recoverySuite"),
  },
  {
    id: "member-guest",
    category: "membership",
    imageSrc: PHOTOS.facilityInterior,
    imageAltKey: "news.item.memberGuest.imageAlt",
    imagePosition: "70% 50%",
    ctaHref: withBase("/membership"),
    keys: articleKeys("memberGuest"),
  },
  {
    id: "coaching-series",
    category: "club",
    imageSrc: PHOTOS.facilityCollage,
    imageAltKey: "news.item.coachingSeries.imageAlt",
    imagePosition: "100% 0%",
    ctaHref: withBase("/events"),
    keys: articleKeys("coachingSeries"),
  },
];

export function featuredHomeNews(): ClubNewsArticle {
  return CLUB_NEWS.find((n) => n.featured) ?? CLUB_NEWS[0];
}

export function homepageSideNews(): ClubNewsArticle[] {
  return CLUB_NEWS.filter((n) => n.homepage && !n.featured);
}

export function newsImageOverride(id: string, overrides: ReadonlyMap<string, string>): string | undefined {
  return overrides.get(id);
}

export function isNewsPublished(id: string, publishedIds: ReadonlySet<string>): boolean {
  return publishedIds.has(id);
}

export function resolveFeaturedNews(publishedIds: ReadonlySet<string>): ClubNewsArticle {
  const featured = featuredHomeNews();
  if (isNewsPublished(featured.id, publishedIds)) return featured;
  return (
    CLUB_NEWS.find((n) => n.homepage && isNewsPublished(n.id, publishedIds)) ??
    CLUB_NEWS.find((n) => isNewsPublished(n.id, publishedIds)) ??
    featured
  );
}
