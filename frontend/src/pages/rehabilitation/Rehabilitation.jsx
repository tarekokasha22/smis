import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { Dumbbell, Plus, Search, Filter, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, User, Users, Calendar, AlertCircle, CheckCircle2, Activity, Clock, Play, Pause, XCircle, FileText, List as ListIcon, LayoutGrid, Thermometer, ClipboardList } from 'lucide-react';
import { rehabApi } from '../../api/endpoints/rehabilitation';
import { playersApi } from '../../api/endpoints/players';
import { injuriesApi } from '../../api/endpoints/injuries';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import useAuthStore from '../../store/authStore';
dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');

// ==========================================
// ثابت المراحل والحالات
// ==========================================
const STATUS_MAP = {
  active: {
    label: i18n.t("\u0646\u0634\u0637"),
    color: 'primary',
    bg: 'bg-primary-50',
    text: 'text-primary',
    icon: Play
  },
  completed: {
    label: i18n.t("\u0645\u0643\u062A\u0645\u0644"),
    color: 'success',
    bg: 'bg-success-light',
    text: 'text-success',
    icon: CheckCircle2
  },
  paused: {
    label: i18n.t("\u0645\u0648\u0642\u0648\u0641"),
    color: 'warning',
    bg: 'bg-warning-light',
    text: 'text-warning',
    icon: Pause
  },
  cancelled: {
    label: i18n.t("\u0645\u0644\u063A\u0649"),
    color: 'danger',
    bg: 'bg-danger-light',
    text: 'text-danger',
    icon: XCircle
  }
};
const PHASE_MAP = {
  1: {
    label: i18n.t("\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 (\u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0623\u0648\u0644\u064A)"),
    color: 'bg-danger-light text-danger'
  },
  2: {
    label: i18n.t("\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u064A\u0629 (\u0627\u0644\u062A\u0642\u0648\u064A\u0629)"),
    color: 'bg-warning-light text-warning'
  },
  3: {
    label: i18n.t("\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0644\u062B\u0629 (\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0623\u0647\u064A\u0644 \u0627\u0644\u0631\u064A\u0627\u0636\u064A)"),
    color: 'bg-info-light text-info'
  },
  4: {
    label: i18n.t("\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0631\u0627\u0628\u0639\u0629 (\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0639\u0628)"),
    color: 'bg-success-light text-success'
  }
};

// ==========================================
// نموذج إضافة/تعديل برنامج التأهيل
// ==========================================
function ProgramFormModal({
  isOpen,
  onClose,
  onSave,
  players,
  therapists,
  programToEdit
}) {
  const initialForm = {
    player_id: '',
    injury_id: '',
    program_name: '',
    phase: 1,
    phase_label: '',
    start_date: dayjs().format('YYYY-MM-DD'),
    expected_end_date: '',
    therapist_id: '',
    goals: '',
    exercises_description: '',
    notes: ''
  };
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [playerInjuries, setPlayerInjuries] = useState([]);
  const [loadingInjuries, setLoadingInjuries] = useState(false);
  useEffect(() => {
    if (isOpen) {
      if (programToEdit) {
        setForm({
          player_id: programToEdit.player_id || '',
          injury_id: programToEdit.injury_id || '',
          program_name: programToEdit.program_name || '',
          phase: programToEdit.phase || 1,
          phase_label: programToEdit.phase_label || '',
          start_date: programToEdit.start_date || dayjs().format('YYYY-MM-DD'),
          expected_end_date: programToEdit.expected_end_date || '',
          therapist_id: programToEdit.therapist_id || '',
          goals: programToEdit.goals || '',
          exercises_description: programToEdit.exercises_description || '',
          notes: programToEdit.notes || ''
        });
      } else {
        // قراءة بيانات مُسبقة الملء إن وُجدت (تأتي من صفحة الإصابات)
        const prefill = window.__rehabPrefill || {};
        setForm({
          ...initialForm,
          player_id: prefill.player_id || '',
          injury_id: prefill.injury_id || '',
          program_name: prefill.program_name || ''
        });
        window.__rehabPrefill = null; // مسحها بعد الاستخدام
      }
    }
  }, [isOpen, programToEdit]);

  // جلب إصابات اللاعب عند تغيير الاختيار
  useEffect(() => {
    if (form.player_id) {
      setLoadingInjuries(true);
      injuriesApi.getByPlayer(form.player_id, {
        status: 'active,recovering'
      }).then(res => {
        if (res.data.success) setPlayerInjuries(res.data.data || []);
      }).catch(() => setPlayerInjuries([])).finally(() => setLoadingInjuries(false));
    } else {
      setPlayerInjuries([]);
    }
  }, [form.player_id]);
  const handleChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.player_id || !form.program_name || !form.start_date) {
      toast.error(i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 \u0648\u0627\u0633\u0645 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0648\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"));
      return;
    }
    setSaving(true);
    try {
      await onSave(form, programToEdit?.id);
      onClose();
    } catch (error) {
      // handled by parent
    } finally {
      setSaving(false);
    }
  };
  const formFooter = <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
      <Button form="rehab-form" type="submit" loading={saving} className="flex-1 gap-2">
        <CheckCircle2 className="w-4 h-4" />
        {programToEdit ? i18n.t("\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A") : i18n.t("\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C")}
      </Button>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={programToEdit ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0628\u0631\u0646\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644") : i18n.t("\u0628\u0631\u0646\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644 \u062C\u062F\u064A\u062F")} size="lg" footer={formFooter}>
      <form id="rehab-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Player */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}<span className="text-danger">*</span>
            </label>
            <select value={form.player_id} onChange={e => handleChange('player_id', e.target.value)} className="input-field" required disabled={!!programToEdit}>
              <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0644\u0627\u0639\u0628...")}</option>
              {players.map(p => <option key={p.id} value={p.id}>
                  #{p.number} - {p.name}
                </option>)}
            </select>
          </div>

          {/* Program Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C")}<span className="text-danger">*</span>
            </label>
            <input type="text" value={form.program_name} onChange={e => handleChange('program_name', e.target.value)} className="input-field" placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u062A\u0623\u0647\u064A\u0644 \u0627\u0644\u0631\u0628\u0627\u0637 \u0627\u0644\u0635\u0644\u064A\u0628\u064A")} required />
          </div>

          {/* Injury Link */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629")}<span className="text-xs text-gray-400 font-normal mr-2">{i18n.t("(\u0627\u062E\u062A\u064A\u0627\u0631\u064A)")}</span>
            </label>
            <select value={form.injury_id} onChange={e => handleChange('injury_id', e.target.value)} className="input-field" disabled={!form.player_id}>
              <option value="">
                {!form.player_id ? i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0644\u0627\u0639\u0628 \u0623\u0648\u0644\u0627\u064B...") : loadingInjuries ? i18n.t("\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...") : playerInjuries.length === 0 ? i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0625\u0635\u0627\u0628\u0627\u062A \u0646\u0634\u0637\u0629") : i18n.t("\u0628\u062F\u0648\u0646 \u0625\u0635\u0627\u0628\u0629 \u0645\u062D\u062F\u062F\u0629")}
              </option>
              {playerInjuries.map(inj => <option key={inj.id} value={inj.id}>
                  {inj.injury_type} — {inj.body_area} ({new Date(inj.injury_date).toLocaleDateString('ar-EG')})
                </option>)}
            </select>
            {form.player_id && playerInjuries.length > 0 && <p className="text-xs text-gray-400 mt-1">{i18n.t("\u0631\u0628\u0637 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0628\u0625\u0635\u0627\u0628\u0629 \u064A\u064F\u0645\u0643\u0651\u0646 \u0645\u0646 \u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u062A\u0642\u062F\u0645 \u0641\u064A \u0633\u062C\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}</p>}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629")}<span className="text-danger">*</span>
            </label>
            <input type="date" value={form.start_date} onChange={e => handleChange('start_date', e.target.value)} className="input-field font-numbers" required />
          </div>

          {/* Expected End Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0645\u062A\u0648\u0642\u0639")}</label>
            <input type="date" value={form.expected_end_date} onChange={e => handleChange('expected_end_date', e.target.value)} className="input-field font-numbers" />
          </div>

          {/* Therapist */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0645\u0639\u0627\u0644\u062C \u0627\u0644\u0645\u0633\u0624\u0648\u0644")}</label>
            <select value={form.therapist_id} onChange={e => handleChange('therapist_id', e.target.value)} className="input-field">
              <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0639\u0627\u0644\u062C...")}</option>
              {therapists.map(t => <option key={t.id} value={t.id}>
                  {t.name} ({t.role})
                </option>)}
            </select>
          </div>

          {/* Phase */}
          {!programToEdit && <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629")}</label>
              <select value={form.phase} onChange={e => handleChange('phase', e.target.value)} className="input-field">
                {Object.entries(PHASE_MAP).map(([key, val]) => <option key={key} value={key}>
                    {val.label}
                  </option>)}
              </select>
            </div>}
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0623\u0647\u062F\u0627\u0641 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C")}</label>
          <textarea value={form.goals} onChange={e => handleChange('goals', e.target.value)} className="input-field resize-none h-20" placeholder={i18n.t("\u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 90 \u062F\u0631\u062C\u0629 \u062B\u0646\u064A...")} />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629")}</label>
          <textarea value={form.notes} onChange={e => handleChange('notes', e.target.value)} className="input-field resize-none h-20" />
        </div>

      </form>
    </Modal>;
}

// ==========================================
// نموذج تحديث حالة أو تقدم
// ==========================================
function ProgressModal({
  isOpen,
  onClose,
  program,
  onUpdate
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    status: 'active',
    phase: 1,
    progress_pct: 0,
    actual_end_date: dayjs().format('YYYY-MM-DD')
  });
  useEffect(() => {
    if (isOpen && program) {
      setForm({
        status: program.status || 'active',
        phase: program.phase || 1,
        progress_pct: program.progress_pct || 0,
        actual_end_date: program.actual_end_date || dayjs().format('YYYY-MM-DD')
      });
    }
  }, [isOpen, program]);
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      // Only call status update if status changed to complete, pause, cancel
      if (form.status !== program.status) {
        await rehabApi.updateStatus(program.id, {
          status: form.status,
          actual_end_date: form.status === 'completed' ? form.actual_end_date : undefined
        });
      }

      // Always update progress/phase if changed
      if (form.phase != program.phase || form.progress_pct != program.progress_pct) {
        await rehabApi.updateProgress(program.id, {
          phase: form.phase,
          progress_pct: form.progress_pct
        });
      }
      await onUpdate();
      onClose();
      toast.success(i18n.t("\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B \u0628\u0646\u062C\u0627\u062D"));
    } catch (error) {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u062D\u062F\u064A\u062B"));
    } finally {
      setSaving(false);
    }
  };
  if (!program) return null;
  const progressFooter = <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
      <Button form="progress-form" type="submit" loading={saving} className="flex-1">{i18n.t("\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A")}</Button>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={i18n.t("\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u0623\u0647\u064A\u0644")} size="md" footer={progressFooter}>
      <form id="progress-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u062D\u0627\u0644\u0629 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C")}</label>
          <select value={form.status} onChange={e => setForm({
          ...form,
          status: e.target.value
        })} className="input-field">
            {Object.entries(STATUS_MAP).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
        </div>

        {/* Progress & Phase visible only if active */}
        {form.status === 'active' && <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0645\u0631\u062D\u0644\u0629")}</label>
              <select value={form.phase} onChange={e => setForm({
            ...form,
            phase: parseInt(e.target.value)
          })} className="input-field">
                {Object.entries(PHASE_MAP).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex justify-between">
                <span>{i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u0642\u062F\u0645")}</span>
                <span className="font-numbers">{form.progress_pct}%</span>
              </label>
              <input type="range" min="0" max="100" step="5" value={form.progress_pct} onChange={e => setForm({
            ...form,
            progress_pct: parseInt(e.target.value)
          })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
          </>}

        {/* Date for completed */}
        {form.status === 'completed' && <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0641\u0639\u0644\u064A")}</label>
            <input type="date" value={form.actual_end_date} onChange={e => setForm({
          ...form,
          actual_end_date: e.target.value
        })} className="input-field font-numbers" required />
          </div>}

      </form>
    </Modal>;
}

// ==========================================
// مكون البطاقة لبرنامج التأهيل
// ==========================================
function ProgramCard({
  program,
  onView,
  onEditProgress,
  onAddSession,
  onEditProgram,
  onDeleteProgram
}) {
  const {
    player,
    injury,
    therapist
  } = program;
  const statusInfo = STATUS_MAP[program.status] || STATUS_MAP.active;
  const phaseInfo = PHASE_MAP[program.phase] || PHASE_MAP[1];
  return <div className={`card hover:shadow-lg transition-all duration-300 relative border-l-4 ${program.status === 'completed' ? 'border-success' : program.status === 'paused' ? 'border-warning' : program.status === 'cancelled' ? 'border-danger' : 'border-primary'}`}>
      {/* رأس البطاقة */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-1 items-start gap-3">
          <Link to={`/players/${player.id}`}>
            <Avatar src={player.avatar_url} name={player.name} size="md" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/players/${player.id}`} className="font-bold text-gray-900 hover:text-primary transition-colors truncate block">
              {player.name}
              <span className="text-gray-400 text-xs font-normal mr-2">#{player.number}</span>
            </Link>
            <p className="text-sm text-gray-700 font-medium truncate mt-0.5" title={program.program_name}>
              {program.program_name}
            </p>
            {injury && <p className="text-xs text-danger mt-0.5">{i18n.t("\u0625\u0635\u0627\u0628\u0629:")}{injury.injury_type}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.bg} ${statusInfo.text}`}>
            <statusInfo.icon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </div>
          <div className="flex items-center gap-1">
             <button onClick={() => onEditProgram(program)} className="p-1.5 text-gray-400 hover:text-primary transition-colors bg-gray-50 rounded-lg" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}><Edit2 className="w-3.5 h-3.5" /></button>
             <button onClick={() => onDeleteProgram(program.id)} className="p-1.5 text-gray-400 hover:text-danger transition-colors bg-gray-50 rounded-lg" title={i18n.t("\u0645\u0633\u062D")}><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${phaseInfo.color}`}>
            {phaseInfo.label}
          </span>
          <span className="text-sm font-bold font-numbers text-gray-700">
            {program.progress_pct}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${statusInfo.bg.replace('-light', '').replace('-50', '')}`} style={{
          width: `${program.progress_pct}%`
        }} />
        </div>
      </div>

      {/* تواريخ و تفاصيل */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{i18n.t("\u0627\u0644\u0628\u062F\u0627\u064A\u0629:")}</span>
          <span className="font-numbers text-gray-800">{dayjs(program.start_date).format('DD/MM/YYYY')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>{i18n.t("\u0627\u0644\u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629:")}</span>
          <span className="font-numbers text-gray-800">{program.expected_end_date ? dayjs(program.expected_end_date).format('DD/MM/YYYY') : '—'}</span>
        </div>
        {therapist && <div className="flex items-center gap-1.5 col-span-2 mt-1">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>{i18n.t("\u0627\u0644\u0645\u0639\u0627\u0644\u062C:")}</span>
            <span className="text-gray-800 font-medium">{therapist.name}</span>
          </div>}
      </div>

      {/* أزرار الإجراء */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 flex-wrap">
        <Link to={`/rehabilitation/${program.id}`} className="flex-1 min-w-[30%]">
          <Button variant="ghost" className="w-full text-xs px-2 h-8 min-w-0">
            <Eye className="w-3.5 h-3.5 ml-1" />{i18n.t("\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644")}</Button>
        </Link>
        {program.status === 'active' && <Button variant="ghost" className="flex-1 text-xs px-2 h-8 min-w-[30%]" onClick={() => onAddSession(program)}>
            <ClipboardList className="w-3.5 h-3.5 ml-1" />{i18n.t("\u062A\u0633\u062C\u064A\u0644 \u062C\u0644\u0633\u0629")}</Button>}
        {program.status !== 'completed' && <Button variant="outline" className="flex-1 text-xs px-2 h-8 min-w-[30%]" onClick={() => onEditProgress(program)}>
            <Activity className="w-3.5 h-3.5 ml-1" />{i18n.t("\u062A\u062D\u062F\u064A\u062B")}</Button>}
      </div>
    </div>;
}

// ==========================================
// الصفحة الرئيسية
// ==========================================
export default function Rehabilitation() {
  const {
    hasRole
  } = useAuthStore();
  const canEdit = hasRole(['club_admin', 'doctor', 'physiotherapist', 'manager']);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [programs, setPrograms] = useState([]);
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    player_id: searchParams.get('player_id') || '',
    status: searchParams.get('status') || '',
    therapist_id: searchParams.get('therapist_id') || ''
  });

  // التحكم فى Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState(null);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [programForProgress, setProgramForProgress] = useState(null);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [programForSession, setProgramForSession] = useState(null);

  // فتح النموذج تلقائياً عند القدوم من صفحة الإصابات
  useEffect(() => {
    if (location.state?.openForm) {
      setProgramToEdit(null);
      // تعيين القيم المسبقة في صفحة التأهيل
      window.__rehabPrefill = {
        player_id: String(location.state.player_id || ''),
        injury_id: String(location.state.injury_id || ''),
        program_name: location.state.injury_type ? `${i18n.t('تأهيل')} ${location.state.injury_type}` : ''
      };
      setIsFormOpen(true);
      // تنظيف الستيت حتى لا يتكرر عند التحديث
      window.history.replaceState({}, '', location.pathname);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 12,
        ...filters
      };
      const [programsRes, statsRes, playersRes, therapistsRes] = await Promise.all([rehabApi.getAll(params), rehabApi.getStats(), playersApi.getAll({
        limit: 500,
        is_active: 'true'
      }), rehabApi.getTherapists()]);
      if (programsRes.data.success) {
        setPrograms(programsRes.data.data);
        setMeta(programsRes.data.meta);
      }
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (playersRes.data.success) setPlayers(playersRes.data.data);
      if (therapistsRes.data.success) setTherapists(therapistsRes.data.data);
    } catch (error) {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (value) newParams.set(key, value);else newParams.delete(key);
    setSearchParams(newParams);
  };
  const handlePageChange = page => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };
  const handleCreateOrUpdate = async (formData, id) => {
    if (id) {
      await rehabApi.update(id, formData);
      toast.success(i18n.t("\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B \u0628\u0646\u062C\u0627\u062D"));
    } else {
      await rehabApi.create(formData);
      toast.success(i18n.t("\u062A\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0628\u0646\u062C\u0627\u062D"));
    }
    fetchData();
  };
  const handleDeleteProgram = async id => {
    if (!window.confirm(i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0645\u0633\u062D \u0628\u0631\u0646\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644\u061F \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621."))) return;
    try {
      await rehabApi.delete(id);
      toast.success(i18n.t("\u062A\u0645 \u0645\u0633\u062D \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0628\u0646\u062C\u0627\u062D"));
      fetchData();
    } catch (error) {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0645\u0633\u062D \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C"));
    }
  };
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <Dumbbell className="w-7 h-7 text-primary" />
            <span>{i18n.t("\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644")}</span>
          </div>} subtitle={i18n.t("\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u062E\u0637\u0637 \u0627\u0644\u062A\u0623\u0647\u064A\u0644\u064A\u0629 \u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0627\u0644\u0645\u0635\u0627\u0628\u064A\u0646 \u0648\u062C\u0644\u0633\u0627\u062A \u0639\u0644\u0627\u062C\u0647\u0645")}>
        <Button onClick={() => {
        setProgramToEdit(null);
        setIsFormOpen(true);
      }} className="gap-2">
            <Plus className="w-4 h-4" />{i18n.t("\u0628\u0631\u0646\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644 \u062C\u062F\u064A\u062F")}</Button>
      </PageHeader>

      {/* لوحة الإحصائيات العليا */}
      {stats && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-primary-50 to-white border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0627\u0644\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u0646\u0634\u0637\u0629")}</p>
                <p className="text-2xl font-bold text-primary font-numbers">
                  {stats.statusDistribution?.find(s => s.status === 'active')?.count || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Play className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-success-light to-white border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0627\u0644\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u0645\u0643\u062A\u0645\u0644\u0629")}</p>
                <p className="text-2xl font-bold text-success font-numbers">
                  {stats.statusDistribution?.find(s => s.status === 'completed')?.count || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>

          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0645\u062F\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</p>
                <p className="text-2xl font-bold text-gray-800 font-numbers">
                  {stats.avgDuration ? `${stats.avgDuration} ${i18n.t('يوم')}` : '—'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="card bg-info-light/30 border-info/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0627\u0644\u062D\u0636\u0648\u0631 \u0648\u0627\u0644\u062A\u0632\u0627\u0645 \u0627\u0644\u062C\u0644\u0633\u0627\u062A")}</p>
                <p className="text-2xl font-bold text-info font-numbers">
                  {stats.attendanceRate}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-info" />
              </div>
            </div>
          </div>
        </div>}

      {/* الفلترة والبحث */}
      <div className="card mb-6 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder={i18n.t("\u0627\u0628\u062D\u062B \u0628\u0627\u0633\u0645 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C\u060C \u0627\u0644\u0647\u062F\u0641...")} value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} className="input-field pr-10" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select value={filters.player_id} onChange={e => handleFilterChange('player_id', e.target.value)} className="input-field min-w-[150px]">
              <option value="">{i18n.t("\u0643\u0644 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="input-field min-w-[120px]">
              <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A")}</option>
              <option value="active">{i18n.t("\u0646\u0634\u0637")}</option>
              <option value="completed">{i18n.t("\u0645\u0643\u062A\u0645\u0644")}</option>
              <option value="paused">{i18n.t("\u0645\u0648\u0642\u0648\u0641")}</option>
            </select>

            <select value={filters.therapist_id} onChange={e => handleFilterChange('therapist_id', e.target.value)} className="input-field min-w-[140px]">
              <option value="">{i18n.t("\u0643\u0644 \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u064A\u0646")}</option>
              {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            
            {(filters.search || filters.player_id || filters.status || filters.therapist_id) && <button onClick={() => {
            setFilters({
              search: '',
              player_id: '',
              status: '',
              therapist_id: ''
            });
            setSearchParams(new URLSearchParams());
          }} className="text-xs text-danger hover:underline px-2">{i18n.t("\u0645\u0633\u062D \u0627\u0644\u0641\u0644\u0627\u062A\u0631")}</button>}
          </div>
        </div>
      </div>

      {/* عرض القائمة */}
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div> : programs.length === 0 ? <div className="card text-center py-20">
          <Dumbbell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t("\u0644\u0627 \u064A\u0648\u062C\u062F \u0628\u0631\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644")}</h3>
          <p className="text-gray-500 mb-6">{i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0623\u064A \u0628\u0631\u0627\u0645\u062C \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0645\u0639\u0627\u064A\u064A\u0631\u0643")}</p>
          {canEdit && <Button onClick={() => {
        setProgramToEdit(null);
        setIsFormOpen(true);
      }} className="mx-auto">{i18n.t("\u062A\u0623\u0633\u064A\u0633 \u0628\u0631\u0646\u0627\u0645\u062C \u062C\u062F\u064A\u062F")}</Button>}
        </div> : <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
            {programs.map(prog => <ProgramCard key={prog.id} program={prog} onView={() => {}} onEditProgress={p => {
          setProgramForProgress(p);
          setIsProgressOpen(true);
        }} onAddSession={p => {
          setProgramForSession(p);
          setIsSessionOpen(true);
        }} onEditProgram={p => {
          setProgramToEdit(p);
          setIsFormOpen(true);
        }} onDeleteProgram={handleDeleteProgram} />)}
          </div>

          {/* الترقيم */}
          {meta.totalPages > 1 && <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={meta.page <= 1} onClick={() => handlePageChange(meta.page - 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="px-4 font-numbers font-medium text-gray-600">
                  {meta.page} / {meta.totalPages}
                </div>
                <Button variant="outline" disabled={meta.page >= meta.totalPages} onClick={() => handlePageChange(meta.page + 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>}
        </>}

      {/* Modals */}
      <ProgramFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleCreateOrUpdate} players={players} therapists={therapists} programToEdit={programToEdit} />

      <ProgressModal isOpen={isProgressOpen} onClose={() => setIsProgressOpen(false)} program={programForProgress} onUpdate={fetchData} />

      <SessionModal isOpen={isSessionOpen} onClose={() => setIsSessionOpen(false)} program={programForSession} onSaved={fetchData} />
    </div>;
}

// ==========================================
// مودال تسجيل جلسة تأهيل
// ==========================================
function SessionModal({
  isOpen,
  onClose,
  program,
  onSaved
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    session_date: new Date().toISOString().split('T')[0],
    duration_minutes: 60,
    session_type: 'physiotherapy',
    exercises_done: '',
    pain_level: 0,
    progress_notes: '',
    attendance: 'attended'
  });
  const handleSubmit = async e => {
    e.preventDefault();
    if (!program) return;
    setSaving(true);
    try {
      await rehabApi.addSession(program.id, form);
      toast.success(i18n.t("\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0646\u062C\u0627\u062D"));
      onClose();
      onSaved();
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0629"));
    } finally {
      setSaving(false);
    }
  };
  if (!program) return null;
  const sessionTypes = [{
    value: 'physiotherapy',
    label: i18n.t("\u0639\u0644\u0627\u062C \u0637\u0628\u064A\u0639\u064A")
  }, {
    value: 'strength',
    label: i18n.t("\u062A\u0642\u0648\u064A\u0629 \u0639\u0636\u0644\u064A\u0629")
  }, {
    value: 'cardio',
    label: i18n.t("\u0644\u064A\u0627\u0642\u0629 \u0642\u0644\u0628\u064A\u0629")
  }, {
    value: 'flexibility',
    label: i18n.t("\u0645\u0631\u0648\u0646\u0629 \u0648\u0625\u0637\u0627\u0644\u0629")
  }, {
    value: 'assessment',
    label: i18n.t("\u062A\u0642\u064A\u064A\u0645")
  }, {
    value: 'other',
    label: i18n.t("\u0623\u062E\u0631\u0649")
  }];
  const sessionFooter = <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
      <Button form="session-form" type="submit" loading={saving} className="flex-1">{i18n.t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0629")}</Button>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={i18n.t("\u062A\u0633\u062C\u064A\u0644 \u062C\u0644\u0633\u0629 \u062A\u0623\u0647\u064A\u0644")} size="md" footer={sessionFooter}>
      <form id="session-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-primary-light rounded-xl p-3 border border-primary/20">
          <p className="text-sm font-medium text-primary">{program.program_name}</p>
          <p className="text-xs text-gray-600">{program.player?.name}{i18n.t("\u2014 \u0627\u0644\u0645\u0631\u062D\u0644\u0629")}{program.phase}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062C\u0644\u0633\u0629 *")}</label>
            <input type="date" value={form.session_date} onChange={e => setForm(p => ({
            ...p,
            session_date: e.target.value
          }))} className="input-field w-full font-numbers" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0645\u062F\u0629 (\u062F\u0642\u064A\u0642\u0629)")}</label>
            <input type="number" min={5} max={240} value={form.duration_minutes} onChange={e => setForm(p => ({
            ...p,
            duration_minutes: parseInt(e.target.value)
          }))} className="input-field w-full font-numbers" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u062C\u0644\u0633\u0629")}</label>
            <select value={form.session_type} onChange={e => setForm(p => ({
            ...p,
            session_type: e.target.value
          }))} className="input-field w-full">
              {sessionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062D\u0636\u0648\u0631")}</label>
            <select value={form.attendance} onChange={e => setForm(p => ({
            ...p,
            attendance: e.target.value
          }))} className="input-field w-full">
              <option value="attended">{i18n.t("\u062D\u0636\u0631")}</option>
              <option value="missed">{i18n.t("\u063A\u0627\u0628")}</option>
              <option value="cancelled">{i18n.t("\u0645\u0644\u063A\u0627\u0629")}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0623\u0644\u0645:")}<span className="font-bold font-numbers text-primary">{form.pain_level}/10</span>
          </label>
          <input type="range" min={0} max={10} value={form.pain_level} onChange={e => setForm(p => ({
          ...p,
          pain_level: parseInt(e.target.value)
        }))} className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{i18n.t("\u0644\u0627 \u0623\u0644\u0645 (0)")}</span>
            <span>{i18n.t("\u0623\u0644\u0645 \u0634\u062F\u064A\u062F (10)")}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646 \u0627\u0644\u0645\u0646\u0641\u0630\u0629")}</label>
          <textarea value={form.exercises_done} onChange={e => setForm(p => ({
          ...p,
          exercises_done: e.target.value
        }))} className="input-field w-full h-20 resize-none" placeholder={i18n.t("\u0627\u0630\u0643\u0631 \u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646 \u0627\u0644\u062A\u064A \u062A\u0645 \u062A\u0646\u0641\u064A\u0630\u0647\u0627 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u062C\u0644\u0633\u0629...")} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u062A\u0642\u062F\u0645")}</label>
          <textarea value={form.progress_notes} onChange={e => setForm(p => ({
          ...p,
          progress_notes: e.target.value
        }))} className="input-field w-full h-20 resize-none" placeholder={i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u062D\u0648\u0644 \u062A\u0642\u062F\u0645 \u0627\u0644\u0644\u0627\u0639\u0628 \u0648\u0623\u062F\u0627\u0626\u0647...")} />
        </div>

      </form>
    </Modal>;
}