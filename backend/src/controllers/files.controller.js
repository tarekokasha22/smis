const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { FileRecord, Player, User, sequelize } = require('../models');
const ApiResponse = require('../utils/apiResponse');

// ==========================================
// إعداد Multer لرفع الملفات
// ==========================================
const uploadDir = path.join(__dirname, '../../uploads/files');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4', 'video/avi',
    'application/zip',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم'), false);
  }
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// ==========================================
// الحصول على قائمة الملفات
// ==========================================
exports.getAllFiles = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      search = '',
      player_id = '',
      file_type = '',
      is_confidential = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = { club_id: clubId };

    if (player_id) where.player_id = player_id;
    if (file_type) where.file_type = file_type;
    if (is_confidential !== '') where.is_confidential = is_confidential === 'true';
    if (dateFrom) where.created_at = { ...where.created_at, [Op.gte]: new Date(dateFrom) };
    if (dateTo) where.created_at = { ...where.created_at, [Op.lte]: new Date(dateTo + 'T23:59:59') };
    if (search) {
      where[Op.or] = [
        { file_name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: files } = await FileRecord.findAndCountAll({
      where,
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'name', 'number', 'position', 'avatar_url'],
          required: false,
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'role'],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset,
    });

    // إحصائيات سريعة
    const typeStats = await FileRecord.findAll({
      where: { club_id: clubId },
      attributes: [
        'file_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('file_size')), 'totalSize'],
      ],
      group: ['file_type'],
      raw: true,
    });

    return res.json({
      success: true,
      data: files,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
      stats: { byType: typeStats },
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب الملفات');
  }
};

// ==========================================
// إحصائيات الملفات
// ==========================================
exports.getFileStats = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    const typeStats = await FileRecord.findAll({
      where: { club_id: clubId },
      attributes: [
        'file_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('file_size')), 'totalSize'],
      ],
      group: ['file_type'],
      raw: true,
    });

    const totalFiles = await FileRecord.count({ where: { club_id: clubId } });
    const totalSize = await FileRecord.sum('file_size', { where: { club_id: clubId } });
    const confidentialCount = await FileRecord.count({ where: { club_id: clubId, is_confidential: true } });

    // الملفات المضافة هذا الشهر
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const thisMonthCount = await FileRecord.count({
      where: { club_id: clubId, created_at: { [Op.gte]: monthStart } },
    });

    // آخر 10 ملفات
    const recent = await FileRecord.findAll({
      where: { club_id: clubId },
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number'], required: false },
        { model: User, as: 'uploader', attributes: ['id', 'name'], required: false },
      ],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    // توزيع الملفات على اللاعبين (أكثر 5 لاعبين لديهم ملفات)
    const playerDist = await FileRecord.findAll({
      where: { club_id: clubId, player_id: { [Op.ne]: null } },
      attributes: [
        'player_id',
        [sequelize.fn('COUNT', sequelize.col('FileRecord.id')), 'count'],
      ],
      include: [{ model: Player, as: 'player', attributes: ['id', 'name', 'number'], required: false }],
      group: ['player_id', 'player.id', 'player.name', 'player.number'],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 5,
    });

    return res.json({
      success: true,
      data: {
        totalFiles,
        totalSize: totalSize || 0,
        confidentialCount,
        thisMonthCount,
        byType: typeStats,
        recent,
        playerDistribution: playerDist,
      },
    });
  } catch (error) {
    console.error('Error fetching file stats:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب الإحصائيات');
  }
};

// ==========================================
// الحصول على ملف محدد
// ==========================================
exports.getFileById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const file = await FileRecord.findOne({
      where: { id, club_id: clubId },
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position', 'avatar_url'], required: false },
        { model: User, as: 'uploader', attributes: ['id', 'name', 'role'], required: false },
      ],
    });

    if (!file) return ApiResponse.notFound(res, 'الملف غير موجود');
    return ApiResponse.success(res, file);
  } catch (error) {
    console.error('Error fetching file:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء جلب الملف');
  }
};

// ==========================================
// رفع ملف جديد
// ==========================================
exports.uploadFile = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;

    if (!req.file) {
      return ApiResponse.validationError(res, [], 'لم يتم اختيار ملف');
    }

    const { player_id, file_type, description, tags, is_confidential } = req.body;

    // التحقق من اللاعب إن حُدِّد
    if (player_id) {
      const player = await Player.findOne({ where: { id: player_id, club_id: clubId } });
      if (!player) {
        // حذف الملف المرفوع
        fs.unlinkSync(req.file.path);
        return ApiResponse.notFound(res, 'اللاعب غير موجود');
      }
    }

    const fileRecord = await FileRecord.create({
      club_id: clubId,
      player_id: player_id || null,
      uploaded_by: userId,
      file_name: req.body.file_name || Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
      file_type: file_type || 'other',
      file_size: req.file.size,
      file_path: `/uploads/files/${req.file.filename}`,
      mime_type: req.file.mimetype,
      description: description || null,
      is_confidential: is_confidential === 'true' || is_confidential === true,
      tags: tags || null,
    });

    const fullFile = await FileRecord.findByPk(fileRecord.id, {
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number'], required: false },
        { model: User, as: 'uploader', attributes: ['id', 'name'], required: false },
      ],
    });

    return ApiResponse.created(res, fullFile, 'تم رفع الملف بنجاح');
  } catch (error) {
    // حذف الملف في حال وجود خطأ
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch { }
    }
    console.error('Error uploading file:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء رفع الملف');
  }
};

// ==========================================
// تحديث بيانات ملف
// ==========================================
exports.updateFile = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { player_id, file_type, description, tags, is_confidential, file_name } = req.body;

    const file = await FileRecord.findOne({ where: { id, club_id: clubId } });
    if (!file) return ApiResponse.notFound(res, 'الملف غير موجود');

    if (player_id) {
      const player = await Player.findOne({ where: { id: player_id, club_id: clubId } });
      if (!player) return ApiResponse.notFound(res, 'اللاعب غير موجود');
    }

    await file.update({
      player_id: player_id !== undefined ? (player_id || null) : file.player_id,
      file_type: file_type || file.file_type,
      description: description !== undefined ? description : file.description,
      tags: tags !== undefined ? tags : file.tags,
      is_confidential: is_confidential !== undefined ? (is_confidential === 'true' || is_confidential === true) : file.is_confidential,
      file_name: file_name || file.file_name,
    });

    const updated = await FileRecord.findByPk(id, {
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number'], required: false },
        { model: User, as: 'uploader', attributes: ['id', 'name'], required: false },
      ],
    });

    return ApiResponse.success(res, updated, 'تم تحديث بيانات الملف بنجاح');
  } catch (error) {
    console.error('Error updating file:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحديث الملف');
  }
};

// ==========================================
// حذف ملف
// ==========================================
exports.deleteFile = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const file = await FileRecord.findOne({ where: { id, club_id: clubId } });
    if (!file) return ApiResponse.notFound(res, 'الملف غير موجود');

    // حذف الملف الفعلي من القرص
    const physicalPath = path.join(__dirname, '../..', file.file_path);
    if (fs.existsSync(physicalPath)) {
      fs.unlinkSync(physicalPath);
    }

    await file.destroy();
    return ApiResponse.success(res, null, 'تم حذف الملف بنجاح');
  } catch (error) {
    console.error('Error deleting file:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء حذف الملف');
  }
};

// ==========================================
// تحميل / عرض ملف
// ==========================================
exports.downloadFile = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const file = await FileRecord.findOne({ where: { id, club_id: clubId } });
    if (!file) return ApiResponse.notFound(res, 'الملف غير موجود');

    const physicalPath = path.join(__dirname, '../..', file.file_path);
    if (!fs.existsSync(physicalPath)) {
      return ApiResponse.notFound(res, 'الملف غير موجود على الخادم');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.file_name)}"`);
    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    res.sendFile(physicalPath);
  } catch (error) {
    console.error('Error downloading file:', error);
    return ApiResponse.error(res, 'حدث خطأ أثناء تحميل الملف');
  }
};
