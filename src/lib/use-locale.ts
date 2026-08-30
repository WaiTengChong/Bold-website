import { useCallback, useEffect, useState } from "react";
import {
  getLocale,
  setLocale as persistLocale,
  subscribeLocale,
  t as translate,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());

  useEffect(() => subscribeLocale(setLocaleState), []);

  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
  }, []);

  const t = useCallback((key: MessageKey, vars?: Record<string, string | number>) => translate(key, locale, vars), [locale]);

  return { locale, setLocale, t };
}
