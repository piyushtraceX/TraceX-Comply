import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Initialize i18next
i18n
  // Load translations using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Namespaces
    ns: ['common'],
    defaultNS: 'common',
    
    // Detect language from URL or localStorage
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    
    react: {
      useSuspense: true,
    },
    
    // Backend configuration - where to load translations from
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
