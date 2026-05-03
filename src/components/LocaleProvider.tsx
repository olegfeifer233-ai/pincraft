"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { type UILocale, getStoredLocale, setStoredLocale } from "@/lib/i18n";

interface LocaleContextValue {
  locale: UILocale;
  setLocale: (l: UILocale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "de",
  setLocale: () => {},
});

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function getSnapshot(): UILocale {
  return getStoredLocale();
}

function getServerSnapshot(): UILocale {
  return "de";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <LocaleContext.Provider value={{ locale, setLocale: setStoredLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
