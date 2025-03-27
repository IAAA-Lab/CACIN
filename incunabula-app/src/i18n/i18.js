import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { es } from './es';

i18n.use(initReactI18next).init({
  interpolation: {
    escapeValue: false, // React already safes from xss
  },
  lng: window.location.pathname.includes('/es') ? 'es' : 'en', // Language detection based on URL path
  resources: {
    en: {
      translation: en,
    },
    es: {
      translation: es,
    },
  },
});

export default i18n;
