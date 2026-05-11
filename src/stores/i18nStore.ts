import { create } from "zustand";

type Locale = "de" | "en";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const STORAGE_KEY = "homyhomegrow-locale";

function getStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" ? "en" : "de";
  } catch {
    return "de";
  }
}

export const useI18n = create<I18nState>((set) => ({
  locale: getStoredLocale(),
  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    set({ locale });
  },
}));

export function useLocale() {
  return useI18n((s) => s.locale);
}

/** Call this hook inside components to get the translate function.
 *  It reads locale reactively and re-renders on change.
 *  Usage: const t = useT(); const text = t("DE text", "EN text");
 */
export function useT() {
  const locale = useI18n((s) => s.locale);
  return (de: string, en: string) => (locale === "en" ? en : de);
}
