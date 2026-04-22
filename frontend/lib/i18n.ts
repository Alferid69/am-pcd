import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enJSON from '../locales/en.json';
import amJSON from '../locales/am.json';

const resources = {
  en: { translation: enJSON },
  am: { translation: amJSON },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

export default i18n;
