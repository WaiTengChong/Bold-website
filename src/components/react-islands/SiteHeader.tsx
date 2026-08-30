import { useMemo } from "react";
import MobileMenu from "@/components/react-islands/MobileMenu";
import AdminNavLink from "@/components/react-islands/AdminNavLink";
import LanguageToggle from "@/components/react-islands/LanguageToggle";
import { desktopNavLinkDefs, isNavActive } from "@/lib/nav";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

export default function SiteHeader() {
  const { t } = useLocale();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  const links = useMemo(
    () => desktopNavLinkDefs.map((link) => ({ ...link, label: t(link.key) })),
    [t],
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-container-max min-w-0 items-center justify-between gap-2 px-4 py-3 md:grid md:grid-cols-3 md:gap-0 md:px-margin-desktop md:py-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-4">
          <div className="relative z-50 md:hidden">
            <MobileMenu />
          </div>
          <a
            href={withBase("/")}
            className="relative z-50 font-display text-headline-lg-mobile uppercase tracking-wider text-primary md:text-headline-lg"
            aria-label="BOLD Pickleball home"
          >
            BOLD
          </a>
        </div>

        <nav className="hidden items-center justify-center gap-8 md:flex" aria-label="Site">
          {links.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <a
                key={link.key}
                href={link.href}
                className={`py-1 font-sans text-label-md uppercase tracking-widest transition-colors ${
                  active
                    ? "border-b-2 border-primary font-semibold text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="relative z-50 flex shrink-0 items-center justify-end gap-2 md:gap-4">
          <LanguageToggle />
          <a
            href={withBase("/booking")}
            className="shrink-0 bg-primary-container px-2.5 py-1.5 font-sans text-[11px] font-medium uppercase tracking-wide text-on-primary-container transition-all active:scale-95 sm:px-4 sm:py-2 sm:text-label-md sm:tracking-widest md:hidden"
          >
            {t("header.book")}
          </a>
          <AdminNavLink className="hidden font-sans text-label-md uppercase tracking-widest text-primary transition-colors hover:opacity-80 md:inline" />
          <a
            href={withBase("/login")}
            className="hidden font-sans text-label-md uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary md:inline"
          >
            {t("header.login")}
          </a>
          <a
            href={withBase("/membership")}
            className="hidden bg-primary px-6 py-2 font-sans text-label-md font-medium uppercase tracking-widest text-on-primary transition-all hover:opacity-90 active:scale-95 md:inline"
          >
            {t("header.join")}
          </a>
        </div>
      </div>
    </header>
  );
}
