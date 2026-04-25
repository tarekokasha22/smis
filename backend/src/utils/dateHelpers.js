const dayjs = require('dayjs');
require('dayjs/locale/ar');

dayjs.locale('ar');

const formatDate = (date) => dayjs(date).format('YYYY-MM-DD');
const formatDateTime = (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss');
const formatArabicDate = (date) => dayjs(date).locale('ar').format('D MMMM YYYY');

module.exports = { formatDate, formatDateTime, formatArabicDate, dayjs };
