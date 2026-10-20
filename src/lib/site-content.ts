import { CLUB_NEWS } from "@/lib/news-data";
import { HOMEPAGE_GALLERY, PHOTOS } from "@/lib/photos";
import { withBase } from "@/lib/utils";

/** ponytail: browser-only demo store; persist on a server when a backend exists */
const KEY = "bold_site_content";
const MAX_UPLOAD_BYTES = 200_000;

export type GalleryImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

export type FeaturedEvent = {
  date: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
};

export type SideEvent = {
  id: string;
  title: string;
  meta: string;
  variant: "primary" | "container";
  icon: "groups" | "fitness_center";
  visible: boolean;
};

export type NewsCmsEntry = {
  id: string;
  published: boolean;
  imageSrc?: string;
};

/** @deprecated demo CMS row — copy lives in i18n */
export type NewsItem = NewsCmsEntry;

export type SiteContent = {
  hero: { imageSrc: string; imageAlt: string };
  gallery: GalleryImage[];
  featured: FeaturedEvent;
  sideEvents: SideEvent[];
  news: NewsItem[];
};

export function defaultSiteContent(): SiteContent {
  return {
    hero: {
      imageSrc: PHOTOS.facilityInterior,
      imageAlt: "BOLD Pickleball luxury indoor facility with lounge, courts, and pro shop",
    },
    gallery: HOMEPAGE_GALLERY.map((img) => ({ ...img })),
    featured: {
      date: "OCT 24",
      title: "PRO-AM INVITATIONAL",
      description:
        "Elite level competition meets luxury hospitality. Watch the best in the state compete for the Bold Cup.",
      imageSrc: PHOTOS.facilityCollage,
      imageAlt: "BOLD championship court and facility overview",
      ctaLabel: "SIGN UP",
      ctaHref: withBase("/booking"),
    },
    sideEvents: [
      { id: "mixer", title: "SOCIAL MIXER", meta: "FRIDAYS @ 7PM", variant: "primary", icon: "groups", visible: true },
      { id: "clinic", title: "ELITE CLINIC", meta: "WEDNESDAYS @ 10AM", variant: "container", icon: "fitness_center", visible: true },
    ],
    news: defaultNewsCms(),
  };
}

function defaultNewsCms(): NewsCmsEntry[] {
  return CLUB_NEWS.map((article) => ({
    id: article.id,
    published: article.homepage === true || article.id === "member-guest",
  }));
}

function normalizeNewsCms(raw: unknown, fallback: NewsCmsEntry[]): NewsCmsEntry[] {
  const byId = new Map(fallback.map((entry) => [entry.id, { ...entry }]));
  if (!Array.isArray(raw)) return [...byId.values()];
  for (const item of raw) {
    if (!isRecord(item) || typeof item.id !== "string") continue;
    const existing = byId.get(item.id);
    if (existing) {
      if ("published" in item) existing.published = Boolean(item.published);
      if (typeof item.imageSrc === "string" && item.imageSrc.length > 0) {
        existing.imageSrc = item.imageSrc;
      }
    }
  }
  return [...byId.values()];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function loadSiteContent(): SiteContent {
  const fallback = defaultSiteContent();
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return fallback;
    return {
      hero: isRecord(parsed.hero)
        ? { ...fallback.hero, ...(parsed.hero as SiteContent["hero"]) }
        : fallback.hero,
      gallery: Array.isArray(parsed.gallery) && parsed.gallery.length === 6
        ? (parsed.gallery as GalleryImage[])
        : fallback.gallery,
      featured: isRecord(parsed.featured)
        ? { ...fallback.featured, ...(parsed.featured as FeaturedEvent) }
        : fallback.featured,
      sideEvents: Array.isArray(parsed.sideEvents) && parsed.sideEvents.length > 0
        ? (parsed.sideEvents as SideEvent[])
        : fallback.sideEvents,
      news: normalizeNewsCms(parsed.news, fallback.news),
    };
  } catch {
    return fallback;
  }
}

export function saveSiteContent(content: SiteContent): void {
  localStorage.setItem(KEY, JSON.stringify(content));
}

export function resetSiteContent(): SiteContent {
  const next = defaultSiteContent();
  localStorage.removeItem(KEY);
  return next;
}

export function publishedNewsIds(content: SiteContent): Set<string> {
  return new Set(content.news.filter((item) => item.published).map((item) => item.id));
}

export function newsImageOverrides(content: SiteContent): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of content.news) {
    if (item.imageSrc) map.set(item.id, item.imageSrc);
  }
  return map;
}

export function visibleSideEvents(content: SiteContent): SideEvent[] {
  return content.sideEvents.filter((item) => item.visible);
}

export function fileToDataUrl(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    return Promise.reject(new Error("Image must be under 200KB for this demo store"));
  }
  if (!file.type.startsWith("image/")) {
    return Promise.reject(new Error("Choose an image file"));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}
