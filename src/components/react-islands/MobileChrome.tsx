import { useMemo } from "react";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";

const tabDefs = [
  { id: "home" as const, href: withBase("/"), key: "mobile.home" as const, icon: "home" },
  { id: "courts" as const, href: withBase("/facility"), key: "mobile.courts" as const, icon: "activity" },
  { id: "events" as const, href: withBase("/#events"), key: "mobile.events" as const, icon: "calendar" },
  { id: "club" as const, href: withBase("/#membership"), key: "mobile.club" as const, icon: "user" },
];

function isTabActive(id: (typeof tabDefs)[number]["id"], pathname: string): boolean {
  const homePath = withBase("/").replace(/\/$/, "") || "/";
  const facilityPath = withBase("/facility").replace(/\/$/, "");
  if (id === "home") return pathname === homePath;
  if (id === "courts") return pathname === facilityPath;
  return false;
}

function Icon({ name, className }: { name: string; className?: string }) {
  if (name === "home") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }
  if (name === "activity") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function MobileChrome() {
  const { t } = useLocale();
  const pathname = typeof window !== "undefined" ? window.location.pathname.replace(/\/$/, "") || "/" : "/";
  const tabs = useMemo(() => tabDefs.map((tab) => ({ ...tab, label: t(tab.key) })), [t]);

  return (
    <>
      <nav
        className="pointer-events-auto fixed right-0 bottom-0 left-0 z-[100] flex max-w-full justify-around border-t border-outline-variant/30 bg-surface px-1 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:hidden"
        aria-label="Mobile primary"
      >
        {tabs.map(({ id, href, label, icon }) => {
          const active = isTabActive(id, pathname);
          return (
            <a
              key={id}
              href={href}
              className={`flex min-h-11 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 px-0.5 transition-colors ${
                active ? "text-primary" : "text-on-surface-variant hover:text-primary"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={icon} className="size-6 shrink-0" />
              <span className={`text-[10px] uppercase tracking-tighter ${active ? "font-bold" : "font-medium"}`}>
                {label}
              </span>
            </a>
          );
        })}
      </nav>
      <a
        href={withBase("/booking")}
        className="pointer-events-auto fixed right-3 bottom-[calc(6.75rem+env(safe-area-inset-bottom,0px))] z-[90] flex size-14 touch-manipulation items-center justify-center rounded-full bg-primary-container text-on-primary shadow-2xl transition-all active:scale-95 sm:right-5 sm:bottom-[calc(7rem+env(safe-area-inset-bottom,0px))] md:hidden"
        aria-label={t("mobile.bookAria")}
      >
        <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </a>
    </>
  );
}
