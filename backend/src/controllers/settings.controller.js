const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { Club, User, sequelize } = require('../models');

exports.getClubSettings = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    const club = await Club.findOne({
      where: { id: clubId },
      attributes: { exclude: ['created_at', 'updated_at'] },
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'النادي غير موجود',
      });
    }

    res.json({
      success: true,
      data: club,
    });
  } catch (error) {
    console.error('Error fetching club settings:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب إعدادات النادي',
    });
  }
};

exports.updateClubSettings = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { name, name_en, city, country, sport_type, primary_color } = req.body;

    const club = await Club.findOne({
      where: { id: clubId },
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'النادي غير موجود',
      });
    }

    await club.update({
      name: name || club.name,
      name_en: name_en !== undefined ? name_en : club.name_en,
      city: city !== undefined ? city : club.city,
      country: country !== undefined ? country : club.country,
      sport_type: sport_type !== undefined ? sport_type : club.sport_type,
      primary_color: primary_color || club.primary_color,
    });

    res.json({
      success: true,
      data: club,
      message: 'تم تحديث إعدادات النادي بنجاح',
    });
  } catch (error) {
    console.error('Error updating club settings:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تحديث إعدادات النادي',
    });
  }
};

exports.uploadClubLogo = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'لم يتم اختيار ملف',
      });
    }

    const club = await Club.findOne({
      where: { id: clubId },
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'النادي غير موجود',
      });
    }

    const logoUrl = `/uploads/club_${clubId}/${req.file.filename}`;
    await club.update({ logo_url: logoUrl });

    res.json({
      success: true,
      data: { logo_url: logoUrl },
      message: 'تم رفع الشعار بنجاح',
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء رفع الشعار',
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash', 'refresh_token'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المستخدم غير موجود',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب الملف الشخصي',
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المستخدم غير موجود',
      });
    }

    await user.update({
      name: name || user.name,
      phone: phone !== undefined ? phone : user.phone,
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      message: 'تم تحديث الملف الشخصي بنجاح',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تحديث الملف الشخصي',
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'جميع الحقول مطلوبة',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المستخدم غير موجود',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'كلمة المرور الحالية غير صحيحة',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await user.update({ password_hash: newHash });

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تغيير كلمة المرور',
    });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'لم يتم اختيار ملف',
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المستخدم غير موجود',
      });
    }

    const avatarUrl = `/uploads/club_${user.club_id}/${req.file.filename}`;
    await user.update({ avatar_url: avatarUrl });

    res.json({
      success: true,
      data: { avatar_url: avatarUrl },
      message: 'تم رفع الصورة بنجاح',
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء رفع الصورة',
    });
  }
};

exports.getSettingsMeta = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        sportTypes: ['كرة قدم', 'كرة سلة', 'كرة يد', 'سباحة', 'ألعاب قوى', 'تنس', 'رياضات أخرى'],
        subscriptionPlans: [
          { value: 'basic', label: 'أساسي' },
          { value: 'premium', label: 'متميز' },
          { value: 'enterprise', label: 'مؤسسي' },
        ],
      },
    });
  } catch (error) {
    console.error('Error fetching meta:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ',
    });
  }
};