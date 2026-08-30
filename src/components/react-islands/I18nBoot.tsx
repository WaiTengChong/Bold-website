import { useEffect } from "react";
import { applyDomI18n, getLocale, subscribeLocale } from "@/lib/i18n";

/** Applies data-i18n attributes and html lang on load + locale change. */
export default function I18nBoot() {
  useEffect(() => {
    document.documentElement.lang = getLocale() === "zh" ? "zh-Hant" : "en";
    applyDomI18n();
    return subscribeLocale(() => applyDomI18n());
  }, []);

  return null;
}
