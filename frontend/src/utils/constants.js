// ثوابت الواجهة الأمامية
import i18n from '../utils/i18n';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLUB_ADMIN: 'club_admin',
  DOCTOR: 'doctor',
  PHYSIOTHERAPIST: 'physiotherapist',
  COACH: 'coach',
  NURSE: 'nurse',
  NUTRITIONIST: 'nutritionist',
  MANAGER: 'manager',
  ANALYST: 'analyst',
};

export const PLAYER_STATUS_COLORS = {
  ready: { bg: 'bg-success-light', text: 'text-success', get label() { return i18n.t('جاهز'); } },
  injured: { bg: 'bg-danger-light', text: 'text-danger', get label() { return i18n.t('مصاب'); } },
  rehab: { bg: 'bg-info-light', text: 'text-info', get label() { return i18n.t('تأهيل'); } },
  suspended: { bg: 'bg-warning-light', text: 'text-warning', get label() { return i18n.t('موقوف'); } },
  unknown: { bg: 'bg-gray-100', text: 'text-gray-600', get label() { return i18n.t('غير محدد'); } },
};

export const SEVERITY_COLORS = {
  mild: { bg: 'bg-success-light', text: 'text-success', get label() { return i18n.t('بسيطة'); } },
  moderate: { bg: 'bg-warning-light', text: 'text-warning', get label() { return i18n.t('متوسطة'); } },
  severe: { bg: 'bg-orange-100', text: 'text-orange-700', get label() { return i18n.t('شديدة'); } },
  critical: { bg: 'bg-danger-light', text: 'text-danger', get label() { return i18n.t('حرجة'); } },
};

export const EQUIPMENT_STATUS_COLORS = {
  excellent: { bg: 'bg-success-light', text: 'text-success', get label() { return i18n.t('ممتاز'); } },
  good: { bg: 'bg-info-light', text: 'text-info', get label() { return i18n.t('جيد'); } },
  needs_maintenance: { bg: 'bg-warning-light', text: 'text-warning', get label() { return i18n.t('يحتاج صيانة'); } },
  out_of_service: { bg: 'bg-danger-light', text: 'text-danger', get label() { return i18n.t('خارج الخدمة'); } },
};

export const API_BASE_URL = '/api/v1';
