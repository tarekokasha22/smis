const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: dbConfig.pool,
  }
);

// تحميل النماذج
const Club = require('./Club')(sequelize);
const User = require('./User')(sequelize);
const Player = require('./Player')(sequelize);
const Injury = require('./Injury')(sequelize);
const Vital = require('./Vital')(sequelize);
const BodyMeasurement = require('./BodyMeasurement')(sequelize);
const Rehabilitation = require('./Rehabilitation')(sequelize);
const RehabSession = require('./RehabSession')(sequelize);
const Equipment = require('./Equipment')(sequelize);
const EquipmentMaintenance = require('./EquipmentMaintenance')(sequelize);
const Supply = require('./Supply')(sequelize);
const SupplyTransaction = require('./SupplyTransaction')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const Performance = require('./Performance')(sequelize);
const FileRecord = require('./FileRecord')(sequelize);
const Notification = require('./Notification')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);

// ==========================================
// العلاقات بين الجداول
// ==========================================

// النادي → المستخدمون
Club.hasMany(User, { foreignKey: 'club_id', as: 'users' });
User.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });

// النادي → اللاعبون
Club.hasMany(Player, { foreignKey: 'club_id', as: 'players' });
Player.belongsTo(Club, { foreignKey: 'club_id', as: 'club' });

// اللاعب → الإصابات
Player.hasMany(Injury, { foreignKey: 'player_id', as: 'injuries' });
Injury.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });

// الطبيب المعالج → الإصابات
User.hasMany(Injury, { foreignKey: 'treating_doctor_id', as: 'treatedInjuries' });
Injury.belongsTo(User, { foreignKey: 'treating_doctor_id', as: 'treatingDoctor' });

// منشئ الإصابة → الإصابات
User.hasMany(Injury, { foreignKey: 'created_by', as: 'createdInjuries' });
Injury.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// اللاعب → المؤشرات الحيوية
Player.hasMany(Vital, { foreignKey: 'player_id', as: 'vitals' });
Vital.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });

// المسجِّل → المؤشرات الحيوية
User.hasMany(Vital, { foreignKey: 'recorded_by', as: 'recordedVitals' });
Vital.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

// اللاعب → قياسات الجسم
Player.hasMany(BodyMeasurement, { foreignKey: 'player_id', as: 'bodyMeasurements' });
BodyMeasurement.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });

// المسجِّل → قياسات الجسم
User.hasMany(BodyMeasurement, { foreignKey: 'recorded_by', as: 'recordedMeasurements' });
BodyMeasurement.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

// اللاعب → برامج التأهيل
Player.hasMany(Rehabilitation, { foreignKey: 'player_id', as: 'rehabilitations' });
Rehabilitation.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });

// الإصابة → برنامج التأهيل
Injury.hasOne(Rehabilitation, { foreignKey: 'injury_id', as: 'rehabilitation' });
Rehabilitation.belongsTo(Injury, { foreignKey: 'injury_id', as: 'injury' });

// برنامج التأهيل → الجلسات
Rehabilitation.hasMany(RehabSession, { foreignKey: 'program_id', as: 'sessions' });
RehabSession.belongsTo(Rehabilitation, { foreignKey: 'program_id', as: 'program' });

// المعالج → برامج التأهيل
User.hasMany(Rehabilitation, { foreignKey: 'therapist_id', as: 'therapistPrograms' });
Rehabilitation.belongsTo(User, { foreignKey: 'therapist_id', as: 'therapist' });

// المعالج → جلسات التأهيل
User.hasMany(RehabSession, { foreignKey: 'therapist_id', as: 'therapistSessions' });
RehabSession.belongsTo(User, { foreignKey: 'therapist_id', as: 'sessionTherapist' });

// اللاعب → جلسات التأهيل
Player.hasMany(RehabSession, { foreignKey: 'player_id', as: 'rehabSessions' });
RehabSession.belongsTo(Player, { foreignKey: 'player_id', as: 'sessionPlayer' });

// المعدات → سجل الصيانة
Equipment.hasMany(EquipmentMaintenance, { foreignKey: 'equipment_id', as: 'maintenanceRecords' });
EquipmentMaintenance.belongsTo(Equipment, { foreignKey: 'equipment_id', as: 'equipment' });

// المستخدم → سجل الصيانة
User.hasMany(EquipmentMaintenance, { foreignKey: 'performed_by', as: 'performedMaintenance' });
EquipmentMaintenance.belongsTo(User, { foreignKey: 'performed_by', as: 'performedByUser' });

// المستلزمات → سجل المعاملات
Supply.hasMany(SupplyTransaction, { foreignKey: 'supply_id', as: 'transactions' });
SupplyTransaction.belongsTo(Supply, { foreignKey: 'supply_id', as: 'supply' });

// المستخدم (منفذ العملية) → سجل المعاملات
User.hasMany(SupplyTransaction, { foreignKey: 'performed_by', as: 'supplyTransactions' });
SupplyTransaction.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });

// اللاعب (.استلام الدواء) → سجل المعاملات
Player.hasMany(SupplyTransaction, { foreignKey: 'player_id', as: 'supplyTransactions' });
SupplyTransaction.belongsTo(Player, { foreignKey: 'player_id', as: 'transactionPlayer' });

// اللاعب → المواعيد
Player.hasMany(Appointment, { foreignKey: 'player_id', as: 'appointments' });
Appointment.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });

// الطبيب → المواعيد
User.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id', as: 'doctor' });

// اللاعب → تقييمات الأداء
Player.hasMany(Performance, { foreignKey: 'player_id', as: 'performances' });
Performance.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });

// المستخدم (المقيّم) → تقييمات الأداء
User.hasMany(Performance, { foreignKey: 'evaluator_id', as: 'evaluations' });
Performance.belongsTo(User, { foreignKey: 'evaluator_id', as: 'evaluator' });

// اللاعب → الملفات
Player.hasMany(FileRecord, { foreignKey: 'player_id', as: 'files' });
FileRecord.belongsTo(Player, { foreignKey: 'player_id', as: 'player' });

// المستخدم (رافع الملف) → الملفات
User.hasMany(FileRecord, { foreignKey: 'uploaded_by', as: 'uploadedFiles' });
FileRecord.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// المستخدم → الإشعارات
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  Sequelize,
  Club,
  User,
  Player,
  Injury,
  Vital,
  BodyMeasurement,
  Rehabilitation,
  RehabSession,
  Equipment,
  EquipmentMaintenance,
  Supply,
  SupplyTransaction,
  Appointment,
  Performance,
  FileRecord,
  Notification,
  AuditLog,
};
