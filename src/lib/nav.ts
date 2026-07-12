export const desktopNavLinks = [
  { href: "/booking", label: "Booking" },
  { href: "/mission", label: "Mission" },
  { href: "/staff", label: "Staff" },
  { href: "/membership", label: "Membership" },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.replace(/\/$/, "") === href;
}
