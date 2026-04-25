import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, User, Activity, Target, Award, BarChart3, X } from 'lucide-react';
import { performanceApi } from '../../api/endpoints/performance';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
const CUSTOM_CRITERIA_KEY = 'smis-custom-performance-criteria';
const trendColors = {
  up: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: '↗',
    label: i18n.t("\u062A\u062D\u0633\u0646")
  },
  stable: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: '→',
    label: i18n.t("\u062B\u0627\u0628\u062A")
  },
  down: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: '↘',
    label: i18n.t("\u062A\u0631\u0627\u062C\u0639")
  }
};
export default function Performance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [metaData, setMetaData] = useState({
    players: [],
    evaluators: [],
    trendOptions: []
  });
  const [filters, setFilters] = useState({
    player_id: searchParams.get('player_id') || ''
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPerf, setSelectedPerf] = useState(null);
  const [formData, setFormData] = useState({
    player_id: '',
    evaluation_date: '',
    vo2_max: '',
    max_speed_kmh: '',
    strength_pct: '',
    endurance_pct: '',
    flexibility_pct: '',
    agility_score: '',
    reaction_time_ms: '',
    overall_score_pct: '',
    physical_readiness_pct: '',
    mental_readiness_pct: '',
    trend: '',
    notes: '',
    recommendations: ''
  });
  const fetchMeta = useCallback(async () => {
    try {
      const response = await performanceApi.getMeta();
      if (response.data.success) setMetaData(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }, []);
  const fetchPerformances = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        player_id: filters.player_id
      };
      const response = await performanceApi.getAll(params);
      if (response.data.success) {
        setPerformances(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error(error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);
  useEffect(() => {
    fetchPerformances();
  }, [fetchPerformances]);
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
  const emptyForm = {
    player_id: '',
    evaluation_date: '',
    vo2_max: '',
    max_speed_kmh: '',
    strength_pct: '',
    endurance_pct: '',
    flexibility_pct: '',
    agility_score: '',
    reaction_time_ms: '',
    overall_score_pct: '',
    physical_readiness_pct: '',
    mental_readiness_pct: '',
    trend: '',
    notes: '',
    recommendations: ''
  };
  const handleOpenForm = (perf = null) => {
    if (perf) {
      setSelectedPerf(perf);
      setFormData({
        player_id: perf.player_id || '',
        evaluation_date: perf.evaluation_date || '',
        vo2_max: perf.vo2_max || '',
        max_speed_kmh: perf.max_speed_kmh || '',
        strength_pct: perf.strength_pct || '',
        endurance_pct: perf.endurance_pct || '',
        flexibility_pct: perf.flexibility_pct || '',
        agility_score: perf.agility_score || '',
        reaction_time_ms: perf.reaction_time_ms || '',
        overall_score_pct: perf.overall_score_pct || '',
        physical_readiness_pct: perf.physical_readiness_pct || '',
        mental_readiness_pct: perf.mental_readiness_pct || '',
        trend: perf.trend || '',
        notes: perf.notes || '',
        recommendations: perf.recommendations || ''
      });
    } else {
      setSelectedPerf(null);
      setFormData(emptyForm);
    }
    setIsFormOpen(true);
  };
  const handleSave = async payload => {
    try {
      if (!payload.player_id || !payload.evaluation_date) {
        toast.error(i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0645\u0637\u0644\u0648\u0628\u0627\u0646"));
        return;
      }
      if (selectedPerf) {
        await performanceApi.update(selectedPerf.id, payload);
        toast.success(i18n.t("\u062A\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B \u0628\u0646\u062C\u0627\u062D"));
      } else {
        await performanceApi.create(payload);
        toast.success(i18n.t("\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0628\u0646\u062C\u0627\u062D"));
      }
      setIsFormOpen(false);
      fetchPerformances();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623"));
    }
  };
  const handleDelete = async perf => {
    if (!window.confirm(i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u061F"))) return;
    try {
      await performanceApi.delete(perf.id);
      toast.success(i18n.t("\u062A\u0645 \u0627\u0644\u062D\u0630\u0641 \u0628\u0646\u062C\u0627\u062D"));
      fetchPerformances();
    } catch (error) {
      console.error(error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623"));
    }
  };
  const renderScoreBar = (value, label, hideValue = false) => {
    const pct = Math.min(100, Math.max(0, value || 0));
    const color = pct >= 80 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-danger';
    return <div className="mb-2">
        {!hideValue && <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{label}</span>
            <span className="font-bold font-numbers">{value || '—'}</span>
          </div>}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all`} style={{
          width: `${pct}%`
        }} />
        </div>
      </div>;
  };
  const renderRow = perf => {
    const player = perf.player || {};
    const trendInfo = trendColors[perf.trend] || trendColors.stable;
    return <tr key={perf.id} className="border-b border-gray-100 hover:bg-gray-50 group">
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <Avatar name={player.name} size="md" />
            <div>
              <p className="font-medium text-gray-900">{player.name || '—'}</p>
              <p className="text-xs text-gray-500">#{player.number || '—'} · {player.position || '—'}</p>
            </div>
          </div>
        </td>
        <td className="py-4 px-4 font-numbers text-gray-700">{formatDate(perf.evaluation_date)}</td>
        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-24">{renderScoreBar(perf.overall_score_pct, '', true)}</div>
            <span className="font-bold text-sm font-numbers">{perf.overall_score_pct != null ? `${perf.overall_score_pct}%` : '—'}</span>
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="flex gap-2 text-xs">
            {perf.strength_pct && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{i18n.t("\u0642\u0648\u0629:")}{perf.strength_pct}%</span>}
            {perf.endurance_pct && <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded">{i18n.t("\u062A\u062D\u0645\u0644:")}{perf.endurance_pct}%</span>}
          </div>
        </td>
        <td className="py-4 px-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${trendInfo.bg} ${trendInfo.text}`}>
            {trendInfo.icon} {trendInfo.label}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100">
            <button onClick={() => handleOpenForm(perf)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(perf)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-danger hover:bg-danger-light transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>;
  };
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <span>{i18n.t("\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0623\u062F\u0627\u0621")}</span>
            <span className="text-sm font-normal text-gray-500">({meta.total})</span>
          </div>} subtitle={i18n.t("\u062A\u0642\u064A\u064A\u0645 \u0648\u062A\u062A\u0628\u0639 \u0623\u062F\u0627\u0621 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u062A\u0642\u064A\u064A\u0645")}</Button>
      </PageHeader>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{
        label: i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A"),
        value: meta.total,
        icon: BarChart3,
        color: 'text-primary'
      }, {
        label: i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0646\u062A\u064A\u062C\u0629"),
        value: performances.length ? Math.round(performances.reduce((s, p) => s + (p.overall_score_pct || 0), 0) / performances.length) + '%' : '—',
        icon: Target,
        color: 'text-success'
      }, {
        label: i18n.t("\u062A\u062D\u0633\u0646"),
        value: performances.filter(p => p.trend === 'up').length,
        icon: TrendingUp,
        color: 'text-success'
      }, {
        label: i18n.t("\u062A\u0631\u0627\u062C\u0639"),
        value: performances.filter(p => p.trend === 'down').length,
        icon: Activity,
        color: 'text-danger'
      }].map((s, i) => <div key={i} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-numbers">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>)}
      </div>

      <div className="card mb-6">
        <div className="flex gap-4">
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={filters.player_id} onChange={e => handleFilterChange('player_id', e.target.value)} className="input-field pr-10 min-w-[200px]">
              <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</option>
              {metaData.players?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {filters.player_id && <button onClick={() => handleFilterChange('player_id', '')} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <X className="w-4 h-4" />{i18n.t("\u0645\u0633\u062D")}</button>}
        </div>
      </div>

      {loading ? <div className="card">
          <table className="w-full">
            <tbody>
              {[...Array(5)].map((_, i) => <tr key={i}>
                  <td className="p-4"><Skeleton className="w-48 h-5" /></td>
                  <td className="p-4"><Skeleton className="w-24 h-5" /></td>
                  <td className="p-4"><Skeleton className="w-32 h-5" /></td>
                  <td className="p-4"><Skeleton className="w-16 h-8" /></td>
                </tr>)}
            </tbody>
          </table>
        </div> : performances.length === 0 ? <div className="card text-center py-16">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0642\u064A\u064A\u0645\u0627\u062A")}</h3>
          <p className="text-gray-500 mb-4">{i18n.t("\u0627\u0628\u062F\u0623 \u0628\u0625\u0636\u0627\u0641\u0629 \u0623\u0648\u0644 \u062A\u0642\u064A\u064A\u0645 \u0623\u062F\u0627\u0621 \u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</p>
          <Button onClick={() => handleOpenForm()}><Plus className="w-4 h-4 ml-2" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u062A\u0642\u064A\u064A\u0645")}</Button>
        </div> : <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-right py-3 px-4 font-semibold">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
                    <th className="text-right py-3 px-4 font-semibold">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
                    <th className="text-right py-3 px-4 font-semibold">{i18n.t("\u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629")}</th>
                    <th className="text-right py-3 px-4 font-semibold">{i18n.t("\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A")}</th>
                    <th className="text-right py-3 px-4 font-semibold">{i18n.t("\u0627\u0644\u0627\u062A\u062C\u0627\u0647")}</th>
                    <th className="text-right py-3 px-4 font-semibold">{i18n.t("\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                  </tr>
                </thead>
                <tbody>{performances.map(renderRow)}</tbody>
              </table>
            </div>
          </div>

          {meta.totalPages > 1 && <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => handlePageChange(meta.page - 1)} disabled={meta.page === 1} className="w-10 h-10 rounded-lg border disabled:opacity-50 flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </button>
              {[...Array(meta.totalPages)].map((_, i) => <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 rounded-lg font-numbers ${meta.page === i + 1 ? 'bg-primary text-white' : 'border hover:bg-gray-50'}`}>
                  {i + 1}
                </button>)}
              <button onClick={() => handlePageChange(meta.page + 1)} disabled={meta.page === meta.totalPages} className="w-10 h-10 rounded-lg border disabled:opacity-50 flex items-center justify-center">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>}
        </>}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedPerf ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0623\u062F\u0627\u0621") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u062A\u0642\u064A\u064A\u0645 \u0623\u062F\u0627\u0621")} size="xl">
        <PerformanceForm formData={formData} setFormData={setFormData} metaData={metaData} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>;
}
// NumberField must be defined OUTSIDE PerformanceForm to prevent re-mounting on every keystroke
function NumberField({ label, field, max = 100, step = 1, hint = '', value, onChange }) {
  return <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {hint && <span className="text-xs text-gray-400 mr-1">({hint})</span>}
    </label>
    <input
      type="number"
      step={step}
      max={max}
      min={0}
      value={value}
      onChange={e => onChange(field, e.target.value)}
      className="input-field w-full"
      placeholder="0"
    />
  </div>;
}

function PerformanceForm({
  formData,
  setFormData,
  metaData,
  onSave,
  onCancel
}) {
  const [customCriteria, setCustomCriteria] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_CRITERIA_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [customValues, setCustomValues] = useState({});
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [newCriteria, setNewCriteria] = useState({
    name: '',
    unit: '',
    min: '',
    max: ''
  });
  const update = useCallback((field, value) => setFormData(prev => ({
    ...prev,
    [field]: value
  })), [setFormData]);
  const saveCriteria = () => {
    if (!newCriteria.name.trim()) return;
    const entry = {
      id: Date.now().toString(),
      ...newCriteria
    };
    const updated = [...customCriteria, entry];
    setCustomCriteria(updated);
    localStorage.setItem(CUSTOM_CRITERIA_KEY, JSON.stringify(updated));
    setNewCriteria({
      name: '',
      unit: '',
      min: '',
      max: ''
    });
    setShowAddCriteria(false);
  };
  const removeCriteria = id => {
    const updated = customCriteria.filter(c => c.id !== id);
    setCustomCriteria(updated);
    localStorage.setItem(CUSTOM_CRITERIA_KEY, JSON.stringify(updated));
    setCustomValues(prev => {
      const n = {
        ...prev
      };
      delete n[id];
      return n;
    });
  };
  const handleSubmit = () => {
    const payload = {
      ...formData
    };
    const customEntries = customCriteria.filter(c => customValues[c.id] !== '' && customValues[c.id] !== undefined).map(c => `${c.name}: ${customValues[c.id]}${c.unit ? ' ' + c.unit : ''}`);
    if (customEntries.length > 0) {
      const customText = i18n.t("\n[\u0645\u0639\u0627\u064A\u064A\u0631 \u0645\u062E\u0635\u0635\u0629]\n") + customEntries.join('\n');
      payload.notes = (payload.notes || '') + customText;
    }
    onSave(payload);
  };
  return <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
      {/* اللاعب والتاريخ */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 *")}</label>
          <select value={formData.player_id} onChange={e => update('player_id', e.target.value)} className="input-field w-full" required>
            <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0644\u0627\u0639\u0628")}</option>
            {metaData.players?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Input label={i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E *")} type="date" value={formData.evaluation_date} onChange={e => update('evaluation_date', e.target.value)} />
      </div>

      {/* المؤشرات البدنية */}
      <div className="border rounded-xl p-4">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />{i18n.t("\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0628\u062F\u0646\u064A\u0629")}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <NumberField label="VO2 Max" field="vo2_max" max={80} step={0.1} hint={i18n.t("\u0645\u0644/\u0643\u063A/\u062F")} value={formData.vo2_max} onChange={update} />
          <NumberField label={i18n.t("\u0623\u0642\u0635\u0649 \u0633\u0631\u0639\u0629")} field="max_speed_kmh" max={50} step={0.1} hint={i18n.t("\u0643\u0645/\u0633")} value={formData.max_speed_kmh} onChange={update} />
          <NumberField label={i18n.t("\u0627\u0644\u0642\u0648\u0629")} field="strength_pct" hint="%" value={formData.strength_pct} onChange={update} />
          <NumberField label={i18n.t("\u0627\u0644\u062A\u062D\u0645\u0644")} field="endurance_pct" hint="%" value={formData.endurance_pct} onChange={update} />
          <NumberField label={i18n.t("\u0627\u0644\u0645\u0631\u0648\u0646\u0629")} field="flexibility_pct" hint="%" value={formData.flexibility_pct} onChange={update} />
          <NumberField label={i18n.t("\u0627\u0644\u0631\u0634\u0627\u0642\u0629")} field="agility_score" hint={i18n.t("\u0646\u0642\u0637\u0629")} value={formData.agility_score} onChange={update} />
          <NumberField label={i18n.t("\u0632\u0645\u0646 \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629")} field="reaction_time_ms" max={2000} hint={i18n.t("\u0645\u0644\u064A \u062B\u0627\u0646\u064A\u0629")} value={formData.reaction_time_ms} onChange={update} />
          <NumberField label={i18n.t("\u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629")} field="overall_score_pct" hint="%" value={formData.overall_score_pct} onChange={update} />
        </div>
      </div>

      {/* الجاهزية */}
      <div className="border rounded-xl p-4">
        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />{i18n.t("\u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629")}</h4>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label={i18n.t("\u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0628\u062F\u0646\u064A\u0629")} field="physical_readiness_pct" hint="%" value={formData.physical_readiness_pct} onChange={update} />
          <NumberField label={i18n.t("\u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0630\u0647\u0646\u064A\u0629")} field="mental_readiness_pct" hint="%" value={formData.mental_readiness_pct} onChange={update} />
        </div>
      </div>

      {/* معايير مخصصة */}
      <div className="border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />{i18n.t("\u0645\u0639\u0627\u064A\u064A\u0631 \u0645\u062E\u0635\u0635\u0629")}</h4>
          <button type="button" onClick={() => setShowAddCriteria(true)} className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium">
            <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0639\u064A\u0627\u0631")}</button>
        </div>

        {showAddCriteria && <div className="bg-primary-light rounded-xl p-4 mb-4 border border-primary/20">
            <p className="text-sm font-medium text-gray-700 mb-3">{i18n.t("\u0645\u0639\u064A\u0627\u0631 \u062C\u062F\u064A\u062F")}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">{i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0639\u064A\u0627\u0631 *")}</label>
                <input type="text" value={newCriteria.name} onChange={e => setNewCriteria(p => ({
              ...p,
              name: e.target.value
            }))} className="input-field w-full text-sm" placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0627\u0644\u0633\u0631\u0639\u0629 \u0627\u0644\u0627\u0646\u0641\u062C\u0627\u0631\u064A\u0629")} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{i18n.t("\u0627\u0644\u0648\u062D\u062F\u0629")}</label>
                <input type="text" value={newCriteria.unit} onChange={e => setNewCriteria(p => ({
              ...p,
              unit: e.target.value
            }))} className="input-field w-full text-sm" placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u062B\u0627\u0646\u064A\u0629")} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{i18n.t("\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0627\u0644\u0637\u0628\u064A\u0639\u064A")}</label>
                <input type="number" value={newCriteria.min} onChange={e => setNewCriteria(p => ({
              ...p,
              min: e.target.value
            }))} className="input-field w-full text-sm" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">{i18n.t("\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0637\u0628\u064A\u0639\u064A")}</label>
                <input type="number" value={newCriteria.max} onChange={e => setNewCriteria(p => ({
              ...p,
              max: e.target.value
            }))} className="input-field w-full text-sm" placeholder="100" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={saveCriteria} className="btn btn-primary text-sm px-4 py-2">{i18n.t("\u062D\u0641\u0638")}</button>
              <button type="button" onClick={() => setShowAddCriteria(false)} className="btn btn-ghost text-sm px-4 py-2">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</button>
            </div>
          </div>}

        {customCriteria.length === 0 && !showAddCriteria ? <p className="text-sm text-gray-400 text-center py-4">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0639\u0627\u064A\u064A\u0631 \u0645\u062E\u0635\u0635\u0629. \u0623\u0636\u0641 \u0645\u0639\u0627\u064A\u064A\u0631 \u0644\u062A\u0642\u064A\u064A\u0645 \u0623\u062F\u0627\u0621 \u0625\u0636\u0627\u0641\u064A\u0629.")}</p> : <div className="grid grid-cols-2 gap-3">
            {customCriteria.map(c => {
          const val = parseFloat(customValues[c.id] || '');
          const isAbnormal = !isNaN(val) && (c.min && val < parseFloat(c.min) || c.max && val > parseFloat(c.max));
          return <div key={c.id} className={`p-3 rounded-lg border ${isAbnormal ? 'border-warning bg-warning-light' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">
                      {c.name} {c.unit && <span className="text-xs text-gray-400">({c.unit})</span>}
                    </label>
                    <button type="button" onClick={() => removeCriteria(c.id)} className="text-gray-400 hover:text-danger">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input type="number" value={customValues[c.id] || ''} onChange={e => setCustomValues(p => ({
              ...p,
              [c.id]: e.target.value
            }))} className="input-field w-full text-sm" placeholder={c.min && c.max ? `${c.min} - ${c.max}` : '0'} />
                  {isAbnormal && <p className="text-xs text-warning mt-1">{i18n.t("\u26A0 \u062E\u0627\u0631\u062C \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0637\u0628\u064A\u0639\u064A")}</p>}
                </div>;
        })}
          </div>}
      </div>

      {/* الاتجاه والمقارنة */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0627\u062A\u062C\u0627\u0647")}</label>
          <select value={formData.trend} onChange={e => update('trend', e.target.value)} className="input-field w-full">
            <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0627\u062A\u062C\u0627\u0647")}</option>
            <option value="up">{i18n.t("\u2197 \u062A\u062D\u0633\u0646")}</option>
            <option value="stable">{i18n.t("\u2192 \u062B\u0627\u0628\u062A")}</option>
            <option value="down">{i18n.t("\u2198 \u062A\u0631\u0627\u062C\u0639")}</option>
          </select>
        </div>
        <NumberField label={i18n.t("\u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0633\u0627\u0628\u0642")} field="comparison_previous_pct" hint="%" value={formData.comparison_previous_pct} onChange={update} />
      </div>

      {/* ملاحظات وتوصيات */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</label>
          <textarea value={formData.notes} onChange={e => update('notes', e.target.value)} className="input-field w-full h-20 resize-none" placeholder={i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0639\u0646 \u0627\u0644\u0623\u062F\u0627\u0621...")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A")}</label>
          <textarea value={formData.recommendations} onChange={e => update('recommendations', e.target.value)} className="input-field w-full h-20 resize-none" placeholder={i18n.t("\u062A\u0648\u0635\u064A\u0627\u062A \u0644\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0623\u062F\u0627\u0621...")} />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button variant="outline" onClick={onCancel} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
        <Button onClick={handleSubmit} className="flex-1">
          {customCriteria.filter(c => customValues[c.id]).length > 0 ? `${i18n.t('حفظ')} (${8 + customCriteria.filter(c => customValues[c.id]).length} ${i18n.t('معيار')})` : i18n.t("\u062D\u0641\u0638 \u0627\u0644\u062A\u0642\u064A\u064A\u0645")}
        </Button>
      </div>
    </div>;
}