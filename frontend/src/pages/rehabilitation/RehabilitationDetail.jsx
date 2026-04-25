import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Dumbbell, Calendar, Clock, User, Activity, CheckCircle2, AlertCircle, FileText, Play, Pause, XCircle, Plus, Trash2, Edit2, TrendingUp } from 'lucide-react';
import { rehabApi } from '../../api/endpoints/rehabilitation';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import useAuthStore from '../../store/authStore';

// ==========================================
// مكون: نافذة إضافة / تعديل جلسة
// ==========================================
function SessionModal({
  isOpen,
  onClose,
  onSave,
  sessionToEdit,
  therapists
}) {
  const [form, setForm] = useState({
    session_date: dayjs().format('YYYY-MM-DD'),
    duration_minutes: 60,
    therapist_id: '',
    session_type: '',
    exercises_done: '',
    pain_level: 0,
    attendance: 'attended',
    progress_notes: ''
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (isOpen) {
      if (sessionToEdit) {
        setForm({
          session_date: sessionToEdit.session_date,
          duration_minutes: sessionToEdit.duration_minutes || 60,
          therapist_id: sessionToEdit.therapist_id || '',
          session_type: sessionToEdit.session_type || '',
          exercises_done: sessionToEdit.exercises_done || '',
          pain_level: sessionToEdit.pain_level || 0,
          attendance: sessionToEdit.attendance || 'attended',
          progress_notes: sessionToEdit.progress_notes || ''
        });
      } else {
        setForm({
          session_date: dayjs().format('YYYY-MM-DD'),
          duration_minutes: 60,
          therapist_id: '',
          session_type: '',
          exercises_done: '',
          pain_level: 0,
          attendance: 'attended',
          progress_notes: ''
        });
      }
    }
  }, [isOpen, sessionToEdit]);
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form, sessionToEdit?.id);
      onClose();
    } catch (error) {
      // handled by parent
    } finally {
      setSaving(false);
    }
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={sessionToEdit ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062C\u0644\u0633\u0629") : i18n.t("\u062A\u0633\u062C\u064A\u0644 \u062C\u0644\u0633\u0629 \u062C\u062F\u064A\u062F\u0629")} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062C\u0644\u0633\u0629")}</label>
            <input type="date" value={form.session_date} onChange={e => setForm({
            ...form,
            session_date: e.target.value
          })} className="input-field font-numbers" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0645\u062F\u0629 (\u062F\u0642\u0627\u0626\u0642)")}</label>
            <input type="number" value={form.duration_minutes} onChange={e => setForm({
            ...form,
            duration_minutes: parseInt(e.target.value)
          })} className="input-field font-numbers" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u062D\u0636\u0648\u0631")}</label>
            <select value={form.attendance} onChange={e => setForm({
            ...form,
            attendance: e.target.value
          })} className="input-field">
              <option value="attended">{i18n.t("\u062D\u0636\u0631 \u0627\u0644\u062C\u0644\u0633\u0629")}</option>
              <option value="missed">{i18n.t("\u063A\u0627\u0628 (\u0628\u062F\u0648\u0646 \u0639\u0630\u0631)")}</option>
              <option value="cancelled">{i18n.t("\u0623\u0644\u063A\u064A\u062A")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0645\u0639\u0627\u0644\u062C")}</label>
            <select value={form.therapist_id} onChange={e => setForm({
            ...form,
            therapist_id: e.target.value
          })} className="input-field">
              <option value="">{i18n.t("\u0627\u062E\u062A\u0631...")}</option>
              {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {form.attendance === 'attended' && <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u062C\u0644\u0633\u0629")}</label>
              <input type="text" placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0639\u0644\u0627\u062C \u0637\u0628\u064A\u0639\u064A\u060C \u062A\u0642\u0648\u064A\u0629 \u0645\u0627\u0626\u064A\u0629...")} value={form.session_type} onChange={e => setForm({
            ...form,
            session_type: e.target.value
          })} className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex justify-between">
                <span>{i18n.t("\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0623\u0644\u0645 \u0628\u0639\u062F \u0627\u0644\u062C\u0644\u0633\u0629")}</span>
                <span className="font-numbers">{form.pain_level}/10</span>
              </label>
              <input type="range" min="0" max="10" value={form.pain_level} onChange={e => setForm({
            ...form,
            pain_level: parseInt(e.target.value)
          })} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{
            background: `linear-gradient(to left, #3B6D11 0%, #854F0B 50%, #A32D2D 100%)`
          }} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646 \u0627\u0644\u0645\u0646\u062C\u0632\u0629")}</label>
              <textarea value={form.exercises_done} onChange={e => setForm({
            ...form,
            exercises_done: e.target.value
          })} className="input-field resize-none h-16" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u062A\u0642\u062F\u0645")}</label>
              <textarea value={form.progress_notes} onChange={e => setForm({
            ...form,
            progress_notes: e.target.value
          })} className="input-field resize-none h-16" />
            </div>
          </>}

        {form.attendance !== 'attended' && <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0633\u0628\u0628 \u0627\u0644\u063A\u064A\u0627\u0628 / \u0627\u0644\u0625\u0644\u063A\u0627\u0621")}</label>
            <textarea value={form.progress_notes} onChange={e => setForm({
          ...form,
          progress_notes: e.target.value
        })} className="input-field resize-none h-20" required />
          </div>}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
          <Button type="submit" loading={saving} className="flex-1">{i18n.t("\u062D\u0641\u0638 \u0627\u0644\u062C\u0644\u0633\u0629")}</Button>
        </div>
      </form>
    </Modal>;
}
export default function RehabilitationDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    hasRole
  } = useAuthStore();
  const canEdit = hasRole(['club_admin', 'doctor', 'physiotherapist', 'manager']);
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fetchProgram = useCallback(async () => {
    try {
      setLoading(true);
      const [progRes, therRes] = await Promise.all([rehabApi.getById(id), rehabApi.getTherapists()]);
      if (progRes.data.success) setProgram(progRes.data.data);
      if (therRes.data.success) setTherapists(therRes.data.data);
    } catch (error) {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C"));
      navigate('/rehabilitation');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);
  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);
  const handleSaveSession = async (formData, sessionId) => {
    try {
      if (sessionId) {
        await rehabApi.updateSession(sessionId, formData);
        toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0646\u062C\u0627\u062D"));
      } else {
        await rehabApi.addSession(id, formData);
        toast.success(i18n.t("\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0646\u062C\u0627\u062D"));
      }
      fetchProgram();
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0641\u0638"));
      throw error;
    }
  };
  const handleDeleteSession = async () => {
    if (!deleteTarget) return;
    try {
      await rehabApi.deleteSession(deleteTarget.id);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062C\u0644\u0633\u0629 \u0628\u0646\u062C\u0627\u062D"));
      setIsDeleteOpen(false);
      fetchProgram();
    } catch (error) {
      toast.error(i18n.t("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0630\u0641"));
    }
  };
  if (loading) {
    return <div className="animate-fade-in p-6">
        <Skeleton className="w-48 h-8 mb-6" />
        <Skeleton className="w-full h-40 mb-6" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="w-full h-64" />
          <Skeleton className="w-full h-64" />
        </div>
      </div>;
  }
  if (!program) return null;
  const STATUS_MAP = {
    active: {
      label: i18n.t("\u0646\u0634\u0637"),
      color: 'primary',
      bg: 'bg-primary-50',
      text: 'text-primary'
    },
    completed: {
      label: i18n.t("\u0645\u0643\u062A\u0645\u0644"),
      color: 'success',
      bg: 'bg-success-light',
      text: 'text-success'
    },
    paused: {
      label: i18n.t("\u0645\u0648\u0642\u0648\u0641"),
      color: 'warning',
      bg: 'bg-warning-light',
      text: 'text-warning'
    },
    cancelled: {
      label: i18n.t("\u0645\u0644\u063A\u0649"),
      color: 'danger',
      bg: 'bg-danger-light',
      text: 'text-danger'
    }
  };
  const statusInfo = STATUS_MAP[program.status] || STATUS_MAP.active;
  return <div className="animate-fade-in">
      {/* رأس الصفحة العائد */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate('/rehabilitation')} className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors font-medium">
          <ArrowRight className="w-5 h-5" />
          <span>{i18n.t("\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644")}</span>
        </button>
      </div>

      {/* بطاقة البرنامج الرئيسية */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{program.program_name}</h1>
            <div className="flex items-center gap-3 text-sm">
              <span className={`px-2.5 py-1 rounded-full font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                {statusInfo.label}
              </span>
              <span className="text-gray-500">{i18n.t("\u0627\u0644\u0645\u0631\u062D\u0644\u0629:")}<span className="font-numbers font-bold text-gray-900">{program.phase}</span> / 4 </span>
              {program.phase_label && <span className="text-gray-500 bg-gray-100 px-2 rounded">{program.phase_label}</span>}
            </div>
          </div>
          
          <Link to={`/players/${program.player.id}`} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl hover:bg-primary-50 transition-colors">
            <Avatar src={program.player?.avatar_url} name={program.player?.name} size="md" />
            <div>
              <p className="font-bold text-gray-900">{program.player?.name}</p>
              <p className="text-sm font-numbers text-gray-500">#{program.player?.number} - {program.player?.position}</p>
            </div>
          </Link>
        </div>

        {/* مؤشر التقدم الرئيسي */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="font-bold text-gray-700">{i18n.t("\u062A\u0642\u062F\u0645 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C")}</span>
            <span className="text-2xl font-bold font-numbers text-primary">{program.progress_pct}%</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{
            width: `${program.progress_pct}%`
          }} />
          </div>
        </div>

        {/* شبكة المعلومات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 mb-1 text-sm">
              <Calendar className="w-4 h-4" />{i18n.t("\u0627\u0644\u0628\u062F\u0627\u064A\u0629")}</div>
            <p className="font-bold font-numbers text-gray-900">{dayjs(program.start_date).format('DD/MM/YYYY')}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 mb-1 text-sm">
              <Clock className="w-4 h-4" />{i18n.t("\u0627\u0644\u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629")}</div>
            <p className="font-bold font-numbers text-gray-900">
              {program.expected_end_date ? dayjs(program.expected_end_date).format('DD/MM/YYYY') : i18n.t("\u063A\u064A\u0631 \u0645\u062D\u062F\u062F")}
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 mb-1 text-sm">
              <Activity className="w-4 h-4" />{i18n.t("\u0627\u0644\u062C\u0644\u0633\u0627\u062A")}</div>
            <p className="font-bold font-numbers text-gray-900 flex gap-2">
              <span className="text-success">{program.sessionStats?.attended || 0}{i18n.t("\u062D\u0636\u0631")}</span>
              <span className="text-gray-300">|</span>
              <span className="text-danger">{program.sessionStats?.missed || 0}{i18n.t("\u063A\u0627\u0628")}</span>
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 mb-1 text-sm">
              <User className="w-4 h-4" />{i18n.t("\u0627\u0644\u0645\u0639\u0627\u0644\u062C \u0627\u0644\u0645\u0633\u0624\u0648\u0644")}</div>
            <p className="font-bold text-gray-900 truncate">
              {program.therapist ? program.therapist.name : i18n.t("\u063A\u064A\u0631 \u0645\u062D\u062F\u062F")}
            </p>
          </div>
        </div>

        {/* الأهداف والوصف */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {program.goals && <div className="bg-primary-50/50 p-4 rounded-xl border border-primary/10">
              <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                <Dumbbell className="w-4 h-4" />{i18n.t("\u0627\u0644\u0623\u0647\u062F\u0627\u0641")}</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{program.goals}</p>
            </div>}
          {program.exercises_description && <div className="bg-info-light/30 p-4 rounded-xl border border-info/10">
              <h4 className="font-bold text-info flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />{i18n.t("\u0648\u0635\u0641 \u0627\u0644\u062A\u0645\u0627\u0631\u064A\u0646")}</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{program.exercises_description}</p>
            </div>}
        </div>
      </div>

      {/* قسم الجلسات */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />{i18n.t("\u0633\u062C\u0644 \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0639\u0644\u0627\u062C\u064A\u0629 (")}{program.sessions?.length || 0})
          </h2>
          {canEdit && program.status !== 'completed' && program.status !== 'cancelled' && <Button onClick={() => {
          setSessionToEdit(null);
          setIsSessionModalOpen(true);
        }} className="gap-2">
              <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u062C\u0644\u0633\u0629")}</Button>}
        </div>

        {program.sessions && program.sessions.length > 0 ? <div className="space-y-4">
            {program.sessions.map(session => <div key={session.id} className="bg-white border text-gray-800 border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shrink-0 ${session.attendance === 'attended' ? 'bg-success-light text-success' : session.attendance === 'missed' ? 'bg-danger-light text-danger' : 'bg-gray-100 text-gray-500'}`}>
                    <span className="text-xs font-bold font-numbers">{dayjs(session.session_date).format('DD')}</span>
                    <span className="text-[10px] uppercase font-numbers">{dayjs(session.session_date).format('MMM')}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">
                        {session.session_type || (session.attendance === 'attended' ? i18n.t("\u062C\u0644\u0633\u0629 \u0639\u0644\u0627\u062C\u064A\u0629") : i18n.t("\u0644\u0645 \u064A\u062D\u0636\u0631"))}
                      </h4>
                      {session.attendance === 'missed' && <Badge variant="danger">{i18n.t("\u062A\u063A\u064A\u0628")}</Badge>}
                      {session.attendance === 'cancelled' && <Badge variant="neutral">{i18n.t("\u0623\u0644\u063A\u064A\u062A")}</Badge>}
                    </div>
                    {session.attendance === 'attended' && <p className="text-sm text-gray-500 mb-1 flex gap-3">
                        <span><Clock className="w-3.5 h-3.5 inline mr-1" /> {session.duration_minutes}{i18n.t("\u062F\u0642\u064A\u0642\u0629")}</span>
                        {session.sessionTherapist && <span><User className="w-3.5 h-3.5 inline mr-1" /> {session.sessionTherapist.name}</span>}
                      </p>}
                    {session.progress_notes && <p className="text-sm text-gray-600 italic bg-gray-50 px-2 py-1 rounded inline-block mt-1">"{session.progress_notes}"</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between flex-1 md:flex-none md:justify-end gap-6">
                  {session.attendance === 'attended' && session.pain_level !== null && <div className="text-center">
                      <p className="text-[10px] text-gray-500 mb-0.5">{i18n.t("\u0627\u0644\u0623\u0644\u0645")}</p>
                      <span className={`font-bold font-numbers ${session.pain_level >= 7 ? 'text-danger' : session.pain_level >= 4 ? 'text-warning' : 'text-success'}`}>
                        {session.pain_level}/10
                      </span>
                    </div>}
                  
                  {canEdit && <div className="flex gap-1 shrink-0">
                      <button onClick={() => {
                setSessionToEdit(session);
                setIsSessionModalOpen(true);
              }} className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => {
                setDeleteTarget(session);
                setIsDeleteOpen(true);
              }} className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-danger hover:bg-danger-light transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>}
                </div>
                
              </div>)}
          </div> : <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u062C\u0644\u0633\u0627\u062A \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0628\u0639\u062F")}</p>
          </div>}
      </div>

      {/* Modals */}
      <SessionModal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} onSave={handleSaveSession} sessionToEdit={sessionToEdit} therapists={therapists} />

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title={i18n.t("\u062D\u0630\u0641 \u0627\u0644\u062C\u0644\u0633\u0629")} size="sm">
        <div className="text-center">
          <Trash2 className="w-12 h-12 text-danger mx-auto mb-4" />
          <p className="text-gray-800 mb-6 font-semibold">{i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u062C\u0644\u0633\u0629\u061F \u0644\u0646 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621.")}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button variant="danger" onClick={handleDeleteSession} className="flex-1">{i18n.t("\u0645\u062A\u0623\u0643\u062F\u060C \u0627\u062D\u0630\u0641")}</Button>
          </div>
        </div>
      </Modal>

    </div>;
}