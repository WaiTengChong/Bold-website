import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Prefix app-root paths with Astro's configured base (GitHub Pages). */
export function withBase(path: string): string {
  if (!path || path === "#" || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/`;

  if (path.startsWith("#")) return path;
  if (path.startsWith("/#")) return `${base}${path.slice(1)}`;
  if (path === "/") return base;

  const normalized = path.replace(/^\//, "");
  const resolved = `${base}${normalized}`;
  // ponytail: GitHub Pages needs trailing slash to serve directory index.html
  if (!normalized.includes(".") && !resolved.endsWith("/")) {
    return `${resolved}/`;
  }
  return resolved;
}
