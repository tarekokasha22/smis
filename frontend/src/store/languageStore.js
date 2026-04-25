import { create } from 'zustand';

const getInitialState = () => ({
  locale: localStorage.getItem('smis-locale') || 'ar',
  dir: localStorage.getItem('smis-dir') || 'rtl',
});

const useLanguageStore = create((set) => ({
  ...getInitialState(),

  setLanguage: (locale) => {
    const dir = locale === 'en' ? 'ltr' : 'rtl';
    localStorage.setItem('smis-locale', locale);
    localStorage.setItem('smis-dir', dir);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    set({ locale, dir });
    window.location.reload();
  },

  toggleLanguage: () => {
    const current = localStorage.getItem('smis-locale') || 'ar';
    const newLocale = current === 'ar' ? 'en' : 'ar';
    const newDir = newLocale === 'en' ? 'ltr' : 'rtl';
    localStorage.setItem('smis-locale', newLocale);
    localStorage.setItem('smis-dir', newDir);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newDir;
    set({ locale: newLocale, dir: newDir });
    window.location.reload();
  },
}));

export default useLanguageStore;