import type { Session } from "@/lib/auth-client";
import { ADMIN_NAV_ITEMS, adminHref, type ViewId } from "@/lib/admin-nav";

type Props = {
  view: ViewId;
  open: boolean;
  session: Session | null;
  onClose: () => void;
  onNavigate: (id: ViewId) => void;
  onLogout: () => void;
};

export default function AdminSidebar({ view, open, session, onClose, onNavigate, onLogout }: Props) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 left-[min(20rem,88vw)] z-[55] bg-primary/40 md:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-[70] flex h-full w-[min(20rem,88vw)] flex-col border-r border-outline-variant bg-primary p-stack-md pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl transition-transform duration-200 pointer-events-auto dark:bg-primary md:w-80 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-stack-lg flex items-start justify-between gap-3">
          <div>
            <span className="font-headline-lg text-headline-lg block uppercase tracking-widest text-primary dark:text-on-primary">
              BOLD
            </span>
            <span className="font-label-sm text-label-sm tracking-[0.2em] text-on-primary/60">ADMIN CONSOLE</span>
          </div>
          <button type="button" className="text-on-primary md:hidden" aria-label="Close menu" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = view === item.id;
            return (
              <a
                key={item.id}
                href={adminHref(item.id)}
                className={
                  active
                    ? "flex w-full translate-x-1 items-center gap-4 rounded-none bg-primary-container px-4 py-3 text-left font-bold text-on-primary-container transition-all"
                    : "flex w-full items-center gap-4 px-4 py-3 text-left text-on-primary/70 transition-all hover:bg-surface-container-low/10 hover:text-on-primary"
                }
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onNavigate(item.id);
                }}
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
              <p className="text-[10px] text-on-primary/40">
                +{session?.dialCode} {session?.phone}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 font-label-sm text-label-sm tracking-widest text-on-primary/60 uppercase hover:text-on-primary"
            onClick={onLogout}
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
