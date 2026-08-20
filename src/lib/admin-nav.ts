import { withBase } from "@/lib/utils";

export const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "DASHBOARD", icon: "dashboard" },
  { id: "schedule", label: "SCHEDULE", icon: "calendar_today" },
  { id: "members", label: "MEMBERS", icon: "groups" },
  { id: "inventory", label: "INVENTORY", icon: "storefront" },
  { id: "settings", label: "SETTINGS", icon: "settings" },
] as const;

export type ViewId = (typeof ADMIN_NAV_ITEMS)[number]["id"];

export const ADMIN_TITLES: Record<ViewId, string> = {
  dashboard: "DASHBOARD",
  schedule: "SCHEDULE",
  members: "MEMBERS",
  inventory: "INVENTORY",
  settings: "SETTINGS",
};

export function adminHref(id: ViewId) {
  return withBase(id === "dashboard" ? "/admin" : `/admin/${id}`);
}

export function viewFromPath(pathname: string): ViewId {
  const path = pathname.replace(/\/+$/, "");
  for (const item of ADMIN_NAV_ITEMS) {
    if (item.id === "dashboard") continue;
    if (path.endsWith(`/admin/${item.id}`)) return item.id;
  }
  return "dashboard";
}

export function samePath(a: string, b: string) {
  return a.replace(/\/+$/, "") === b.replace(/\/+$/, "");
}
