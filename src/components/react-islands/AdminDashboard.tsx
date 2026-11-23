import { useEffect, useMemo, useState } from "react";
import { apiEnabled, staffApiFetch } from "@/lib/api-client";
import { getStaffSession, isAdmin, isStaffLoggedIn, staffLogout } from "@/lib/auth-client";
import { fetchCourtMaintenance } from "@/lib/booking-api";
import { adminHref, samePath, viewFromPath, type ViewId } from "@/lib/admin-nav";
import type { MessageKey } from "@/lib/i18n";
import { useLocale } from "@/lib/use-locale";
import { withBase } from "@/lib/utils";
import AdminSidebar from "./AdminSidebar";
import AdminCms from "./AdminCms";
import LanguageToggle from "./LanguageToggle";

type Court = {
  id: number;
  status: "Active" | "Maintenance" | "Available";
  player: string;
  time: string;
  maint: boolean;
};

type OverviewBooking = {
  id: string;
  date: string;
  time: string;
  courtId: number;
  guestLabel: string;
  paymentStatus: string;
  memberId: string | null;
};

function localTodayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function mergeTodayBookings(courts: Court[], bookings: OverviewBooking[]): Court[] {
  const today = localTodayIso();
  const byCourt = new Map<number, OverviewBooking>();
  for (const b of bookings) {
    if (b.date !== today) continue;
    const prev = byCourt.get(b.courtId);
    if (!prev || b.time < prev.time) byCourt.set(b.courtId, b);
  }
  return courts.map((c) => {
    if (c.maint) {
      return { ...c, status: "Maintenance", player: "-", time: "-" };
    }
    const hit = byCourt.get(c.id);
    if (!hit) {
      return { ...c, status: "Available", player: "-", time: "-" };
    }
    return { ...c, status: "Active", player: hit.guestLabel, time: hit.time };
  });
}

type Member = {
  id: string;
  name: string;
  tier: string;
  balance: string;
  last: string;
  color: string;
};

const INITIAL_COURTS: Court[] = [
  { id: 1, status: "Active", player: "M. Thompson", time: "14:22", maint: false },
  { id: 2, status: "Active", player: "L. Richards", time: "14:05", maint: false },
  { id: 3, status: "Maintenance", player: "-", time: "-", maint: true },
  { id: 4, status: "Available", player: "-", time: "-", maint: false },
  { id: 5, status: "Active", player: "A. Chen", time: "14:40", maint: false },
  { id: 6, status: "Active", player: "J. Smith", time: "14:15", maint: false },
  { id: 7, status: "Active", player: "D. Vance", time: "14:55", maint: false },
  { id: 8, status: "Active", player: "K. Miller", time: "14:32", maint: false },
];

const INITIAL_MEMBERS: Member[] = [
  { id: "BP-4891", name: "Marcus Sterling", tier: "Founding Member", balance: "$2,450.00", last: "2h ago", color: "text-on-primary-container" },
  { id: "BP-2204", name: "Elena Rodriguez", tier: "Pro Elite", balance: "$840.50", last: "Yesterday", color: "text-primary" },
  { id: "BP-9982", name: "David Kim", tier: "Club Tier", balance: "$120.00", last: "3d ago", color: "text-outline" },
  { id: "BP-1156", name: "Sarah Waters", tier: "Pro Elite", balance: "$3,100.00", last: "15m ago", color: "text-primary" },
  { id: "BP-5532", name: "Robert Vance", tier: "Founding Member", balance: "$45.00", last: "Just now", color: "text-on-primary-container" },
];

const INVENTORY = [
  { sku: "PD-PRO-01", name: "Pro Carbon Paddle", stock: 24, status: "In stock" },
  { sku: "BL-OUT-40", name: "Outdoor Balls (40pk)", stock: 8, status: "Low" },
  { sku: "TW-CLB-12", name: "Club Towels", stock: 56, status: "In stock" },
  { sku: "NT-CT-08", name: "Court Nets", stock: 2, status: "Reorder" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

function greetingDate() {
  return new Date()
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })
    .toUpperCase();
}

const navKeys: Record<ViewId, MessageKey> = {
  dashboard: "admin.nav.dashboard",
  schedule: "admin.nav.schedule",
  members: "admin.nav.members",
  content: "admin.nav.content",
  inventory: "admin.nav.inventory",
  settings: "admin.nav.settings",
};

export default function AdminDashboard({ view: initialView = "dashboard" }: { view?: ViewId }) {
  const { t } = useLocale();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [courts, setCourts] = useState(INITIAL_COURTS);
  const [bookingsOverview, setBookingsOverview] = useState<OverviewBooking[]>([]);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [view, setView] = useState<ViewId>(initialView);
  const [guestBookingEnabled, setGuestBookingEnabled] = useState(true);

  const [staffList, setStaffList] = useState<
    { id: string; dialCode: string; phone: string; surname: string; givenName: string; email: string; role: string }[]
  >([]);
  const [staffForm, setStaffForm] = useState({
    dialCode: "852",
    phone: "",
    password: "",
    surname: "",
    givenName: "",
    email: "",
    role: "staff" as "staff" | "admin",
  });
  const [staffMsg, setStaffMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!isStaffLoggedIn()) {
        window.location.replace(withBase("/console/login"));
        return;
      }
      if (apiEnabled()) {
        try {
          const courtRows = await staffApiFetch<{ id: number; inMaintenance: boolean }[]>("/courts");
          setCourts(
            courtRows.map((c) => ({
              id: c.id,
              status: c.inMaintenance ? "Maintenance" : "Available",
              player: "-",
              time: "-",
              maint: c.inMaintenance,
            })),
          );
          const settings = await staffApiFetch<{ guestBookingEnabled: boolean }>("/settings");
          setGuestBookingEnabled(settings.guestBookingEnabled);
          const apiMembers = await staffApiFetch<
            {
              id: string;
              dialCode: string;
              phone: string;
              surname: string;
              givenName: string;
              email: string;
              createdAt: string;
            }[]
          >("/admin/members");
          setMembers(
            apiMembers.map((m, i) => ({
              id: m.id.slice(0, 8).toUpperCase(),
              name: [m.surname, m.givenName].filter(Boolean).join(" ") || `+${m.dialCode} ${m.phone}`,
              tier: m.email || "Member",
              balance: "—",
              last: new Date(m.createdAt).toLocaleDateString(),
              color: i % 2 === 0 ? "text-on-primary-container" : "text-primary",
            })),
          );
          if (isAdmin()) {
            const staff = await staffApiFetch<typeof staffList>("/admin/staff");
            setStaffList(staff);
          }
          const overview = await staffApiFetch<OverviewBooking[]>("/bookings/admin/overview");
          setBookingsOverview(overview);
        } catch {
          /* keep demo rows if API unreachable */
        }
      }
      setAllowed(true);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!allowed) return;
    const tick = window.setInterval(() => {
      setMembers((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        return prev.map((m, i) => (i === idx ? { ...m, last: "Just now" } : m));
      });
    }, 30000);
    return () => window.clearInterval(tick);
  }, [allowed]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  useEffect(() => {
    const onPop = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.tier.toLowerCase().includes(q),
    );
  }, [members, query]);

  const displayCourts = useMemo(() => {
    if (!apiEnabled()) return courts;
    return mergeTodayBookings(courts, bookingsOverview);
  }, [courts, bookingsOverview]);

  const activeCount = displayCourts.filter((c) => c.status === "Active").length;
  const maintCourts = courts.filter((c) => c.maint);
  const recentMembers = members.slice(0, 3);

  const toggleMaint = (id: number) => {
    void (async () => {
      const court = courts.find((c) => c.id === id);
      if (!court) return;
      const next = !court.maint;
      if (apiEnabled()) {
        try {
          await staffApiFetch(`/admin/courts/${id}/maintenance`, {
            method: "PATCH",
            body: JSON.stringify({ inMaintenance: next }),
          });
          await fetchCourtMaintenance();
        } catch {
          return;
        }
      }
      setCourts((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          return {
            ...c,
            maint: next,
            status: next ? "Maintenance" : c.player === "-" ? "Available" : "Active",
          };
        }),
      );
    })();
  };

  const toggleGuestBooking = () => {
    void (async () => {
      if (!apiEnabled()) return;
      const next = !guestBookingEnabled;
      try {
        const res = await staffApiFetch<{ guestBookingEnabled: boolean }>("/settings", {
          method: "PATCH",
          body: JSON.stringify({ guestBookingEnabled: next }),
        });
        setGuestBookingEnabled(res.guestBookingEnabled);
      } catch {
        /* ignore */
      }
    })();
  };

  const handleLogout = () => {
    staffLogout();
    window.location.href = withBase("/login");
  };

  const goTo = (id: ViewId) => {
    setView(id);
    setNavOpen(false);
    const href = adminHref(id);
    if (!samePath(window.location.pathname, href)) {
      window.history.pushState({ view: id }, "", href);
    }
    document.title = `BOLD PICKLEBALL | ${t(navKeys[id])}`;
    requestAnimationFrame(() => {
      document.getElementById("admin-main")?.scrollTo({ top: 0 });
    });
  };

  if (!ready || !allowed) {
    return (
      <div className="admin-console light flex h-dvh bg-surface">
        <div className="hidden w-80 shrink-0 bg-primary md:block" />
        <div className="min-w-0 flex-1 space-y-6 px-margin-mobile py-stack-md md:px-margin-desktop">
          <div className="h-8 w-40 animate-pulse bg-surface-container-high" />
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            <div className="h-32 animate-pulse bg-surface-container-high" />
            <div className="h-32 animate-pulse bg-surface-container-high" />
            <div className="h-32 animate-pulse bg-surface-container-high" />
          </div>
          <div className="h-24 animate-pulse bg-surface-container-high" />
        </div>
      </div>
    );
  }

  const session = getStaffSession();

  return (
    <div className="admin-console light flex h-dvh max-w-full overflow-hidden bg-surface text-on-surface">
      <AdminSidebar
        view={view}
        open={navOpen}
        session={session}
        onClose={() => setNavOpen(false)}
        onNavigate={goTo}
        onLogout={handleLogout}
      />

      <main id="admin-main" className="custom-scrollbar min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-[max(2rem,env(safe-area-inset-bottom))] md:ml-80">
        <header className="docked full-width sticky top-0 z-50 flex w-full items-center justify-between gap-2 border-b border-outline-variant/30 bg-surface/90 px-margin-mobile py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl md:px-margin-desktop md:py-4 dark:bg-primary/90">
          <div className="flex min-w-0 items-center gap-2 md:gap-4">
            <button
              type="button"
              className="shrink-0 text-primary md:pointer-events-none"
              aria-expanded={navOpen}
              aria-label={t("admin.openMenu")}
              onClick={() => setNavOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile truncate text-primary uppercase md:font-headline-lg md:text-headline-lg">
              {t(navKeys[view])}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-gutter">
            <LanguageToggle />
            <div className="hidden items-center gap-6 md:flex">
              <span className="material-symbols-outlined cursor-pointer text-on-surface-variant transition-colors hover:text-primary">
                notifications
              </span>
              <span className="material-symbols-outlined cursor-pointer text-on-surface-variant transition-colors hover:text-primary">
                search
              </span>
            </div>
            <a
              href={withBase("/booking")}
              className="bg-primary px-3 py-2 font-bold tracking-wider text-on-primary uppercase text-[11px] transition-all active:scale-95 active:opacity-80 sm:px-6 sm:text-label-md"
            >
              {t("admin.quickBook")}
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-container-max space-y-stack-md px-margin-mobile py-stack-md md:px-margin-desktop">
          {view === "dashboard" && (
            <>
              <div>
                <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">{greetingDate()}</p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {t("admin.welcome")}
                  {session?.phone ? ` · +${session.dialCode} ${session.phone}` : ""}
                </p>
              </div>

              {maintCourts.length > 0 && (
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 border border-error/40 bg-error-container px-4 py-3 text-left"
                  onClick={() => goTo("schedule")}
                >
                  <span className="font-label-md text-label-md text-on-error-container uppercase">
                    {maintCourts.length === 1
                      ? t("admin.maintAlert", { count: maintCourts.length })
                      : t("admin.maintAlertPlural", { count: maintCourts.length })}
                  </span>
                  <span className="font-label-sm text-label-sm tracking-widest text-error uppercase">{t("admin.viewSchedule")}</span>
                </button>
              )}

              <KpiRow />

              <section className="grid grid-cols-2 gap-stack-sm md:grid-cols-4">
                {[
                  { id: "book", label: t("admin.quickBookAction"), hint: t("admin.quickBookHint"), icon: "event_available", href: withBase("/booking") },
                  { id: "schedule", label: t("admin.scheduleAction"), hint: t("admin.scheduleHint"), icon: "calendar_today" },
                  { id: "content", label: t("admin.contentAction"), hint: t("admin.contentHint"), icon: "photo_library" },
                  { id: "members", label: t("admin.membersAction"), hint: t("admin.membersHint"), icon: "groups" },
                ].map((action) =>
                  action.href ? (
                    <a
                      key={action.id}
                      href={action.href}
                      className="flex items-center gap-3 border border-outline-variant bg-surface-container-lowest p-4 text-left transition-colors hover:border-primary hover:bg-surface-container-low"
                    >
                      <span className="material-symbols-outlined text-primary">{action.icon}</span>
                      <span>
                        <span className="font-label-md text-label-md block text-primary uppercase">{action.label}</span>
                        <span className="font-body-md text-[11px] text-on-surface-variant">{action.hint}</span>
                      </span>
                    </a>
                  ) : (
                    <button
                      key={action.id}
                      type="button"
                      className="flex items-center gap-3 border border-outline-variant bg-surface-container-lowest p-4 text-left transition-colors hover:border-primary hover:bg-surface-container-low"
                      onClick={() => goTo(action.id as ViewId)}
                    >
                      <span className="material-symbols-outlined text-primary">{action.icon}</span>
                      <span>
                        <span className="font-label-md text-label-md block text-primary uppercase">{action.label}</span>
                        <span className="font-body-md text-[11px] text-on-surface-variant">{action.hint}</span>
                      </span>
                    </button>
                  ),
                )}
              </section>

              <CourtsBlock title={t("admin.courtOccupancy")} courts={displayCourts} activeCount={activeCount} onToggle={toggleMaint} />

              <section className="space-y-stack-sm">
                <div className="flex items-end justify-between gap-4">
                  <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
                    {t("admin.recentMembers")}
                  </h2>
                  <button
                    type="button"
                    className="font-label-sm text-label-sm tracking-widest text-primary uppercase hover:underline"
                    onClick={() => goTo("members")}
                  >
                    {t("admin.viewAll")}
                  </button>
                </div>
                <MemberTable members={recentMembers} compact />
              </section>
            </>
          )}

          {view === "schedule" && (
            <>
              <CourtsBlock title={t("admin.todaySchedule")} courts={displayCourts} activeCount={activeCount} onToggle={toggleMaint} />
              {apiEnabled() && <ScheduleBookingsTable bookings={bookingsOverview} />}
            </>
          )}

          {view === "members" && (
            <section className="space-y-stack-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
                  {t("admin.memberMgmt")}
                </h2>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                  <div className="relative min-w-0 flex-1 sm:flex-none">
                    <input
                      className="w-full border-b border-primary bg-transparent py-2 pr-4 pl-8 font-label-md text-label-md uppercase outline-none focus:border-primary-container focus:ring-0 sm:w-64"
                      placeholder={t("admin.searchMembers")}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute top-2 left-0 text-primary">search</span>
                  </div>
                  <button
                    type="button"
                    className="border border-primary px-6 py-2 font-bold tracking-wider text-primary uppercase text-label-md transition-all hover:bg-primary hover:text-on-primary"
                  >
                    {t("admin.exportList")}
                  </button>
                </div>
              </div>
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center border border-dashed border-outline-variant px-4 py-12 text-center">
                  <span className="material-symbols-outlined mb-3 text-outline">group_off</span>
                  <p className="font-headline-sm text-headline-sm text-primary uppercase">{t("admin.noMembers")}</p>
                  <p className="font-body-md text-body-md mt-2 max-w-sm text-on-surface-variant">
                    {t("admin.noMembersHint")}
                  </p>
                </div>
              ) : (
                <MemberTable members={filtered} />
              )}
            </section>
          )}

          {view === "content" && <AdminCms />}

          {view === "inventory" && (
            <section className="space-y-stack-sm">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
                {t("admin.inventory")}
              </h2>
              <div className="overflow-hidden border border-outline-variant bg-surface-container-lowest">
                <div className="admin-table-scroll overflow-x-auto">
                  <table className="w-full min-w-[28rem] text-left">
                    <thead className="bg-primary font-headline-sm text-headline-sm text-on-primary uppercase">
                      <tr>
                        <th className="px-6 py-4 text-[14px] tracking-widest">{t("admin.sku")}</th>
                        <th className="px-6 py-4 text-[14px] tracking-widest">{t("admin.item")}</th>
                        <th className="px-6 py-4 text-[14px] tracking-widest">{t("admin.stock")}</th>
                        <th className="px-6 py-4 text-[14px] tracking-widest">{t("admin.statusCol")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30 font-body-md text-body-md">
                      {INVENTORY.map((row) => (
                        <tr key={row.sku} className="hover:bg-surface-container-low">
                          <td className="px-6 py-5 font-mono text-sm">{row.sku}</td>
                          <td className="px-6 py-5 font-semibold text-primary">{row.name}</td>
                          <td className="px-6 py-5 font-mono">{row.stock}</td>
                          <td className="px-6 py-5">
                            <span
                              className={`text-[10px] font-bold tracking-wider uppercase ${
                                row.status === "In stock" ? "text-on-primary-container" : "text-error"
                              }`}
                            >
                              {row.status === "In stock"
                                ? t("admin.inStock")
                                : row.status === "Low"
                                  ? t("admin.low")
                                  : t("admin.reorder")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {view === "settings" && (
            <section className="space-y-stack-sm">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
                {t("admin.settings")}
              </h2>
              <div className="space-y-4 border border-outline-variant bg-surface-container-lowest p-stack-md">
                <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                  <div>
                    <p className="font-label-md text-label-md text-primary uppercase">{t("admin.guestBooking")}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{t("admin.guestBookingDesc")}</p>
                  </div>
                  {apiEnabled() ? (
                    <button
                      type="button"
                      onClick={toggleGuestBooking}
                      className={`font-label-sm text-label-sm uppercase ${
                        guestBookingEnabled ? "text-on-primary-container" : "text-outline"
                      }`}
                    >
                      {guestBookingEnabled ? t("admin.on") : t("admin.off")}
                    </button>
                  ) : (
                    <span className="font-label-sm text-label-sm text-outline uppercase">{t("admin.off")}</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                  <div>
                    <p className="font-label-md text-label-md text-primary uppercase">{t("admin.smsReminders")}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{t("admin.smsRemindersDesc")}</p>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-primary-container uppercase">{t("admin.on")}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-label-md text-label-md text-primary uppercase">{t("admin.openingHours")}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{t("admin.openingHoursDesc")}</p>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline uppercase">{t("admin.edit")}</span>
                </div>
              </div>
              {isAdmin() && apiEnabled() && (
                <div className="mt-stack-md space-y-4 border border-outline-variant bg-surface-container-lowest p-stack-md">
                  <h3 className="font-label-md text-label-md uppercase text-primary">{t("admin.staff.heading")}</h3>
                  {staffList.length > 0 && (
                    <ul className="space-y-2 font-body-sm text-body-sm text-on-surface">
                      {staffList.map((s) => (
                        <li key={s.id}>
                          {[s.surname, s.givenName].filter(Boolean).join(" ") || `+${s.dialCode} ${s.phone}`} ·{" "}
                          {s.role === "admin" ? t("admin.staff.role.admin") : t("admin.staff.role.staff")}
                        </li>
                      ))}
                    </ul>
                  )}
                  <form
                    className="auth-form max-w-md"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void (async () => {
                        setStaffMsg(null);
                        try {
                          const created = await staffApiFetch<(typeof staffList)[0]>("/admin/staff", {
                            method: "POST",
                            body: JSON.stringify(staffForm),
                          });
                          setStaffList((prev) => [created, ...prev]);
                          setStaffForm({
                            dialCode: "852",
                            phone: "",
                            password: "",
                            surname: "",
                            givenName: "",
                            email: "",
                            role: "staff",
                          });
                          setStaffMsg("OK");
                        } catch {
                          setStaffMsg("ERR");
                        }
                      })();
                    }}
                  >
                    <div className="auth-field">
                      <label className="auth-label">{t("admin.staff.role")}</label>
                      <select
                        className="auth-input auth-select"
                        value={staffForm.role}
                        onChange={(e) =>
                          setStaffForm((f) => ({ ...f, role: e.target.value as "staff" | "admin" }))
                        }
                      >
                        <option value="staff">{t("admin.staff.role.staff")}</option>
                        <option value="admin">{t("admin.staff.role.admin")}</option>
                      </select>
                    </div>
                    <div className="auth-field-row">
                      <input
                        className="auth-input"
                        placeholder={t("auth.surname")}
                        value={staffForm.surname}
                        onChange={(e) => setStaffForm((f) => ({ ...f, surname: e.target.value }))}
                      />
                      <input
                        className="auth-input"
                        placeholder={t("auth.givenName")}
                        value={staffForm.givenName}
                        onChange={(e) => setStaffForm((f) => ({ ...f, givenName: e.target.value }))}
                      />
                    </div>
                    <input
                      className="auth-input auth-field"
                      placeholder={t("auth.email")}
                      value={staffForm.email}
                      onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))}
                    />
                    <input
                      className="auth-input auth-field"
                      placeholder={t("auth.phone")}
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                    <input
                      type="password"
                      className="auth-input auth-field"
                      placeholder={t("auth.password")}
                      value={staffForm.password}
                      onChange={(e) => setStaffForm((f) => ({ ...f, password: e.target.value }))}
                    />
                    <button type="submit" className="auth-submit">
                      {t("admin.staff.create")}
                    </button>
                    {staffMsg === "OK" && (
                      <p className="font-body-sm text-primary">{t("admin.staff.create")} ✓</p>
                    )}
                  </form>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function KpiRow() {
  const { t } = useLocale();
  return (
    <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
      <div className="space-y-4 border border-outline-variant p-stack-md">
        <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">{t("admin.kpi.revenue")}</p>
        <p className="font-display-md text-[clamp(2rem,8vw,3rem)] text-primary md:text-display-md">$12,492.00</p>
        <div className="flex items-center gap-2 text-on-primary-container">
          <span className="material-symbols-outlined text-sm">trending_up</span>
          <span className="text-xs font-bold tracking-tighter uppercase">{t("admin.kpi.vsYesterday")}</span>
        </div>
      </div>
      <div className="space-y-4 border border-outline-variant p-stack-md">
        <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">{t("admin.kpi.onSite")}</p>
        <p className="font-display-md text-[clamp(2rem,8vw,3rem)] text-primary md:text-display-md">42</p>
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-sm">people</span>
          <span className="text-xs font-bold tracking-tighter uppercase">{t("admin.kpi.capacity")}</span>
        </div>
      </div>
      <div className="space-y-4 border border-outline-variant bg-primary p-stack-md text-on-primary">
        <p className="font-label-sm text-label-sm tracking-widest text-on-primary/60 uppercase">{t("admin.kpi.growth")}</p>
        <p className="font-display-md text-[clamp(2rem,8vw,3rem)] md:text-display-md">+12</p>
        <div className="flex items-center gap-2 text-on-primary/60">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            loyalty
          </span>
          <span className="text-xs font-bold tracking-tighter uppercase">{t("admin.kpi.newMembers")}</span>
        </div>
      </div>
    </section>
  );
}

function ScheduleBookingsTable({ bookings }: { bookings: OverviewBooking[] }) {
  const { t } = useLocale();
  const rows = useMemo(
  () => [...bookings].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [bookings],
  );

  return (
    <section className="mt-stack-md space-y-stack-sm">
      <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
        {t("admin.schedule.bookingsHeading")}
      </h2>
      {rows.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">{t("admin.schedule.emptyBookings")}</p>
      ) : (
        <div className="overflow-hidden border border-outline-variant bg-surface-container-lowest">
          <div className="admin-table-scroll overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left">
              <thead className="bg-primary font-headline-sm text-headline-sm text-on-primary uppercase">
                <tr>
                  <th className="px-4 py-3 text-[13px] tracking-widest">{t("admin.table.id")}</th>
                  <th className="px-4 py-3 text-[13px] tracking-widest">{t("admin.schedule.colDate")}</th>
                  <th className="px-4 py-3 text-[13px] tracking-widest">{t("admin.schedule.colTime")}</th>
                  <th className="px-4 py-3 text-[13px] tracking-widest">{t("admin.schedule.colCourt")}</th>
                  <th className="px-4 py-3 text-[13px] tracking-widest">{t("admin.schedule.colGuest")}</th>
                  <th className="px-4 py-3 text-[13px] tracking-widest">{t("admin.schedule.colPayment")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 font-body-md text-body-md">
                {rows.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low">
                    <td className="px-4 py-4 font-mono text-sm uppercase">{b.id}</td>
                    <td className="px-4 py-4">{b.date}</td>
                    <td className="px-4 py-4 font-mono">{b.time}</td>
                    <td className="px-4 py-4">
                      {t("admin.court")} {b.courtId}
                    </td>
                    <td className="px-4 py-4 font-medium text-primary">{b.guestLabel}</td>
                    <td className="px-4 py-4 text-on-surface-variant">{b.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function CourtsBlock({
  title,
  courts,
  activeCount,
  onToggle,
}: {
  title: string;
  courts: Court[];
  activeCount: number;
  onToggle: (id: number) => void;
}) {
  const { t } = useLocale();

  const statusLabel = (status: Court["status"]) => {
    if (status === "Active") return t("admin.status.active");
    if (status === "Maintenance") return t("admin.status.maintenance");
    return t("admin.status.available");
  };

  return (
    <section className="space-y-stack-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
          {title}
        </h2>
        <span className="font-label-sm text-label-sm text-outline uppercase">
          {t("admin.liveStatus", { active: activeCount })}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-stack-sm min-[400px]:grid-cols-2 min-[400px]:gap-gutter lg:grid-cols-4">
        {courts.map((court) => (
          <div
            key={court.id}
            className={`space-y-4 border border-outline-variant p-stack-sm ${
              court.maint ? "bg-surface-container-high opacity-70" : "bg-surface-container-lowest"
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="font-headline-sm text-headline-sm text-primary">
                {t("admin.court")} {court.id}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold tracking-tighter uppercase ${
                    court.status === "Active"
                      ? "text-on-primary-container"
                      : court.status === "Maintenance"
                        ? "text-error"
                        : "text-outline"
                  }`}
                >
                  {statusLabel(court.status)}
                </span>
                <div
                  className={`h-2 w-2 rounded-full ${
                    court.status === "Active"
                      ? "bg-on-primary-container"
                      : court.status === "Maintenance"
                        ? "bg-error"
                        : "bg-outline"
                  }`}
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-label-sm text-label-sm text-outline uppercase">{t("admin.reservedBy")}</p>
              <p className="font-body-md text-body-md font-medium text-primary">{court.player}</p>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-2">
              <div className="flex items-center gap-1 text-outline">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="font-mono text-[12px]">{court.time}</span>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={court.maint}
                  onChange={() => onToggle(court.id)}
                  className="peer sr-only"
                />
                <div className="peer h-4 w-8 rounded-full bg-outline-variant after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MemberTable({ members, compact = false }: { members: Member[]; compact?: boolean }) {
  const { t } = useLocale();
  return (
    <div className="overflow-hidden border border-outline-variant bg-surface-container-lowest">
      <div className="admin-table-scroll overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left">
          <thead className="bg-primary font-headline-sm text-headline-sm text-on-primary uppercase">
            <tr>
              <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">{t("admin.table.id")}</th>
              <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">{t("admin.table.name")}</th>
              <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">{t("admin.table.tier")}</th>
              <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">{t("admin.table.balance")}</th>
              <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">{t("admin.table.lastActive")}</th>
              {!compact && (
                <th className="px-6 py-4 text-right font-headline-sm text-[14px] tracking-widest">{t("admin.table.actions")}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 font-body-md text-body-md">
            {members.map((member) => (
              <tr key={member.id} className="group transition-colors hover:bg-surface-container-low">
                <td className="px-6 py-5 font-mono text-sm">{member.id}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold">
                      {initials(member.name)}
                    </div>
                    <span className="font-semibold text-primary">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    className={`inline-block bg-surface-container-high px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${member.color}`}
                  >
                    {member.tier}
                  </span>
                </td>
                <td className="px-6 py-5 font-mono font-semibold text-primary">{member.balance}</td>
                <td className="px-6 py-5 text-sm text-on-surface-variant italic">{member.last}</td>
                {!compact && (
                  <td className="space-x-2 px-6 py-5 text-right">
                    <button type="button" className="text-[10px] font-bold tracking-widest text-primary uppercase hover:underline">
                      {t("admin.topUp")}
                    </button>
                    <button type="button" className="text-[10px] font-bold tracking-widest text-outline uppercase transition-colors hover:text-primary">
                      {t("admin.edit")}
                    </button>
                    <button type="button" className="text-[10px] font-bold tracking-widest text-error uppercase opacity-30 transition-opacity hover:opacity-100">
                      {t("admin.suspend")}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
