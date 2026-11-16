/** Static paths match Astro public assets; frontend rewrites with withBase when rendering. */
const photos = {
  facilityInterior: "/photos/facility-interior.webp",
  facilityCollage: "/photos/facility-collage.webp",
};

export const defaultSiteContentPayload = {
  hero: {
    imageSrc: photos.facilityInterior,
    imageAlt: "BOLD Pickleball luxury indoor facility with lounge, courts, and pro shop",
  },
  gallery: [
    {
      src: photos.facilityCollage,
      alt: "BOLD reception lounge with branded seating and pillar signage",
      objectPosition: "0% 0%",
    },
    {
      src: photos.facilityCollage,
      alt: "Indoor championship pickleball court with BOLD branding",
      objectPosition: "100% 0%",
    },
    {
      src: photos.facilityCollage,
      alt: "Premium locker room with wood bench and branded apparel",
      objectPosition: "100% 35%",
    },
    {
      src: photos.facilityCollage,
      alt: "Pro shop pegboard with BOLD paddles and merchandise",
      objectPosition: "50% 35%",
    },
    {
      src: photos.facilityCollage,
      alt: "Café and social lounge with communal seating",
      objectPosition: "0% 100%",
    },
    {
      src: photos.facilityCollage,
      alt: "Play Hard Stay Humble motivational wall at BOLD",
      objectPosition: "50% 65%",
    },
  ],
  featured: {
    date: "OCT 24",
    title: "PRO-AM INVITATIONAL",
    description:
      "Elite level competition meets luxury hospitality. Watch the best in the state compete for the Bold Cup.",
    imageSrc: photos.facilityCollage,
    imageAlt: "BOLD championship court and facility overview",
    ctaLabel: "SIGN UP",
    ctaHref: "/Bold-website/booking/",
  },
  sideEvents: [
    {
      id: "mixer",
      title: "SOCIAL MIXER",
      meta: "FRIDAYS @ 7PM",
      variant: "primary",
      icon: "groups",
      visible: true,
    },
    {
      id: "clinic",
      title: "ELITE CLINIC",
      meta: "WEDNESDAYS @ 10AM",
      variant: "container",
      icon: "fitness_center",
      visible: true,
    },
  ],
  news: [
    { id: "court-hours", published: true },
    { id: "pro-shop", published: true },
    { id: "recovery-suite", published: true },
    { id: "member-guest", published: true },
    { id: "coaching-series", published: false },
  ],
};

export const defaultFacilityPayload = {
  heroImageSrc: photos.facilityInterior,
  blueprintImageSrc: photos.facilityCollage,
  galleryImageSrc: photos.facilityInterior,
  locationImageSrc: photos.facilityCollage,
};

export const catalogRows: { id: string; kind: "event" | "news"; payload: Record<string, unknown> }[] = [
  {
    id: "pro-am",
    kind: "event",
    payload: {
      homepage: true,
      featured: true,
      imageSrc: photos.facilityCollage,
      imagePosition: "50% 15%",
      icon: "trophy",
      accent: "primary",
      ctaHref: "/Bold-website/booking/",
    },
  },
  {
    id: "mixer",
    kind: "event",
    payload: {
      homepage: true,
      imageSrc: photos.facilityInterior,
      imagePosition: "60% 40%",
      icon: "users",
      accent: "primary",
      ctaHref: "/Bold-website/signup/",
    },
  },
  {
    id: "clinic",
    kind: "event",
    payload: {
      homepage: true,
      imageSrc: photos.facilityCollage,
      imagePosition: "100% 0%",
      icon: "dumbbell",
      accent: "container",
      ctaHref: "/Bold-website/booking/",
    },
  },
  {
    id: "member-open",
    kind: "event",
    payload: {
      imageSrc: photos.facilityCollage,
      imagePosition: "0% 0%",
      icon: "sparkles",
      accent: "container",
      ctaHref: "/Bold-website/membership/",
    },
  },
  {
    id: "doubles-ladder",
    kind: "event",
    payload: {
      imageSrc: photos.facilityInterior,
      imagePosition: "30% 50%",
      icon: "trophy",
      accent: "primary",
      ctaHref: "/Bold-website/booking/",
    },
  },
  {
    id: "recovery-social",
    kind: "event",
    payload: {
      imageSrc: photos.facilityCollage,
      imagePosition: "50% 35%",
      icon: "heart-pulse",
      accent: "container",
      ctaHref: "/Bold-website/booking/",
    },
  },
  {
    id: "court-hours",
    kind: "news",
    payload: {
      homepage: true,
      featured: true,
      category: "club",
      imageSrc: photos.facilityInterior,
      imagePosition: "50% 30%",
      ctaHref: "/Bold-website/booking/",
    },
  },
  {
    id: "pro-shop",
    kind: "news",
    payload: {
      homepage: true,
      category: "retail",
      imageSrc: photos.facilityCollage,
      imagePosition: "50% 35%",
      ctaHref: "/Bold-website/#life",
    },
  },
  {
    id: "recovery-suite",
    kind: "news",
    payload: {
      homepage: true,
      category: "facility",
      imageSrc: photos.facilityCollage,
      imagePosition: "100% 35%",
      ctaHref: "/Bold-website/membership/",
    },
  },
  {
    id: "member-guest",
    kind: "news",
    payload: {
      category: "membership",
      imageSrc: photos.facilityInterior,
      imagePosition: "70% 50%",
      ctaHref: "/Bold-website/membership/",
    },
  },
  {
    id: "coaching-series",
    kind: "news",
    payload: {
      category: "club",
      imageSrc: photos.facilityCollage,
      imagePosition: "100% 0%",
      ctaHref: "/Bold-website/events/",
    },
  },
];