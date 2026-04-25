import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { Wrench, Plus, Search, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, XCircle, Calendar, DollarSign, MapPin, Tag, RefreshCw, X, List, LayoutGrid, Settings, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { equipmentApi } from '../../api/endpoints/equipment';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import useAuthStore from '../../store/authStore';
dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');
const EQUIPMENT_STATUSES = [{
  value: 'excellent',
  label: i18n.t("\u0645\u0645\u062A\u0627\u0632"),
  color: 'text-success bg-success-light',
  icon: CheckCircle2
}, {
  value: 'good',
  label: i18n.t("\u062C\u064A\u062F"),
  color: 'text-primary bg-primary-50',
  icon: CheckCircle2
}, {
  value: 'needs_maintenance',
  label: i18n.t("\u064A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629"),
  color: 'text-warning bg-warning-light',
  icon: AlertTriangle
}, {
  value: 'out_of_service',
  label: i18n.t("\u062E\u0627\u0631\u062C \u0627\u0644\u062E\u062F\u0645\u0629"),
  color: 'text-danger bg-danger-light',
  icon: XCircle
}];
const MAINTENANCE_TYPES = [{
  value: 'routine',
  label: i18n.t("\u0635\u064A\u0627\u0646\u0629 \u062F\u0648\u0631\u064A\u0629")
}, {
  value: 'repair',
  label: i18n.t("\u0625\u0635\u0644\u0627\u062D")
}, {
  value: 'calibration',
  label: i18n.t("\u0645\u0639\u0627\u064A\u0631\u0629")
}, {
  value: 'inspection',
  label: i18n.t("\u0641\u062D\u0635")
}];
function getStatusInfo(status) {
  return EQUIPMENT_STATUSES.find(s => s.value === status) || EQUIPMENT_STATUSES[1];
}
function formatDate(date) {
  if (!date) return '—';
  return dayjs(date).format('DD/MM/YYYY');
}
function formatCurrency(amount) {
  if (!amount) return '—';
  const locale = localStorage.getItem('smis-locale') === 'en' ? 'en-US' : 'ar-EG';
  return `${parseFloat(amount).toLocaleString(locale)} ${i18n.t('ج.م')}`;
}
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subLabel
}) {
  return <div className="card flex items-center gap-4">
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
function EquipmentFormModal({
  isOpen,
  onClose,
  onSave,
  equipmentToEdit = null
}) {
  const initialForm = {
    name: '',
    purpose: '',
    brand: '',
    serial_number: '',
    model: '',
    location: '',
    status: 'good',
    purchase_date: '',
    purchase_price: '',
    warranty_expiry: '',
    last_maintenance_date: '',
    next_maintenance_date: '',
    requires_calibration: false,
    calibration_date: '',
    notes: ''
  };
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  useEffect(() => {
    if (isOpen) {
      if (equipmentToEdit) {
        setForm({
          name: equipmentToEdit.name || '',
          purpose: equipmentToEdit.purpose || '',
          brand: equipmentToEdit.brand || '',
          serial_number: equipmentToEdit.serial_number || '',
          model: equipmentToEdit.model || '',
          location: equipmentToEdit.location || '',
          status: equipmentToEdit.status || 'good',
          purchase_date: equipmentToEdit.purchase_date || '',
          purchase_price: equipmentToEdit.purchase_price || '',
          warranty_expiry: equipmentToEdit.warranty_expiry || '',
          last_maintenance_date: equipmentToEdit.last_maintenance_date || '',
          next_maintenance_date: equipmentToEdit.next_maintenance_date || '',
          requires_calibration: equipmentToEdit.requires_calibration || false,
          calibration_date: equipmentToEdit.calibration_date || '',
          notes: equipmentToEdit.notes || ''
        });
      } else {
        setForm(initialForm);
      }
      setActiveTab('basic');
    }
  }, [isOpen, equipmentToEdit]);
  const handleChange = (key, value) => setForm(p => ({
    ...p,
    [key]: value
  }));
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0639\u062F\u0629 \u0645\u0637\u0644\u0648\u0628"));
      return;
    }
    setSaving(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) payload[k] = v;
      });
      await onSave(payload, equipmentToEdit?.id);
      onClose();
    } catch (_) {} finally {
      setSaving(false);
    }
  };
  const tabs = [{
    id: 'basic',
    label: i18n.t("\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629")
  }, {
    id: 'purchase',
    label: i18n.t("\u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u0627\u0644\u0636\u0645\u0627\u0646")
  }, {
    id: 'maintenance',
    label: i18n.t("\u0627\u0644\u0635\u064A\u0627\u0646\u0629")
  }];
  const eqFooter = <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
      <Button form="eq-form" type="submit" loading={saving} className="flex-1 gap-2">
        <CheckCircle2 className="w-4 h-4" />
        {equipmentToEdit ? i18n.t("\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0639\u062F\u0629")}
      </Button>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={equipmentToEdit ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0639\u062F\u0629") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0639\u062F\u0629 \u0637\u0628\u064A\u0629 \u062C\u062F\u064A\u062F\u0629")} size="lg" footer={eqFooter}>
      <form id="eq-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex bg-gray-50 border-b border-gray-200">
            {tabs.map(t => <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-white text-primary border-b-2 border-primary -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>)}
          </div>

          <div className="p-4">
            {activeTab === 'basic' && <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0639\u062F\u0629")}<span className="text-danger">*</span></label>
                    <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0648\u062C\u0627\u062A \u0641\u0648\u0642 \u0627\u0644\u0635\u0648\u062A\u064A\u0629")} className="input-field" required />
                  </div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u063A\u0631\u0636 / \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645")}</label><input type="text" value={form.purpose} onChange={e => handleChange('purpose', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0641\u062D\u0635 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0639\u0636\u0644\u064A\u0629")} className="input-field" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0645\u0627\u0631\u0643\u0629 / \u0627\u0644\u0634\u0631\u0643\u0629")}</label><input type="text" value={form.brand} onChange={e => handleChange('brand', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: Philips")} className="input-field" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0645\u0648\u062F\u064A\u0644")}</label><input type="text" value={form.model} onChange={e => handleChange('model', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: HD-2000")} className="input-field" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A")}</label><input type="text" value={form.serial_number} onChange={e => handleChange('serial_number', e.target.value)} placeholder="SN-XXXXXXXX" className="input-field font-numbers" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{i18n.t("\u0645\u0648\u0642\u0639 \u0627\u0644\u062A\u062E\u0632\u064A\u0646")}</label><input type="text" value={form.location} onChange={e => handleChange('location', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u063A\u0631\u0641\u0629 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u0627\u0644\u0637\u0628\u064A\u0629")} className="input-field" /></div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</label>
                    <select value={form.status} onChange={e => handleChange('status', e.target.value)} className="input-field">
                      {EQUIPMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</label><textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} rows={3} placeholder={i18n.t("\u0623\u064A \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629...")} className="input-field resize-none" /></div>
              </div>}

            {activeTab === 'purchase' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-400" />{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0634\u0631\u0627\u0621")}</label><input type="date" value={form.purchase_date} onChange={e => handleChange('purchase_date', e.target.value)} className="input-field font-numbers" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-gray-400" />{i18n.t("\u0633\u0639\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 (\u062C.\u0645)")}</label><input type="number" step="0.01" value={form.purchase_price} onChange={e => handleChange('purchase_price', e.target.value)} placeholder="0.00" min="0" className="input-field font-numbers" /></div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-gray-400" />{i18n.t("\u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0636\u0645\u0627\u0646")}</label><input type="date" value={form.warranty_expiry} onChange={e => handleChange('warranty_expiry', e.target.value)} className="input-field font-numbers" /></div>
              </div>}

            {activeTab === 'maintenance' && <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0622\u062E\u0631 \u0635\u064A\u0627\u0646\u0629")}</label><input type="date" value={form.last_maintenance_date} onChange={e => handleChange('last_maintenance_date', e.target.value)} className="input-field font-numbers" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629")}</label><input type="date" value={form.next_maintenance_date} onChange={e => handleChange('next_maintenance_date', e.target.value)} className="input-field font-numbers" /></div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input type="checkbox" id="requires_calibration" checked={form.requires_calibration} onChange={e => handleChange('requires_calibration', e.target.checked)} className="w-4 h-4 accent-primary" />
                  <label htmlFor="requires_calibration" className="text-sm font-semibold text-gray-700 cursor-pointer">{i18n.t("\u062A\u062A\u0637\u0644\u0628 \u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u062F\u0629 \u0645\u0639\u0627\u064A\u0631\u0629 \u062F\u0648\u0631\u064A\u0629")}</label>
                </div>
                {form.requires_calibration && <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0622\u062E\u0631 \u0645\u0639\u0627\u064A\u0631\u0629")}</label><input type="date" value={form.calibration_date} onChange={e => handleChange('calibration_date', e.target.value)} className="input-field font-numbers" /></div>}
              </div>}
          </div>
        </div>
      </form>
    </Modal>;
}
function MaintenanceFormModal({
  isOpen,
  onClose,
  equipment,
  onSave
}) {
  const [form, setForm] = useState({
    maintenance_type: 'routine',
    performed_at: dayjs().format('YYYY-MM-DDTHH:mm'),
    cost: '',
    description: '',
    next_due: '',
    status: 'completed'
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (isOpen) setForm({
      maintenance_type: 'routine',
      performed_at: dayjs().format('YYYY-MM-DDTHH:mm'),
      cost: '',
      description: '',
      next_due: '',
      status: 'completed'
    });
  }, [isOpen]);
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) payload[k] = v;
      });
      await onSave(payload);
      onClose();
    } catch (_) {} finally {
      setSaving(false);
    }
  };
  const maintFooter = <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
      <Button form="maint-form" type="submit" loading={saving} className="flex-1 gap-2">
        <CheckCircle2 className="w-4 h-4" />{i18n.t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629")}</Button>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={`${i18n.t('تسجيل صيانة')}: ${equipment?.name || ''}`} size="md" footer={maintFooter}>
      <form id="maint-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0635\u064A\u0627\u0646\u0629")}<span className="text-danger">*</span></label><select value={form.maintenance_type} onChange={e => setForm(p => ({
            ...p,
            maintenance_type: e.target.value
          }))} className="input-field" required>{MAINTENANCE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0627\u0644\u0635\u064A\u0627\u0646\u0629")}<span className="text-danger">*</span></label><input type="datetime-local" value={form.performed_at} onChange={e => setForm(p => ({
            ...p,
            performed_at: e.target.value
          }))} className="input-field font-numbers" required /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062A\u0643\u0644\u0641\u0629 (\u062C.\u0645)")}</label><input type="number" step="0.01" value={form.cost} onChange={e => setForm(p => ({
            ...p,
            cost: e.target.value
          }))} placeholder="0.00" min="0" className="input-field font-numbers" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0645\u0648\u0639\u062F \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629")}</label><input type="date" value={form.next_due} onChange={e => setForm(p => ({
            ...p,
            next_due: e.target.value
          }))} className="input-field font-numbers" /></div>
          <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1.5">{i18n.t("\u0648\u0635\u0641 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u0646\u062C\u0632")}</label><textarea value={form.description} onChange={e => setForm(p => ({
            ...p,
            description: e.target.value
          }))} rows={3} placeholder={i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0646\u062C\u0632\u0629...")} className="input-field resize-none" /></div>
        </div>
      </form>
    </Modal>;
}
function EquipmentDetailModal({
  isOpen,
  onClose,
  equipment,
  onMaintenance
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (isOpen && equipment) {
      setLoading(true);
      equipmentApi.getMaintenanceRecords(equipment.id).then(res => {
        if (res.data.success) setRecords(res.data.data);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [isOpen, equipment]);
  if (!equipment) return null;
  const statusInfo = getStatusInfo(equipment.status);
  const StatusIcon = statusInfo.icon;
  const warrantyExpired = equipment.warranty_expiry && dayjs(equipment.warranty_expiry).isBefore(dayjs());
  const maintenanceDue = equipment.next_maintenance_date && dayjs(equipment.next_maintenance_date).isBefore(dayjs().add(7, 'day'));
  return <Modal isOpen={isOpen} onClose={onClose} title={i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0645\u0639\u062F\u0629 \u0627\u0644\u0637\u0628\u064A\u0629")} size="xl">
      <div className="space-y-5">
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0"><Wrench className="w-8 h-8 text-primary" /></div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{equipment.name}</h3>
                {equipment.brand && <p className="text-sm text-gray-500">{equipment.brand} {equipment.model && `- ${equipment.model}`}</p>}
                {equipment.purpose && <p className="text-xs text-gray-400 mt-1">{equipment.purpose}</p>}
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusInfo.color}`}><StatusIcon className="w-3.5 h-3.5" />{statusInfo.label}</span>
            </div>
          </div>
        </div>

        {(warrantyExpired || maintenanceDue) && <div className="space-y-2">
            {maintenanceDue && <div className="flex items-center gap-2 p-3 bg-warning-light border border-warning/30 rounded-xl"><AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" /><span className="text-sm text-warning font-medium">{i18n.t("\u0635\u064A\u0627\u0646\u0629 \u0645\u0633\u062A\u062D\u0642\u0629 \u0628\u062A\u0627\u0631\u064A\u062E")}{formatDate(equipment.next_maintenance_date)}</span></div>}
            {warrantyExpired && <div className="flex items-center gap-2 p-3 bg-danger-light border border-danger/20 rounded-xl"><XCircle className="w-4 h-4 text-danger flex-shrink-0" /><span className="text-sm text-danger font-medium">{i18n.t("\u0627\u0646\u062A\u0647\u0649 \u0627\u0644\u0636\u0645\u0627\u0646 \u0628\u062A\u0627\u0631\u064A\u062E")}{formatDate(equipment.warranty_expiry)}</span></div>}
          </div>}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[{
          label: i18n.t("\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A"),
          value: equipment.serial_number,
          icon: Tag
        }, {
          label: i18n.t("\u0627\u0644\u0645\u0648\u0642\u0639"),
          value: equipment.location,
          icon: MapPin
        }, {
          label: i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0634\u0631\u0627\u0621"),
          value: formatDate(equipment.purchase_date),
          icon: Calendar
        }, {
          label: i18n.t("\u0633\u0639\u0631 \u0627\u0644\u0634\u0631\u0627\u0621"),
          value: formatCurrency(equipment.purchase_price),
          icon: DollarSign
        }, {
          label: i18n.t("\u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0636\u0645\u0627\u0646"),
          value: formatDate(equipment.warranty_expiry),
          icon: ShieldCheck
        }, {
          label: i18n.t("\u0622\u062E\u0631 \u0635\u064A\u0627\u0646\u0629"),
          value: formatDate(equipment.last_maintenance_date),
          icon: Settings
        }].map(({
          label,
          value,
          icon: Icon
        }) => <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1"><Icon className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs text-gray-500">{label}</span></div>
              <p className="text-sm font-semibold text-gray-900 font-numbers">{value || '—'}</p>
            </div>)}
        </div>

        {equipment.notes && <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-bold text-gray-500 mb-1">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</p><p className="text-sm text-gray-700">{equipment.notes}</p>
          </div>}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900 flex items-center gap-2"><Settings className="w-4 h-4 text-primary" />{i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 (")}{records.length})</h4>
            <button onClick={onMaintenance} className="btn btn-primary text-xs gap-1 py-1.5 px-3"><Plus className="w-3.5 h-3.5" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0635\u064A\u0627\u0646\u0629")}</button>
          </div>
          {loading ? <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div> : records.length === 0 ? <div className="py-8 text-center bg-gray-50 rounded-xl border border-gray-200"><Settings className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0633\u062C\u0644\u0627\u062A \u0635\u064A\u0627\u0646\u0629 \u0645\u0633\u062C\u0644\u0629")}</p></div> : <div className="space-y-2 max-h-64 overflow-y-auto">
              {(expanded ? records : records.slice(0, 3)).map(rec => {
            const typeInfo = MAINTENANCE_TYPES.find(t => t.value === rec.maintenance_type);
            return <div key={rec.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0"><Settings className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">{typeInfo?.label || rec.maintenance_type}</span>
                        <span className="text-xs text-gray-400 font-numbers">{formatDate(rec.performed_at)}</span>
                      </div>
                      {rec.description && <p className="text-xs text-gray-500 truncate mt-0.5">{rec.description}</p>}
                      {rec.cost && <span className="text-xs text-warning font-numbers">{i18n.t("\u0627\u0644\u062A\u0643\u0644\u0641\u0629:")}{formatCurrency(rec.cost)}</span>}
                    </div>
                  </div>;
          })}
              {records.length > 3 && <button onClick={() => setExpanded(!expanded)} className="w-full py-2 text-xs text-primary font-semibold flex items-center justify-center gap-1 hover:bg-primary-50 rounded-xl transition-colors">
                  {expanded ? <><ChevronUp className="w-3.5 h-3.5" />{i18n.t("\u0639\u0631\u0636 \u0623\u0642\u0644")}</> : <><ChevronDown className="w-3.5 h-3.5" />{i18n.t("\u0639\u0631\u0636 \u0627\u0644\u0643\u0644")}</>}
                </button>}
            </div>}
        </div>
      </div>
    </Modal>;
}
function EquipmentCard({
  eq,
  onView,
  onEdit,
  onDelete,
  onMaintenance,
  canEdit
}) {
  const statusInfo = getStatusInfo(eq.status);
  const StatusIcon = statusInfo.icon;
  const isMaintenanceDue = eq.next_maintenance_date && dayjs(eq.next_maintenance_date).isBefore(dayjs().add(7, 'day'));
  const warrantyValid = eq.warranty_expiry && dayjs(eq.warranty_expiry).isAfter(dayjs());
  return <div className={`card transition-all duration-300 hover:shadow-lg relative flex flex-col ${eq.status === 'out_of_service' ? 'opacity-75 border-danger/30 border-2' : isMaintenanceDue ? 'border-warning/40 border-2' : ''}`}>
      {isMaintenanceDue && eq.status !== 'out_of_service' && <div className="absolute top-3 left-3"><div className="w-5 h-5 bg-warning rounded-full flex items-center justify-center animate-pulse-soft"><AlertTriangle className="w-3 h-3 text-white" /></div></div>}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0"><Wrench className="w-6 h-6 text-primary" /></div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{eq.name}</h3>
          {eq.brand && <p className="text-xs text-gray-500 truncate">{eq.brand} {eq.model ? `• ${eq.model}` : ''}</p>}
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${statusInfo.color}`}><StatusIcon className="w-3 h-3" />{statusInfo.label}</span>
      </div>
      <div className="space-y-1.5 flex-1">
        {eq.location && <div className="flex items-center gap-2 text-xs text-gray-500"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className="truncate">{eq.location}</span></div>}
        {eq.serial_number && <div className="flex items-center gap-2 text-xs text-gray-500"><Tag className="w-3.5 h-3.5 text-gray-400" /><span className="font-numbers truncate">{eq.serial_number}</span></div>}
        {eq.next_maintenance_date && <div className={`flex items-center gap-2 text-xs ${isMaintenanceDue ? 'text-warning font-semibold' : 'text-gray-500'}`}><Calendar className="w-3.5 h-3.5" /><span>{i18n.t("\u0635\u064A\u0627\u0646\u0629:")}{formatDate(eq.next_maintenance_date)}</span></div>}
        {eq.warranty_expiry && <div className={`flex items-center gap-2 text-xs ${warrantyValid ? 'text-success' : 'text-danger'}`}><ShieldCheck className="w-3.5 h-3.5" /><span>{i18n.t("\u0636\u0645\u0627\u0646 \u062D\u062A\u0649:")}{formatDate(eq.warranty_expiry)}</span></div>}
      </div>
      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100">
        <button onClick={() => onView(eq)} className="flex-1 btn btn-ghost text-xs gap-1 py-1.5"><Eye className="w-3.5 h-3.5" />{i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644")}</button>
        {canEdit && <>
            <button onClick={() => onMaintenance(eq)} className="flex-1 btn btn-ghost text-xs gap-1 py-1.5 text-primary"><Settings className="w-3.5 h-3.5" />{i18n.t("\u0635\u064A\u0627\u0646\u0629")}</button>
            <button onClick={() => onEdit(eq)} className="btn btn-ghost text-xs p-1.5"><Edit2 className="w-3.5 h-3.5 text-gray-500" /></button>
            <button onClick={() => onDelete(eq)} className="btn btn-ghost text-xs p-1.5"><Trash2 className="w-3.5 h-3.5 text-danger" /></button>
          </>}
      </div>
    </div>;
}
export default function Equipment() {
  const {
    isAdmin,
    user
  } = useAuthStore();
  const [equipment, setEquipment] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchEquipment, setSearchEquipment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [eqPage, setEqPage] = useState(1);
  const [eqMeta, setEqMeta] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [viewEquipment, setViewEquipment] = useState(null);
  const [maintenanceEquipment, setMaintenanceEquipment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const canEdit = isAdmin() || ['doctor', 'physiotherapist', 'nurse', 'manager'].includes(user?.role);
  const canDelete = isAdmin() || user?.role === 'manager';
  const fetchEquipment = useCallback(async () => {
    setLoadingEquipment(true);
    try {
      const res = await equipmentApi.getAll({
        page: eqPage,
        limit: 12,
        search: searchEquipment,
        status: filterStatus
      });
      if (res.data.success) {
        setEquipment(res.data.data);
        setEqMeta(res.data.meta);
      }
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0639\u062F\u0627\u062A"));
    } finally {
      setLoadingEquipment(false);
    }
  }, [eqPage, searchEquipment, filterStatus]);
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const eqRes = await equipmentApi.getStats();
      if (eqRes.data.success) setStats(eqRes.data.data);
    } catch {} finally {
      setLoadingStats(false);
    }
  }, []);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);
  const handleSaveEquipment = async (data, id) => {
    try {
      if (id) {
        await equipmentApi.update(id, data);
        toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0639\u062F\u0629 \u0628\u0646\u062C\u0627\u062D"));
      } else {
        await equipmentApi.create(data);
        toast.success(i18n.t("\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0639\u062F\u0629 \u0628\u0646\u062C\u0627\u062D"));
      }
      fetchEquipment();
      fetchStats();
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623\u060C \u0627\u0644\u0631\u062C\u0627\u0621 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649"));
      throw new Error();
    }
  };
  const handleDeleteEquipment = async eq => {
    try {
      await equipmentApi.delete(eq.id);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0639\u062F\u0629 \u0628\u0646\u062C\u0627\u062D"));
      setDeleteConfirm(null);
      fetchEquipment();
      fetchStats();
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0630\u0641 \u0627\u0644\u0645\u0639\u062F\u0629"));
    }
  };
  const handleAddMaintenance = async data => {
    try {
      await equipmentApi.addMaintenance(maintenanceEquipment.id, data);
      toast.success(i18n.t("\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0633\u062C\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0628\u0646\u062C\u0627\u062D"));
      fetchEquipment();
      fetchStats();
      if (viewEquipment?.id === maintenanceEquipment.id) {
        const res = await equipmentApi.getById(maintenanceEquipment.id);
        if (res.data.success) setViewEquipment(res.data.data);
      }
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629"));
      throw new Error();
    }
  };
  return <div className="space-y-6 animate-fade-in">
      <PageHeader title={i18n.t("\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629")} subtitle={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0648\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u062F\u0648\u0631\u064A\u0629")} actions={<div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => {
        fetchEquipment();
        fetchStats();
      }} className="gap-2" title={i18n.t("\u062A\u062D\u062F\u064A\u062B")}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            {canEdit && <Button onClick={() => setShowAddEquipment(true)} className="gap-2">
                <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0639\u062F\u0629")}</Button>}
          </div>} />

      {!loadingStats && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Wrench} label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0639\u062F\u0627\u062A")} value={stats?.total ?? 0} color="bg-primary-50 text-primary" />
          <StatCard icon={CheckCircle2} label={i18n.t("\u062D\u0627\u0644\u0629 \u0645\u0645\u062A\u0627\u0632\u0629")} value={(stats?.byStatus?.excellent ?? 0) + (stats?.byStatus?.good ?? 0)} color="bg-success-light text-success" />
          <StatCard icon={AlertTriangle} label={i18n.t("\u062A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629")} value={stats?.needsMaintenance ?? stats?.byStatus?.needs_maintenance ?? 0} color="bg-warning-light text-warning" subLabel={i18n.t("\u062E\u0644\u0627\u0644 30 \u064A\u0648\u0645")} />
          <StatCard icon={XCircle} label={i18n.t("\u062E\u0627\u0631\u062C \u0627\u0644\u062E\u062F\u0645\u0629")} value={stats?.byStatus?.out_of_service ?? 0} color="bg-danger-light text-danger" />
        </div>}

      {loadingStats && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>}

      <div className="card p-5 space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchEquipment} onChange={e => {
            setSearchEquipment(e.target.value);
            setEqPage(1);
          }} placeholder={i18n.t("\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645\u060C \u0627\u0644\u0645\u0627\u0631\u0643\u0629\u060C \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A...")} className="input-field pr-10" />
          </div>
          <select value={filterStatus} onChange={e => {
          setFilterStatus(e.target.value);
          setEqPage(1);
        }} className="input-field w-auto min-w-[150px]">
            <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A")}</option>
            {EQUIPMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {(searchEquipment || filterStatus) && <button onClick={() => {
          setSearchEquipment('');
          setFilterStatus('');
          setEqPage(1);
        }} className="btn btn-ghost gap-1 text-sm"><X className="w-4 h-4" />{i18n.t("\u0645\u0633\u062D")}</button>}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 mr-auto">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-4 h-4" /></button>
          </div>
        </div>

        {loadingEquipment ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-52 rounded-xl" />)}</div> : equipment.length === 0 ? <div className="py-16 text-center">
            <Wrench className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0639\u062F\u0627\u062A \u0645\u0633\u062C\u0644\u0629")}</h3>
            {canEdit && <Button onClick={() => setShowAddEquipment(true)} className="gap-2 mt-4"><Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0623\u0648\u0644 \u0645\u0639\u062F\u0629")}</Button>}
          </div> : viewMode === 'grid' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map(eq => <EquipmentCard key={eq.id} eq={eq} canEdit={canEdit} onView={e => setViewEquipment(e)} onEdit={e => setEditEquipment(e)} onDelete={e => setDeleteConfirm({
          type: 'eq',
          item: e
        })} onMaintenance={e => setMaintenanceEquipment(e)} />)}
          </div> : <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u0645\u0639\u062F\u0629")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u0645\u0627\u0631\u0643\u0629 / \u0627\u0644\u0645\u0648\u062F\u064A\u0644")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u0645\u0648\u0642\u0639")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629")}</th>
                  {canEdit && <th className="text-right py-3 px-4 font-semibold text-gray-600">{i18n.t("\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {equipment.map(eq => {
              const statusInfo = getStatusInfo(eq.status);
              const isDue = eq.next_maintenance_date && dayjs(eq.next_maintenance_date).isBefore(dayjs().add(7, 'day'));
              return <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center"><Wrench className="w-4 h-4 text-primary" /></div>
                          <div><p className="font-semibold text-gray-900">{eq.name}</p>{eq.serial_number && <p className="text-xs text-gray-400 font-numbers">{eq.serial_number}</p>}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{eq.brand || '—'} {eq.model ? `/ ${eq.model}` : ''}</td>
                      <td className="py-3 px-4 text-gray-600">{eq.location || '—'}</td>
                      <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>{statusInfo.label}</span></td>
                      <td className={`py-3 px-4 font-numbers text-sm ${isDue ? 'text-warning font-bold' : 'text-gray-600'}`}>{formatDate(eq.next_maintenance_date)}</td>
                      {canEdit && <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setViewEquipment(eq)} className="btn btn-ghost p-1.5" title={i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644")}><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setMaintenanceEquipment(eq)} className="btn btn-ghost p-1.5 text-primary" title={i18n.t("\u0635\u064A\u0627\u0646\u0629")}><Settings className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditEquipment(eq)} className="btn btn-ghost p-1.5" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}><Edit2 className="w-3.5 h-3.5" /></button>
                            {canDelete && <button onClick={() => setDeleteConfirm({
                      type: 'eq',
                      item: eq
                    })} className="btn btn-ghost p-1.5" title={i18n.t("\u062D\u0630\u0641")}><Trash2 className="w-3.5 h-3.5 text-danger" /></button>}
                          </div>
                        </td>}
                    </tr>;
            })}
              </tbody>
            </table>
          </div>}

        {eqMeta && eqMeta.totalPages > 1 && <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500">{i18n.t("\u0639\u0631\u0636")}{(eqMeta.page - 1) * eqMeta.limit + 1} - {Math.min(eqMeta.page * eqMeta.limit, eqMeta.total)}{i18n.t("\u0645\u0646")}{eqMeta.total}</span>
            <div className="flex gap-2">
              <button onClick={() => setEqPage(p => Math.max(1, p - 1))} disabled={eqMeta.page <= 1} className="btn btn-ghost gap-1 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              <span className="px-3 py-2 text-sm font-numbers">{eqMeta.page} / {eqMeta.totalPages}</span>
              <button onClick={() => setEqPage(p => Math.min(eqMeta.totalPages, p + 1))} disabled={eqMeta.page >= eqMeta.totalPages} className="btn btn-ghost gap-1 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            </div>
          </div>}
      </div>

      <EquipmentFormModal isOpen={showAddEquipment || !!editEquipment} onClose={() => {
      setShowAddEquipment(false);
      setEditEquipment(null);
    }} onSave={handleSaveEquipment} equipmentToEdit={editEquipment} />
      <EquipmentDetailModal isOpen={!!viewEquipment} onClose={() => setViewEquipment(null)} equipment={viewEquipment} onMaintenance={() => {
      setMaintenanceEquipment(viewEquipment);
      setViewEquipment(null);
    }} />
      <MaintenanceFormModal isOpen={!!maintenanceEquipment} onClose={() => setMaintenanceEquipment(null)} equipment={maintenanceEquipment} onSave={handleAddMaintenance} />
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={i18n.t("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641")} size="sm">
        <div className="space-y-4">
          <div className="w-14 h-14 bg-danger-light rounded-2xl flex items-center justify-center mx-auto"><Trash2 className="w-7 h-7 text-danger" /></div>
          <div className="text-center">
            <p className="font-semibold text-gray-900">{i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \"")}{deleteConfirm?.item?.name}{i18n.t("\"\u061F")}</p>
            <p className="text-sm text-gray-500 mt-1">{i18n.t("\u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0639\u062F\u0629 \u0648\u062C\u0645\u064A\u0639 \u0633\u062C\u0644\u0627\u062A \u0635\u064A\u0627\u0646\u062A\u0647\u0627 \u0646\u0647\u0627\u0626\u064A\u0627\u064B")}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button onClick={() => handleDeleteEquipment(deleteConfirm.item)} className="flex-1 bg-danger hover:bg-danger/90 gap-2"><Trash2 className="w-4 h-4" />{i18n.t("\u062D\u0630\u0641 \u0646\u0647\u0627\u0626\u064A")}</Button>
          </div>
        </div>
      </Modal>
    </div>;
}