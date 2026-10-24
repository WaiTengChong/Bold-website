import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { ensureAdminSeed, isAdmin } from "@/lib/auth-client";
import type { MessageKey } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";
import LanguageToggle from "./LanguageToggle";

const baseLinkDefs: { href: string; key: MessageKey }[] = [
  { href: withBase("/"), key: "menu.club" },
  { href: withBase("/facility"), key: "menu.facility" },
  { href: withBase("/events"), key: "menu.events" },
  { href: withBase("/news"), key: "menu.news" },
  { href: withBase("/#membership"), key: "menu.membership" },
  { href: withBase("/#life"), key: "menu.life" },
  { href: "#", key: "menu.shop" },
  { href: withBase("/login"), key: "header.login" },
  { href: withBase("/signup"), key: "menu.signup" },
];

export default function MobileMenu() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [admin, setAdmin] = useState(false);
  const menuId = useId();

  const links = useMemo(() => {
    const items = baseLinkDefs.map((link) => ({ ...link, label: t(link.key) }));
    if (admin) items.push({ href: withBase("/console"), key: "header.admin" as MessageKey, label: t("header.admin") });
    return items;
  }, [admin, t]);

  useEffect(() => {
    setMounted(true);
    ensureAdminSeed();
    setAdmin(isAdmin());
    return () => {
      document.documentElement.removeAttribute("data-mobile-menu-open");
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!open) {
      document.documentElement.removeAttribute("data-mobile-menu-open");
      document.body.style.overflow = "";
      return;
    }
    document.documentElement.setAttribute("data-mobile-menu-open", "");
    document.body.style.overflow = "hidden";
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className="text-primary transition-all active:scale-95 active:opacity-80"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? t("menu.close") : t("menu.open")}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-8" strokeWidth={1.5} /> : <Menu className="size-8" strokeWidth={1.5} />}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-[110] flex flex-col bg-surface/95 backdrop-blur-xl pt-[env(safe-area-inset-top,0px)] md:hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className="relative z-20 flex shrink-0 justify-end px-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-2">
              <LanguageToggle />
            </div>
            <nav
              className="relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-contain px-margin-mobile pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] [-webkit-overflow-scrolling:touch]"
              aria-label="Mobile site"
            >
              <ul className="flex flex-col gap-4 sm:gap-5">
                {links.map((link) => (
                  <li key={link.key}>
                    <a
                      href={link.href}
                      className="block py-1 font-display text-[clamp(1.625rem,6.5vw,2rem)] leading-tight tracking-wide text-primary transition-opacity hover:opacity-70"
                      onClick={close}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
