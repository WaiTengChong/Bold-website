import { useEffect, useMemo, useState } from "react";
import { ensureAdminSeed, getSession, isAdmin, logout } from "@/lib/auth-client";
import { withBase } from "@/lib/utils";

type Court = {
  id: number;
  status: "Active" | "Maintenance" | "Available";
  player: string;
  time: string;
  maint: boolean;
};

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

const NAV_ITEMS = [
  { id: "dashboard", label: "DASHBOARD", icon: "dashboard" },
  { id: "schedule", label: "SCHEDULE", icon: "calendar_today" },
  { id: "members", label: "MEMBERS", icon: "groups" },
  { id: "inventory", label: "INVENTORY", icon: "storefront" },
  { id: "settings", label: "SETTINGS", icon: "settings" },
] as const;

export type ViewId = (typeof NAV_ITEMS)[number]["id"];

function navHref(id: ViewId) {
  return withBase(id === "dashboard" ? "/admin" : `/admin/${id}`);
}

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

export default function AdminDashboard({ view = "dashboard" }: { view?: ViewId }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [courts, setCourts] = useState(INITIAL_COURTS);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [query, setQuery] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    ensureAdminSeed();
    if (!isAdmin()) {
      window.location.replace(withBase("/login"));
      return;
    }
    setAllowed(true);
    setReady(true);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.tier.toLowerCase().includes(q),
    );
  }, [members, query]);

  const activeCount = courts.filter((c) => c.status === "Active").length;

  const toggleMaint = (id: number) => {
    setCourts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const maint = !c.maint;
        return {
          ...c,
          maint,
          status: maint ? "Maintenance" : c.player === "-" ? "Available" : "Active",
        };
      }),
    );
  };

  const handleLogout = () => {
    logout();
    window.location.href = withBase("/login");
  };

  const titles: Record<ViewId, string> = {
    dashboard: "DASHBOARD",
    schedule: "SCHEDULE",
    members: "MEMBERS",
    inventory: "INVENTORY",
    settings: "SETTINGS",
  };

  if (!ready || !allowed) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-on-surface-variant">
        <p className="font-label-md text-label-md uppercase tracking-widest">Checking access…</p>
      </div>
    );
  }

  const session = getSession();

  return (
    <div className="admin-console light flex h-dvh max-w-full overflow-hidden bg-surface text-on-surface">
      {navOpen && (
        <button
          type="button"
          className="fixed inset-0 left-[min(20rem,88vw)] z-[55] bg-primary/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setNavOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-[70] flex h-full w-[min(20rem,88vw)] flex-col border-r border-outline-variant bg-primary p-stack-md pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl transition-transform duration-200 pointer-events-auto dark:bg-primary md:w-80 md:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-stack-lg flex items-start justify-between gap-3">
          <div>
            <span className="font-headline-lg text-headline-lg block uppercase tracking-widest text-primary dark:text-on-primary">
              BOLD
            </span>
            <span className="font-label-sm text-label-sm tracking-[0.2em] text-on-primary/60">ADMIN CONSOLE</span>
          </div>
          <button
            type="button"
            className="text-on-primary md:hidden"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const active = view === item.id;
            return (
              <a
                key={item.id}
                href={navHref(item.id)}
                className={
                  active
                    ? "flex w-full translate-x-1 items-center gap-4 rounded-none bg-primary-container px-4 py-3 text-left font-bold text-on-primary-container transition-all"
                    : "flex w-full items-center gap-4 px-4 py-3 text-left text-on-primary/70 transition-all hover:bg-surface-container-low/10 hover:text-on-primary"
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="font-headline-sm text-headline-sm uppercase">{item.label}</span>
              </a>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-on-primary/10 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-on-primary-container font-bold text-primary">
              JD
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-primary">John Doe</p>
              <p className="text-[10px] tracking-wider text-on-primary/50 uppercase">Facility Manager</p>
              <p className="text-[10px] text-on-primary/40">+{session?.dialCode} {session?.phone}</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 font-label-sm text-label-sm tracking-widest text-on-primary/60 uppercase hover:text-on-primary"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </aside>

      <main id="admin-main" className="custom-scrollbar min-w-0 flex-1 overflow-x-hidden overflow-y-auto md:ml-80">
        <header className="docked full-width sticky top-0 z-50 flex w-full items-center justify-between gap-2 border-b border-outline-variant/30 bg-surface/90 px-margin-mobile py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl md:px-margin-desktop md:py-4 dark:bg-primary/90">
          <div className="flex min-w-0 items-center gap-2 md:gap-4">
            <button
              type="button"
              className="shrink-0 text-primary md:pointer-events-none"
              aria-expanded={navOpen}
              aria-label="Open menu"
              onClick={() => setNavOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile truncate text-primary uppercase md:font-headline-lg md:text-headline-lg">
              {titles[view]}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-gutter">
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
              QUICK BOOK
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-container-max space-y-stack-md px-margin-mobile py-stack-md md:px-margin-desktop">
          {(view === "dashboard" || view === "schedule") && (
          <section className="space-y-stack-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
                {view === "schedule" ? "TODAY'S COURT SCHEDULE" : "COURT OCCUPANCY"}
              </h2>
              <span className="font-label-sm text-label-sm text-outline uppercase">
                Live Status: {activeCount}/8 Courts Active
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
                    <span className="font-headline-sm text-headline-sm text-primary">COURT {court.id}</span>
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
                        {court.status}
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
                    <p className="font-label-sm text-label-sm text-outline uppercase">Reserved by</p>
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
                        onChange={() => toggleMaint(court.id)}
                        className="peer sr-only"
                      />
                      <div className="peer h-4 w-8 rounded-full bg-outline-variant after:absolute after:top-[2px] after:left-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
          )}

          {(view === "dashboard" || view === "members") && (
          <section className="space-y-stack-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
                MEMBER MANAGEMENT
              </h2>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <input
                    className="w-full border-b border-primary bg-transparent py-2 pr-4 pl-8 font-label-md text-label-md uppercase outline-none focus:border-primary-container focus:ring-0 sm:w-64"
                    placeholder="SEARCH MEMBERS..."
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
                  EXPORT LIST
                </button>
              </div>
            </div>
            <div className="overflow-hidden border border-outline-variant bg-surface-container-lowest">
              <div className="admin-table-scroll overflow-x-auto">
                <table className="w-full min-w-[40rem] text-left">
                  <thead className="bg-primary font-headline-sm text-headline-sm text-on-primary uppercase">
                    <tr>
                      <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">ID</th>
                      <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">NAME</th>
                      <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">VIP TIER</th>
                      <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">BALANCE</th>
                      <th className="px-6 py-4 font-headline-sm text-[14px] tracking-widest">LAST ACTIVE</th>
                      <th className="px-6 py-4 text-right font-headline-sm text-[14px] tracking-widest">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 font-body-md text-body-md">
                    {filtered.map((member) => (
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
                        <td className="space-x-2 px-6 py-5 text-right">
                          <button type="button" className="text-[10px] font-bold tracking-widest text-primary uppercase hover:underline">
                            TOP UP
                          </button>
                          <button type="button" className="text-[10px] font-bold tracking-widest text-outline uppercase transition-colors hover:text-primary">
                            EDIT
                          </button>
                          <button type="button" className="text-[10px] font-bold tracking-widest text-error uppercase opacity-30 transition-opacity hover:opacity-100">
                            SUSPEND
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          )}

          {view === "dashboard" && (
          <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
            <div className="space-y-4 border border-outline-variant p-stack-md">
              <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">TOTAL DAILY REVENUE</p>
              <p className="font-display-md text-[clamp(2rem,8vw,3rem)] text-primary md:text-display-md">$12,492.00</p>
              <div className="flex items-center gap-2 text-on-primary-container">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span className="text-xs font-bold tracking-tighter uppercase">+18.5% VS YESTERDAY</span>
              </div>
            </div>
            <div className="space-y-4 border border-outline-variant p-stack-md">
              <p className="font-label-sm text-label-sm tracking-widest text-outline uppercase">MEMBERS ON-SITE</p>
              <p className="font-display-md text-[clamp(2rem,8vw,3rem)] text-primary md:text-display-md">42</p>
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-sm">people</span>
                <span className="text-xs font-bold tracking-tighter uppercase">85% CAPACITY</span>
              </div>
            </div>
            <div className="space-y-4 border border-outline-variant bg-primary p-stack-md text-on-primary">
              <p className="font-label-sm text-label-sm tracking-widest text-on-primary/60 uppercase">MEMBERSHIP GROWTH</p>
              <p className="font-display-md text-[clamp(2rem,8vw,3rem)] md:text-display-md">+12</p>
              <div className="flex items-center gap-2 text-on-primary/60">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  loyalty
                </span>
                <span className="text-xs font-bold tracking-tighter uppercase">NEW MEMBERS THIS WEEK</span>
              </div>
            </div>
          </section>
          )}

          {view === "inventory" && (
            <section className="space-y-stack-sm">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase md:font-headline-lg md:text-headline-lg">
                PRO SHOP INVENTORY
              </h2>
              <div className="overflow-hidden border border-outline-variant bg-surface-container-lowest">
                <div className="admin-table-scroll overflow-x-auto">
                  <table className="w-full min-w-[28rem] text-left">
                    <thead className="bg-primary font-headline-sm text-headline-sm text-on-primary uppercase">
                      <tr>
                        <th className="px-6 py-4 text-[14px] tracking-widest">SKU</th>
                        <th className="px-6 py-4 text-[14px] tracking-widest">ITEM</th>
                        <th className="px-6 py-4 text-[14px] tracking-widest">STOCK</th>
                        <th className="px-6 py-4 text-[14px] tracking-widest">STATUS</th>
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
                              {row.status}
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
                FACILITY SETTINGS
              </h2>
              <div className="space-y-4 border border-outline-variant bg-surface-container-lowest p-stack-md">
                <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                  <div>
                    <p className="font-label-md text-label-md text-primary uppercase">Guest booking</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">Allow non-members to reserve courts</p>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline uppercase">Off</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
                  <div>
                    <p className="font-label-md text-label-md text-primary uppercase">SMS reminders</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">Send booking reminders 2 hours before play</p>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-primary-container uppercase">On</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-label-md text-label-md text-primary uppercase">Opening hours</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">06:00 – 23:00 daily</p>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline uppercase">Edit</span>
                </div>
              </div>
            </section>
          )}
        </div>

        <footer className="full-width bottom-0 mt-stack-xl border-t border-on-primary-fixed-variant/20 bg-primary">
          <div className="mx-auto grid w-full max-w-container-max grid-cols-1 gap-gutter px-margin-mobile py-stack-lg md:grid-cols-4 md:px-margin-desktop">
            <div className="space-y-4 md:col-span-2">
              <span className="font-display-md text-headline-lg-mobile block text-on-primary uppercase md:text-display-md">
                BOLD PICKLEBALL
              </span>
              <p className="font-body-md text-body-md max-w-md text-on-primary/70">
                The elite standard in athletic competition and social membership. Access your dashboard for facility
                management, member insights, and operational excellence.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-headline-sm text-headline-sm text-on-primary uppercase">ADMIN LINKS</h4>
              <nav className="flex flex-col gap-2">
                <a className="font-body-md text-body-md text-on-primary/70 underline transition-all hover:text-on-primary" href="#">
                  Facility Settings
                </a>
                <a className="font-body-md text-body-md text-on-primary/70 underline transition-all hover:text-on-primary" href="#">
                  Support Portal
                </a>
                <a className="font-body-md text-body-md text-on-primary/70 underline transition-all hover:text-on-primary" href="#">
                  Staff Management
                </a>
              </nav>
            </div>
            <div className="space-y-4">
              <h4 className="font-headline-sm text-headline-sm text-on-primary uppercase">LEGAL</h4>
              <nav className="flex flex-col gap-2">
                <a className="font-body-md text-body-md text-on-primary/70 underline transition-all hover:text-on-primary" href="#">
                  Privacy Policy
                </a>
                <a className="font-body-md text-body-md text-on-primary/70 underline transition-all hover:text-on-primary" href="#">
                  Terms of Service
                </a>
              </nav>
            </div>
          </div>
          <div className="border-t border-on-primary/10 px-margin-mobile py-8 pb-[max(2rem,env(safe-area-inset-bottom))] md:px-margin-desktop">
            <p className="font-label-sm text-label-sm text-center tracking-[0.3em] text-on-primary/50 uppercase">
              © 2024 BOLD PICKLEBALL. ALL RIGHTS RESERVED.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
