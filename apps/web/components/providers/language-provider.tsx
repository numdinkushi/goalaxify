"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LANGUAGE,
  type LanguageCode,
} from "@/lib/i18n/language-constants";
import {
  getInitialLanguage,
  saveLanguageToStorage,
} from "@/lib/i18n/language-utils";
import { getTranslationService } from "@/lib/i18n/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const initialLanguage = getInitialLanguage();
    setLanguageState(initialLanguage);
    getTranslationService().setLanguage(initialLanguage);
    document.documentElement.lang = initialLanguage;
    if (typeof window !== "undefined") {
      localStorage.removeItem("goalaxify-voice-dialect");
    }
  }, []);

  const setLanguage = useCallback((newLanguage: LanguageCode) => {
    setLanguageState(newLanguage);
    saveLanguageToStorage(newLanguage);
    getTranslationService().setLanguage(newLanguage);
    document.documentElement.lang = newLanguage;
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
