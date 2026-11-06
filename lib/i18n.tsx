'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { messages, type Lang, type MessageKey } from '@/lib/messages';

const STORAGE_KEY = 'ustra-lang';

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

type LanguageState = { lang: Lang; setLang: (lang: Lang) => void; t: Translate };

const LanguageContext = createContext<LanguageState | null>(null);

function readStoredLang(): Lang | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'en' || value === 'hi' ? value : null;
  } catch {
    // Storage can be blocked (private browsing). The page then just starts in English.
    return null;
  }
}

/** Holds the page language. Starts in English, then switches to the visitor's last choice after load. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = readStoredLang();
    if (stored) setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still applies for this page visit.
    }
  }, []);

  const value = useMemo<LanguageState>(() => {
    const t: Translate = (key, params) => {
      let text = messages[lang][key] ?? messages.en[key];
      if (params) {
        for (const [name, replacement] of Object.entries(params)) {
          text = text.replace(`{${name}}`, String(replacement));
        }
      }
      return text;
    };
    return { lang, setLang, t };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageState {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider');
  return value;
}
