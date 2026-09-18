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
  { href: withBase("/#events"), key: "menu.events" },
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
      document.body.style.overflow = "";
    };
  }, []);

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
            className="fixed inset-x-0 top-0 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-40 bg-surface/95 backdrop-blur-xl md:hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <div className="absolute top-4 right-4">
              <LanguageToggle />
            </div>
            <nav className="flex h-full flex-col justify-center gap-8 px-margin-mobile pt-20 pb-8">
              {links.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="font-display text-display-md uppercase text-primary transition-opacity hover:opacity-70"
                  onClick={close}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>,
          document.body,
        )}
    </>
  );
}
