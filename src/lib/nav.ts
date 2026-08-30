import { withBase } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n";

export const desktopNavLinkDefs = [
  { href: withBase("/booking"), key: "nav.booking" as MessageKey },
  { href: withBase("/facility"), key: "nav.facility" as MessageKey },
  { href: withBase("/mission"), key: "nav.mission" as MessageKey },
  { href: withBase("/staff"), key: "nav.staff" as MessageKey },
  { href: withBase("/membership"), key: "nav.membership" as MessageKey },
] as const;

/** @deprecated use desktopNavLinkDefs + i18n */
export const desktopNavLinks = desktopNavLinkDefs.map((l) => ({ href: l.href, label: l.key }));

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.replace(/\/$/, "") === href.replace(/\/$/, "");
}
