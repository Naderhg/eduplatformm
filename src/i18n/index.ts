import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ar: {
        translation: arTranslations
      }
    },
    lng: 'ar', // default language - Arabic is primary
    fallbackLng: 'ar',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      caches: ['localStorage'],
      convertDetectedLanguage: (lng: string) => lng
    }
  });

// Force Arabic as default on first visit (when no localStorage preference exists)
if (!localStorage.getItem('i18nextLng')) {
  i18n.changeLanguage('ar');
}

export default i18n;
