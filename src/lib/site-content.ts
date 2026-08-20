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

export type NewsItem = {
  id: string;
  title: string;
  date: string;
  body: string;
  published: boolean;
};

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
    news: [
      {
        id: "court-hours",
        title: "Extended Friday hours",
        date: "12 OCT",
        body: "Courts stay open until 23:00 every Friday through the fall season.",
        published: true,
      },
      {
        id: "pro-shop",
        title: "New paddles in the pro shop",
        date: "5 OCT",
        body: "Carbon pro paddles are back in stock. Members get 10% off this week.",
        published: true,
      },
    ],
  };
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
      news: Array.isArray(parsed.news) ? (parsed.news as NewsItem[]) : fallback.news,
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

export function publishedNews(content: SiteContent): NewsItem[] {
  return content.news.filter((item) => item.published);
}

export function visibleSideEvents(content: SiteContent): SideEvent[] {
  return content.sideEvents.filter((item) => item.visible);
}

export function newNewsId(): string {
  return `news-${Date.now()}`;
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
