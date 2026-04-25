import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Will be populated by our auto-generated JSONs
import translationEN from '../locales/en/translation.json';
import translationAR from '../locales/ar/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
};

const savedLocale = localStorage.getItem('smis-locale') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLocale,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
