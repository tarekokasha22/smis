import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Activity,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Heart,
  Thermometer,
  Droplets,
  Wind,
  Moon,
  Zap,
  Scale,
  AlertTriangle,
  CheckCircle2,
  User,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  X,
  LayoutGrid,
  List,
  Download,
  ClipboardList,
} from 'lucide-react';
import { vitalsApi } from '../../api/endpoints/vitals';
import { playersApi } from '../../api/endpoints/players';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import { LineChart, AreaChart } from '../../components/charts';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import useAuthStore from '../../store/authStore';
import i18n from '../../utils/i18n';

dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');

// ==========================================
// ثوابت وروابط التحقق من القيم
// ==========================================
const VITAL_THRESHOLDS = {
  heart_rate: { low: 40, highWarning: 100, highDanger: 120, get unit() { return i18n.t('نبضة/دقيقة'); }, get label() { return i18n.t('معدل القلب'); } },
  spo2: { lowDanger: 90, lowWarning: 95, high: 100, unit: '%', get label() { return i18n.t('تشبع الأكسجين'); } },
  blood_pressure_systolic: { low: 90, highWarning: 130, highDanger: 140, get unit() { return i18n.t('ملم زئبق'); }, get label() { return i18n.t('ضغط الدم الانقباضي'); } },
  blood_pressure_diastolic: { low: 60, highWarning: 80, highDanger: 90, get unit() { return i18n.t('ملم زئبق'); }, get label() { return i18n.t('ضغط الدم الانبساطي'); } },
  temperature: { low: 36, highWarning: 37.5, highDanger: 38.5, get unit() { return i18n.t('°م'); }, get label() { return i18n.t('درجة الحرارة'); } },
  fatigue_level: { low: 1, highWarning: 7, highDanger: 9, unit: '/10', get label() { return i18n.t('مستوى التعب'); } },
  sleep_hours: { low: 5, highWarning: 9, highDanger: 12, get unit() { return i18n.t('ساعة'); }, get label() { return i18n.t('ساعات النوم'); } },
  hrv: { low: 20, highWarning: 100, highDanger: null, unit: 'ms', get label() { return i18n.t('تباين معدل القلب'); } },
};

const HYDRATION_OPTIONS = [
  { value: 'excellent', get label() { return i18n.t('ممتاز'); }, color: 'text-success bg-success-light' },
  { value: 'good', get label() { return i18n.t('جيد'); }, color: 'text-primary bg-primary-50' },
  { value: 'moderate', get label() { return i18n.t('متوسط'); }, color: 'text-warning bg-warning-light' },
  { value: 'poor', get label() { return i18n.t('ضعيف'); }, color: 'text-danger bg-danger-light' },
];

// ==========================================
// مكون: بطاقة مؤشر حيوي صغيرة
// ==========================================
function VitalBadge({ value, type, compact = false }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 text-sm">—</span>;
  }

  const threshold = VITAL_THRESHOLDS[type];
  if (!threshold) return <span className="text-gray-900 font-numbers text-sm">{value}</span>;

  let status = 'normal'; // normal | warning | danger
  if (type === 'spo2') {
    if (value < threshold.lowDanger) status = 'danger';
    else if (value < threshold.lowWarning) status = 'warning';
  } else if (type === 'heart_rate' || type === 'blood_pressure_systolic' || type === 'blood_pressure_diastolic' || type === 'fatigue_level' || type === 'temperature') {
    if (threshold.highDanger && value >= threshold.highDanger) status = 'danger';
    else if (threshold.highWarning && value >= threshold.highWarning) status = 'warning';
    else if (value < threshold.low) status = 'warning';
  } else if (type === 'sleep_hours') {
    if (value < threshold.low) status = 'danger';
    else if (value > threshold.highWarning) status = 'warning';
  }

  const colorClass = {
    normal: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  }[status];

  const icon = status === 'danger'
    ? <AlertTriangle className="w-3 h-3" />
    : status === 'warning'
    ? <AlertTriangle className="w-3 h-3" />
    : null;

  if (compact) {
    return (
      <span className={`font-numbers font-semibold text-sm ${colorClass}`}>
        {value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-numbers font-semibold text-sm ${colorClass}`}>
      {icon}
      {value}
    </span>
  );
}

// ==========================================
// مكون: نموذج إدخال المؤشرات الحيوية
// ==========================================
export function VitalFormModal({ isOpen, onClose, onSave, players, vitalToEdit = null }) {
  const initialForm = {
    player_id: '',
    recorded_at: dayjs().format('YYYY-MM-DDTHH:mm'),
    heart_rate: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    temperature: '',
    spo2: '',
    weight: '',
    height: '',
    resting_hr: '',
    hrv: '',
    sleep_hours: '',
    fatigue_level: '',
    hydration_status: '',
    notes: '',
  };

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  // Custom vital signs
  const [customTypes, setCustomTypes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('smis-custom-vital-types') || '[]'); } catch { return []; }
  });
  const [customValues, setCustomValues] = useState({});
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomType, setNewCustomType] = useState({ name: '', unit: '', normalMin: '', normalMax: '' });

  useEffect(() => {
    if (isOpen) {
      if (vitalToEdit) {
        setForm({
          player_id: vitalToEdit.player_id || '',
          recorded_at: vitalToEdit.recorded_at
            ? dayjs(vitalToEdit.recorded_at).format('YYYY-MM-DDTHH:mm')
            : dayjs().format('YYYY-MM-DDTHH:mm'),
          heart_rate: vitalToEdit.heart_rate ?? '',
          blood_pressure_systolic: vitalToEdit.blood_pressure_systolic ?? '',
          blood_pressure_diastolic: vitalToEdit.blood_pressure_diastolic ?? '',
          temperature: vitalToEdit.temperature ?? '',
          spo2: vitalToEdit.spo2 ?? '',
          weight: vitalToEdit.weight ?? '',
          height: vitalToEdit.height ?? '',
          resting_hr: vitalToEdit.resting_hr ?? '',
          hrv: vitalToEdit.hrv ?? '',
          sleep_hours: vitalToEdit.sleep_hours ?? '',
          fatigue_level: vitalToEdit.fatigue_level ?? '',
          hydration_status: vitalToEdit.hydration_status || '',
          notes: vitalToEdit.notes || '',
        });
      } else {
        setForm(initialForm);
      }
      setActiveSection('basic');
    }
  }, [isOpen, vitalToEdit]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // تلقائياً حساب BMI عند تغيير الوزن أو الطول
  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / ((parseFloat(form.height) / 100) ** 2)).toFixed(1)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.player_id) {
      toast.error(i18n.t('يجب تحديد اللاعب'));
      return;
    }

    setSaving(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([key, val]) => {
        if (val !== '' && val !== null && val !== undefined) {
          payload[key] = val;
        }
      });
      // Append custom vitals to notes
      const customEntries = customTypes
        .filter(ct => customValues[ct.id] !== '' && customValues[ct.id] !== undefined)
        .map(ct => `${ct.name}: ${customValues[ct.id]}${ct.unit ? ' ' + ct.unit : ''}`);
      if (customEntries.length > 0) {
        const customText = '\n[' + i18n.t('مؤشرات مخصصة') + ']\n' + customEntries.join('\n');
        payload.notes = (payload.notes || '') + customText;
      }
      await onSave(payload, vitalToEdit?.id);
      setCustomValues({});
      onClose();
    } catch (error) {
      // handled by parent
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'basic', get label() { return i18n.t('القياسات الأساسية'); } },
    { id: 'advanced', get label() { return i18n.t('القياسات المتقدمة'); } },
    { id: 'wellness', get label() { return i18n.t('الصحة العامة'); } },
    { id: 'custom', get label() { return i18n.t('مؤشرات مخصصة'); } },
  ];

  const saveCustomType = () => {
    if (!newCustomType.name.trim()) { toast.error(i18n.t('اسم المؤشر مطلوب')); return; }
    const newType = { id: Date.now(), ...newCustomType };
    const updated = [...customTypes, newType];
    setCustomTypes(updated);
    localStorage.setItem('smis-custom-vital-types', JSON.stringify(updated));
    setNewCustomType({ name: '', unit: '', normalMin: '', normalMax: '' });
    setShowAddCustom(false);
    toast.success(i18n.t('تم إضافة المؤشر المخصص'));
  };

  const removeCustomType = (id) => {
    const updated = customTypes.filter(t => t.id !== id);
    setCustomTypes(updated);
    localStorage.setItem('smis-custom-vital-types', JSON.stringify(updated));
    const newVals = { ...customValues };
    delete newVals[id];
    setCustomValues(newVals);
  };

  const vitalFooter = (
    <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t('إلغاء')}</Button>
      <Button form="vital-form" type="submit" loading={saving} className="flex-1 gap-2">
        <CheckCircle2 className="w-4 h-4" />
        {vitalToEdit ? i18n.t('حفظ التعديلات') : i18n.t('حفظ القياس')}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vitalToEdit ? i18n.t('تعديل القياس الحيوي') : i18n.t('تسجيل مؤشرات حيوية جديدة')}
      size="lg"
      footer={vitalFooter}
    >
      <form id="vital-form" onSubmit={handleSubmit} className="space-y-5">
        {/* اللاعب والتاريخ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {i18n.t('اللاعب')} <span className="text-danger">*</span>
            </label>
            <select
              value={form.player_id}
              onChange={(e) => handleChange('player_id', e.target.value)}
              className="input-field"
              required
              disabled={!!vitalToEdit}
            >
              <option value="">{i18n.t('اختر اللاعب...')}</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number} - {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {i18n.t('تاريخ ووقت القياس')}
            </label>
            <input
              type="datetime-local"
              value={form.recorded_at}
              onChange={(e) => handleChange('recorded_at', e.target.value)}
              className="input-field font-numbers"
            />
          </div>
        </div>

        {/* أقسام النموذج */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* تبويبات */}
          <div className="flex bg-gray-50 border-b border-gray-200">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  activeSection === s.id
                    ? 'bg-white text-primary border-b-2 border-primary -mb-px'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* القياسات الأساسية */}
            {activeSection === 'basic' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-danger" />
                    {i18n.t('معدل القلب')} ({i18n.t('نبضة/دقيقة')})
                  </label>
                  <input
                    type="number"
                    value={form.heart_rate}
                    onChange={(e) => handleChange('heart_rate', e.target.value)}
                    placeholder="72"
                    min="20"
                    max="250"
                    className="input-field font-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    {i18n.t('ضغط الدم الانقباضي')}
                  </label>
                  <input
                    type="number"
                    value={form.blood_pressure_systolic}
                    onChange={(e) => handleChange('blood_pressure_systolic', e.target.value)}
                    placeholder="120"
                    min="60"
                    max="250"
                    className="input-field font-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-info" />
                    {i18n.t('ضغط الدم الانبساطي')}
                  </label>
                  <input
                    type="number"
                    value={form.blood_pressure_diastolic}
                    onChange={(e) => handleChange('blood_pressure_diastolic', e.target.value)}
                    placeholder="80"
                    min="40"
                    max="150"
                    className="input-field font-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-warning" />
                    {i18n.t('درجة الحرارة')} ({i18n.t('°م')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.temperature}
                    onChange={(e) => handleChange('temperature', e.target.value)}
                    placeholder="36.6"
                    min="34"
                    max="43"
                    className="input-field font-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-info" />
                    {i18n.t('تشبع الأكسجين')} SpO₂ (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.spo2}
                    onChange={(e) => handleChange('spo2', e.target.value)}
                    placeholder="98"
                    min="70"
                    max="100"
                    className="input-field font-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-success" />
                    {i18n.t('الوزن')} ({i18n.t('كجم')})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="75.5"
                    min="30"
                    max="200"
                    className="input-field font-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    {i18n.t('الطول')} ({i18n.t('سم')})
                  </label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    placeholder="180"
                    min="100"
                    max="230"
                    className="input-field font-numbers"
                  />
                </div>
                {bmi && (
                  <div className="flex items-center justify-center bg-primary-50 rounded-xl border border-primary/20">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">BMI</p>
                      <p className="text-2xl font-bold font-numbers text-primary">{bmi}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* القياسات المتقدمة */}
            {activeSection === 'advanced' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-danger" />
                    {i18n.t('معدل القلب أثناء الراحة')}
                  </label>
                  <input
                    type="number"
                    value={form.resting_hr}
                    onChange={(e) => handleChange('resting_hr', e.target.value)}
                    placeholder="60"
                    min="20"
                    max="120"
                    className="input-field font-numbers"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-warning" />
                    HRV ({i18n.t('تباين معدل القلب')} ms)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.hrv}
                    onChange={(e) => handleChange('hrv', e.target.value)}
                    placeholder="45"
                    min="1"
                    max="300"
                    className="input-field font-numbers"
                  />
                </div>
              </div>
            )}

            {/* الصحة العامة */}
            {activeSection === 'wellness' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-info" />
                      {i18n.t('ساعات النوم')}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.sleep_hours}
                      onChange={(e) => handleChange('sleep_hours', e.target.value)}
                      placeholder="8"
                      min="0"
                      max="24"
                      className="input-field font-numbers"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-info" />
                      {i18n.t('حالة الترطيب')}
                    </label>
                    <select
                      value={form.hydration_status}
                      onChange={(e) => handleChange('hydration_status', e.target.value)}
                      className="input-field"
                    >
                      <option value="">{i18n.t('اختر...')}</option>
                      {HYDRATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* مستوى التعب - شريط تمرير */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-warning" />
                      {i18n.t('مستوى التعب')}
                    </span>
                    {form.fatigue_level && (
                      <span
                        className={`font-numbers font-bold ${
                          form.fatigue_level >= 8
                            ? 'text-danger'
                            : form.fatigue_level >= 6
                            ? 'text-warning'
                            : 'text-success'
                        }`}
                      >
                        {form.fatigue_level}/10
                      </span>
                    )}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={form.fatigue_level || 5}
                    onChange={(e) => handleChange('fatigue_level', e.target.value)}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to left, #A32D2D 0%, #854F0B 50%, #3B6D11 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 - {i18n.t('نشيط تماماً')}</span>
                    <span>10 - {i18n.t('منهك تماماً')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* مؤشرات مخصصة */}
            {activeSection === 'custom' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">{i18n.t('أضف مؤشرات حيوية مخصصة لا تندرج ضمن القياسات الافتراضية')}</p>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(!showAddCustom)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {i18n.t('إضافة مؤشر مخصص')}
                  </button>
                </div>

                {showAddCustom && (
                  <div className="bg-primary-50 border border-primary/20 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-bold text-primary">{i18n.t('تعريف مؤشر مخصص جديد')}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{i18n.t('اسم المؤشر')} *</label>
                        <input type="text" value={newCustomType.name} onChange={(e) => setNewCustomType({...newCustomType, name: e.target.value})} className="input-field text-sm" placeholder="VO2 Max" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{i18n.t('وحدة القياس')}</label>
                        <input type="text" value={newCustomType.unit} onChange={(e) => setNewCustomType({...newCustomType, unit: e.target.value})} className="input-field text-sm" placeholder="ml/kg/min" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{i18n.t('الحد الأدنى الطبيعي')}</label>
                        <input type="number" value={newCustomType.normalMin} onChange={(e) => setNewCustomType({...newCustomType, normalMin: e.target.value})} className="input-field font-numbers text-sm" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{i18n.t('الحد الأقصى الطبيعي')}</label>
                        <input type="number" value={newCustomType.normalMax} onChange={(e) => setNewCustomType({...newCustomType, normalMax: e.target.value})} className="input-field font-numbers text-sm" placeholder="100" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setShowAddCustom(false)} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">{i18n.t('إلغاء')}</button>
                      <button type="button" onClick={saveCustomType} className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark">{i18n.t('حفظ المؤشر')}</button>
                    </div>
                  </div>
                )}

                {customTypes.length === 0 && !showAddCustom ? (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">{i18n.t('لا توجد مؤشرات مخصصة. اضغط "إضافة مؤشر مخصص" لإضافة أول مؤشر.')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customTypes.map((ct) => {
                      const val = customValues[ct.id] || '';
                      const isAbnormal = val && ct.normalMin && ct.normalMax && (parseFloat(val) < parseFloat(ct.normalMin) || parseFloat(val) > parseFloat(ct.normalMax));
                      return (
                        <div key={ct.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isAbnormal ? 'border-warning/50 bg-warning-light' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-700">{ct.name}</span>
                              {ct.unit && <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border">{ct.unit}</span>}
                              {ct.normalMin && ct.normalMax && (
                                <span className="text-xs text-gray-400">{i18n.t('المعدل الطبيعي')}: {ct.normalMin} - {ct.normalMax}</span>
                              )}
                            </div>
                            <input
                              type="number"
                              step="any"
                              value={val}
                              onChange={(e) => setCustomValues({...customValues, [ct.id]: e.target.value})}
                              className="input-field font-numbers text-sm"
                              placeholder={i18n.t('أدخل القيمة...')}
                            />
                            {isAbnormal && <p className="text-xs text-warning mt-1">⚠️ {i18n.t('القيمة خارج النطاق الطبيعي')}</p>}
                          </div>
                          <button type="button" onClick={() => removeCustomType(ct.id)} className="p-1.5 text-gray-400 hover:text-danger transition-colors rounded-lg hover:bg-danger-light">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ملاحظات */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {i18n.t('ملاحظات')}
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder={i18n.t('أي ملاحظات أو معلومات إضافية...')}
            rows={3}
            className="input-field resize-none"
          />
        </div>

      </form>
    </Modal>
  );
}

// ==========================================
// مكون: بطاقة مؤشرات لاعب في نمط الشبكة
// ==========================================
function PlayerVitalCard({ playerData, onView, onAdd, canEdit }) {
  const { player, latest } = playerData;

  const getStatusInfo = (status) => {
    const map = {
      ready: { get label() { return i18n.t('جاهز'); }, bg: 'bg-success-light', text: 'text-success' },
      injured: { get label() { return i18n.t('مصاب'); }, bg: 'bg-danger-light', text: 'text-danger' },
      rehab: { get label() { return i18n.t('تأهيل'); }, bg: 'bg-info-light', text: 'text-info' },
      suspended: { get label() { return i18n.t('موقوف'); }, bg: 'bg-warning-light', text: 'text-warning' },
      unknown: { get label() { return i18n.t('غير معروف'); }, bg: 'bg-gray-100', text: 'text-gray-600' },
    };
    return map[status] || map.unknown;
  };

  const statusInfo = getStatusInfo(player.status);
  const daysSince = latest
    ? dayjs().diff(dayjs(latest.recorded_at), 'day')
    : null;

  const hasAlerts = latest && (
    (latest.heart_rate && latest.heart_rate > 100) ||
    (latest.spo2 && latest.spo2 < 95) ||
    (latest.fatigue_level && latest.fatigue_level >= 8) ||
    (latest.blood_pressure_systolic && latest.blood_pressure_systolic > 140)
  );

  return (
    <div className={`card hover:shadow-lg transition-all duration-300 relative ${hasAlerts ? 'border-warning/40 border-2' : ''}`}>
      {hasAlerts && (
        <div className="absolute top-3 left-3">
          <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center animate-pulse-soft">
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      {/* رأس البطاقة */}
      <div className="flex items-start gap-3 mb-4">
        <Link to={`/players/${player.id}`}>
          <Avatar src={player.avatar_url} name={player.name} size="lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/players/${player.id}`} className="font-bold text-gray-900 hover:text-primary transition-colors truncate block">
            {player.name}
          </Link>
          <p className="text-xs text-gray-500">#{player.number} - {player.position}</p>
          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${statusInfo.bg} ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* القياسات */}
      {latest ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* معدل القلب */}
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <Heart className="w-3 h-3 text-danger" />
                <span className="text-[11px] text-gray-500">{i18n.t('معدل القلب')}</span>
              </div>
              <VitalBadge value={latest.heart_rate} type="heart_rate" compact />
              {latest.heart_rate && <span className="text-[10px] text-gray-400"> {i18n.t('ن/د')}</span>}
            </div>

            {/* SpO2 */}
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <Wind className="w-3 h-3 text-info" />
                <span className="text-[11px] text-gray-500">SpO₂</span>
              </div>
              <VitalBadge value={latest.spo2} type="spo2" compact />
              {latest.spo2 && <span className="text-[10px] text-gray-400">%</span>}
            </div>

            {/* ضغط الدم */}
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <Activity className="w-3 h-3 text-primary" />
                <span className="text-[11px] text-gray-500">{i18n.t('ضغط الدم')}</span>
              </div>
              {latest.blood_pressure_systolic ? (
                <span className="font-numbers font-semibold text-sm text-gray-900">
                  {latest.blood_pressure_systolic}/{latest.blood_pressure_diastolic || '?'}
                </span>
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </div>

            {/* مستوى التعب */}
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="flex items-center gap-1 mb-0.5">
                <Zap className="w-3 h-3 text-warning" />
                <span className="text-[11px] text-gray-500">{i18n.t('التعب')}</span>
              </div>
              <VitalBadge value={latest.fatigue_level} type="fatigue_level" compact />
              {latest.fatigue_level && <span className="text-[10px] text-gray-400">/10</span>}
            </div>
          </div>

          {/* الوزن وساعات النوم */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <Scale className="w-3 h-3" />
              {latest.weight ? `${latest.weight} ${i18n.t('كجم')}` : '—'}
            </span>
            <span className="flex items-center gap-1">
              <Moon className="w-3 h-3" />
              {latest.sleep_hours ? `${latest.sleep_hours} ${i18n.t('س')}` : '—'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {daysSince === 0 ? i18n.t('اليوم') : daysSince === 1 ? i18n.t('أمس') : i18n.t('منذ {{n}} يوم', { n: daysSince })}
            </span>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center">
          <Activity className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-xs text-gray-400">{i18n.t('لا توجد قياسات مسجلة')}</p>
        </div>
      )}

      {/* أزرار الإجراء */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        {latest && (
          <button
            onClick={() => onView(player.id)}
            className="flex-1 btn btn-ghost text-xs gap-1"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {i18n.t('الرسوم البيانية')}
          </button>
        )}
        {canEdit && (
          <button
            onClick={() => onAdd(player)}
            className="flex-1 btn btn-ghost text-xs gap-1 text-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            {i18n.t('قياس جديد')}
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// مكون: رسوم بيانية لاعب
// ==========================================
function PlayerVitalsChart({ playerId, playerName, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [activeMetric, setActiveMetric] = useState('heart_rate');

  const metrics = [
    { key: 'heart_rate', get label() { return i18n.t('معدل القلب'); }, color: '#A32D2D', icon: Heart, get unit() { return i18n.t('ن/د'); } },
    { key: 'spo2', label: 'SpO₂', color: '#185FA5', icon: Wind, unit: '%' },
    { key: 'weight', get label() { return i18n.t('الوزن'); }, color: '#1D9E75', icon: Scale, get unit() { return i18n.t('كجم'); } },
    { key: 'fatigue_level', get label() { return i18n.t('التعب'); }, color: '#854F0B', icon: Zap, unit: '/10' },
    { key: 'sleep_hours', get label() { return i18n.t('النوم'); }, color: '#6c757d', icon: Moon, get unit() { return i18n.t('س'); } },
    { key: 'temperature', get label() { return i18n.t('الحرارة'); }, color: '#3B6D11', icon: Thermometer, get unit() { return i18n.t('°م'); } },
  ];

  const fetchData = useCallback(async () => {
    if (!playerId) return;
    try {
      setLoading(true);
      const res = await vitalsApi.getPlayerVitals(playerId, { days });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      toast.error(i18n.t('حدث خطأ أثناء جلب بيانات اللاعب'));
    } finally {
      setLoading(false);
    }
  }, [playerId, days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = data?.vitals
    ? data.vitals
        .filter((v) => v[activeMetric] !== null && v[activeMetric] !== undefined)
        .map((v) => ({
          date: dayjs(v.recorded_at).format('DD/MM'),
          value: parseFloat(v[activeMetric]),
        }))
    : [];

  const activeM = metrics.find((m) => m.key === activeMetric);

  return (
    <Modal isOpen onClose={onClose} title={i18n.t('مؤشرات {{name}} الحيوية', { name: playerName })} size="xl">
      <div className="space-y-5">
        {/* Period Selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {[7, 14, 30, 60, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  days === d
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d} {i18n.t('يوم')}
              </button>
            ))}
          </div>
          {data?.stats && (
            <span className="text-sm text-gray-500">
              {data.stats.totalRecords} {i18n.t('قياس مسجل')}
            </span>
          )}
        </div>

        {/* Metrics Selector */}
        <div className="flex gap-2 flex-wrap">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeMetric === m.key
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={activeMetric === m.key ? { backgroundColor: m.color } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <Skeleton className="w-full h-64" />
        ) : chartData.length > 0 ? (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              {activeM && <activeM.icon className="w-4 h-4" style={{ color: activeM.color }} />}
              {activeM?.label} ({activeM?.unit})
            </h4>
            <div className="h-64">
              <AreaChart
                data={chartData}
                dataKey="value"
                xKey="date"
                color={activeM?.color || '#1D9E75'}
                label={activeM?.label || ''}
              />
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Activity className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">{i18n.t('لا توجد بيانات كافية لعرض الرسم البياني')}</p>
          </div>
        )}

        {/* Summary Stats */}
        {data?.stats && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { get label() { return i18n.t('معدل القلب'); }, val: data.stats.avgHeartRate, get unit() { return i18n.t('ن/د'); }, type: 'heart_rate' },
              { label: 'SpO₂', val: data.stats.avgSpo2, unit: '%', type: 'spo2' },
              { get label() { return i18n.t('الوزن'); }, val: data.stats.avgWeight, get unit() { return i18n.t('كجم'); }, type: 'weight' },
              { get label() { return i18n.t('التعب'); }, val: data.stats.avgFatigue, unit: '/10', type: 'fatigue_level' },
              { get label() { return i18n.t('النوم'); }, val: data.stats.avgSleepHours, get unit() { return i18n.t('س'); }, type: 'sleep_hours' },
              { get label() { return i18n.t('الحرارة'); }, val: data.stats.avgTemperature, get unit() { return i18n.t('°م'); }, type: 'temperature' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-[11px] text-gray-500 mb-1">{stat.label}</p>
                {stat.val !== null && stat.val !== undefined ? (
                  <p className="font-numbers font-bold text-lg text-gray-900">
                    {stat.val}
                    <span className="text-xs text-gray-400 font-normal">{stat.unit}</span>
                  </p>
                ) : (
                  <p className="text-gray-300 text-lg">—</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* History Table */}
        {data?.vitals && data.vitals.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">{i18n.t('التاريخ')}</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">{i18n.t('معدل القلب')}</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">SpO₂</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">{i18n.t('ضغط الدم')}</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">{i18n.t('الحرارة')}</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">{i18n.t('التعب')}</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">{i18n.t('النوم')}</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">{i18n.t('الوزن')}</th>
                </tr>
              </thead>
              <tbody>
                {[...data.vitals].reverse().slice(0, 10).map((v) => (
                  <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-numbers text-gray-600">
                      {dayjs(v.recorded_at).format('DD/MM/YY')}
                    </td>
                    <td className="py-2 px-3">
                      <VitalBadge value={v.heart_rate} type="heart_rate" compact />
                    </td>
                    <td className="py-2 px-3">
                      <VitalBadge value={v.spo2} type="spo2" compact />
                    </td>
                    <td className="py-2 px-3">
                      {v.blood_pressure_systolic
                        ? <span className="font-numbers text-gray-900">{v.blood_pressure_systolic}/{v.blood_pressure_diastolic || '?'}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-2 px-3">
                      <VitalBadge value={v.temperature} type="temperature" compact />
                    </td>
                    <td className="py-2 px-3">
                      <VitalBadge value={v.fatigue_level} type="fatigue_level" compact />
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-numbers text-gray-900">{v.sleep_hours ?? '—'}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-numbers text-gray-900">{v.weight ?? '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ==========================================
// الصفحة الرئيسية: المؤشرات الحيوية
// ==========================================
export default function Vitals() {
  const { hasRole } = useAuthStore();
  const canEdit = hasRole(['club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']);

  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('overview'); // overview | list
  const [players, setPlayers] = useState([]);
  const [overview, setOverview] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    player_id: searchParams.get('player_id') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  });

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vitalToEdit, setVitalToEdit] = useState(null);
  const [preselectedPlayer, setPreselectedPlayer] = useState(null);
  const [chartPlayerId, setChartPlayerId] = useState(null);
  const [chartPlayerName, setChartPlayerName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch players list
  const fetchPlayers = useCallback(async () => {
    try {
      const res = await playersApi.getAll({ limit: 200, is_active: 'true' });
      if (res.data.success) setPlayers(res.data.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }, []);

  // Fetch overview (latest vital per player)
  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vitalsApi.getOverview();
      if (res.data.success) setOverview(res.data.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
      toast.error(i18n.t('حدث خطأ أثناء جلب نظرة عامة على المؤشرات'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch vitals list for list view
  const fetchVitals = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        player_id: filters.player_id,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      };
      const res = await vitalsApi.getAll(params);
      if (res.data.success) {
        setVitals(res.data.data);
        setMeta(res.data.meta);
      }
    } catch (error) {
      console.error('Error fetching vitals:', error);
      toast.error(i18n.t('حدث خطأ أثناء جلب قائمة القياسات'));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await vitalsApi.getStats({ days: 30 });
      if (res.data.success) setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching vitals stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
    fetchStats();
  }, [fetchPlayers, fetchStats]);

  useEffect(() => {
    if (viewMode === 'overview') {
      fetchOverview();
    } else {
      fetchVitals();
    }
  }, [viewMode, fetchOverview, fetchVitals]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  };

  const handleSave = async (formData, editId) => {
    try {
      if (editId) {
        await vitalsApi.update(editId, formData);
        toast.success(i18n.t('تم تحديث القياس بنجاح'));
      } else {
        await vitalsApi.create(formData);
        toast.success(i18n.t('تم تسجيل المؤشرات الحيوية بنجاح'));
      }
      setIsFormOpen(false);
      setVitalToEdit(null);
      setPreselectedPlayer(null);
      fetchOverview();
      fetchStats();
      if (viewMode === 'list') fetchVitals();
    } catch (error) {
      console.error('Error saving vital:', error);
      toast.error(error.response?.data?.message || i18n.t('حدث خطأ أثناء حفظ القياس'));
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await vitalsApi.delete(deleteTarget.id);
      toast.success(i18n.t('تم حذف القياس بنجاح'));
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchOverview();
      fetchStats();
      if (viewMode === 'list') fetchVitals();
    } catch (error) {
      console.error('Error deleting vital:', error);
      toast.error(error.response?.data?.message || i18n.t('حدث خطأ أثناء حذف القياس'));
    }
  };

  const handleAddForPlayer = (player) => {
    setPreselectedPlayer(player);
    setVitalToEdit(null);
    setIsFormOpen(true);
  };

  const handleViewCharts = (playerId) => {
    const p = players.find((x) => x.id === playerId) || overview.find((o) => o.player.id === playerId)?.player;
    setChartPlayerId(playerId);
    setChartPlayerName(p?.name || '');
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  // فلترة الـ overview
  const filteredOverview = overview.filter((item) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!item.player.name.toLowerCase().includes(q) &&
          !String(item.player.number).includes(q)) {
        return false;
      }
    }
    if (filters.player_id && String(item.player.id) !== String(filters.player_id)) {
      return false;
    }
    return true;
  });

  // إحصائيات نظرة عامة
  const overviewStats = {
    total: overview.length,
    measured: overview.filter((o) => o.latest).length,
    alerts: overview.filter(
      (o) =>
        o.latest &&
        ((o.latest.heart_rate && o.latest.heart_rate > 100) ||
          (o.latest.spo2 && o.latest.spo2 < 95) ||
          (o.latest.fatigue_level && o.latest.fatigue_level >= 8) ||
          (o.latest.blood_pressure_systolic && o.latest.blood_pressure_systolic > 140))
    ).length,
    noData: overview.filter((o) => !o.latest).length,
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-primary" />
            <span>{i18n.t('المؤشرات الحيوية')}</span>
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              ({overview.length} {i18n.t('لاعب')})
            </span>
          </div>
        }
        subtitle={i18n.t('تتبع وتحليل المؤشرات الحيوية لجميع اللاعبين')}
      >
        <div className="flex items-center gap-2">
          <Button
            variant={showStats ? 'primary' : 'outline'}
            onClick={() => setShowStats(!showStats)}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {showStats ? i18n.t('إخفاء الإحصائيات') : i18n.t('عرض الإحصائيات')}
          </Button>
          <Button
              onClick={() => { setVitalToEdit(null); setPreselectedPlayer(null); setIsFormOpen(true); }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {i18n.t('تسجيل قياس جديد')}
            </Button>
        </div>
      </PageHeader>

      {/* ==========================================
          لوحة الإحصائيات العليا
         ========================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-primary-50 to-white border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{i18n.t('إجمالي اللاعبين')}</p>
              <p className="text-2xl font-bold text-primary font-numbers">{overviewStats.total}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-success-light to-white border-success/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{i18n.t('تم قياسهم')}</p>
              <p className="text-2xl font-bold text-success font-numbers">{overviewStats.measured}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-warning-light to-white border-warning/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{i18n.t('تنبيهات نشطة')}</p>
              <p className="text-2xl font-bold text-warning font-numbers">{overviewStats.alerts}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-gray-50 to-white border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{i18n.t('بلا بيانات')}</p>
              <p className="text-2xl font-bold text-gray-700 font-numbers">{overviewStats.noData}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          لوحة الإحصائيات التفصيلية
         ========================================== */}
      {showStats && stats && (
        <div className="card mb-6 border-2 border-primary/10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {i18n.t('متوسطات المؤشرات الحيوية للفريق (آخر 30 يوم)')}
            </h3>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {stats.measuredPlayersCount} {i18n.t('لاعب')}
            </Badge>
          </div>

          {statsLoading ? (
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : (
            <>
              {/* متوسط المؤشرات */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
                {[
                  { label: i18n.t('معدل القلب'), val: stats.averages?.avgHeartRate, unit: i18n.t('ن/د'), icon: Heart, color: 'text-danger', bg: 'bg-danger-light' },
                  { label: 'SpO₂', val: stats.averages?.avgSpo2, unit: '%', icon: Wind, color: 'text-info', bg: 'bg-info-light' },
                  { label: i18n.t('الوزن'), val: stats.averages?.avgWeight, unit: i18n.t('كجم'), icon: Scale, color: 'text-primary', bg: 'bg-primary-50' },
                  { label: i18n.t('مستوى التعب'), val: stats.averages?.avgFatigue, unit: '/10', icon: Zap, color: 'text-warning', bg: 'bg-warning-light' },
                  { label: i18n.t('ساعات النوم'), val: stats.averages?.avgSleepHours, unit: i18n.t('س'), icon: Moon, color: 'text-gray-600', bg: 'bg-gray-100' },
                  { label: i18n.t('الحرارة'), val: stats.averages?.avgTemperature, unit: i18n.t('°م'), icon: Thermometer, color: 'text-success', bg: 'bg-success-light' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className={`rounded-xl p-4 ${item.bg}`}>
                      <div className={`flex items-center gap-1.5 mb-2 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-semibold">{item.label}</span>
                      </div>
                      <p className={`text-2xl font-bold font-numbers ${item.color}`}>
                        {item.val ? parseFloat(item.val).toFixed(1) : '—'}
                        {item.val && <span className="text-sm font-normal opacity-70"> {item.unit}</span>}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* تنبيهات القيم الشاذة */}
              {stats.alerts && Object.values(stats.alerts).some((v) => v > 0) && (
                <div className="bg-warning-light/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-warning mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {i18n.t('تنبيهات القيم غير الطبيعية (آخر 30 يوم)')}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: i18n.t('معدل قلب مرتفع (>100)'), val: stats.alerts.highHeartRate, icon: Heart },
                      { label: i18n.t('SpO₂ منخفض (<95%)'), val: stats.alerts.lowSpo2, icon: Wind },
                      { label: i18n.t('ضغط دم مرتفع (>140)'), val: stats.alerts.highBp, icon: Activity },
                      { label: i18n.t('تعب شديد (≥8)'), val: stats.alerts.highFatigue, icon: Zap },
                    ].filter((a) => a.val > 0).map((alert) => {
                      const Icon = alert.icon;
                      return (
                        <div key={alert.label} className="bg-white rounded-lg p-3 border border-warning/20">
                          <div className="flex items-center gap-1.5 text-warning mb-1">
                            <Icon className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{alert.label}</span>
                          </div>
                          <p className="text-xl font-bold font-numbers text-danger">{alert.val}</p>
                          <p className="text-xs text-gray-400">{i18n.t('قياس')}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* اتجاه معدل القلب */}
              {stats.hrTrend && stats.hrTrend.length > 1 && (
                <div className="mt-4 bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-danger" />
                    {i18n.t('اتجاه متوسط معدل القلب (آخر 7 أيام)')}
                  </h4>
                  <div className="h-40">
                    <LineChart
                      data={stats.hrTrend.map((d) => ({
                        date: dayjs(d.date).format('DD/MM'),
                        value: d.avgHr ? parseFloat(d.avgHr).toFixed(0) : null,
                      }))}
                      dataKey="value"
                      xKey="date"
                      color="#A32D2D"
                      label={i18n.t('متوسط معدل القلب')}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ==========================================
          شريط الفلترة والبحث
         ========================================== */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* البحث */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={i18n.t('ابحث باسم اللاعب أو رقمه...')}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pr-10"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* فلتر اللاعب */}
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.player_id}
                onChange={(e) => handleFilterChange('player_id', e.target.value)}
                className="input-field pr-10 min-w-[150px] appearance-none cursor-pointer"
              >
                <option value="">{i18n.t('جميع اللاعبين')}</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* فلتر التاريخ */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="input-field text-sm font-numbers"
                placeholder={i18n.t('من')}
              />
              <span className="text-gray-400 text-sm">—</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="input-field text-sm font-numbers"
                placeholder={i18n.t('إلى')}
              />
            </div>

            {/* مسح الفلاتر */}
            {(filters.search || filters.player_id || filters.dateFrom || filters.dateTo) && (
              <button
                onClick={() => {
                  setFilters({ search: '', player_id: '', dateFrom: '', dateTo: '' });
                  setSearchParams(new URLSearchParams());
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-danger hover:bg-danger-light rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                {i18n.t('مسح')}
              </button>
            )}

            {/* تبديل عرض */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-2 text-sm transition-colors ${viewMode === 'overview' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title={i18n.t('عرض الشبكة')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title={i18n.t('عرض القائمة')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          عرض الشبكة (Overview per player)
         ========================================== */}
      {viewMode === 'overview' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filteredOverview.length === 0 ? (
            <div className="card text-center py-16">
              <Activity className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t('لا توجد نتائج')}</h3>
              <p className="text-gray-500">{i18n.t('لا يوجد لاعبون مطابقون لمعايير البحث')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOverview.map((item) => (
                <PlayerVitalCard
                  key={item.player.id}
                  playerData={item}
                  onView={handleViewCharts}
                  onAdd={handleAddForPlayer}
                  canEdit={canEdit}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ==========================================
          عرض القائمة التفصيلية
         ========================================== */}
      {viewMode === 'list' && (
        <>
          {loading ? (
            <div className="card space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : vitals.length === 0 ? (
            <div className="card text-center py-16">
              <ClipboardList className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t('لا توجد قياسات مسجلة')}</h3>
              <p className="text-gray-500 mb-6">{i18n.t('لم يتم تسجيل أي قياسات حيوية حتى الآن')}</p>
              {canEdit && (
                <Button
                  onClick={() => { setVitalToEdit(null); setIsFormOpen(true); }}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {i18n.t('تسجيل أول قياس')}
                </Button>
              )}
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">{i18n.t('اللاعب')}</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">{i18n.t('التاريخ')}</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                        <Heart className="w-3.5 h-3.5 text-danger inline ml-1" />
                        {i18n.t('Q. القلب')}
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                        <Wind className="w-3.5 h-3.5 text-info inline ml-1" />
                        SpO₂
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                        <Activity className="w-3.5 h-3.5 text-primary inline ml-1" />
                        {i18n.t('ضغط الدم')}
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                        <Thermometer className="w-3.5 h-3.5 text-warning inline ml-1" />
                        {i18n.t('الحرارة')}
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                        <Zap className="w-3.5 h-3.5 text-warning inline ml-1" />
                        {i18n.t('التعب')}
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                        <Moon className="w-3.5 h-3.5 text-info inline ml-1" />
                        {i18n.t('النوم')}
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                        <Scale className="w-3.5 h-3.5 text-success inline ml-1" />
                        {i18n.t('الوزن')}
                      </th>
                      {canEdit && (
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">{i18n.t('إجراءات')}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {vitals.map((vital) => (
                      <tr key={vital.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            to={`/players/${vital.player_id}`}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            <Avatar src={vital.player?.avatar_url} name={vital.player?.name} size="sm" />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{vital.player?.name}</p>
                              <p className="text-xs text-gray-400">#{vital.player?.number}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-numbers text-gray-700">
                            {dayjs(vital.recorded_at).format('DD/MM/YYYY')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {dayjs(vital.recorded_at).format('HH:mm')}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <VitalBadge value={vital.heart_rate} type="heart_rate" compact />
                          {vital.heart_rate && <span className="text-xs text-gray-400 mr-0.5">{i18n.t('ن/د')}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <VitalBadge value={vital.spo2} type="spo2" compact />
                          {vital.spo2 && <span className="text-xs text-gray-400 mr-0.5">%</span>}
                        </td>
                        <td className="py-3 px-4">
                          {vital.blood_pressure_systolic ? (
                            <span className="font-numbers text-sm text-gray-900">
                              {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic || '?'}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <VitalBadge value={vital.temperature} type="temperature" compact />
                          {vital.temperature && <span className="text-xs text-gray-400 mr-0.5">{i18n.t('°م')}</span>}
                        </td>
                        <td className="py-3 px-4">
                          {vital.fatigue_level ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    vital.fatigue_level >= 8
                                      ? 'bg-danger'
                                      : vital.fatigue_level >= 6
                                      ? 'bg-warning'
                                      : 'bg-success'
                                  }`}
                                  style={{ width: `${vital.fatigue_level * 10}%` }}
                                />
                              </div>
                              <VitalBadge value={vital.fatigue_level} type="fatigue_level" compact />
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-numbers text-sm text-gray-700">
                            {vital.sleep_hours ?? <span className="text-gray-300">—</span>}
                          </span>
                          {vital.sleep_hours && <span className="text-xs text-gray-400"> {i18n.t('س')}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-numbers text-sm text-gray-700">
                            {vital.weight ?? <span className="text-gray-300">—</span>}
                          </span>
                          {vital.weight && <span className="text-xs text-gray-400"> {i18n.t('كجم')}</span>}
                        </td>
                        {canEdit && (
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewCharts(vital.player_id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                                title={i18n.t('الرسوم البيانية')}
                              >
                                <BarChart3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setVitalToEdit(vital); setIsFormOpen(true); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                                title={i18n.t('تعديل')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setDeleteTarget(vital); setIsDeleteOpen(true); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-danger hover:bg-danger-light transition-colors"
                                title={i18n.t('حذف')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {i18n.t('عرض')} {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} {i18n.t('من')} {meta.total}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(meta.page - 1)}
                      disabled={meta.page <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-numbers transition-colors ${
                            page === meta.page
                              ? 'bg-primary text-white'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(meta.page + 1)}
                      disabled={meta.page >= meta.totalPages}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ==========================================
          Modals
         ========================================== */}

      {/* نموذج إضافة / تعديل قياس */}
      <VitalFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setVitalToEdit(null); setPreselectedPlayer(null); }}
        onSave={handleSave}
        players={preselectedPlayer ? [preselectedPlayer, ...players.filter((p) => p.id !== preselectedPlayer.id)] : players}
        vitalToEdit={vitalToEdit
          ? { ...vitalToEdit, player_id: vitalToEdit.player_id }
          : preselectedPlayer
          ? { player_id: preselectedPlayer.id }
          : null}
      />

      {/* رسوم بيانية لاعب */}
      {chartPlayerId && (
        <PlayerVitalsChart
          playerId={chartPlayerId}
          playerName={chartPlayerName}
          onClose={() => { setChartPlayerId(null); setChartPlayerName(''); }}
        />
      )}

      {/* تأكيد الحذف */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
        title={i18n.t('تأكيد حذف القياس')}
        size="sm"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-danger" />
          </div>
          <p className="text-gray-600 mb-2">
            {i18n.t('هل أنت متأكد من حذف هذا القياس؟')}
          </p>
          {deleteTarget && (
            <p className="text-sm text-gray-400 mb-6">
              {i18n.t('اللاعب')}: <span className="font-semibold text-gray-700">{deleteTarget.player?.name}</span>
              {' — '}
              <span className="font-numbers">{dayjs(deleteTarget.recorded_at).format('DD/MM/YYYY')}</span>
            </p>
          )}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
              className="flex-1"
            >
              {i18n.t('إلغاء')}
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              className="flex-1"
            >
              {i18n.t('حذف')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
