import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import i18n from '../utils/i18n';

const getLocale = () => localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar';

dayjs.locale(getLocale());

/**
 * تنسيق التاريخ
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return dayjs(date).locale(getLocale()).format('DD MMMM YYYY');
};

export const formatDateShort = (date) => {
  if (!date) return '—';
  return dayjs(date).locale(getLocale()).format('DD/MM/YYYY');
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return dayjs(date).locale(getLocale()).format('DD MMMM YYYY - HH:mm');
};

export const formatTime = (date) => {
  if (!date) return '—';
  if (typeof date === 'string' && date.includes(':')) {
    return date.substring(0, 5);
  }
  return dayjs(date).locale(getLocale()).format('HH:mm');
};

/**
 * الوقت النسبي
 */
export const timeAgo = (date) => {
  if (!date) return '—';
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  const isEn = getLocale() === 'en';

  if (diffMinutes < 1) return isEn ? 'Just now' : 'الآن';
  if (diffMinutes < 60) return isEn ? `${diffMinutes}m ago` : `منذ ${diffMinutes} دقيقة`;
  if (diffHours < 24) return isEn ? `${diffHours}h ago` : `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return isEn ? `${diffDays}d ago` : `منذ ${diffDays} يوم`;
  return formatDateShort(date);
};

/**
 * تنسيق الأرقام
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '—';
  const locale = getLocale() === 'en' ? 'en-US' : 'ar-EG';
  return new Intl.NumberFormat(locale).format(num);
};

export const formatPercent = (num) => {
  if (num === null || num === undefined) return '—';
  return `${Math.round(num)}%`;
};

export const formatCurrency = (amount, currency = 'SAR') => {
  if (amount === null || amount === undefined) return '—';
  const locale = getLocale() === 'en' ? 'en-US' : 'ar-SA';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * تسمية الأدوار
 */
export const getRoleLabel = (role) => {
  const labels = {
    super_admin: i18n.t('مدير النظام'),
    club_admin: i18n.t('مدير النادي'),
    doctor: i18n.t('طبيب'),
    physiotherapist: i18n.t('أخصائي علاج طبيعي'),
    coach: i18n.t('مدرب'),
    nurse: i18n.t('ممرض'),
    nutritionist: i18n.t('أخصائي تغذية'),
    manager: i18n.t('مدير'),
    analyst: i18n.t('محلل'),
  };
  return labels[role] || role;
};

export const roleLabels = {
  super_admin: 'مدير النظام',
  club_admin: 'مدير النادي',
  doctor: 'طبيب',
  physiotherapist: 'أخصائي علاج طبيعي',
  coach: 'مدرب',
  nurse: 'ممرض',
  nutritionist: 'أخصائي تغذية',
  manager: 'مدير',
  analyst: 'محلل',
};
