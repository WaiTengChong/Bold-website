import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { withBase } from "@/lib/utils";

const links = [
  { href: withBase("/"), label: "The Club" },
  { href: withBase("/facility"), label: "The Facility" },
  { href: withBase("/#events"), label: "Events" },
  { href: withBase("/#membership"), label: "Membership" },
  { href: withBase("/#life"), label: "Bold Life" },
  { href: "#", label: "Shop" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="text-primary transition-all active:scale-95 active:opacity-80"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "Close menu" : "Open menu"}
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
            className="fixed inset-0 z-40 bg-surface/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex h-full flex-col justify-center gap-8 px-margin-mobile pt-20 pb-32">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="font-display text-display-md uppercase text-primary transition-opacity hover:opacity-70"
                  onClick={() => setOpen(false)}
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
