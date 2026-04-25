// تنسيق استجابة API موحد

class ApiResponse {
  static success(res, data = null, message = 'تمت العملية بنجاح', statusCode = 200, meta = null) {
    const response = {
      success: true,
      message,
      data,
    };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  static created(res, data = null, message = 'تم الإنشاء بنجاح') {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(res, message = 'حدث خطأ', statusCode = 500, error = null, details = null) {
    const response = {
      success: false,
      message,
      error: error || 'SERVER_ERROR',
    };
    if (details) response.details = details;
    return res.status(statusCode).json(response);
  }

  static notFound(res, message = 'السجل المطلوب غير موجود') {
    return ApiResponse.error(res, message, 404, 'NOT_FOUND');
  }

  static unauthorized(res, message = 'غير مصرح بالوصول') {
    return ApiResponse.error(res, message, 401, 'UNAUTHORIZED');
  }

  static forbidden(res, message = 'ليس لديك صلاحية للوصول لهذا المحتوى') {
    return ApiResponse.error(res, message, 403, 'FORBIDDEN');
  }

  static validationError(res, details = [], message = 'البيانات المدخلة غير صحيحة') {
    return ApiResponse.error(res, message, 422, 'VALIDATION_ERROR', details);
  }

  static paginated(res, data, total, page, limit, message = 'تمت العملية بنجاح') {
    return ApiResponse.success(res, data, message, 200, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    });
  }
}

module.exports = ApiResponse;
