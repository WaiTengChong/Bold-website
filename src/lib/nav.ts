import { withBase } from "@/lib/utils";

export const desktopNavLinks = [
  { href: withBase("/booking"), label: "Booking" },
  { href: withBase("/facility"), label: "Facility" },
  { href: withBase("/mission"), label: "Mission" },
  { href: withBase("/staff"), label: "Staff" },
  { href: withBase("/membership"), label: "Membership" },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.replace(/\/$/, "") === href.replace(/\/$/, "");
}
