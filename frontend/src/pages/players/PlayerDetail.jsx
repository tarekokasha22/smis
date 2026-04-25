import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, User, Activity, FileText, Calendar, Heart, Dumbbell, TrendingUp, FolderOpen, Pill, ClipboardList, ChevronLeft, Edit2, Trash2, Phone, MapPin, Ruler, Weight, Droplet, AlertCircle, CheckCircle2, Clock, FileX, Plus, Tag, AlertTriangle, Eye, RefreshCw, Download, Lock, TrendingDown, Minus, Stethoscope, HeartPulse, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { playersApi } from '../../api/endpoints/players';
import { injuriesApi } from '../../api/endpoints/injuries';
import { vitalsApi } from '../../api/endpoints/vitals';
import { measurementsApi } from '../../api/endpoints/measurements';
import { rehabApi } from '../../api/endpoints/rehabilitation';
import { performanceApi } from '../../api/endpoints/performance';
import { filesApi } from '../../api/endpoints/files';
import { appointmentsApi } from '../../api/endpoints/appointments';
import { equipmentApi } from '../../api/endpoints/equipment';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import PlayerFormModal from './PlayerFormModal';
import InjuryDetailModal from '../injuries/InjuryDetailModal';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

// ── Status maps ──────────────────────────────
const statusMap = {
  ready: {
    label: i18n.t("\u062C\u0627\u0647\u0632"),
    color: 'success',
    bg: 'bg-success-light',
    text: 'text-success',
    icon: CheckCircle2
  },
  injured: {
    label: i18n.t("\u0645\u0635\u0627\u0628"),
    color: 'danger',
    bg: 'bg-danger-light',
    text: 'text-danger',
    icon: AlertCircle
  },
  rehab: {
    label: i18n.t("\u062A\u0623\u0647\u064A\u0644"),
    color: 'info',
    bg: 'bg-info-light',
    text: 'text-info',
    icon: Activity
  },
  suspended: {
    label: i18n.t("\u0645\u0648\u0642\u0648\u0641"),
    color: 'warning',
    bg: 'bg-warning-light',
    text: 'text-warning',
    icon: Clock
  },
  unknown: {
    label: i18n.t("\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"),
    color: 'gray',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: User
  }
};
const bloodTypeColors = {
  'A+': 'bg-blue-100 text-blue-700',
  'A-': 'bg-blue-50 text-blue-600',
  'B+': 'bg-green-100 text-green-700',
  'B-': 'bg-green-50 text-green-600',
  'AB+': 'bg-purple-100 text-purple-700',
  'AB-': 'bg-purple-50 text-purple-600',
  'O+': 'bg-red-100 text-red-700',
  'O-': 'bg-red-50 text-red-600'
};
const severityMap = {
  mild: {
    label: i18n.t("\u0628\u0633\u064A\u0637\u0629"),
    bg: 'bg-success-light',
    text: 'text-success'
  },
  moderate: {
    label: i18n.t("\u0645\u062A\u0648\u0633\u0637\u0629"),
    bg: 'bg-warning-light',
    text: 'text-warning'
  },
  severe: {
    label: i18n.t("\u0634\u062F\u064A\u062F\u0629"),
    bg: 'bg-danger-light',
    text: 'text-danger'
  },
  critical: {
    label: i18n.t("\u062D\u0631\u062C\u0629"),
    bg: 'bg-danger-light',
    text: 'text-danger'
  }
};
const injuryStatusMap = {
  active: {
    label: i18n.t("\u0646\u0634\u0637\u0629"),
    bg: 'bg-danger-light',
    text: 'text-danger',
    icon: AlertTriangle
  },
  recovering: {
    label: i18n.t("\u0642\u064A\u062F \u0627\u0644\u062A\u0639\u0627\u0641\u064A"),
    bg: 'bg-warning-light',
    text: 'text-warning',
    icon: Activity
  },
  closed: {
    label: i18n.t("\u0645\u063A\u0644\u0642"),
    bg: 'bg-success-light',
    text: 'text-success',
    icon: CheckCircle2
  }
};
const rehabStatusMap = {
  active: {
    label: i18n.t("\u0646\u0634\u0637"),
    bg: 'bg-primary-50',
    text: 'text-primary'
  },
  completed: {
    label: i18n.t("\u0645\u0643\u062A\u0645\u0644"),
    bg: 'bg-success-light',
    text: 'text-success'
  },
  paused: {
    label: i18n.t("\u0645\u0648\u0642\u0648\u0641"),
    bg: 'bg-warning-light',
    text: 'text-warning'
  },
  cancelled: {
    label: i18n.t("\u0645\u0644\u063A\u0649"),
    bg: 'bg-gray-100',
    text: 'text-gray-500'
  }
};
const aptStatusMap = {
  scheduled: {
    label: i18n.t("\u0645\u062C\u062F\u0648\u0644"),
    bg: 'bg-primary-50',
    text: 'text-primary'
  },
  completed: {
    label: i18n.t("\u0645\u0646\u062C\u0632"),
    bg: 'bg-success-light',
    text: 'text-success'
  },
  cancelled: {
    label: i18n.t("\u0645\u0644\u063A\u0649"),
    bg: 'bg-gray-100',
    text: 'text-gray-500'
  },
  no_show: {
    label: i18n.t("\u0644\u0645 \u064A\u062D\u0636\u0631"),
    bg: 'bg-danger-light',
    text: 'text-danger'
  },
  rescheduled: {
    label: i18n.t("\u0645\u064F\u0639\u0627\u062F"),
    bg: 'bg-warning-light',
    text: 'text-warning'
  }
};
const FILE_TYPES = {
  xray: i18n.t("\u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629"),
  mri: i18n.t("\u0631\u0646\u064A\u0646 \u0645\u063A\u0646\u0627\u0637\u064A\u0633\u064A"),
  scan: i18n.t("\u0645\u0633\u062D \u0636\u0648\u0626\u064A"),
  report: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0637\u0628\u064A"),
  contract: i18n.t("\u0639\u0642\u062F"),
  lab: i18n.t("\u0646\u062A\u0627\u0626\u062C \u0645\u062E\u0628\u0631\u064A\u0629"),
  other: i18n.t("\u0623\u062E\u0631\u0649")
};
const TX_TYPES = {
  dispense: {
    label: i18n.t("\u0635\u0631\u0641"),
    icon: ArrowDownCircle,
    color: 'text-danger'
  },
  restock: {
    label: i18n.t("\u0625\u0636\u0627\u0641\u0629"),
    icon: ArrowUpCircle,
    color: 'text-success'
  },
  adjustment: {
    label: i18n.t("\u062A\u0639\u062F\u064A\u0644"),
    icon: RefreshCw,
    color: 'text-warning'
  },
  expired_disposal: {
    label: i18n.t("\u0625\u062A\u0644\u0627\u0641"),
    icon: Trash2,
    color: 'text-gray-500'
  }
};

// Helper component
function InfoCard({
  label,
  value
}) {
  return <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900 font-numbers">{value}</p>
    </div>;
}
function EmptyState({
  icon: Icon,
  title,
  subtitle
}) {
  return <div className="text-center py-14">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <Icon className="w-8 h-8 text-gray-300" />
      </div>
      <h4 className="font-semibold text-gray-700 mb-1">{title}</h4>
      {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
    </div>;
}
function TabLoading() {
  return <div className="space-y-3">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>;
}

// ── Vitals Tab ───────────────────────────────
function VitalsTab({
  playerId
}) {
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    vitalsApi.getPlayerVitals(playerId, {
      days: 180
    }).then(r => {
      if (r.data.success) {
        const arr = r.data.data?.vitals || r.data.data || [];
        setVitals([...arr].reverse());
      }
    }).catch(() => toast.error(i18n.t("\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629"))).finally(() => setLoading(false));
  }, [playerId]);
  if (loading) return <TabLoading />;
  if (!vitals.length) return <EmptyState icon={Activity} title={i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0624\u0634\u0631\u0627\u062A \u062D\u064A\u0648\u064A\u0629")} subtitle={i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u0642\u064A\u0627\u0633\u0627\u062A \u062D\u064A\u0648\u064A\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0639\u062F")} />;
  const latest = vitals[0];
  const ABNORMAL = {
    heart_rate: v => v > 100 || v < 50,
    spo2: v => v < 95,
    temperature: v => v > 37.5,
    blood_pressure_systolic: v => v > 140,
    fatigue_level: v => v >= 8
  };
  function VitalBadge({
    label,
    value,
    unit,
    field
  }) {
    if (!value && value !== 0) return null;
    const abnormal = ABNORMAL[field]?.(parseFloat(value));
    return <div className={`p-3 rounded-xl border text-center ${abnormal ? 'bg-danger-light border-danger/20' : 'bg-gray-50 border-gray-100'}`}>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className={`text-lg font-bold font-numbers ${abnormal ? 'text-danger' : 'text-gray-900'}`}>
          {value}<span className="text-xs font-normal ml-0.5">{unit}</span>
        </p>
        {abnormal && <p className="text-[10px] text-danger mt-0.5">{i18n.t("\u26A0 \u062E\u0627\u0631\u062C \u0627\u0644\u0637\u0628\u064A\u0639\u064A")}</p>}
      </div>;
  }
  return <div className="space-y-6">
      {/* Latest reading */}
      <div>
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-primary" />{i18n.t("\u0622\u062E\u0631 \u0642\u064A\u0627\u0633 \u2014")}{dayjs(latest.recorded_at).format('DD/MM/YYYY HH:mm')}
        </h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <VitalBadge label={i18n.t("\u0645\u0639\u062F\u0644 \u0627\u0644\u0642\u0644\u0628")} value={latest.heart_rate} unit={i18n.t("\u0646\u0628\u0636\u0629/\u062F")} field="heart_rate" />
          <VitalBadge label="SpO2" value={latest.spo2} unit="%" field="spo2" />
          <VitalBadge label={i18n.t("\u0627\u0644\u062D\u0631\u0627\u0631\u0629")} value={latest.temperature} unit="°C" field="temperature" />
          <VitalBadge label={i18n.t("\u0636\u063A\u0637 \u0627\u0644\u062F\u0645")} value={latest.blood_pressure_systolic ? `${latest.blood_pressure_systolic}/${latest.blood_pressure_diastolic}` : null} unit="mmHg" field="blood_pressure_systolic" />
          <VitalBadge label={i18n.t("\u0627\u0644\u0648\u0632\u0646")} value={latest.weight} unit={i18n.t("\u0643\u062C\u0645")} field="weight" />
          <VitalBadge label={i18n.t("\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062A\u0639\u0628")} value={latest.fatigue_level} unit="/10" field="fatigue_level" />
        </div>
      </div>

      {/* History table */}
      <div>
        <h4 className="font-bold text-gray-800 mb-3">{i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629")}</h4>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E"), i18n.t("\u0627\u0644\u0642\u0644\u0628"), 'SpO2', i18n.t("\u0627\u0644\u062D\u0631\u0627\u0631\u0629"), i18n.t("\u0636\u063A\u0637 \u0627\u0644\u062F\u0645"), i18n.t("\u0627\u0644\u0648\u0632\u0646"), i18n.t("\u0627\u0644\u062A\u0639\u0628"), i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")].map(h => <th key={h} className="text-right px-3 py-3 text-xs font-bold text-gray-500">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vitals.map(v => <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 font-numbers text-xs text-gray-500 whitespace-nowrap">{dayjs(v.recorded_at).format('DD/MM/YY HH:mm')}</td>
                  <td className="px-3 py-2.5 font-numbers text-center">
                    <span className={v.heart_rate > 100 || v.heart_rate < 50 ? 'text-danger font-bold' : 'text-gray-700'}>
                      {v.heart_rate ?? '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-numbers text-center">
                    <span className={v.spo2 < 95 ? 'text-danger font-bold' : 'text-gray-700'}>{v.spo2 ?? '—'}</span>
                  </td>
                  <td className="px-3 py-2.5 font-numbers text-center">
                    <span className={v.temperature > 37.5 ? 'text-danger font-bold' : 'text-gray-700'}>{v.temperature ?? '—'}</span>
                  </td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-700 text-xs">
                    {v.blood_pressure_systolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '—'}
                  </td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-700">{v.weight ?? '—'}</td>
                  <td className="px-3 py-2.5 font-numbers text-center">
                    {v.fatigue_level != null ? <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${v.fatigue_level >= 8 ? 'bg-danger-light text-danger' : v.fatigue_level >= 6 ? 'bg-warning-light text-warning' : 'bg-success-light text-success'}`}>
                        {v.fatigue_level}/10
                      </span> : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-400 max-w-[120px] truncate">{v.notes || '—'}</td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}

// ── Measurements Tab ─────────────────────────
function MeasurementsTab({
  playerId
}) {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    measurementsApi.getAll({
      player_id: playerId,
      limit: 20
    }).then(r => {
      if (r.data.success) setMeasurements(r.data.data || []);
    }).catch(() => toast.error(i18n.t("\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u0645"))).finally(() => setLoading(false));
  }, [playerId]);
  if (loading) return <TabLoading />;
  if (!measurements.length) return <EmptyState icon={Ruler} title={i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u064A\u0627\u0633\u0627\u062A \u062C\u0633\u0645")} subtitle={i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u0642\u064A\u0627\u0633\u0627\u062A \u0644\u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0639\u062F")} />;
  const latest = measurements[0];
  return <div className="space-y-6">
      {/* Latest */}
      <div>
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Ruler className="w-4 h-4 text-primary" />{i18n.t("\u0622\u062E\u0631 \u0642\u064A\u0627\u0633 \u2014")}{dayjs(latest.measured_at).format('DD/MM/YYYY')}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{
          label: i18n.t("\u0627\u0644\u0648\u0632\u0646"),
          value: latest.weight,
          unit: i18n.t("\u0643\u062C\u0645")
        }, {
          label: i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u062F\u0647\u0648\u0646"),
          value: latest.body_fat_pct,
          unit: '%'
        }, {
          label: i18n.t("\u0627\u0644\u0643\u062A\u0644\u0629 \u0627\u0644\u0639\u0636\u0644\u064A\u0629"),
          value: latest.muscle_mass_kg,
          unit: i18n.t("\u0643\u062C\u0645")
        }, {
          label: 'InBody Score',
          value: latest.inbody_score,
          unit: ''
        }].map(({
          label,
          value,
          unit
        }) => value != null ? <div key={label} className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-bold font-numbers text-gray-900">{value}<span className="text-xs font-normal ml-0.5">{unit}</span></p>
            </div> : null)}
        </div>
      </div>

      {/* History */}
      <div>
        <h4 className="font-bold text-gray-800 mb-3">{i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A")}</h4>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E"), i18n.t("\u0627\u0644\u0648\u0632\u0646 (\u0643\u062C\u0645)"), i18n.t("\u062F\u0647\u0648\u0646 %"), i18n.t("\u0639\u0636\u0644\u0627\u062A (\u0643\u062C\u0645)"), i18n.t("\u0645\u0627\u0621 %"), 'InBody', i18n.t("\u0627\u0644\u0635\u062F\u0631"), i18n.t("\u0627\u0644\u062E\u0635\u0631"), i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")].map(h => <th key={h} className="text-right px-3 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {measurements.map(m => <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 font-numbers text-xs text-gray-500 whitespace-nowrap">{dayjs(m.measured_at).format('DD/MM/YYYY')}</td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-700">{m.weight ?? '—'}</td>
                  <td className="px-3 py-2.5 font-numbers text-center">
                    {m.body_fat_pct != null ? <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.body_fat_pct > 20 ? 'bg-orange-100 text-orange-700' : 'bg-green-50 text-green-700'}`}>{m.body_fat_pct}%</span> : '—'}
                  </td>
                  <td className="px-3 py-2.5 font-numbers text-center text-blue-700 font-medium">{m.muscle_mass_kg ?? '—'}</td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-700">{m.water_pct != null ? `${m.water_pct}%` : '—'}</td>
                  <td className="px-3 py-2.5 font-numbers text-center font-bold text-primary">{m.inbody_score ?? '—'}</td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-700">{m.chest_cm ?? '—'}</td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-700">{m.waist_cm ?? '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-400 max-w-[120px] truncate">{m.notes || '—'}</td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}

// ── Rehabilitation Tab ───────────────────────
function RehabilitationTab({
  playerId
}) {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    rehabApi.getAll({
      player_id: playerId,
      limit: 20
    }).then(r => {
      if (r.data.success) setPrograms(r.data.data || []);
    }).catch(() => toast.error(i18n.t("\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644"))).finally(() => setLoading(false));
  }, [playerId]);
  if (loading) return <TabLoading />;
  if (!programs.length) return <EmptyState icon={Dumbbell} title={i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u0631\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644")} subtitle={i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u0628\u0631\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644 \u0644\u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628")} />;
  return <div className="space-y-4">
      {programs.map(prog => {
      const st = rehabStatusMap[prog.status] || rehabStatusMap.active;
      const pct = prog.progress_pct || 0;
      const barColor = pct >= 75 ? 'bg-success' : pct >= 40 ? 'bg-info' : 'bg-warning';
      return <div key={prog.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900">{prog.program_name}</h4>
                <p className="text-sm text-gray-500 mt-0.5">{i18n.t("\u0627\u0644\u0645\u0631\u062D\u0644\u0629")}{prog.phase}{prog.phase_label ? ` — ${prog.phase_label}` : ''}
                  {prog.therapist && ` · ${prog.therapist.name}`}
                </p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">{i18n.t("\u0627\u0644\u062A\u0642\u062F\u0645")}</span>
                <span className="text-xs font-bold font-numbers text-primary">{pct}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${barColor}`} style={{
              width: `${pct}%`
            }} />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              {prog.start_date && <span>{i18n.t("\u0628\u062F\u0627\u064A\u0629:")}{dayjs(prog.start_date).format('DD/MM/YYYY')}</span>}
              {prog.expected_end_date && <span>{i18n.t("\u0627\u0644\u0645\u062A\u0648\u0642\u0639:")}{dayjs(prog.expected_end_date).format('DD/MM/YYYY')}</span>}
              {prog.injury && <span>{i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0629:")}{prog.injury.injury_type}</span>}
            </div>

            {prog.goals && <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0623\u0647\u062F\u0627\u0641:")}</span>{prog.goals}
              </div>}
          </div>;
    })}
    </div>;
}

// ── Performance Tab ──────────────────────────
function PerformanceTab({
  playerId
}) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    performanceApi.getPlayerHistory(playerId, {
      limit: 20
    }).then(r => {
      if (r.data.success) setRecords(r.data.data || []);
    }).catch(() => toast.error(i18n.t("\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0623\u062F\u0627\u0621"))).finally(() => setLoading(false));
  }, [playerId]);
  if (loading) return <TabLoading />;
  if (!records.length) return <EmptyState icon={TrendingUp} title={i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0623\u062F\u0627\u0621")} subtitle={i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0623\u062F\u0627\u0621 \u0644\u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628")} />;
  const latest = records[0];
  const trendIcon = t => {
    if (t === 'up') return <TrendingUp className="w-3.5 h-3.5 text-success" />;
    if (t === 'down') return <TrendingDown className="w-3.5 h-3.5 text-danger" />;
    return <Minus className="w-3.5 h-3.5 text-gray-400" />;
  };
  const metrics = [{
    label: 'VO2 Max',
    value: latest.vo2_max,
    unit: 'ml/kg/min'
  }, {
    label: i18n.t("\u0627\u0644\u0633\u0631\u0639\u0629 \u0627\u0644\u0642\u0635\u0648\u0649"),
    value: latest.max_speed_kmh,
    unit: i18n.t("\u0643\u0645/\u0633")
  }, {
    label: i18n.t("\u0627\u0644\u0642\u0648\u0629"),
    value: latest.strength_pct,
    unit: '%'
  }, {
    label: i18n.t("\u0627\u0644\u062A\u062D\u0645\u0644"),
    value: latest.endurance_pct,
    unit: '%'
  }, {
    label: i18n.t("\u0627\u0644\u0645\u0631\u0648\u0646\u0629"),
    value: latest.flexibility_pct,
    unit: '%'
  }, {
    label: i18n.t("\u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0643\u0644\u064A"),
    value: latest.overall_score_pct,
    unit: '%'
  }];
  return <div className="space-y-6">
      {/* Latest scores */}
      <div>
        <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />{i18n.t("\u0622\u062E\u0631 \u062A\u0642\u064A\u064A\u0645 \u2014")}{dayjs(latest.evaluation_date).format('DD/MM/YYYY')}
          {latest.trend && <span className="flex items-center gap-1">{trendIcon(latest.trend)}</span>}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {metrics.map(({
          label,
          value,
          unit
        }) => value != null ? <div key={label} className="bg-gradient-to-br from-primary/5 to-white p-4 rounded-xl border border-primary/10 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-bold font-numbers text-gray-900">
                {value}<span className="text-xs font-normal ml-0.5">{unit}</span>
              </p>
            </div> : null)}
        </div>
      </div>

      {/* Readiness */}
      {(latest.physical_readiness_pct != null || latest.mental_readiness_pct != null) && <div className="grid grid-cols-2 gap-4">
          {[{
        label: i18n.t("\u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0628\u062F\u0646\u064A\u0629"),
        value: latest.physical_readiness_pct,
        color: 'bg-success'
      }, {
        label: i18n.t("\u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0630\u0647\u0646\u064A\u0629"),
        value: latest.mental_readiness_pct,
        color: 'bg-info'
      }].map(({
        label,
        value,
        color
      }) => value != null ? <div key={label} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{label}</span>
                <span className="font-bold font-numbers text-primary">{value}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{
            width: `${value}%`
          }} />
              </div>
            </div> : null)}
        </div>}

      {/* Recommendations */}
      {latest.recommendations && <div className="bg-warning-light/40 p-4 rounded-xl border border-warning/20">
          <h5 className="font-semibold text-warning mb-2">{i18n.t("\u062A\u0648\u0635\u064A\u0627\u062A \u0627\u0644\u0645\u0642\u064A\u0651\u0645")}</h5>
          <p className="text-sm text-gray-700">{latest.recommendations}</p>
        </div>}

      {/* History table */}
      <div>
        <h4 className="font-bold text-gray-800 mb-3">{i18n.t("\u0633\u062C\u0644 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A")}</h4>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E"), i18n.t("\u0627\u0644\u0642\u0648\u0629 %"), i18n.t("\u0627\u0644\u062A\u062D\u0645\u0644 %"), i18n.t("\u0627\u0644\u0645\u0631\u0648\u0646\u0629 %"), i18n.t("\u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0643\u0644\u064A %"), i18n.t("\u0627\u0644\u0627\u062A\u062C\u0627\u0647")].map(h => <th key={h} className="text-right px-3 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map(r => <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 font-numbers text-xs text-gray-500 whitespace-nowrap">{dayjs(r.evaluation_date).format('DD/MM/YYYY')}</td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-700">{r.strength_pct ?? '—'}</td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-700">{r.endurance_pct ?? '—'}</td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-700">{r.flexibility_pct ?? '—'}</td>
                  <td className="px-3 py-2.5 font-numbers text-center font-bold text-primary">{r.overall_score_pct ?? '—'}</td>
                  <td className="px-3 py-2.5 text-center">{trendIcon(r.trend)}</td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}

// ── Files Tab ────────────────────────────────
function FilesTab({
  playerId
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    filesApi.getAll({
      player_id: playerId,
      limit: 50
    }).then(r => {
      if (r.data.success) setFiles(r.data.data || []);
    }).catch(() => toast.error(i18n.t("\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0644\u0641\u0627\u062A"))).finally(() => setLoading(false));
  }, [playerId]);
  if (loading) return <TabLoading />;
  if (!files.length) return <EmptyState icon={FolderOpen} title={i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0644\u0641\u0627\u062A")} subtitle={i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u0631\u0641\u0639 \u0623\u064A \u0645\u0644\u0641\u0627\u062A \u0644\u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0639\u062F")} />;
  return <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {files.map(file => <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{file.file_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">{FILE_TYPES[file.file_type] || i18n.t("\u0623\u062E\u0631\u0649")}</span>
                <span className="text-gray-200">•</span>
                <span className="text-xs text-gray-400 font-numbers">{dayjs(file.created_at).format('DD/MM/YYYY')}</span>
                {file.is_confidential && <Lock className="w-3 h-3 text-danger" />}
              </div>
            </div>
            <a href={file.file_path} download={file.file_name} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
              <Download className="w-4 h-4" />
            </a>
          </div>)}
      </div>
      <div className="mt-4 text-center">
        <Link to={`/files?player_id=${playerId}`} className="text-sm text-primary hover:underline font-medium">{i18n.t("\u0639\u0631\u0636 \u0643\u0644 \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0641\u064A \u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u0644\u0641\u0627\u062A")}</Link>
      </div>
    </div>;
}

// ── Appointments Tab ─────────────────────────
function AppointmentsTab({
  playerId
}) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    appointmentsApi.getAll({
      player_id: playerId,
      limit: 30
    }).then(r => {
      if (r.data.success) setAppointments(r.data.data || []);
    }).catch(() => toast.error(i18n.t("\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F"))).finally(() => setLoading(false));
  }, [playerId]);
  if (loading) return <TabLoading />;
  if (!appointments.length) return <EmptyState icon={Calendar} title={i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0648\u0627\u0639\u064A\u062F")} subtitle={i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u0645\u0648\u0627\u0639\u064A\u062F \u0644\u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0639\u062F")} />;
  return <div className="space-y-3">
      {appointments.map(apt => {
      const st = aptStatusMap[apt.status] || aptStatusMap.scheduled;
      return <div key={apt.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
            {/* Date block */}
            <div className="w-14 text-center flex-shrink-0">
              <div className="bg-primary text-white rounded-lg px-2 py-1.5">
                <p className="text-xs font-bold font-numbers">{dayjs(apt.scheduled_date).format('DD')}</p>
                <p className="text-[9px] opacity-80">{dayjs(apt.scheduled_date).format('MMM')}</p>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{apt.appointment_type}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-500">
                {apt.scheduled_time && <span className="font-numbers">{String(apt.scheduled_time).slice(0, 5)}</span>}
                {apt.doctor && <span>{i18n.t("\u0627\u0644\u0637\u0628\u064A\u0628:")}{apt.doctor.name}</span>}
                {apt.location && <span>📍 {apt.location}</span>}
                {apt.duration_minutes && <span>{apt.duration_minutes}{i18n.t("\u062F\u0642\u064A\u0642\u0629")}</span>}
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${st.bg} ${st.text}`}>{st.label}</span>
          </div>;
    })}
    </div>;
}

// ── Medications Tab ──────────────────────────
function MedicationsTab({
  playerId
}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await equipmentApi.getPlayerTransactions(playerId, {
          limit: 100
        });
        if (res.data.success) {
          const all = res.data.data || [];
          setTransactions(all.filter(tx => tx.transaction_type === 'dispense'));
        }
      } catch {
        toast.error(i18n.t("\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0633\u062C\u0644 \u0627\u0644\u0623\u062F\u0648\u064A\u0629"));
      } finally {
        setLoading(false);
      }
    };
    fetchMedications();
  }, [playerId]);
  if (loading) return <TabLoading />;
  if (!transactions.length) return <EmptyState icon={Pill} title={i18n.t("\u0644\u0627 \u064A\u0648\u062C\u062F \u0633\u062C\u0644 \u0623\u062F\u0648\u064A\u0629")} subtitle={i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u0635\u0631\u0641 \u0623\u064A \u0623\u062F\u0648\u064A\u0629 \u0623\u0648 \u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0644\u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0639\u062F")} />;
  return <div>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E"), i18n.t("\u0627\u0644\u062F\u0648\u0627\u0621/\u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645"), i18n.t("\u0627\u0644\u0646\u0648\u0639"), i18n.t("\u0627\u0644\u0643\u0645\u064A\u0629"), i18n.t("\u0627\u0644\u0645\u062A\u0628\u0642\u064A"), i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")].map(h => <th key={h} className="text-right px-3 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map(tx => {
            const txInfo = TX_TYPES[tx.transaction_type] || TX_TYPES.dispense;
            const TxIcon = txInfo.icon;
            return <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 font-numbers text-xs text-gray-500 whitespace-nowrap">
                    {dayjs(tx.transaction_at).format('DD/MM/YYYY HH:mm')}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Pill className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{tx.supply?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`flex items-center gap-1 text-xs font-bold ${txInfo.color}`}>
                      <TxIcon className="w-3.5 h-3.5" />
                      {txInfo.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-numbers text-center font-bold text-gray-900">
                    {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                  </td>
                  <td className="px-3 py-2.5 font-numbers text-center text-gray-500">{tx.remaining_after ?? '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-400 max-w-[120px] truncate">{tx.notes || '—'}</td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>
    </div>;
}

// ── Main Component ───────────────────────────
export default function PlayerDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [positions, setPositions] = useState([]);
  const [isInjuryDetailOpen, setIsInjuryDetailOpen] = useState(false);
  const [selectedInjury, setSelectedInjury] = useState(null);
  const [playerInjuries, setPlayerInjuries] = useState([]);
  const fetchPlayer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await playersApi.getById(id);
      if (response.data.success) setPlayer(response.data.data);
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0644\u0627\u0639\u0628"));
      navigate('/players');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);
  const fetchMeta = useCallback(async () => {
    try {
      const response = await playersApi.getMeta();
      if (response.data.success) setPositions(response.data.data.positions || []);
    } catch {}
  }, []);
  const fetchPlayerInjuries = useCallback(async () => {
    if (!id) return;
    try {
      const response = await injuriesApi.getAll({
        player_id: id,
        limit: 50
      });
      if (response.data.success) setPlayerInjuries(response.data.data);
    } catch {}
  }, [id]);
  useEffect(() => {
    fetchPlayer();
    fetchMeta();
  }, [fetchPlayer, fetchMeta]);
  useEffect(() => {
    if (activeTab === 'injuries') fetchPlayerInjuries();
  }, [activeTab, fetchPlayerInjuries]);
  const handleSavePlayer = async (playerData, photoFile) => {
    try {
      await playersApi.update(id, playerData);
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        await playersApi.uploadPhoto(id, formData);
      }
      toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0646\u062C\u0627\u062D"));
      setIsEditModalOpen(false);
      fetchPlayer();
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0644\u0627\u0639\u0628"));
    }
  };
  const handleDeleteConfirm = async () => {
    try {
      await playersApi.delete(id);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0646\u062C\u0627\u062D"));
      navigate('/players');
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0630\u0641 \u0627\u0644\u0644\u0627\u0639\u0628"));
    }
  };
  const handleViewInjury = async injury => {
    try {
      const response = await injuriesApi.getById(injury.id);
      if (response.data.success) {
        setSelectedInjury(response.data.data);
        setIsInjuryDetailOpen(true);
      }
    } catch {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0629"));
    }
  };
  const calculateAge = dob => {
    if (!dob) return null;
    return dayjs().diff(dayjs(dob), 'year');
  };
  const tabs = [{
    id: 'basic',
    label: i18n.t("\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629"),
    icon: User
  }, {
    id: 'injuries',
    label: i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A"),
    icon: AlertCircle
  }, {
    id: 'vitals',
    label: i18n.t("\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629"),
    icon: Activity
  }, {
    id: 'measurements',
    label: i18n.t("\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u0645"),
    icon: Ruler
  }, {
    id: 'rehabilitation',
    label: i18n.t("\u0627\u0644\u062A\u0623\u0647\u064A\u0644"),
    icon: Dumbbell
  }, {
    id: 'performance',
    label: i18n.t("\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0623\u062F\u0627\u0621"),
    icon: TrendingUp
  }, {
    id: 'files',
    label: i18n.t("\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642"),
    icon: FolderOpen
  }, {
    id: 'appointments',
    label: i18n.t("\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F"),
    icon: Calendar
  }, {
    id: 'medications',
    label: i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0623\u062F\u0648\u064A\u0629"),
    icon: Pill
  }];
  if (loading) {
    return <div className="animate-fade-in">
        <div className="card mb-6">
          <div className="flex items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="w-48 h-8" />
              <Skeleton className="w-32 h-5" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="w-20 h-6" />
                <Skeleton className="w-24 h-6" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex gap-2 border-b border-gray-200 pb-4 mb-4 overflow-x-auto">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="w-32 h-10" />)}
          </div>
          <div className="space-y-4">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>;
  }
  if (!player) {
    return <div className="card text-center py-16">
        <FileX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F")}</h3>
        <p className="text-gray-500 mb-6">{i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A \u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628")}</p>
        <Button onClick={() => navigate('/players')}>
          <ArrowRight className="w-4 h-4 ml-2" />{i18n.t("\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0642\u0627\u0626\u0645\u0629")}</Button>
      </div>;
  }
  const statusInfo = statusMap[player.status] || statusMap.unknown;
  const StatusIcon = statusInfo.icon;
  const age = calculateAge(player.date_of_birth);
  return <div className="animate-fade-in">
      {/* Header Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate('/players')} className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span>{i18n.t("\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0642\u0627\u0626\u0645\u0629")}</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative mx-auto md:mx-0">
            <Avatar src={player.avatar_url} name={player.name} size="3xl" className="w-28 h-28 md:w-32 md:h-32" />
            <span className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-numbers text-white ${player.number < 10 ? 'bg-primary' : 'bg-primary-dark'}`}>
              {player.number}
            </span>
          </div>

          <div className="flex-1 text-center md:text-right">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold mx-auto md:mx-0 ${statusInfo.bg} ${statusInfo.text}`}>
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
            </div>
            <p className="text-gray-500 mb-4">{player.position}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {player.nationality && <Badge variant="outline" className="gap-1"><MapPin className="w-3 h-3" />{player.nationality}</Badge>}
              {age && <Badge variant="outline" className="gap-1 font-numbers"><Calendar className="w-3 h-3" />{age}{i18n.t("\u0633\u0646\u0629")}</Badge>}
              {player.blood_type && <Badge className={`gap-1 ${bloodTypeColors[player.blood_type] || 'bg-gray-100 text-gray-700'}`}><Droplet className="w-3 h-3" />{i18n.t("\u0641\u0635\u064A\u0644\u0629")}{player.blood_type}</Badge>}
              {player.dominant_foot && <Badge variant="outline">{i18n.t("\u0627\u0644\u0642\u062F\u0645")}{player.dominant_foot === 'right' ? i18n.t("\u0627\u0644\u064A\u0645\u0646\u0649") : player.dominant_foot === 'left' ? i18n.t("\u0627\u0644\u064A\u0633\u0631\u0649") : i18n.t("\u0643\u0644\u062A\u0627\u0647\u0645\u0627")}</Badge>}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:min-w-[140px]">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="gap-2">
              <Edit2 className="w-4 h-4" />{i18n.t("\u062A\u0639\u062F\u064A\u0644")}</Button>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(true)} className="gap-2 text-danger hover:bg-danger-light">
              <Trash2 className="w-4 h-4" />{i18n.t("\u062D\u0630\u0641")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-1"><Ruler className="w-4 h-4" /><span className="text-sm">{i18n.t("\u0627\u0644\u0637\u0648\u0644")}</span></div>
            <p className="text-xl font-bold font-numbers text-gray-900">{player.height ? `${player.height} ${i18n.t('سم')}` : '-'}</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-1"><Weight className="w-4 h-4" /><span className="text-sm">{i18n.t("\u0627\u0644\u0648\u0632\u0646")}</span></div>
            <p className="text-xl font-bold font-numbers text-gray-900">{player.weight ? `${player.weight} ${i18n.t('كجم')}` : '-'}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-1"><Activity className="w-4 h-4" /><span className="text-sm">BMI</span></div>
            <p className="text-xl font-bold font-numbers text-gray-900">
              {player.height && player.weight ? (player.weight / (player.height / 100) ** 2).toFixed(1) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-visible">
        <div className="flex gap-0.5 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar pb-px">
          {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative -mb-px ${isActive ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>;
        })}
        </div>

        <div className="min-h-[300px]">

          {/* Basic Info */}
          {activeTab === 'basic' && <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />{i18n.t("\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0634\u062E\u0635\u064A\u0629")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard label={i18n.t("\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644")} value={player.name} />
                  <InfoCard label={i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0642\u0645\u064A\u0635")} value={player.number} />
                  <InfoCard label={i18n.t("\u0627\u0644\u0645\u0631\u0643\u0632")} value={player.position} />
                  <InfoCard label={i18n.t("\u0627\u0644\u062C\u0646\u0633\u064A\u0629")} value={player.nationality || '-'} />
                  <InfoCard label={i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F")} value={player.date_of_birth ? dayjs(player.date_of_birth).format('DD/MM/YYYY') : '-'} />
                  <InfoCard label={i18n.t("\u0627\u0644\u0639\u0645\u0631")} value={age ? `${age} ${i18n.t('سنة')}` : '-'} />
                </div>
              </div>
              {(player.phone || player.emergency_contact_name) && <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />{i18n.t("\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard label={i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641")} value={player.phone || '-'} />
                    <InfoCard label={i18n.t("\u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0637\u0627\u0631\u0626\u0629")} value={player.emergency_contact_name || '-'} />
                    <InfoCard label={i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0637\u0648\u0627\u0631\u0626")} value={player.emergency_contact_phone || '-'} />
                  </div>
                </div>}
              {(player.chronic_conditions || player.surgeries_history || player.previous_injuries || player.current_medications) && <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-danger" />{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0637\u0628\u064A")}</h3>
                  <div className="space-y-4">
                    {player.chronic_conditions && <div className="bg-danger-light/30 p-4 rounded-lg"><h4 className="font-semibold text-danger mb-2">{i18n.t("\u0627\u0644\u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u0645\u0632\u0645\u0646\u0629")}</h4><p className="text-gray-700 text-sm">{player.chronic_conditions}</p></div>}
                    {player.surgeries_history && <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold text-gray-700 mb-2">{i18n.t("\u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0631\u0627\u062D\u064A\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629")}</h4><p className="text-gray-600 text-sm">{player.surgeries_history}</p></div>}
                    {player.previous_injuries && <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold text-gray-700 mb-2">{i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0633\u0627\u0628\u0642\u0629")}</h4><p className="text-gray-600 text-sm">{player.previous_injuries}</p></div>}
                    {player.current_medications && <div className="bg-warning-light/30 p-4 rounded-lg"><h4 className="font-semibold text-warning mb-2">{i18n.t("\u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629")}</h4><p className="text-gray-700 text-sm">{player.current_medications}</p></div>}
                  </div>
                </div>}
              {(player.contract_start || player.contract_end) && <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />{i18n.t("\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0639\u0642\u062F")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard label={i18n.t("\u062A\u0627\u0631\u064A\u062E \u0628\u062F\u0627\u064A\u0629 \u0627\u0644\u0639\u0642\u062F")} value={player.contract_start ? dayjs(player.contract_start).format('DD/MM/YYYY') : '-'} />
                    <InfoCard label={i18n.t("\u062A\u0627\u0631\u064A\u062E \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0639\u0642\u062F")} value={player.contract_end ? dayjs(player.contract_end).format('DD/MM/YYYY') : '-'} />
                  </div>
                </div>}
              {player.notes && <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{player.notes}</p>
                  </div>
                </div>}
            </div>}

          {/* Injuries */}
          {activeTab === 'injuries' && <div className="space-y-4">
              {playerInjuries.length === 0 ? <EmptyState icon={AlertCircle} title={i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0625\u0635\u0627\u0628\u0627\u062A \u0645\u0633\u062C\u0644\u0629")} subtitle={i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u0625\u0635\u0627\u0628\u0627\u062A \u0644\u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628")} /> : playerInjuries.map(injury => {
            const severityInfo = severityMap[injury.severity] || severityMap.moderate;
            const statusInfo = injuryStatusMap[injury.status] || injuryStatusMap.active;
            const StatusIcon2 = statusInfo.icon || AlertTriangle;
            const daysSince = dayjs().diff(dayjs(injury.injury_date), 'day');
            return <div key={injury.id} className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100" onClick={() => handleViewInjury(injury)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusInfo.bg}`}>
                            <StatusIcon2 className={`w-5 h-5 ${statusInfo.text}`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">{injury.injury_type}</h4>
                            <p className="text-sm text-gray-500">{injury.body_area}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${severityInfo.bg} ${severityInfo.text}`}>{severityInfo.label}</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>{statusInfo.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>{i18n.t("\u062A\u0627\u0631\u064A\u062E:")}{dayjs(injury.injury_date).format('DD/MM/YYYY')}</span>
                          {injury.status !== 'closed' && <span>{i18n.t("\u0645\u0646\u0630")}{daysSince}{i18n.t("\u064A\u0648\u0645")}</span>}
                          {injury.expected_recovery_days && <span>{i18n.t("\u0627\u0644\u0645\u062A\u0648\u0642\u0639:")}{injury.expected_recovery_days}{i18n.t("\u064A\u0648\u0645")}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-primary">
                          <span className="text-sm">{i18n.t("\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644")}</span>
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>
                      {injury.is_recurring && <div className="flex items-center gap-1 text-xs text-warning mt-2">
                          <RefreshCw className="w-3.5 h-3.5" /><span>{i18n.t("\u0625\u0635\u0627\u0628\u0629 \u0645\u062A\u0643\u0631\u0631\u0629")}</span>
                        </div>}
                    </div>;
          })}
            </div>}

          {activeTab === 'vitals' && <VitalsTab playerId={id} />}
          {activeTab === 'measurements' && <MeasurementsTab playerId={id} />}
          {activeTab === 'rehabilitation' && <RehabilitationTab playerId={id} />}
          {activeTab === 'performance' && <PerformanceTab playerId={id} />}
          {activeTab === 'files' && <FilesTab playerId={id} />}
          {activeTab === 'appointments' && <AppointmentsTab playerId={id} />}
          {activeTab === 'medications' && <MedicationsTab playerId={id} />}
        </div>
      </div>

      {/* Edit Modal */}
      <PlayerFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} player={player} onSave={handleSavePlayer} positions={positions} />

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={i18n.t("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641")} size="sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-danger" />
          </div>
          <p className="text-gray-600 mb-6">{i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0627\u0644\u0644\u0627\u0639\u0628")}<span className="font-bold text-gray-900">"{player?.name}"</span>{i18n.t("\u061F")}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">{i18n.t("\u062D\u0630\u0641")}</Button>
          </div>
        </div>
      </Modal>

      {/* Injury Detail Modal */}
      <InjuryDetailModal isOpen={isInjuryDetailOpen} onClose={() => setIsInjuryDetailOpen(false)} injury={selectedInjury} />
    </div>;
}