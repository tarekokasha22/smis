/**
 * الحصول على الأحرف الأولى من الاسم (للأفاتار)
 */
export const getInitials = (name) => {
  if (!name) return '؟';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0);
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
};

/**
 * تقسيم النص الطويل
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * تأخير التنفيذ (debounce)
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * إنشاء معرف فريد
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * نسخ نص للحافظة
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * تبديل صنف CSS
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
