'use client';

/**
 * @fileOverview High-Performance Localization Context Provider for Varban Workspace.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocaleCode, DICTIONARY } from './i18n-dictionary';

interface i18nContextType {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (path: string) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date) => string;
}

const i18nContext = createContext<i18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>('en');

  useEffect(() => {
    const saved = localStorage.getItem('varban_workspace_locale') as LocaleCode;
    if (saved && DICTIONARY[saved]) {
      setLocaleState(saved);
    } else if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.slice(0, 2);
      if (browserLang === 'fr' || browserLang === 'es' || browserLang === 'pt') {
        setLocaleState(browserLang as LocaleCode);
      } else if (navigator.language.startsWith('zh')) {
        setLocaleState('zh-CN');
      }
    }
  }, []);

  const setLocale = (code: LocaleCode) => {
    if (DICTIONARY[code]) {
      setLocaleState(code);
      localStorage.setItem('varban_workspace_locale', code);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = code;
      }
    }
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = DICTIONARY[locale] || DICTIONARY['en'];
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback check
        let fallback: any = DICTIONARY['en'];
        for (const fallbackKey of keys) {
          if (fallback && fallback[fallbackKey] !== undefined) {
            fallback = fallback[fallbackKey];
          } else {
            return path;
          }
        }
        return fallback;
      }
    }
    return typeof current === 'string' ? current : path;
  };

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    const formatLocale = locale === 'zh-CN' ? 'zh-CN' : locale;
    return new Intl.NumberFormat(formatLocale, options).format(value);
  };

  const formatDate = (date: Date) => {
    const formatLocale = locale === 'zh-CN' ? 'zh-CN' : locale;
    return new Intl.DateTimeFormat(formatLocale, {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(date);
  };

  return (
    <i18nContext.Provider value={{ locale, setLocale, t, formatNumber, formatDate }}>
      {children}
    </i18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(i18nContext);
  if (!context) {
    throw new Error('useTranslation must be loaded within an I18nProvider structure.');
  }
  return context;
}
