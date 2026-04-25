export const translations = {
  ar: {
    language: 'العربية',
    switchToEn: 'English',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
  },
  en: {
    language: 'English',
    switchToEn: 'العربية',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
  },
};

export const getLabel = (key) => {
  const stored = localStorage.getItem('smis-locale') || 'ar';
  return translations[stored]?.[key] || translations.ar[key] || key;
};