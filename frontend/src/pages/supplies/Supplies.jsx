import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { Pill, Plus, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Clock, Calendar, MapPin, Package, RefreshCw, X, List, LayoutGrid, ArrowUpCircle, ArrowDownCircle, ShieldCheck, TrendingDown, CheckCircle2, Tag, BarChart3, History, AlertCircle, Boxes, FlaskConical, Bandage, Syringe, Recycle } from 'lucide-react';
import { equipmentApi } from '../../api/endpoints/equipment';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';
import useAuthStore from '../../store/authStore';
dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');
dayjs.extend(relativeTime);

// ==========================================
// ثوابت
// ==========================================
const SUPPLY_CATEGORIES = [{
  value: 'medication',
  label: i18n.t("\u0623\u062F\u0648\u064A\u0629"),
  color: 'text-danger bg-danger-light',
  border: 'border-danger/30',
  icon: Pill
}, {
  value: 'topical',
  label: i18n.t("\u0645\u0648\u0636\u0639\u064A \u0648\u0647\u0644\u0627\u0645\u064A\u0627\u062A"),
  color: 'text-warning bg-warning-light',
  border: 'border-warning/30',
  icon: FlaskConical
}, {
  value: 'supplement',
  label: i18n.t("\u0645\u0643\u0645\u0644\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629"),
  color: 'text-success bg-success-light',
  border: 'border-success/30',
  icon: Syringe
}, {
  value: 'consumable',
  label: i18n.t("\u0645\u0633\u062A\u0647\u0644\u0643\u0627\u062A \u0637\u0628\u064A\u0629"),
  color: 'text-info bg-info-light',
  border: 'border-info/30',
  icon: Bandage
}, {
  value: 'equipment_consumable',
  label: i18n.t("\u0645\u0633\u062A\u0647\u0644\u0643\u0627\u062A \u0645\u0639\u062F\u0627\u062A"),
  color: 'text-primary bg-primary-50',
  border: 'border-primary/20',
  icon: Boxes
}];
const TRANSACTION_TYPES = [{
  value: 'dispense',
  label: i18n.t("\u0635\u0631\u0641"),
  color: 'text-danger',
  bg: 'bg-danger-light',
  icon: ArrowDownCircle
}, {
  value: 'restock',
  label: i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u062E\u0632\u0648\u0646"),
  color: 'text-success',
  bg: 'bg-success-light',
  icon: ArrowUpCircle
}, {
  value: 'adjustment',
  label: i18n.t("\u062A\u0639\u062F\u064A\u0644"),
  color: 'text-warning',
  bg: 'bg-warning-light',
  icon: ArrowUpCircle
}, {
  value: 'expired_disposal',
  label: i18n.t("\u0625\u062A\u0644\u0627\u0641 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629"),
  color: 'text-gray-500',
  bg: 'bg-gray-100',
  icon: Recycle
}];
function getCategoryInfo(cat) {
  return SUPPLY_CATEGORIES.find(c => c.value === cat) || SUPPLY_CATEGORIES[3];
}
function getTxInfo(type) {
  return TRANSACTION_TYPES.find(t => t.value === type) || TRANSACTION_TYPES[0];
}
function formatDate(date) {
  if (!date) return '—';
  return dayjs(date).format('DD/MM/YYYY');
}
function formatDateTime(date) {
  if (!date) return '—';
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

// ==========================================
// مكون: بطاقة إحصاء
// ==========================================
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subLabel,
  onClick,
  highlight
}) {
  return <div className={`card flex items-center gap-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''} ${highlight ? 'ring-2 ring-primary' : ''}`} onClick={onClick}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold font-numbers text-gray-900">{value ?? '—'}</p>
        {subLabel && <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>}
      </div>
    </div>;
}

// ==========================================
// نموذج إضافة / تعديل مستلزم
// ==========================================
function SupplyFormModal({
  isOpen,
  onClose,
  onSave,
  supplyToEdit = null
}) {
  const INITIAL = {
    name: '',
    category: 'consumable',
    unit: '',
    total_quantity: '',
    reorder_level: 10,
    expiry_date: '',
    storage_location: '',
    purpose: '',
    manufacturer: '',
    barcode: '',
    is_controlled_substance: false,
    requires_prescription: false,
    notes: ''
  };
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  useEffect(() => {
    if (!isOpen) return;
    if (supplyToEdit) {
      setForm({
        name: supplyToEdit.name || '',
        category: supplyToEdit.category || 'consumable',
        unit: supplyToEdit.unit || '',
        total_quantity: supplyToEdit.total_quantity ?? '',
        reorder_level: supplyToEdit.reorder_level ?? 10,
        expiry_date: supplyToEdit.expiry_date || '',
        storage_location: supplyToEdit.storage_location || '',
        purpose: supplyToEdit.purpose || '',
        manufacturer: supplyToEdit.manufacturer || '',
        barcode: supplyToEdit.barcode || '',
        is_controlled_substance: supplyToEdit.is_controlled_substance || false,
        requires_prescription: supplyToEdit.requires_prescription || false,
        notes: supplyToEdit.notes || ''
      });
    } else {
      setForm(INITIAL);
    }
    setActiveTab('basic');
  }, [isOpen, supplyToEdit]);
  const set = (k, v) => setForm(p => ({
    ...p,
    [k]: v
  }));
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      toast.error(i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645 \u0648\u0627\u0644\u0641\u0626\u0629 \u0645\u0637\u0644\u0648\u0628\u0627\u0646"));
      return;
    }
    setSaving(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) payload[k] = v;
      });
      await onSave(payload, supplyToEdit?.id);
      onClose();
    } catch (_) {} finally {
      setSaving(false);
    }
  };
  const available = Math.max(0, parseInt(form.total_quantity) || 0);
  const isLow = available <= (parseInt(form.reorder_level) || 10) && form.total_quantity !== '';
  const TABS = [{
    id: 'basic',
    label: i18n.t("\u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629")
  }, {
    id: 'storage',
    label: i18n.t("\u0627\u0644\u062A\u062E\u0632\u064A\u0646 \u0648\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629")
  }, {
    id: 'flags',
    label: i18n.t("\u0625\u0634\u0627\u0631\u0627\u062A \u062E\u0627\u0635\u0629")
  }];
  const supplyFooter = <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
      <Button form="supply-form" type="submit" loading={saving} className="flex-1 gap-2">
        <CheckCircle2 className="w-4 h-4" />
        {supplyToEdit ? i18n.t("\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645")}
      </Button>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={supplyToEdit ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u0644\u0632\u0645 / \u062F\u0648\u0627\u0621 \u062C\u062F\u064A\u062F")} size="lg" footer={supplyFooter}>
      <form id="supply-form" onSubmit={handleSubmit} className="space-y-5">
        {/* التبويبات */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(t => <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === t.id ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>)}
        </div>

        {/* المعلومات الأساسية */}
        {activeTab === 'basic' && <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0627\u0633\u0645")}<span className="text-danger">*</span>
                </label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0628\u0646\u0627\u062F\u0648\u0644\u060C \u0634\u0631\u064A\u0637 \u0644\u0627\u0635\u0642\u060C \u0645\u0631\u0647\u0645 \u0641\u0648\u0644\u062A\u0627\u0631\u064A\u0646...")} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0641\u0626\u0629")}<span className="text-danger">*</span>
                </label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field" required>
                  {SUPPLY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0648\u062D\u062F\u0629 \u0627\u0644\u0642\u064A\u0627\u0633")}</label>
                <input type="text" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder={i18n.t("\u062D\u0628\u0629\u060C \u0639\u0644\u0628\u0629\u060C \u0632\u062C\u0627\u062C\u0629\u060C \u0644\u0641\u0629...")} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629")}</label>
                <input type="number" value={form.total_quantity} onChange={e => set('total_quantity', e.target.value)} placeholder="0" min="0" className="input-field font-numbers" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u062D\u062F \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0637\u0644\u0628")}</label>
                <input type="number" value={form.reorder_level} onChange={e => set('reorder_level', e.target.value)} placeholder="10" min="0" className="input-field font-numbers" />
              </div>
              {form.total_quantity !== '' && <div className="md:col-span-2">
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${isLow ? 'bg-warning-light border-warning/30' : 'bg-success-light border-success/30'}`}>
                    <Package className={`w-4 h-4 ${isLow ? 'text-warning' : 'text-success'}`} />
                    <span className={`text-sm font-semibold ${isLow ? 'text-warning' : 'text-success'}`}>{i18n.t("\u0627\u0644\u0645\u062A\u0627\u062D:")}{available} {form.unit || i18n.t("\u0648\u062D\u062F\u0629")}
                      {isLow && i18n.t(" \u2014 \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0645\u0646\u062E\u0641\u0636\u060C \u064A\u064F\u0646\u0635\u062D \u0628\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0637\u0644\u0628")}
                    </span>
                  </div>
                </div>}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0634\u0631\u0643\u0629 \u0627\u0644\u0645\u0635\u0646\u0639\u0629")}</label>
                <input type="text" value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} placeholder={i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0634\u0631\u0643\u0629")} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u063A\u0631\u0636 / \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645")}</label>
                <input type="text" value={form.purpose} onChange={e => set('purpose', e.target.value)} placeholder={i18n.t("\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u062A\u0648\u0631\u0645 \u0648\u0627\u0644\u0622\u0644\u0627\u0645...")} className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder={i18n.t("\u0623\u064A \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629...")} className="input-field resize-none" />
            </div>
          </div>}

        {/* التخزين والصلاحية */}
        {activeTab === 'storage' && <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629")}</label>
                <input type="date" value={form.expiry_date} onChange={e => set('expiry_date', e.target.value)} className="input-field font-numbers" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />{i18n.t("\u0645\u0648\u0642\u0639 \u0627\u0644\u062A\u062E\u0632\u064A\u0646")}</label>
                <input type="text" value={form.storage_location} onChange={e => set('storage_location', e.target.value)} placeholder={i18n.t("\u062E\u0632\u0627\u0646\u0629 \u0627\u0644\u062F\u0648\u0627\u0621 \u0631\u0642\u0645 1\u060C \u0631\u0641 B...")} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F")}</label>
                <input type="text" value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="XXXXXXXXXX" className="input-field font-numbers" />
              </div>
              <div className="md:col-span-2 bg-info-light border border-info/20 rounded-xl p-4">
                <p className="text-sm text-info font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{i18n.t("\u0633\u064A\u062A\u0645 \u062A\u0646\u0628\u064A\u0647\u0643 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0639\u0646\u062F \u0627\u0642\u062A\u0631\u0627\u0628 \u062A\u0627\u0631\u064A\u062E \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 (30 \u064A\u0648\u0645\u0627\u064B) \u0623\u0648 \u0627\u0646\u062E\u0641\u0627\u0636 \u0627\u0644\u0645\u062E\u0632\u0648\u0646.")}</p>
              </div>
            </div>
          </div>}

        {/* إشارات خاصة */}
        {activeTab === 'flags' && <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-danger-light border border-danger/20 rounded-xl">
              <input type="checkbox" id="is_controlled_substance" checked={form.is_controlled_substance} onChange={e => set('is_controlled_substance', e.target.checked)} className="w-4 h-4 accent-danger mt-0.5 flex-shrink-0" />
              <label htmlFor="is_controlled_substance" className="cursor-pointer">
                <p className="text-sm font-bold text-danger">{i18n.t("\u0645\u0627\u062F\u0629 \u062E\u0627\u0636\u0639\u0629 \u0644\u0644\u0631\u0642\u0627\u0628\u0629")}</p>
                <p className="text-xs text-danger/70 mt-0.5">{i18n.t("\u0627\u0644\u0645\u062E\u062F\u0631\u0627\u062A \u0623\u0648 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062A\u064A \u062A\u062A\u0637\u0644\u0628 \u062A\u0633\u062C\u064A\u0644\u0627\u064B \u062E\u0627\u0635\u0627\u064B")}</p>
              </label>
            </div>
            <div className="flex items-start gap-3 p-4 bg-warning-light border border-warning/20 rounded-xl">
              <input type="checkbox" id="requires_prescription" checked={form.requires_prescription} onChange={e => set('requires_prescription', e.target.checked)} className="w-4 h-4 accent-warning mt-0.5 flex-shrink-0" />
              <label htmlFor="requires_prescription" className="cursor-pointer">
                <p className="text-sm font-bold text-warning">{i18n.t("\u064A\u062A\u0637\u0644\u0628 \u0648\u0635\u0641\u0629 \u0637\u0628\u064A\u0629")}</p>
                <p className="text-xs text-warning/70 mt-0.5">{i18n.t("\u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u062A\u064A \u0644\u0627 \u062A\u064F\u0639\u0637\u0649 \u0625\u0644\u0627 \u0628\u0648\u0635\u0641\u0629 \u0637\u0628\u064A\u0628 \u0645\u0631\u062E\u0635")}</p>
              </label>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm text-gray-500">{i18n.t("\u26A0\uFE0F \u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u062D\u0641\u0627\u0638 \u0639\u0644\u0649 \u0633\u062C\u0644 \u062F\u0642\u064A\u0642 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0648\u0627\u062F \u0627\u0644\u062E\u0627\u0636\u0639\u0629 \u0644\u0644\u0631\u0642\u0627\u0628\u0629 \u0648\u0641\u0642\u0627\u064B \u0644\u0623\u0646\u0638\u0645\u0629 \u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u0635\u062D\u0629.")}</div>
          </div>}

      </form>
    </Modal>;
}

// ==========================================
// نموذج حركة المخزون (صرف / إضافة / إتلاف)
// ==========================================
function TransactionModal({
  isOpen,
  onClose,
  supply,
  onSave,
  players = []
}) {
  const [form, setForm] = useState({
    transaction_type: 'dispense',
    quantity: '',
    notes: '',
    player_id: '',
    reason: '',
    dose: '',
    duration: '',
    doctor: ''
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (isOpen) setForm({
      transaction_type: 'dispense',
      quantity: '',
      notes: '',
      player_id: '',
      reason: '',
      dose: '',
      duration: '',
      doctor: ''
    });
  }, [isOpen]);
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.quantity || parseInt(form.quantity) <= 0) {
      toast.error(i18n.t("\u0627\u0644\u0643\u0645\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629 \u0648\u0623\u0643\u0628\u0631 \u0645\u0646 \u0635\u0641\u0631"));
      return;
    }
    setSaving(true);
    try {
      const extraNotes = [form.reason && `${i18n.t('السبب')}: ${form.reason}`, form.dose && `${i18n.t('الجرعة')}: ${form.dose}`, form.duration && `${i18n.t('المدة')}: ${form.duration}`, form.doctor && `${i18n.t('الطبيب')}: ${form.doctor}`, form.notes].filter(Boolean).join(' | ');
      await onSave({
        ...form,
        quantity: parseInt(form.quantity),
        notes: extraNotes
      });
      onClose();
    } catch (_) {} finally {
      setSaving(false);
    }
  };
  const available = supply?.total_quantity || 0;
  const TX_OPTIONS = [{
    type: 'dispense',
    label: i18n.t("\u0635\u0631\u0641"),
    desc: i18n.t("\u062A\u0633\u0644\u064A\u0645 \u0644\u0627\u0639\u0628 \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0627\u0645"),
    icon: ArrowDownCircle,
    color: 'border-danger bg-danger-light text-danger',
    selected: 'border-danger border-2 bg-danger-light'
  }, {
    type: 'restock',
    label: i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u062E\u0632\u0648\u0646"),
    desc: i18n.t("\u0627\u0633\u062A\u0644\u0627\u0645 \u0634\u062D\u0646\u0629 \u062C\u062F\u064A\u062F\u0629"),
    icon: ArrowUpCircle,
    color: 'border-success bg-success-light text-success',
    selected: 'border-success border-2 bg-success-light'
  }, {
    type: 'expired_disposal',
    label: i18n.t("\u0625\u062A\u0644\u0627\u0641 \u0645\u0646\u062A\u0647\u064A"),
    desc: i18n.t("\u062A\u0644\u0641 \u0623\u0648 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629"),
    icon: Recycle,
    color: 'border-gray-300 bg-gray-50 text-gray-500',
    selected: 'border-gray-400 border-2 bg-gray-100'
  }];
  const modalFooter = <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
      <Button form="tx-form" type="submit" loading={saving} className="flex-1 gap-2">
        <CheckCircle2 className="w-4 h-4" />{i18n.t("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0639\u0645\u0644\u064A\u0629")}</Button>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={`${i18n.t('حركة مخزون')}: ${supply?.name || ''}`} size="md" footer={modalFooter}>
      <form id="tx-form" onSubmit={handleSubmit} className="space-y-4">
        {/* نوع العملية */}
        <div className="grid grid-cols-3 gap-2">
          {TX_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const isSelected = form.transaction_type === opt.type;
          return <button key={opt.type} type="button" onClick={() => setForm(p => ({
            ...p,
            transaction_type: opt.type
          }))} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${isSelected ? opt.selected : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <Icon className={`w-5 h-5 ${isSelected ? '' : 'text-gray-400'}`} />
                <span className={`text-xs font-bold ${isSelected ? '' : 'text-gray-500'}`}>{opt.label}</span>
                <span className={`text-[10px] text-center leading-tight ${isSelected ? '' : 'text-gray-400'}`}>{opt.desc}</span>
              </button>;
        })}
        </div>

        {/* المتاح حالياً */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-200">
          <span className="text-sm text-gray-600">{i18n.t("\u0627\u0644\u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B:")}</span>
          <span className={`font-numbers text-lg font-bold ${available <= (supply?.reorder_level || 10) ? 'text-warning' : 'text-success'}`}>
            {available} {supply?.unit || ''}
          </span>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0643\u0645\u064A\u0629")}<span className="text-danger">*</span>
          </label>
          <input type="number" value={form.quantity} onChange={e => setForm(p => ({
          ...p,
          quantity: e.target.value
        }))} placeholder="0" min="1" max={form.transaction_type !== 'restock' ? available : undefined} className="input-field font-numbers" required />
        </div>

        {/* اختيار لاعب (عند الصرف) */}
        {form.transaction_type === 'dispense' && players.length > 0 && <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 \u0627\u0644\u0645\u0633\u062A\u0644\u0645")}<span className="text-gray-400 font-normal">{i18n.t("(\u0627\u062E\u062A\u064A\u0627\u0631\u064A)")}</span>
            </label>
            <select value={form.player_id} onChange={e => setForm(p => ({
          ...p,
          player_id: e.target.value
        }))} className="input-field">
              <option value="">{i18n.t("-- \u0644\u0627\u0639\u0628 \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0639\u0627\u0645 --")}</option>
              {players.map(pl => <option key={pl.id} value={pl.id}>{pl.name} {pl.number ? `(#${pl.number})` : ''}</option>)}
            </select>
          </div>}

        {/* حقول إضافية عند الصرف */}
        {form.transaction_type === 'dispense' && <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0633\u0628\u0628 \u0627\u0644\u0635\u0631\u0641")}</label>
              <select value={form.reason} onChange={e => setForm(p => ({
            ...p,
            reason: e.target.value
          }))} className="input-field">
                <option value="">{i18n.t("-- \u0627\u062E\u062A\u0631 \u0627\u0644\u0633\u0628\u0628 --")}</option>
                <option value={i18n.t("\u0639\u0644\u0627\u062C \u0625\u0635\u0627\u0628\u0629")}>{i18n.t("\u0639\u0644\u0627\u062C \u0625\u0635\u0627\u0628\u0629")}</option>
                <option value={i18n.t("\u0648\u0642\u0627\u0626\u064A")}>{i18n.t("\u0648\u0642\u0627\u0626\u064A")}</option>
                <option value={i18n.t("\u0628\u0631\u0646\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644")}>{i18n.t("\u0628\u0631\u0646\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644")}</option>
                <option value={i18n.t("\u0635\u064A\u0627\u0646\u0629 \u062F\u0648\u0631\u064A\u0629")}>{i18n.t("\u0635\u064A\u0627\u0646\u0629 \u062F\u0648\u0631\u064A\u0629")}</option>
                <option value={i18n.t("\u0622\u062E\u0631")}>{i18n.t("\u0622\u062E\u0631")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062C\u0631\u0639\u0629 / \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u0627\u062A")}</label>
              <input type="text" value={form.dose} onChange={e => setForm(p => ({
            ...p,
            dose: e.target.value
          }))} placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0642\u0631\u0635 \u0645\u0631\u062A\u064A\u0646 \u064A\u0648\u0645\u064A\u0627\u064B")} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0645\u062F\u0629")}</label>
              <input type="text" value={form.duration} onChange={e => setForm(p => ({
            ...p,
            duration: e.target.value
          }))} placeholder={i18n.t("\u0645\u062B\u0627\u0644: 7 \u0623\u064A\u0627\u0645")} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0633\u0624\u0648\u0644")}</label>
              <input type="text" value={form.doctor} onChange={e => setForm(p => ({
            ...p,
            doctor: e.target.value
          }))} placeholder={i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0637\u0628\u064A\u0628")} className="input-field" />
            </div>
          </div>}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629")}</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({
          ...p,
          notes: e.target.value
        }))} rows={2} placeholder={i18n.t("\u0623\u064A \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0623\u062E\u0631\u0649...")} className="input-field resize-none" />
        </div>
      </form>
    </Modal>;
}

// ==========================================
// نافذة تفاصيل مستلزم
// ==========================================
function SupplyDetailModal({
  isOpen,
  onClose,
  supply,
  onEdit,
  onTransaction,
  canEdit
}) {
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [txPage, setTxPage] = useState(1);
  const [txMeta, setTxMeta] = useState(null);
  useEffect(() => {
    if (!isOpen || !supply) {
      setActiveTab('info');
      return;
    }
  }, [isOpen, supply]);
  const fetchTransactions = useCallback(async () => {
    if (!supply) return;
    setLoadingTx(true);
    try {
      const res = await equipmentApi.getSupplyTransactions(supply.id, {
        page: txPage,
        limit: 10
      });
      if (res.data.success) {
        setTransactions(res.data.data);
        setTxMeta(res.data.meta);
      }
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A"));
    } finally {
      setLoadingTx(false);
    }
  }, [supply, txPage]);
  useEffect(() => {
    if (activeTab === 'history') fetchTransactions();
  }, [activeTab, fetchTransactions]);
  if (!supply) return null;
  const catInfo = getCategoryInfo(supply.category);
  const CatIcon = catInfo.icon;
  const available = supply.total_quantity || 0;
  const isLow = available <= (supply.reorder_level || 10);
  const isExpired = supply.expiry_date && dayjs(supply.expiry_date).isBefore(dayjs());
  const isExpiringSoon = supply.expiry_date && !isExpired && dayjs(supply.expiry_date).isBefore(dayjs().add(30, 'day'));
  const stockPercent = Math.min(100, Math.round(available / Math.max(1, supply.reorder_level * 3 || 30) * 100));
  const detailFooter = <div className="flex gap-3">
      {canEdit ? <>
          <Button variant="outline" onClick={() => {
        onClose();
        onEdit(supply);
      }} className="flex-1 gap-2">
            <Edit2 className="w-4 h-4" />{i18n.t("\u062A\u0639\u062F\u064A\u0644")}</Button>
          <Button onClick={() => {
        onClose();
        onTransaction(supply);
      }} className="flex-1 gap-2">
            <Package className="w-4 h-4" />{i18n.t("\u062D\u0631\u0643\u0629 \u0645\u062E\u0632\u0648\u0646")}</Button>
        </> : <Button variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u063A\u0644\u0627\u0642")}</Button>}
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645 / \u0627\u0644\u062F\u0648\u0627\u0621")} size="lg" footer={detailFooter}>
      <div className="space-y-4">
        {/* الرأس */}
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${catInfo.border} ${catInfo.color.split(' ')[1]}`}>
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${catInfo.color}`}>
            <CatIcon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{supply.name}</h3>
                {supply.manufacturer && <p className="text-sm text-gray-500">{supply.manufacturer}</p>}
                {supply.purpose && <p className="text-xs text-gray-400 mt-0.5">{supply.purpose}</p>}
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${catInfo.color}`}>
                {catInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* تحذيرات */}
        {(isExpired || isLow || isExpiringSoon || supply.is_controlled_substance) && <div className="space-y-2">
            {isExpired && <div className="flex items-center gap-2 p-3 bg-danger-light border border-danger/30 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
                <span className="text-sm text-danger font-semibold">{i18n.t("\u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0646\u0630")}{formatDate(supply.expiry_date)}</span>
              </div>}
            {isExpiringSoon && !isExpired && <div className="flex items-center gap-2 p-3 bg-warning-light border border-warning/30 rounded-xl">
                <Clock className="w-4 h-4 text-warning flex-shrink-0" />
                <span className="text-sm text-warning font-semibold">{i18n.t("\u064A\u0646\u062A\u0647\u064A \u0642\u0631\u064A\u0628\u0627\u064B:")}{formatDate(supply.expiry_date)} ({dayjs(supply.expiry_date).fromNow()})</span>
              </div>}
            {isLow && !isExpired && <div className="flex items-center gap-2 p-3 bg-warning-light border border-warning/30 rounded-xl">
                <TrendingDown className="w-4 h-4 text-warning flex-shrink-0" />
                <span className="text-sm text-warning font-semibold">{i18n.t("\u0645\u062E\u0632\u0648\u0646 \u0645\u0646\u062E\u0641\u0636 \u2014 \u0627\u0644\u0645\u062A\u0627\u062D:")}{available}{i18n.t("/ \u062D\u062F \u0627\u0644\u0637\u0644\u0628:")}{supply.reorder_level}</span>
              </div>}
            {supply.is_controlled_substance && <div className="flex items-center gap-2 p-3 bg-danger-light border border-danger/20 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-danger flex-shrink-0" />
                <span className="text-sm text-danger font-semibold">{i18n.t("\u0645\u0627\u062F\u0629 \u062E\u0627\u0636\u0639\u0629 \u0644\u0644\u0631\u0642\u0627\u0628\u0629 \u2014 \u064A\u062A\u0637\u0644\u0628 \u062A\u0648\u062B\u064A\u0642\u0627\u064B \u062E\u0627\u0635\u0627\u064B")}</span>
              </div>}
          </div>}

        {/* التبويبات */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[{
          id: 'info',
          label: i18n.t("\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A")
        }, {
          id: 'stock',
          label: i18n.t("\u0627\u0644\u0645\u062E\u0632\u0648\u0646")
        }, {
          id: 'history',
          label: i18n.t("\u0627\u0644\u0633\u062C\u0644")
        }].map(t => <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === t.id ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>)}
        </div>

        {/* محتوى التبويب: المعلومات */}
        {activeTab === 'info' && <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[{
          label: i18n.t("\u0648\u062D\u062F\u0629 \u0627\u0644\u0642\u064A\u0627\u0633"),
          value: supply.unit,
          icon: Package
        }, {
          label: i18n.t("\u0645\u0648\u0642\u0639 \u0627\u0644\u062A\u062E\u0632\u064A\u0646"),
          value: supply.storage_location,
          icon: MapPin
        }, {
          label: i18n.t("\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F"),
          value: supply.barcode,
          icon: Tag
        }, {
          label: i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621"),
          value: formatDate(supply.expiry_date),
          icon: Calendar
        }, {
          label: i18n.t("\u062D\u062F \u0627\u0644\u0637\u0644\u0628"),
          value: supply.reorder_level,
          icon: AlertCircle
        }, {
          label: i18n.t("\u064A\u062A\u0637\u0644\u0628 \u0648\u0635\u0641\u0629"),
          value: supply.requires_prescription ? i18n.t("\u0646\u0639\u0645") : i18n.t("\u0644\u0627"),
          icon: ShieldCheck
        }].map(({
          label,
          value,
          icon: Icon
        }) => <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 font-numbers">{value || '—'}</p>
              </div>)}
            {supply.notes && <div className="col-span-2 md:col-span-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</p>
                <p className="text-sm text-gray-700">{supply.notes}</p>
              </div>}
          </div>}

        {/* محتوى التبويب: المخزون */}
        {activeTab === 'stock' && <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-success-light border border-success/20 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold font-numbers ${isLow ? 'text-warning' : 'text-success'}`}>{available}</p>
                <p className="text-xs text-gray-600 mt-1">{i18n.t("\u0627\u0644\u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B")}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold font-numbers text-gray-700">{supply.used_quantity || 0}</p>
                <p className="text-xs text-gray-600 mt-1">{i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645")}</p>
              </div>
              <div className={`rounded-xl p-4 text-center border ${isLow ? 'bg-warning-light border-warning/30' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-2xl font-bold font-numbers ${isLow ? 'text-warning' : 'text-gray-700'}`}>{supply.reorder_level}</p>
                <p className="text-xs text-gray-600 mt-1">{i18n.t("\u062D\u062F \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0637\u0644\u0628")}</p>
              </div>
            </div>
            {/* شريط المخزون */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{i18n.t("\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u062E\u0632\u0648\u0646")}</span>
                <span className={`font-numbers font-bold ${stockPercent < 30 ? 'text-danger' : stockPercent < 60 ? 'text-warning' : 'text-success'}`}>
                  {stockPercent}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${stockPercent < 30 ? 'bg-danger' : stockPercent < 60 ? 'bg-warning' : 'bg-success'}`} style={{
              width: `${Math.max(3, stockPercent)}%`
            }} />
              </div>
              {isLow && <p className="text-xs text-warning font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />{i18n.t("\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u2014 \u064A\u064F\u0646\u0635\u062D \u0628\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0637\u0644\u0628")}</p>}
            </div>
            {canEdit && <Button onClick={() => {
          onClose();
          onTransaction(supply);
        }} className="w-full gap-2">
                <Package className="w-4 h-4" />{i18n.t("\u062A\u0633\u062C\u064A\u0644 \u062D\u0631\u0643\u0629 \u0645\u062E\u0632\u0648\u0646")}</Button>}
          </div>}

        {/* محتوى التبويب: السجل */}
        {activeTab === 'history' && <div className="space-y-3">
            {loadingTx ? <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div> : transactions.length === 0 ? <div className="py-10 text-center bg-gray-50 rounded-xl">
                <History className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0639\u0627\u0645\u0644\u0627\u062A \u0645\u0633\u062C\u0644\u0629 \u0628\u0639\u062F")}</p>
              </div> : <>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {transactions.map(tx => {
              const txInfo = getTxInfo(tx.transaction_type);
              const TxIcon = txInfo.icon;
              const isPositive = tx.quantity_change > 0;
              return <div key={tx.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${txInfo.bg}`}>
                          <TxIcon className={`w-4 h-4 ${txInfo.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{txInfo.label}</span>
                            <span className={`text-sm font-numbers font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                              {isPositive ? '+' : ''}{tx.quantity_change}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="text-xs text-gray-400 font-numbers">{formatDateTime(tx.transaction_at)}</span>
                            {tx.remaining_after !== null && <span className="text-xs text-gray-500">{i18n.t("\u0627\u0644\u0645\u062A\u0628\u0642\u064A:")}<strong className="font-numbers">{tx.remaining_after}</strong></span>}
                          </div>
                          {tx.notes && <p className="text-xs text-gray-500 mt-0.5 truncate">{tx.notes}</p>}
                        </div>
                      </div>;
            })}
                </div>
                {/* ترقيم المعاملات */}
                {txMeta && txMeta.totalPages > 1 && <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-400">{txMeta.total}{i18n.t("\u0645\u0639\u0627\u0645\u0644\u0629 \u0625\u062C\u0645\u0627\u0644\u0627\u064B")}</span>
                    <div className="flex gap-1">
                      <button onClick={() => setTxPage(p => Math.max(1, p - 1))} disabled={txPage <= 1} className="btn btn-ghost p-1.5 disabled:opacity-40"><ChevronRight className="w-3.5 h-3.5" /></button>
                      <span className="text-xs font-numbers px-2 py-1.5">{txPage}/{txMeta.totalPages}</span>
                      <button onClick={() => setTxPage(p => Math.min(txMeta.totalPages, p + 1))} disabled={txPage >= txMeta.totalPages} className="btn btn-ghost p-1.5 disabled:opacity-40"><ChevronLeft className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>}
              </>}
          </div>}

      </div>
    </Modal>;
}

// ==========================================
// بطاقة مستلزم (Grid)
// ==========================================
function SupplyCard({
  supply,
  onView,
  onEdit,
  onDelete,
  onTransaction,
  canEdit,
  canDelete
}) {
  const catInfo = getCategoryInfo(supply.category);
  const CatIcon = catInfo.icon;
  const available = supply.total_quantity || 0;
  const isLow = available <= (supply.reorder_level || 10);
  const isExpired = supply.expiry_date && dayjs(supply.expiry_date).isBefore(dayjs());
  const isExpiringSoon = supply.expiry_date && !isExpired && dayjs(supply.expiry_date).isBefore(dayjs().add(30, 'day'));
  const stockPercent = Math.min(100, Math.round(available / Math.max(1, (supply.reorder_level || 10) * 3) * 100));
  return <div className={`card transition-all duration-300 hover:shadow-lg flex flex-col relative ${isExpired ? 'border-2 border-danger/40' : isLow ? 'border-2 border-warning/40' : ''}`}>
      {(isLow || isExpired) && <div className="absolute top-3 left-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center animate-pulse-soft ${isExpired ? 'bg-danger' : 'bg-warning'}`}>
            <AlertTriangle className="w-3 h-3 text-white" />
          </div>
        </div>}

      {/* الرأس */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${catInfo.color}`}>
          <CatIcon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate leading-snug">{supply.name}</h3>
          {supply.manufacturer && <p className="text-xs text-gray-400 truncate">{supply.manufacturer}</p>}
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${catInfo.color}`}>
            {catInfo.label}
          </span>
        </div>
      </div>

      {/* شريط المخزون */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">{i18n.t("\u0627\u0644\u0645\u062E\u0632\u0648\u0646")}</span>
          <span className={`text-xs font-numbers font-bold ${isExpired ? 'text-danger' : isLow ? 'text-warning' : 'text-success'}`}>
            {available} {supply.unit || ''}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${stockPercent < 30 ? 'bg-danger' : stockPercent < 60 ? 'bg-warning' : 'bg-success'}`} style={{
          width: `${Math.max(3, stockPercent)}%`
        }} />
        </div>
        {isLow && !isExpired && <p className="text-xs text-warning font-semibold mt-0.5">{i18n.t("\u0645\u062E\u0632\u0648\u0646 \u0645\u0646\u062E\u0641\u0636 \u2022 \u062D\u062F \u0627\u0644\u0637\u0644\u0628:")}{supply.reorder_level}</p>}
      </div>

      {/* تفاصيل */}
      <div className="space-y-1 flex-1">
        {supply.storage_location && <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{supply.storage_location}</span>
          </div>}
        {supply.expiry_date && <div className={`flex items-center gap-2 text-xs font-semibold ${isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : 'text-gray-500'}`}>
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{isExpired ? i18n.t("\u0645\u0646\u062A\u0647\u064A:") : i18n.t("\u064A\u0646\u062A\u0647\u064A:")} {formatDate(supply.expiry_date)}</span>
          </div>}
        {supply.is_controlled_substance && <div className="flex items-center gap-2 text-xs text-danger font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />{i18n.t("\u062E\u0627\u0636\u0639 \u0644\u0644\u0631\u0642\u0627\u0628\u0629")}</div>}
        {supply.requires_prescription && <div className="flex items-center gap-2 text-xs text-warning font-semibold">
            <Tag className="w-3.5 h-3.5 flex-shrink-0" />{i18n.t("\u064A\u062A\u0637\u0644\u0628 \u0648\u0635\u0641\u0629 \u0637\u0628\u064A\u0629")}</div>}
      </div>

      {/* أزرار */}
      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
        <button onClick={() => onView(supply)} className="flex-1 btn btn-ghost text-xs gap-1 py-1.5">
          <Eye className="w-3.5 h-3.5" />{i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644")}</button>
        {canEdit && <>
            <button onClick={() => onTransaction(supply)} className="flex-1 btn btn-ghost text-xs gap-1 py-1.5 text-primary">
              <Package className="w-3.5 h-3.5" />{i18n.t("\u062D\u0631\u0643\u0629")}</button>
            <button onClick={() => onEdit(supply)} className="btn btn-ghost text-xs p-1.5">
              <Edit2 className="w-3.5 h-3.5 text-gray-500" />
            </button>
            {canDelete && <button onClick={() => onDelete(supply)} className="btn btn-ghost text-xs p-1.5">
                <Trash2 className="w-3.5 h-3.5 text-danger" />
              </button>}
          </>}
      </div>
    </div>;
}

// ==========================================
// بطاقة فئة (Category breakdown)
// ==========================================
function CategoryBadge({
  category,
  count,
  active,
  onClick
}) {
  const info = getCategoryInfo(category);
  const Icon = info.icon;
  return <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${active ? `${info.color} ${info.border} border-2` : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}>
      <Icon className="w-4 h-4" />
      {info.label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full font-numbers ${active ? 'bg-white/50' : 'bg-gray-100'}`}>{count}</span>
    </button>;
}

// ==========================================
// الصفحة الرئيسية
// ==========================================
export default function Supplies() {
  const {
    isAdmin,
    user
  } = useAuthStore();

  // البيانات
  const [supplies, setSupplies] = useState([]);
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);

  // حالة التحميل
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // الفلاتر
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [filterExpired, setFilterExpired] = useState(false);

  // الترقيم
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // العرض
  const [viewMode, setViewMode] = useState('grid');

  // المودلات
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [txItem, setTxItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const canEdit = isAdmin() || ['doctor', 'physiotherapist', 'nurse', 'manager'].includes(user?.role);
  const canDelete = isAdmin() || user?.role === 'manager';

  // ==========================================
  // جلب البيانات
  // ==========================================
  const fetchSupplies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await equipmentApi.getAllSupplies({
        page,
        limit: 15,
        search,
        category: filterCategory,
        lowStock: filterLowStock ? 'true' : ''
      });
      if (res.data.success) {
        let data = res.data.data;
        if (filterExpired) {
          data = data.filter(s => s.expiry_date && dayjs(s.expiry_date).isBefore(dayjs()));
        }
        setSupplies(data);
        setMeta(res.data.meta);
      }
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A"));
    } finally {
      setLoading(false);
    }
  }, [page, search, filterCategory, filterLowStock, filterExpired]);
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await equipmentApi.getSuppliesStats();
      if (res.data.success) setStats(res.data.data);
    } catch {/* non-blocking */} finally {
      setLoadingStats(false);
    }
  }, []);

  // جلب اللاعبين لنموذج الصرف
  const fetchPlayers = useCallback(async () => {
    try {
      const {
        playersApi
      } = await import('../../api/endpoints/players');
      const res = await playersApi.getAll({
        limit: 100
      });
      if (res.data.success) setPlayers(res.data.data || []);
    } catch {/* اختياري */}
  }, []);
  useEffect(() => {
    fetchStats();
    fetchPlayers();
  }, [fetchStats, fetchPlayers]);
  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  // ==========================================
  // معالجات CRUD
  // ==========================================
  const handleSave = async (data, id) => {
    try {
      if (id) {
        await equipmentApi.updateSupply(id, data);
        toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645 \u0628\u0646\u062C\u0627\u062D"));
      } else {
        await equipmentApi.createSupply(data);
        toast.success(i18n.t("\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645 \u0628\u0646\u062C\u0627\u062D"));
      }
      fetchSupplies();
      fetchStats();
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623\u060C \u0627\u0644\u0631\u062C\u0627\u0621 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649"));
      throw new Error();
    }
  };
  const handleDelete = async supply => {
    try {
      await equipmentApi.deleteSupply(supply.id);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645 \u0628\u0646\u062C\u0627\u062D"));
      setDeleteConfirm(null);
      fetchSupplies();
      fetchStats();
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062D\u0630\u0641"));
    }
  };
  const handleTransaction = async data => {
    try {
      await equipmentApi.recordTransaction(txItem.id, data);
      toast.success(i18n.t("\u062A\u0645\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0628\u0646\u062C\u0627\u062D"));
      fetchSupplies();
      fetchStats();
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629"));
      throw new Error();
    }
  };
  const resetFilters = () => {
    setSearch('');
    setFilterCategory('');
    setFilterLowStock(false);
    setFilterExpired(false);
    setPage(1);
  };
  const hasFilters = search || filterCategory || filterLowStock || filterExpired;

  // ==========================================
  // الواجهة
  // ==========================================
  return <div className="space-y-6 animate-fade-in">
      <PageHeader title={i18n.t("\u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0648\u0627\u0644\u0623\u062F\u0648\u064A\u0629")} subtitle={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0644\u0644\u0639\u064A\u0627\u062F\u0629")} actions={<div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => {
        fetchSupplies();
        fetchStats();
      }} title={i18n.t("\u062A\u062D\u062F\u064A\u062B")} className="gap-2">
              <RefreshCw className="w-4 h-4" />
            </Button>
            {canEdit && <Button onClick={() => setShowAdd(true)} className="gap-2">
                <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u0644\u0632\u0645")}</Button>}
          </div>} />

      {/* بطاقات الإحصاء */}
      {loadingStats ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div> : stats && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Pill} label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0623\u0635\u0646\u0627\u0641")} value={stats.total ?? 0} color="bg-primary-50 text-primary" onClick={() => {
        setFilterCategory('');
        setFilterLowStock(false);
        setFilterExpired(false);
      }} />
          <StatCard icon={TrendingDown} label={i18n.t("\u0645\u062E\u0632\u0648\u0646 \u0645\u0646\u062E\u0641\u0636")} value={stats.lowStock ?? 0} color="bg-warning-light text-warning" subLabel={i18n.t("\u062A\u062D\u062A\u0627\u062C \u0625\u0639\u0627\u062F\u0629 \u0637\u0644\u0628")} onClick={() => {
        setFilterLowStock(true);
        setFilterExpired(false);
        setPage(1);
      }} highlight={filterLowStock} />
          <StatCard icon={AlertTriangle} label={i18n.t("\u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629")} value={stats.expired ?? 0} color="bg-danger-light text-danger" subLabel={i18n.t("\u064A\u062C\u0628 \u0625\u062A\u0644\u0627\u0641\u0647\u0627")} onClick={() => {
        setFilterExpired(true);
        setFilterLowStock(false);
        setPage(1);
      }} highlight={filterExpired} />
          <StatCard icon={BarChart3} label={i18n.t("\u0623\u0635\u0646\u0627\u0641 \u0627\u0644\u0623\u062F\u0648\u064A\u0629")} value={stats.byCategory?.medication ?? 0} color="bg-info-light text-info" onClick={() => {
        setFilterCategory('medication');
        setPage(1);
      }} highlight={filterCategory === 'medication'} />
        </div>}

      {/* توزيع الفئات */}
      {stats?.byCategory && Object.values(stats.byCategory).some(v => v > 0) && <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />{i18n.t("\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0641\u0626\u0629")}</h3>
            {filterCategory && <button onClick={() => {
          setFilterCategory('');
          setPage(1);
        }} className="text-xs text-primary hover:underline flex items-center gap-1">
                <X className="w-3 h-3" />{i18n.t("\u0645\u0633\u062D \u0627\u0644\u0641\u0644\u062A\u0631")}</button>}
          </div>
          <div className="flex flex-wrap gap-2">
            {SUPPLY_CATEGORIES.filter(c => stats.byCategory[c.value] > 0).map(c => <CategoryBadge key={c.value} category={c.value} count={stats.byCategory[c.value] || 0} active={filterCategory === c.value} onClick={() => {
          setFilterCategory(filterCategory === c.value ? '' : c.value);
          setPage(1);
        }} />)}
          </div>
        </div>}

      {/* لوحة الفلاتر والبحث */}
      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* البحث */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }} placeholder={i18n.t("\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645\u060C \u0627\u0644\u0634\u0631\u0643\u0629\u060C \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F...")} className="input-field pr-10" />
          </div>
          {/* فلتر الفئة */}
          <select value={filterCategory} onChange={e => {
          setFilterCategory(e.target.value);
          setPage(1);
        }} className="input-field w-auto min-w-[160px]">
            <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0641\u0626\u0627\u062A")}</option>
            {SUPPLY_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          {/* مخزون منخفض */}
          <button onClick={() => {
          setFilterLowStock(!filterLowStock);
          if (!filterLowStock) setFilterExpired(false);
          setPage(1);
        }} className={`btn gap-2 text-sm ${filterLowStock ? 'btn-primary' : 'btn-ghost border border-gray-200'}`}>
            <TrendingDown className="w-4 h-4" />{i18n.t("\u0645\u0646\u062E\u0641\u0636")}</button>
          {/* منتهي الصلاحية */}
          <button onClick={() => {
          setFilterExpired(!filterExpired);
          if (!filterExpired) setFilterLowStock(false);
          setPage(1);
        }} className={`btn gap-2 text-sm ${filterExpired ? 'bg-danger text-white hover:bg-danger/90' : 'btn-ghost border border-gray-200'}`}>
            <Clock className="w-4 h-4" />{i18n.t("\u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629")}</button>
          {/* نوع العرض */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 mr-auto">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          {/* مسح الكل */}
          {hasFilters && <button onClick={resetFilters} className="btn btn-ghost gap-1 text-sm">
              <X className="w-4 h-4" />{i18n.t("\u0645\u0633\u062D \u0627\u0644\u0643\u0644")}</button>}
        </div>

        {/* نتائج البحث */}
        {meta && <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {hasFilters ? `${i18n.t('نتائج البحث')}: ` : i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A: ")}
              <strong className="text-gray-900 font-numbers">{meta.total}</strong>{i18n.t("\u0635\u0646\u0641")}</span>
            {meta.total > 0 && <span className="font-numbers">
                {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)}
              </span>}
          </div>}
      </div>

      {/* قائمة المستلزمات */}
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div> : supplies.length === 0 ? <div className="card py-16 text-center">
          <Pill className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            {hasFilters ? i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C") : i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0645\u0633\u062C\u0644\u0629")}
          </h3>
          <p className="text-gray-400 mb-6">
            {hasFilters ? i18n.t("\u062C\u0631\u0628 \u062A\u063A\u064A\u064A\u0631 \u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0628\u062D\u062B \u0623\u0648 \u0627\u0644\u0641\u0644\u0627\u062A\u0631") : i18n.t("\u0627\u0628\u062F\u0623 \u0628\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0644\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0646\u0627\u062F\u064A")}
          </p>
          {hasFilters ? <Button variant="outline" onClick={resetFilters} className="gap-2 mx-auto">
              <X className="w-4 h-4" />{i18n.t("\u0645\u0633\u062D \u0627\u0644\u0641\u0644\u0627\u062A\u0631")}</Button> : canEdit && <Button onClick={() => setShowAdd(true)} className="gap-2 mx-auto">
              <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0623\u0648\u0644 \u0645\u0633\u062A\u0644\u0632\u0645")}</Button>}
        </div> : viewMode === 'grid' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supplies.map(sup => <SupplyCard key={sup.id} supply={sup} canEdit={canEdit} canDelete={canDelete} onView={s => setViewItem(s)} onEdit={s => setEditItem(s)} onDelete={s => setDeleteConfirm(s)} onTransaction={s => setTxItem(s)} />)}
        </div> : (/* عرض القائمة */
    <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u0627\u0633\u0645")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u0641\u0626\u0629")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u0645\u062E\u0632\u0648\u0646")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u0645\u0648\u0642\u0639")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {supplies.map(sup => {
              const catInfo = getCategoryInfo(sup.category);
              const CatIcon = catInfo.icon;
              const av = sup.total_quantity || 0;
              const low = av <= (sup.reorder_level || 10);
              const expired = sup.expiry_date && dayjs(sup.expiry_date).isBefore(dayjs());
              const expiring = sup.expiry_date && !expired && dayjs(sup.expiry_date).isBefore(dayjs().add(30, 'day'));
              return <tr key={sup.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${catInfo.color}`}>
                            <CatIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{sup.name}</p>
                            {sup.manufacturer && <p className="text-xs text-gray-400">{sup.manufacturer}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-numbers font-bold text-sm ${expired ? 'text-danger' : low ? 'text-warning' : 'text-success'}`}>
                          {av} {sup.unit || ''}
                        </span>
                        {low && !expired && <p className="text-xs text-warning">{i18n.t("\u2193 \u0645\u0646\u062E\u0641\u0636")}</p>}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{sup.storage_location || '—'}</td>
                      <td className={`py-3 px-4 font-numbers text-xs font-semibold ${expired ? 'text-danger' : expiring ? 'text-warning' : 'text-gray-600'}`}>
                        {formatDate(sup.expiry_date)}
                      </td>
                      <td className="py-3 px-4">
                        {expired ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-danger bg-danger-light">
                            <AlertTriangle className="w-3 h-3" />{i18n.t("\u0645\u0646\u062A\u0647\u064A")}</span> : low ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-warning bg-warning-light">
                            <TrendingDown className="w-3 h-3" />{i18n.t("\u0645\u0646\u062E\u0641\u0636")}</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-success bg-success-light">
                            <CheckCircle2 className="w-3 h-3" />{i18n.t("\u062C\u064A\u062F")}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewItem(sup)} className="btn btn-ghost p-1.5" title={i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644")}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && <>
                              <button onClick={() => setTxItem(sup)} className="btn btn-ghost p-1.5 text-primary" title={i18n.t("\u062D\u0631\u0643\u0629 \u0645\u062E\u0632\u0648\u0646")}>
                                <Package className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditItem(sup)} className="btn btn-ghost p-1.5" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              {canDelete && <button onClick={() => setDeleteConfirm(sup)} className="btn btn-ghost p-1.5" title={i18n.t("\u062D\u0630\u0641")}>
                                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                                </button>}
                            </>}
                        </div>
                      </td>
                    </tr>;
            })}
              </tbody>
            </table>
          </div>
        </div>)}

      {/* الترقيم */}
      {meta && meta.totalPages > 1 && <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{i18n.t("\u0639\u0631\u0636")}{(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)}{i18n.t("\u0645\u0646")}{meta.total}
          </span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page <= 1} className="btn btn-ghost gap-1 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm font-numbers">{meta.page} / {meta.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page >= meta.totalPages} className="btn btn-ghost gap-1 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>}

      {/* ==========================================
          المودلات
          ========================================== */}

      {/* إضافة / تعديل */}
      <SupplyFormModal isOpen={showAdd || !!editItem} onClose={() => {
      setShowAdd(false);
      setEditItem(null);
    }} onSave={handleSave} supplyToEdit={editItem} />

      {/* تفاصيل */}
      <SupplyDetailModal isOpen={!!viewItem} onClose={() => setViewItem(null)} supply={viewItem} canEdit={canEdit} onEdit={s => {
      setViewItem(null);
      setEditItem(s);
    }} onTransaction={s => {
      setViewItem(null);
      setTxItem(s);
    }} />

      {/* حركة مخزون */}
      <TransactionModal isOpen={!!txItem} onClose={() => setTxItem(null)} supply={txItem} onSave={handleTransaction} players={players} />

      {/* تأكيد الحذف */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={i18n.t("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641")} size="sm">
        <div className="space-y-4">
          <div className="w-14 h-14 bg-danger-light rounded-2xl flex items-center justify-center mx-auto">
            <Trash2 className="w-7 h-7 text-danger" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \"")}{deleteConfirm?.name}{i18n.t("\"\u061F")}</p>
            <p className="text-sm text-gray-500 mt-1">{i18n.t("\u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645 \u0648\u062C\u0645\u064A\u0639 \u0633\u062C\u0644\u0627\u062A \u0645\u0639\u0627\u0645\u0644\u0627\u062A\u0647 \u0646\u0647\u0627\u0626\u064A\u0627\u064B \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639")}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-danger hover:bg-danger/90 gap-2">
              <Trash2 className="w-4 h-4" />{i18n.t("\u062D\u0630\u0641 \u0646\u0647\u0627\u0626\u064A")}</Button>
          </div>
        </div>
      </Modal>
    </div>;
}