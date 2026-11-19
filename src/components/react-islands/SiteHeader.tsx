import { useMemo } from "react";
import MobileMenu from "@/components/react-islands/MobileMenu";
import AdminNavLink from "@/components/react-islands/AdminNavLink";
import HeaderAuthActions from "@/components/react-islands/HeaderAuthActions";
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
    <header className="sticky top-0 z-50 w-full border-b border-elevated-border bg-surface-container-lowest/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-container-max min-w-0 items-center gap-2 px-4 py-3 md:gap-3 md:px-margin-desktop md:py-3.5 lg:gap-4">
        <div className="flex min-w-0 shrink-0 items-center gap-2 md:gap-4">
          <div className="relative z-50 lg:hidden">
            <MobileMenu />
          </div>
          <a
            href={withBase("/")}
            className="relative z-50 font-display text-headline-lg-mobile uppercase tracking-wide text-primary md:text-headline-lg"
            aria-label="BOLD Pickleball home"
          >
            BOLD
          </a>
        </div>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex lg:gap-7"
          aria-label="Site"
        >
          {links.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <a
                key={link.key}
                href={link.href}
                className={`py-1 font-sans text-body-md font-medium transition-colors ${
                  active
                    ? "text-primary underline decoration-primary decoration-2 underline-offset-[6px]"
                    : "text-on-surface-variant hover:text-primary"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-2 md:ml-0 md:gap-3 lg:gap-4">
          <LanguageToggle className="relative z-[120] hidden shrink-0 lg:flex" />
          <a href={withBase("/booking")} className="bold-btn-primary shrink-0 px-3 py-2 text-[13px] lg:hidden">
            {t("header.book")}
          </a>
          <HeaderAuthActions layout="compact" className="lg:hidden" />
          <AdminNavLink className="hidden font-sans text-body-md font-medium text-primary transition-opacity hover:opacity-80 lg:inline" />
          <HeaderAuthActions layout="desktop" className="hidden lg:flex" />
        </div>
      </div>
    </header>
  );
}
