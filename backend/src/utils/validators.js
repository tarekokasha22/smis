const Joi = require('joi');

// مخططات التحقق من البيانات

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'البريد الإلكتروني غير صحيح',
    'any.required': 'البريد الإلكتروني مطلوب',
    'string.empty': 'البريد الإلكتروني مطلوب',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'any.required': 'كلمة المرور مطلوبة',
    'string.empty': 'كلمة المرور مطلوبة',
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'كلمة المرور الحالية مطلوبة',
  }),
  newPassword: Joi.string().min(8).required().messages({
    'string.min': 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل',
    'any.required': 'كلمة المرور الجديدة مطلوبة',
  }),
});

const playerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'اسم اللاعب يجب أن يكون حرفين على الأقل',
    'any.required': 'اسم اللاعب مطلوب',
  }),
  number: Joi.number().integer().min(1).max(99).required().messages({
    'number.base': 'رقم القميص يجب أن يكون رقماً',
    'any.required': 'رقم القميص مطلوب',
  }),
  position: Joi.string().required().messages({
    'any.required': 'مركز اللاعب مطلوب',
  }),
  nationality: Joi.string().allow('', null),
  date_of_birth: Joi.date().allow(null),
  height: Joi.number().min(100).max(250).allow(null),
  weight: Joi.number().min(30).max(200).allow(null),
  blood_type: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').allow(null),
  dominant_foot: Joi.string().valid('right', 'left', 'both').allow(null),
  phone: Joi.string().allow('', null),
  emergency_contact_name: Joi.string().allow('', null),
  emergency_contact_phone: Joi.string().allow('', null),
  chronic_conditions: Joi.string().allow('', null),
  surgeries_history: Joi.string().allow('', null),
  previous_injuries: Joi.string().allow('', null),
  current_medications: Joi.string().allow('', null),
  contract_start: Joi.date().allow(null),
  contract_end: Joi.date().allow(null),
  notes: Joi.string().allow('', null),
});

const injurySchema = Joi.object({
  player_id: Joi.number().integer().required().messages({
    'any.required': 'يجب اختيار اللاعب',
  }),
  injury_type: Joi.string().required().messages({
    'any.required': 'نوع الإصابة مطلوب',
  }),
  body_area: Joi.string().required().messages({
    'any.required': 'المنطقة المصابة مطلوبة',
  }),
  body_side: Joi.string().valid('left', 'right', 'both').allow(null),
  severity: Joi.string().valid('mild', 'moderate', 'severe', 'critical').required().messages({
    'any.required': 'درجة الخطورة مطلوبة',
  }),
  expected_recovery_days: Joi.number().integer().min(1).required().messages({
    'any.required': 'أيام التعافي المتوقعة مطلوبة',
  }),
  injury_date: Joi.date().required().messages({
    'any.required': 'تاريخ الإصابة مطلوب',
  }),
  treating_doctor_id: Joi.number().integer().required().messages({
    'any.required': 'الطبيب المعالج مطلوب',
  }),
  mechanism: Joi.string().valid('collision', 'overuse', 'fatigue', 'unknown').allow(null),
  occurred_during: Joi.string().valid('match', 'training', 'other').allow(null),
  is_recurring: Joi.boolean().default(false),
  recurrence_count: Joi.number().integer().min(0).default(0),
  description: Joi.string().allow('', null),
  treatment_plan: Joi.string().allow('', null),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return res.status(422).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'البيانات المدخلة غير صحيحة',
        details,
      });
    }
    next();
  };
};

module.exports = {
  loginSchema,
  changePasswordSchema,
  playerSchema,
  injurySchema,
  validate,
};
