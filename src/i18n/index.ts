import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import cs from './cs.json';
import en from './en.json';

export const supportedLngs = ['cs', 'en'] as const;
export type Lng = (typeof supportedLngs)[number];

i18n.use(initReactI18next).init({
  resources: {
    cs: { translation: cs },
    en: { translation: en },
  },
  lng: localStorage.getItem('lng') ?? 'cs',
  fallbackLng: 'cs',
  interpolation: { escapeValue: false },
});

export default i18n;
