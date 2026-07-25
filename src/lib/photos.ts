import { withBase } from "@/lib/utils";

/** Brand photography from UI/Photo — served from /public/photos */
export const PHOTOS = {
  brandLogo: withBase("/photos/brand-logo.jpg"),
  facilityInterior: withBase("/photos/facility-interior.jpg"),
  facilityCollage: withBase("/photos/facility-collage.jpg"),
} as const;

export type GalleryImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

/** Six crops from the facility collage for the Bold Life grid */
export const HOMEPAGE_GALLERY: GalleryImage[] = [
  {
    src: PHOTOS.facilityCollage,
    alt: "BOLD reception lounge with branded seating and pillar signage",
    objectPosition: "0% 0%",
  },
  {
    src: PHOTOS.facilityCollage,
    alt: "Indoor championship pickleball court with BOLD branding",
    objectPosition: "100% 0%",
  },
  {
    src: PHOTOS.facilityCollage,
    alt: "Premium locker room with wood bench and branded apparel",
    objectPosition: "100% 35%",
  },
  {
    src: PHOTOS.facilityCollage,
    alt: "Pro shop pegboard with BOLD paddles and merchandise",
    objectPosition: "50% 35%",
  },
  {
    src: PHOTOS.facilityCollage,
    alt: "Café and social lounge with communal seating",
    objectPosition: "0% 100%",
  },
  {
    src: PHOTOS.facilityCollage,
    alt: "Play Hard Stay Humble motivational wall at BOLD",
    objectPosition: "50% 65%",
  },
];
