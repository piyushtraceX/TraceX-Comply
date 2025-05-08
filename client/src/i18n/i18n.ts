import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Initialize i18next
i18n
  // Load translations using http backend (Vite will handle this via @assets alias)
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: true, // Enable debug in development
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    // List of namespaces to load
    ns: ['common', 'auth'],
    defaultNS: 'common',
    backend: {
      // Path to load translations from
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'no-store'
      }
    },
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator'],
      // Cache language selection in localStorage
      caches: ['localStorage'],
    },
  });

export default i18n;