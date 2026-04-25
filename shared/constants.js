// shared/constants.js
// ثوابت مشتركة بين الواجهة الخلفية والأمامية

const ROLES = {
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

const PLAYER_STATUS = {
  READY: 'ready',
  INJURED: 'injured',
  REHAB: 'rehab',
  SUSPENDED: 'suspended',
  UNKNOWN: 'unknown',
};

const PLAYER_STATUS_LABELS = {
  ready: 'جاهز',
  injured: 'مصاب',
  rehab: 'تأهيل',
  suspended: 'موقوف',
  unknown: 'غير محدد',
};

const INJURY_SEVERITY = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe',
  CRITICAL: 'critical',
};

const INJURY_SEVERITY_LABELS = {
  mild: 'بسيطة',
  moderate: 'متوسطة',
  severe: 'شديدة',
  critical: 'حرجة',
};

const INJURY_STATUS = {
  ACTIVE: 'active',
  RECOVERING: 'recovering',
  CLOSED: 'closed',
};

const INJURY_STATUS_LABELS = {
  active: 'نشطة',
  recovering: 'في التعافي',
  closed: 'مغلقة',
};

const BODY_SIDE = {
  LEFT: 'left',
  RIGHT: 'right',
  BOTH: 'both',
};

const BODY_SIDE_LABELS = {
  left: 'يسار',
  right: 'يمين',
  both: 'كلاهما',
};

const MECHANISM = {
  COLLISION: 'collision',
  OVERUSE: 'overuse',
  FATIGUE: 'fatigue',
  UNKNOWN: 'unknown',
};

const OCCURRED_DURING = {
  MATCH: 'match',
  TRAINING: 'training',
  OTHER: 'other',
};

const EQUIPMENT_STATUS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  NEEDS_MAINTENANCE: 'needs_maintenance',
  OUT_OF_SERVICE: 'out_of_service',
};

const EQUIPMENT_STATUS_LABELS = {
  excellent: 'ممتاز',
  good: 'جيد',
  needs_maintenance: 'يحتاج صيانة',
  out_of_service: 'خارج الخدمة',
};

const MAINTENANCE_TYPE = {
  ROUTINE: 'routine',
  REPAIR: 'repair',
  CALIBRATION: 'calibration',
  INSPECTION: 'inspection',
};

const SUPPLY_CATEGORY = {
  MEDICATION: 'medication',
  TOPICAL: 'topical',
  SUPPLEMENT: 'supplement',
  CONSUMABLE: 'consumable',
  EQUIPMENT_CONSUMABLE: 'equipment_consumable',
};

const SUPPLY_CATEGORY_LABELS = {
  medication: 'أدوية',
  topical: 'مستحضرات موضعية',
  supplement: 'مكملات غذائية',
  consumable: 'مستهلكات',
  equipment_consumable: 'مستهلكات أجهزة',
};

const TRANSACTION_TYPE = {
  DISPENSE: 'dispense',
  RESTOCK: 'restock',
  ADJUSTMENT: 'adjustment',
  EXPIRED_DISPOSAL: 'expired_disposal',
};

const APPOINTMENT_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  RESCHEDULED: 'rescheduled',
};

const APPOINTMENT_STATUS_LABELS = {
  scheduled: 'مجدول',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  no_show: 'لم يحضر',
  rescheduled: 'أعيد جدولته',
};

const REHAB_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
};

const ATTENDANCE = {
  ATTENDED: 'attended',
  MISSED: 'missed',
  CANCELLED: 'cancelled',
};

const FILE_TYPE = {
  XRAY: 'xray',
  MRI: 'mri',
  SCAN: 'scan',
  REPORT: 'report',
  CONTRACT: 'contract',
  LAB: 'lab',
  OTHER: 'other',
};

const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

const NOTIFICATION_TYPES = {
  INJURY_NEW: 'injury_new',
  INJURY_RECOVERED: 'injury_recovered',
  REHAB_PHASE_CHANGE: 'rehab_phase_change',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  EQUIPMENT_MAINTENANCE: 'equipment_maintenance',
  SUPPLY_LOW: 'supply_low',
  SUPPLY_EXPIRY: 'supply_expiry',
  USER_ADDED: 'user_added',
};

const POSITIONS = [
  'حارس مرمى',
  'مدافع أيمن',
  'مدافع أيسر',
  'قلب دفاع',
  'ظهير أيمن',
  'ظهير أيسر',
  'وسط دفاعي',
  'وسط ميدان',
  'جناح أيمن',
  'جناح أيسر',
  'وسط هجومي',
  'مهاجم',
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DOMINANT_FOOT = {
  RIGHT: 'right',
  LEFT: 'left',
  BOTH: 'both',
};

const DOMINANT_FOOT_LABELS = {
  right: 'يمنى',
  left: 'يسرى',
  both: 'كلتيهما',
};

module.exports = {
  ROLES,
  PLAYER_STATUS,
  PLAYER_STATUS_LABELS,
  INJURY_SEVERITY,
  INJURY_SEVERITY_LABELS,
  INJURY_STATUS,
  INJURY_STATUS_LABELS,
  BODY_SIDE,
  BODY_SIDE_LABELS,
  MECHANISM,
  OCCURRED_DURING,
  EQUIPMENT_STATUS,
  EQUIPMENT_STATUS_LABELS,
  MAINTENANCE_TYPE,
  SUPPLY_CATEGORY,
  SUPPLY_CATEGORY_LABELS,
  TRANSACTION_TYPE,
  APPOINTMENT_STATUS,
  APPOINTMENT_STATUS_LABELS,
  REHAB_STATUS,
  ATTENDANCE,
  FILE_TYPE,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_TYPES,
  POSITIONS,
  BLOOD_TYPES,
  DOMINANT_FOOT,
  DOMINANT_FOOT_LABELS,
};
