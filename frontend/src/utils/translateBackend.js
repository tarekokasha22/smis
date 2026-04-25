/**
 * Translates known Arabic strings that come from the backend API.
 * Used for dashboard alerts, activities, notifications, stats charts, filters, etc.
 */

const getLocale = () => localStorage.getItem('smis-locale') || 'ar';

// Body areas (injuries)
const BODY_AREA_MAP = {
  'الرأس': 'Head', 'الرقبة': 'Neck', 'الكتف': 'Shoulder', 'الذراع': 'Arm',
  'الكوع': 'Elbow', 'الرسغ': 'Wrist', 'اليد': 'Hand', 'الصدر': 'Chest',
  'الظهر': 'Back', 'الخصر': 'Lower Back', 'الحوض': 'Hip/Pelvis',
  'الفخذ': 'Thigh', 'الركبة': 'Knee', 'الساق': 'Leg', 'الكاحل': 'Ankle',
  'القدم': 'Foot', 'البطن': 'Abdomen', 'العضلة': 'Muscle',
};

// Injury severity
const SEVERITY_MAP = {
  'بسيطة': 'Minor', 'خفيفة': 'Mild', 'متوسطة': 'Moderate',
  'شديدة': 'Severe', 'حرجة': 'Critical',
};

// Injury conditions/occasions
const CONDITION_MAP = {
  'تدريب': 'Training', 'مباراة': 'Match', 'حرارة': 'Heat',
  'بدني': 'Physical', 'صدام': 'Contact',
};

// Injury mechanisms
const MECHANISM_MAP = {
  'تصادم': 'Collision', 'إجهاد': 'Overuse', 'التواء': 'Sprain',
  'شد عضلي': 'Muscle Strain', 'تمزق': 'Tear', 'كسر': 'Fracture',
  'خلع': 'Dislocation', 'غير معروف': 'Unknown', 'أخرى': 'Other',
  'إجهاد متكرر': 'Repetitive Strain', 'غير محدد': 'Unspecified',
  'إرهاق': 'Fatigue', 'إجهاد عضلي': 'Muscle Overuse',
};

// Injury types
const INJURY_TYPE_MAP = {
  'تمزق عضلي': 'Muscle Tear', 'التواء': 'Sprain', 'كدمة': 'Bruise',
  'كدمة عظمية': 'Bone Contusion', 'التهاب': 'Inflammation', 'كسر': 'Fracture',
  'خلع': 'Dislocation', 'تمزق رباط': 'Ligament Tear', 'إجهاد': 'Overuse',
};

// Performance metrics (radar chart axes)
const PERFORMANCE_METRIC_MAP = {
  'القوة': 'Strength', 'التحمل': 'Endurance', 'المرونة': 'Flexibility',
  'الرشاقة': 'Agility', 'سرعة الاستجابة': 'Reaction Speed',
  'ردة الفعل': 'Reaction', 'السرعة': 'Speed', 'الدقة': 'Accuracy',
  'التوازن': 'Balance', 'التنسيق': 'Coordination',
};

// Equipment status
const EQUIPMENT_STATUS_MAP = {
  'ممتاز': 'Excellent', 'جيد': 'Good', 'يحتاج صيانة': 'Needs Maintenance',
  'خارج الخدمة': 'Out of Service', 'معطل': 'Broken', 'صالح': 'Functional',
};

// Supply categories
const SUPPLY_CATEGORY_MAP = {
  'مستهلكات': 'Consumables', 'أدوية': 'Medicines', 'معدات': 'Equipment',
  'أجهزة': 'Devices', 'مستلزمات': 'Supplies', 'ضمادات': 'Bandages',
  'أخرى': 'Other',
};

// Appointment status labels
const APT_STATUS_LABEL_MAP = {
  'مجدول': 'Scheduled', 'مكتمل': 'Completed', 'ملغى': 'Cancelled',
  'لم يحضر': 'No-show', 'قيد الانتظار': 'Pending',
};

// Appointment type labels
const APT_TYPE_LABEL_MAP = {
  'فحص طبي': 'Medical Exam', 'متابعة': 'Follow-up',
  'علاج طبيعي': 'Physical Therapy', 'تقييم': 'Evaluation',
  'تغذية': 'Nutrition', 'أخرى': 'Other', 'عيادة': 'Clinic',
  'طارئ': 'Emergency', 'اختبار': 'Test', 'طبي': 'Medical',
};

// Exact-match title translations
const TITLE_MAP = {
  'صيانة جهاز مطلوبة': 'Device Maintenance Required',
  'مخزون منخفض': 'Low Stock',
  'انتهاء صلاحية قريب': 'Expiry Soon',
  'إصابة حرجة': 'Critical Injury',
  'إصابة جديدة مسجلة': 'New Injury Recorded',
  'برنامج تأهيل مكتمل': 'Rehabilitation Program Completed',
  'تحديث برنامج تأهيل': 'Rehabilitation Program Updated',
  'تقييم أداء جديد': 'New Performance Evaluation',
  'تعافٍ من الإصابة': 'Injury Recovery',
  'صرف مستلزم للاعب': 'Supply Dispensed to Player',
  'تسجيل مؤشرات حيوية': 'Vitals Recorded',
  'إضافة مواعيد': 'Appointment Scheduled',
  'موعد مجدول': 'Appointment Scheduled',
  'موعد مكتمل': 'Appointment Completed',
  'موعد ملغى': 'Appointment Cancelled',
  'موعد جديد': 'New Appointment',
  'مخزون نفد': 'Out of Stock',
  'صلاحية منتهية': 'Expired',
  'تسجيل صيانة معدة': 'Equipment Maintenance Recorded',
  'تسجيل صيانة': 'Maintenance Recorded',
  'تحديث إصابة': 'Injury Updated',
  'تحديث مؤشرات': 'Vitals Updated',
};

// File type translations
const FILE_TYPE_MAP = {
  'أشعة سينية': 'X-Ray',
  'رنين مغناطيسي': 'MRI',
  'فحوصات': 'Scans',
  'تقارير': 'Reports',
  'عقود': 'Contracts',
  'مختبر': 'Lab Results',
  'أخرى': 'Other',
};

// Appointment type translations
const APT_TYPE_MAP = {
  'فحص طبي': 'Medical Exam',
  'متابعة': 'Follow-up',
  'علاج طبيعي': 'Physical Therapy',
  'تقييم': 'Evaluation',
  'تغذية': 'Nutrition',
  'أخرى': 'Other',
  'checkup': 'Checkup',
  'followup': 'Follow-up',
  'physiotherapy': 'Physical Therapy',
  'evaluation': 'Evaluation',
  'nutrition': 'Nutrition',
  'other': 'Other',
};

// Pattern-based message translations
const MESSAGE_PATTERNS = [
  [/^جهاز "(.+)" خارج الخدمة$/, (_, name) => `Device "${name}" out of service`],
  [/^جهاز "(.+)" يحتاج صيانة عاجلة$/, (_, name) => `Device "${name}" needs urgent maintenance`],
  [/^(.+): (\d+) وحدة متبقية$/, (_, item, n) => `${item}: ${n} units remaining`],
  [/^(.+) تنتهي خلال (\d+) يوم$/, (_, item, n) => `${item} expires in ${n} day(s)`],
  [/^إصابة حرجة: (.+) - (.+)$/, (_, player, area) => `Critical injury: ${player} - ${area}`],
  [/^تم تسجيل إصابة "(.+)" للاعب (.+)$/, (_, type, player) => `Injury "${type}" recorded for player ${player}`],
  [/^تم صرف (\d+) من "(.+)" للاعب (.+)$/, (_, n, item, player) => `${n} of "${item}" dispensed to ${player}`],
  [/^تم تسجيل تعافي اللاعب (.+) من الإصابة$/, (_, player) => `Player ${player}'s recovery recorded`],
  [/^تم تسجيل تعافي اللاعب (.+)$/, (_, player) => `Player ${player}'s recovery recorded`],
  [/^(\d+) تنبيه نشط$/, (_, n) => `${n} active alert(s)`],
  [/^(\d+) موعد مجدول$/, (_, n) => `${n} scheduled appointment(s)`],
  [/^تم تحديد موعد "(.+)" للاعب (.+) بتاريخ (.+)$/, (_, type, player, date) => `Appointment "${type}" scheduled for player ${player} on ${date}`],
  [/^تم تسجيل صيانة للمعدة "(.+)"(.*)$/, (_, name, rest) => `Maintenance recorded for equipment "${name}"${rest}`],
  [/^تم تسجيل قياسات للاعب (.+)$/, (_, player) => `Measurements recorded for player ${player}`],
];

/**
 * Translate a backend-provided Arabic title string.
 */
export function translateTitle(text) {
  if (!text || getLocale() !== 'en') return text;
  return TITLE_MAP[text] || text;
}

/**
 * Translate a backend-provided Arabic message/body string (may contain dynamic data).
 */
export function translateMessage(text) {
  if (!text || getLocale() !== 'en') return text;
  // Try exact match first
  if (TITLE_MAP[text]) return TITLE_MAP[text];
  // Try pattern matching
  for (const [pattern, fn] of MESSAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return fn(...match);
  }
  return text;
}

/**
 * Translate a file type Arabic name from the backend.
 */
export function translateFileType(name) {
  if (!name || getLocale() !== 'en') return name;
  return FILE_TYPE_MAP[name] || name;
}

/**
 * Translate an appointment type.
 */
export function translateAptType(type) {
  if (!type || getLocale() !== 'en') return type;
  return APT_TYPE_MAP[type] || type;
}

/**
 * Translate a dynamic subtitle like "N تنبيه نشط" or "N موعد مجدول".
 */
export function translateSubtitle(text) {
  if (!text || getLocale() !== 'en') return text;
  if (TITLE_MAP[text]) return TITLE_MAP[text];
  for (const [pattern, fn] of MESSAGE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return fn(...match);
  }
  return text;
}

/** Translate a body area name from Arabic. */
export function translateBodyArea(name) {
  if (!name || getLocale() !== 'en') return name;
  return BODY_AREA_MAP[name] || name;
}

/** Translate an injury severity from Arabic. */
export function translateSeverity(name) {
  if (!name || getLocale() !== 'en') return name;
  return SEVERITY_MAP[name] || name;
}

/** Translate an injury condition/occasion from Arabic. */
export function translateCondition(name) {
  if (!name || getLocale() !== 'en') return name;
  return CONDITION_MAP[name] || name;
}

/** Translate an injury mechanism from Arabic. */
export function translateMechanism(name) {
  if (!name || getLocale() !== 'en') return name;
  return MECHANISM_MAP[name] || name;
}

/** Translate an injury type from Arabic. */
export function translateInjuryType(name) {
  if (!name || getLocale() !== 'en') return name;
  return INJURY_TYPE_MAP[name] || name;
}

/** Translate a performance metric name from Arabic. */
export function translatePerformanceMetric(name) {
  if (!name || getLocale() !== 'en') return name;
  return PERFORMANCE_METRIC_MAP[name] || name;
}

/** Translate an equipment status from Arabic. */
export function translateEquipmentStatus(name) {
  if (!name || getLocale() !== 'en') return name;
  return EQUIPMENT_STATUS_MAP[name] || name;
}

/** Translate a supply category label from Arabic. */
export function translateSupplyCategory(name) {
  if (!name || getLocale() !== 'en') return name;
  return SUPPLY_CATEGORY_MAP[name] || name;
}

// Player positions map
const POSITION_MAP = {
  'حارس مرمى': 'Goalkeeper', 'مدافع': 'Defender', 'مدافع أيمن': 'Right Back',
  'مدافع أيسر': 'Left Back', 'قلب دفاع': 'Center Back', 'وسط': 'Midfielder',
  'وسط دفاعي': 'Defensive Midfielder', 'وسط هجومي': 'Attacking Midfielder',
  'جناح أيمن': 'Right Winger', 'جناح أيسر': 'Left Winger',
  'مهاجم': 'Striker', 'مهاجم مركزي': 'Center Forward',
  'ظهير أيمن': 'Right Fullback', 'ظهير أيسر': 'Left Fullback',
  'وسط الملعب': 'Central Midfielder', 'جناح': 'Winger',
  'وسط أيمن': 'Right Midfielder', 'وسط أيسر': 'Left Midfielder',
  'مدافع وسط': 'Center-back',
};

/** Translate a player position from Arabic. */
export function translatePosition(name) {
  if (!name || getLocale() !== 'en') return name;
  return POSITION_MAP[name] || name;
}

/** Translate an appointment status label from Arabic. */
export function translateAptStatusLabel(label) {
  if (!label || getLocale() !== 'en') return label;
  return APT_STATUS_LABEL_MAP[label] || label;
}

/** Translate an appointment type label from Arabic. */
export function translateAptTypeLabel(label) {
  if (!label || getLocale() !== 'en') return label;
  return APT_TYPE_LABEL_MAP[label] || label;
}

/** Translate a week label like "أسبوع 16" or "أسبوع 27/2025". */
export function translateWeekLabel(label) {
  if (!label || getLocale() !== 'en') return label;
  return label.replace(/^أسبوع\s+/, 'Week ');
}

// Player status map
const PLAYER_STATUS_MAP = {
  'جاهز': 'Available', 'متاح': 'Available',
  'مصاب': 'Injured',
  'تأهيل': 'Rehab', 'إعادة تأهيل': 'Rehab',
  'غائب': 'Absent', 'معلق': 'Suspended',
  'مريض': 'Sick',
};

/** Translate a player status from Arabic. */
export function translatePlayerStatus(name) {
  if (!name || getLocale() !== 'en') return name;
  return PLAYER_STATUS_MAP[name] || name;
}
