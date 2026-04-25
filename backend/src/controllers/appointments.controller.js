const { Op } = require('sequelize');
const { Appointment, Player, User, sequelize } = require('../models');
const { notifyAppointmentCreated } = require('../services/notification.service');

exports.getAllAppointments = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const {
      page = 1,
      limit = 20,
      status = '',
      player_id = '',
      doctor_id = '',
      start_date = '',
      end_date = '',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereCondition = {
      club_id: clubId,
    };

    if (status) {
      whereCondition.status = status;
    }

    if (player_id) {
      whereCondition.player_id = parseInt(player_id);
    }

    if (doctor_id) {
      whereCondition.doctor_id = parseInt(doctor_id);
    }

    if (start_date && end_date) {
      whereCondition.scheduled_date = {
        [Op.between]: [start_date, end_date],
      };
    } else if (start_date) {
      whereCondition.scheduled_date = {
        [Op.gte]: start_date,
      };
    } else if (end_date) {
      whereCondition.scheduled_date = {
        [Op.lte]: end_date,
      };
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: whereCondition,
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number'] },
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
      ],
      order: [['scheduled_date', 'ASC'], ['scheduled_time', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: appointments,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب المواعيد',
    });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      where: { id, club_id: clubId },
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number', 'position'] },
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'الموعد غير موجود',
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء جلب بيانات الموعد',
    });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const userId = req.user.userId;
    const {
      player_id,
      doctor_id,
      appointment_type,
      location,
      scheduled_date,
      scheduled_time,
      duration_minutes,
      notes,
    } = req.body;

    if (!player_id || !scheduled_date) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'اللاعب والتاريخ مطلوبان',
      });
    }

    const player = await Player.findOne({
      where: { id: player_id, club_id: clubId },
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'اللاعب غير موجود',
      });
    }

    const appointment = await Appointment.create({
      club_id: clubId,
      player_id,
      doctor_id,
      appointment_type,
      location,
      scheduled_date,
      scheduled_time,
      duration_minutes: duration_minutes || 30,
      notes,
      status: 'scheduled',
      created_by: userId,
    });

    notifyAppointmentCreated(clubId, userId, player.name, appointment_type || 'طبي', scheduled_date, appointment.id).catch(() => {});

    res.status(201).json({
      success: true,
      data: appointment,
      message: 'تم إضافة الموعد بنجاح',
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء إضافة الموعد',
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const {
      doctor_id,
      appointment_type,
      location,
      scheduled_date,
      scheduled_time,
      duration_minutes,
      notes,
    } = req.body;

    const appointment = await Appointment.findOne({
      where: { id, club_id: clubId },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'الموعد غير موجود',
      });
    }

    await appointment.update({
      doctor_id: doctor_id !== undefined ? doctor_id : appointment.doctor_id,
      appointment_type: appointment_type !== undefined ? appointment_type : appointment.appointment_type,
      location: location !== undefined ? location : appointment.location,
      scheduled_date: scheduled_date || appointment.scheduled_date,
      scheduled_time: scheduled_time !== undefined ? scheduled_time : appointment.scheduled_time,
      duration_minutes: duration_minutes || appointment.duration_minutes,
      notes: notes !== undefined ? notes : appointment.notes,
    });

    res.json({
      success: true,
      data: appointment,
      message: 'تم تحديث الموعد بنجاح',
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ أثناء تحديث الموعد',
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findOne({
      where: { id, club_id: clubId },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'الموعد غير موجود',
      });
    }

    const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'حالة غير صالحة',
      });
    }

    await appointment.update({
      status,
      notes: notes !== undefined ? notes : appointment.notes,
    });

    res.json({
      success: true,
      data: appointment,
      message: 'تم تحديث حالة الموعد بنجاح',
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ',
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      where: { id, club_id: clubId },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'الموعد غير موجود',
      });
    }

    await appointment.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'تم إلغاء الموعد بنجاح',
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ',
    });
  }
};

exports.getAppointmentsMeta = async (req, res) => {
  try {
    const clubId = req.user.clubId;

    const players = await Player.findAll({
      where: { club_id: clubId, is_active: true },
      attributes: ['id', 'name', 'number'],
      order: [['name', 'ASC']],
    });

    const doctors = await User.findAll({
      where: { club_id: clubId, is_active: true, role: 'doctor' },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    const statusOptions = [
      { value: 'scheduled', label: 'محدد' },
      { value: 'completed', label: 'مكتمل' },
      { value: 'cancelled', label: 'ملغى' },
      { value: 'no_show', label: 'لم يحضر' },
      { value: 'rescheduled', label: 'إعادة جدولة' },
    ];

    const appointmentTypes = [
      { value: 'فحص طبي', label: 'فحص طبي' },
      { value: 'علاج طبيعي', label: 'علاج طبيعي' },
      { value: 'كشف', label: 'كشف' },
      { value: 'أشعة', label: 'أشعة' },
      { value: 'تحليل', label: 'تحليل' },
      { value: 'استشارة', label: 'استشارة' },
    ];

    res.json({
      success: true,
      data: {
        players,
        doctors,
        statusOptions,
        appointmentTypes,
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

exports.getTodayAppointments = async (req, res) => {
  try {
    const clubId = req.user.clubId;
    const today = new Date().toISOString().split('T')[0];

    const appointments = await Appointment.findAll({
      where: {
        club_id: clubId,
        scheduled_date: today,
        status: 'scheduled',
      },
      include: [
        { model: Player, as: 'player', attributes: ['id', 'name', 'number'] },
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
      ],
      order: [['scheduled_time', 'ASC']],
    });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'حدث خطأ',
    });
  }
};