/**
 * i18n Configuration
 *
 * Configures i18next with:
 * - HTTP Backend for loading translations from /locales
 * - Browser language detection
 * - React integration
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Language info interface
interface LanguageInfo {
  nativeName: string;
  flag: string;
}

// Supported languages
export const LANGUAGES: Record<string, LanguageInfo> = {
  es: { nativeName: 'Español', flag: '🇪🇸' },
  en: { nativeName: 'English', flag: '🇺🇸' },
  pt: { nativeName: 'Português', flag: '🇧🇷' },
};

export const DEFAULT_LANGUAGE = 'es';

i18n
  // Load translations from /public/locales
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass i18n to react-i18next
  .use(initReactI18next)
  // Initialize
  .init({
    // Default language
    fallbackLng: DEFAULT_LANGUAGE,

    // Supported languages
    supportedLngs: Object.keys(LANGUAGES),

    // Debug mode (development only)
    debug: import.meta.env.DEV,

    // Namespace configuration
    ns: ['common', 'auth', 'churches', 'events', 'sermons', 'admin', 'errors'],
    defaultNS: 'common',

    // Backend configuration
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Language detection configuration
    detection: {
      // Order of detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Cache user language in localStorage
      caches: ['localStorage'],
      // Key to store language in localStorage
      lookupLocalStorage: 'ceslar-language',
    },

    // React configuration
    react: {
      useSuspense: true,
    },

    // Interpolation
    interpolation: {
      // React already escapes values
      escapeValue: false,
      // Date/number formatting
      format: (value: unknown, format: string | undefined, lng: string | undefined): string => {
        if (format === 'date' && value instanceof Date) {
          return new Intl.DateTimeFormat(lng).format(value);
        }
        if (format === 'number' && typeof value === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        return String(value);
      },
    },

    // Missing key handling
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lng: readonly string[], ns: string, key: string) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation: ${lng}/${ns}/${key}`);
      }
    },
  });

export default i18n;
