import i18n from "../../utils/i18n";
import { useState, useRef, useCallback } from 'react';
import { Printer, FileText, Users, HeartPulse, Dumbbell, Activity, ChevronRight, ChevronLeft, Calendar, User, AlertTriangle, CheckCircle2, Clock, TrendingUp, Eye, X, Wrench, Pill, Ruler, Package, BarChart3 } from 'lucide-react';
import { reportsApi } from '../../api/endpoints/reports';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');

// ==========================================
// ترجمات وثوابت مشتركة
// ==========================================
const SEVERITY_MAP = {
  mild: {
    label: i18n.t("\u0628\u0633\u064A\u0637\u0629"),
    color: 'text-success bg-success-light'
  },
  moderate: {
    label: i18n.t("\u0645\u062A\u0648\u0633\u0637\u0629"),
    color: 'text-warning bg-warning-light'
  },
  severe: {
    label: i18n.t("\u0634\u062F\u064A\u062F\u0629"),
    color: 'text-danger bg-danger-light'
  },
  critical: {
    label: i18n.t("\u062D\u0631\u062C\u0629"),
    color: 'text-white bg-danger'
  }
};
const STATUS_INJ = {
  active: i18n.t("\u0646\u0634\u0637\u0629"),
  recovering: i18n.t("\u0641\u064A \u062A\u0639\u0627\u0641\u064D"),
  closed: i18n.t("\u0645\u063A\u0644\u0642\u0629")
};
const STATUS_REHAB = {
  active: {
    label: i18n.t("\u0646\u0634\u0637"),
    color: 'text-primary bg-primary-50'
  },
  completed: {
    label: i18n.t("\u0645\u0643\u062A\u0645\u0644"),
    color: 'text-success bg-success-light'
  },
  paused: {
    label: i18n.t("\u0645\u0648\u0642\u0648\u0641"),
    color: 'text-warning bg-warning-light'
  },
  cancelled: {
    label: i18n.t("\u0645\u0644\u063A\u0649"),
    color: 'text-danger bg-danger-light'
  }
};
const PLAYER_STATUS = {
  ready: {
    label: i18n.t("\u062C\u0627\u0647\u0632"),
    color: 'text-success'
  },
  injured: {
    label: i18n.t("\u0645\u0635\u0627\u0628"),
    color: 'text-danger'
  },
  rehab: {
    label: i18n.t("\u062A\u0623\u0647\u064A\u0644"),
    color: 'text-info'
  },
  suspended: {
    label: i18n.t("\u0645\u0648\u0642\u0648\u0641"),
    color: 'text-warning'
  },
  unknown: {
    label: i18n.t("\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"),
    color: 'text-gray-500'
  }
};
const APPT_STATUS = {
  scheduled: {
    label: i18n.t("\u0645\u062C\u062F\u0648\u0644"),
    color: 'text-info bg-info-light'
  },
  completed: {
    label: i18n.t("\u0645\u0643\u062A\u0645\u0644"),
    color: 'text-success bg-success-light'
  },
  cancelled: {
    label: i18n.t("\u0645\u0644\u063A\u0649"),
    color: 'text-danger bg-danger-light'
  },
  no_show: {
    label: i18n.t("\u063A\u064A\u0627\u0628"),
    color: 'text-warning bg-warning-light'
  },
  rescheduled: {
    label: i18n.t("\u0645\u0639\u0627\u062F \u062C\u062F\u0648\u0644\u062A\u0647"),
    color: 'text-gray-500 bg-gray-100'
  }
};
const EQ_STATUS = {
  excellent: {
    label: i18n.t("\u0645\u0645\u062A\u0627\u0632"),
    color: 'text-success bg-success-light'
  },
  good: {
    label: i18n.t("\u062C\u064A\u062F"),
    color: 'text-info bg-info-light'
  },
  needs_maintenance: {
    label: i18n.t("\u064A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629"),
    color: 'text-warning bg-warning-light'
  },
  out_of_service: {
    label: i18n.t("\u062E\u0627\u0631\u062C \u0627\u0644\u062E\u062F\u0645\u0629"),
    color: 'text-danger bg-danger-light'
  }
};
const SUPPLY_CATEGORIES = {
  medication: i18n.t("\u0623\u062F\u0648\u064A\u0629"),
  topical: i18n.t("\u0645\u0648\u0636\u0639\u064A"),
  supplement: i18n.t("\u0645\u0643\u0645\u0644\u0627\u062A"),
  consumable: i18n.t("\u0645\u0633\u062A\u0647\u0644\u0643\u0627\u062A \u0637\u0628\u064A\u0629"),
  equipment_consumable: i18n.t("\u0645\u0633\u062A\u0647\u0644\u0643\u0627\u062A \u0645\u0639\u062F\u0627\u062A")
};

// ==========================================
// أنواع التقارير المتاحة
// ==========================================
const REPORT_TYPES = [{
  id: 'team_health',
  title: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0635\u062D\u0629 \u0627\u0644\u0641\u0631\u064A\u0642"),
  description: i18n.t("\u0646\u0638\u0631\u0629 \u0634\u0627\u0645\u0644\u0629 \u0639\u0644\u0649 \u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0635\u062D\u064A\u0629 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646\u060C \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629\u060C \u0648\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644"),
  icon: Users,
  color: 'from-primary/10 to-primary/5',
  border: 'border-primary/20',
  iconBg: 'bg-primary/10',
  iconColor: 'text-primary',
  fields: ['dateFrom', 'dateTo']
}, {
  id: 'player_medical',
  title: i18n.t("\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0637\u0628\u064A \u0644\u0644\u0627\u0639\u0628"),
  description: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u062A\u0641\u0635\u064A\u0644\u064A \u0639\u0646 \u062A\u0627\u0631\u064A\u062E \u0644\u0627\u0639\u0628 \u0645\u062D\u062F\u062F \u0627\u0644\u0637\u0628\u064A: \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A\u060C \u0627\u0644\u062A\u0623\u0647\u064A\u0644\u060C \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0648\u0627\u0644\u0645\u0644\u0641\u0627\u062A"),
  icon: User,
  color: 'from-info/10 to-info/5',
  border: 'border-info/20',
  iconBg: 'bg-info/10',
  iconColor: 'text-info',
  fields: ['player']
}, {
  id: 'injuries',
  title: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A"),
  description: i18n.t("\u062A\u062D\u0644\u064A\u0644 \u0634\u0627\u0645\u0644 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u062E\u0644\u0627\u0644 \u0641\u062A\u0631\u0629 \u0645\u062D\u062F\u062F\u0629 \u0645\u0639 \u062A\u0648\u0632\u064A\u0639 \u062D\u0633\u0628 \u0627\u0644\u0634\u062F\u0629 \u0648\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0648\u0627\u0644\u062D\u0627\u0644\u0629"),
  icon: HeartPulse,
  color: 'from-danger/10 to-danger/5',
  border: 'border-danger/20',
  iconBg: 'bg-danger/10',
  iconColor: 'text-danger',
  fields: ['dateFrom', 'dateTo', 'severity', 'status']
}, {
  id: 'rehabilitation',
  title: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u062A\u0623\u0647\u064A\u0644"),
  description: i18n.t("\u0645\u0644\u062E\u0635 \u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644 \u0648\u062A\u0642\u062F\u0645 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0645\u0639 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0648\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u062D\u0636\u0648\u0631"),
  icon: Dumbbell,
  color: 'from-purple-500/10 to-purple-500/5',
  border: 'border-purple-400/20',
  iconBg: 'bg-purple-500/10',
  iconColor: 'text-purple-600',
  fields: ['rehabStatus']
}, {
  id: 'vitals',
  title: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629"),
  description: i18n.t("\u0627\u062A\u062C\u0627\u0647\u0627\u062A \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0644\u0644\u0627\u0639\u0628\u064A\u0646: \u0627\u0644\u0646\u0628\u0636\u060C \u0636\u063A\u0637 \u0627\u0644\u062F\u0645\u060C \u0627\u0644\u062D\u0631\u0627\u0631\u0629\u060C \u0627\u0644\u0623\u0643\u0633\u062C\u064A\u0646 \u0648\u0627\u0644\u0648\u0632\u0646"),
  icon: Activity,
  color: 'from-success/10 to-success/5',
  border: 'border-success/20',
  iconBg: 'bg-success/10',
  iconColor: 'text-success',
  fields: ['player', 'dateFrom', 'dateTo']
}, {
  id: 'appointments',
  title: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F"),
  description: i18n.t("\u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0637\u0628\u064A\u0629 \u062E\u0644\u0627\u0644 \u0641\u062A\u0631\u0629 \u0645\u062D\u062F\u062F\u0629 \u0645\u0639 \u062D\u0627\u0644\u0629 \u0643\u0644 \u0645\u0648\u0639\u062F \u0648\u0627\u0644\u0644\u0627\u0639\u0628 \u0648\u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0633\u0624\u0648\u0644"),
  icon: Calendar,
  color: 'from-yellow-500/10 to-yellow-500/5',
  border: 'border-yellow-400/20',
  iconBg: 'bg-yellow-500/10',
  iconColor: 'text-yellow-600',
  fields: ['dateFrom', 'dateTo', 'apptStatus']
}, {
  id: 'performance',
  title: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0623\u062F\u0627\u0621"),
  description: i18n.t("\u0646\u062A\u0627\u0626\u062C \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0628\u062F\u0646\u064A \u0644\u0644\u0627\u0639\u0628\u064A\u0646: \u0627\u0644\u0642\u0648\u0629\u060C \u0627\u0644\u062A\u062D\u0645\u0644\u060C \u0627\u0644\u0645\u0631\u0648\u0646\u0629\u060C \u0627\u0644\u0631\u0634\u0627\u0642\u0629 \u0648\u0645\u0624\u0634\u0631 \u0627\u0644\u0644\u064A\u0627\u0642\u0629 \u0627\u0644\u0639\u0627\u0645"),
  icon: TrendingUp,
  color: 'from-orange-500/10 to-orange-500/5',
  border: 'border-orange-400/20',
  iconBg: 'bg-orange-500/10',
  iconColor: 'text-orange-600',
  fields: ['player', 'dateFrom', 'dateTo']
}, {
  id: 'equipment',
  title: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629"),
  description: i18n.t("\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0628\u062D\u0627\u0644\u062A\u0647\u0627 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0648\u0633\u062C\u0644 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0648\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0645\u062D\u062A\u0627\u062C\u0629 \u0644\u0635\u064A\u0627\u0646\u0629 \u0639\u0627\u062C\u0644\u0629"),
  icon: Wrench,
  color: 'from-gray-500/10 to-gray-500/5',
  border: 'border-gray-400/20',
  iconBg: 'bg-gray-500/10',
  iconColor: 'text-gray-600',
  fields: ['eqStatus']
}, {
  id: 'supplies',
  title: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0648\u0627\u0644\u0645\u062E\u0632\u0648\u0646"),
  description: i18n.t("\u062C\u0631\u062F \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0648\u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0645\u0639 \u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0648\u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A"),
  icon: Pill,
  color: 'from-pink-500/10 to-pink-500/5',
  border: 'border-pink-400/20',
  iconBg: 'bg-pink-500/10',
  iconColor: 'text-pink-600',
  fields: ['supplyCategory']
}, {
  id: 'measurements',
  title: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u0645"),
  description: i18n.t("\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u062F\u064A\u0629 \u0644\u0644\u0627\u0639\u0628\u064A\u0646: \u0627\u0644\u0648\u0632\u0646\u060C \u0646\u0633\u0628\u0629 \u0627\u0644\u062F\u0647\u0648\u0646\u060C \u0627\u0644\u0643\u062A\u0644\u0629 \u0627\u0644\u0639\u0636\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u062D\u064A\u0637\u0627\u062A \u0627\u0644\u062C\u0633\u062F\u064A\u0629"),
  icon: Ruler,
  color: 'from-teal-500/10 to-teal-500/5',
  border: 'border-teal-400/20',
  iconBg: 'bg-teal-500/10',
  iconColor: 'text-teal-600',
  fields: ['player', 'dateFrom', 'dateTo']
}];

// ==========================================
// نافذة إعداد التقرير
// ==========================================
function ReportConfigPanel({
  report,
  players,
  onGenerate,
  loading
}) {
  const [config, setConfig] = useState({
    player_id: '',
    dateFrom: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    dateTo: dayjs().format('YYYY-MM-DD'),
    severity: '',
    status: '',
    rehabStatus: '',
    apptStatus: '',
    eqStatus: '',
    supplyCategory: ''
  });
  const handleSubmit = e => {
    e.preventDefault();
    onGenerate(config);
  };
  const Icon = report.icon;
  return <div className={`card bg-gradient-to-br ${report.color} border ${report.border} mb-6`}>
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-12 h-12 rounded-xl ${report.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${report.iconColor}`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{report.title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{report.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

          {/* اختيار اللاعب */}
          {report.fields.includes('player') && <div className={report.id === 'player_medical' ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {report.id === 'player_medical' ? i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 *") : i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)")}
              </label>
              <select value={config.player_id} onChange={e => setConfig({
            ...config,
            player_id: e.target.value
          })} className="input-field" required={report.id === 'player_medical'}>
                <option value="">{report.id === 'player_medical' ? i18n.t("\u0627\u062E\u062A\u0631 \u0644\u0627\u0639\u0628\u0627\u064B...") : i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</option>
                {players.map(p => <option key={p.id} value={p.id}>#{p.number} - {p.name}</option>)}
              </select>
            </div>}

          {/* نطاق التاريخ */}
          {report.fields.includes('dateFrom') && <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0645\u0646 \u062A\u0627\u0631\u064A\u062E")}</label>
                <input type="date" value={config.dateFrom} onChange={e => setConfig({
              ...config,
              dateFrom: e.target.value
            })} className="input-field font-numbers" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0625\u0644\u0649 \u062A\u0627\u0631\u064A\u062E")}</label>
                <input type="date" value={config.dateTo} onChange={e => setConfig({
              ...config,
              dateTo: e.target.value
            })} className="input-field font-numbers" />
              </div>
            </>}

          {/* شدة الإصابة */}
          {report.fields.includes('severity') && <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0634\u062F\u0629")}</label>
              <select value={config.severity} onChange={e => setConfig({
            ...config,
            severity: e.target.value
          })} className="input-field">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0634\u062F\u062F")}</option>
                <option value="mild">{i18n.t("\u0628\u0633\u064A\u0637\u0629")}</option>
                <option value="moderate">{i18n.t("\u0645\u062A\u0648\u0633\u0637\u0629")}</option>
                <option value="severe">{i18n.t("\u0634\u062F\u064A\u062F\u0629")}</option>
                <option value="critical">{i18n.t("\u062D\u0631\u062C\u0629")}</option>
              </select>
            </div>}

          {/* حالة الإصابة */}
          {report.fields.includes('status') && <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</label>
              <select value={config.status} onChange={e => setConfig({
            ...config,
            status: e.target.value
          })} className="input-field">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A")}</option>
                <option value="active">{i18n.t("\u0646\u0634\u0637\u0629")}</option>
                <option value="recovering">{i18n.t("\u0641\u064A \u062A\u0639\u0627\u0641\u064D")}</option>
                <option value="closed">{i18n.t("\u0645\u063A\u0644\u0642\u0629")}</option>
              </select>
            </div>}

          {/* حالة التأهيل */}
          {report.fields.includes('rehabStatus') && <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</label>
              <select value={config.rehabStatus} onChange={e => setConfig({
            ...config,
            rehabStatus: e.target.value
          })} className="input-field">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A")}</option>
                <option value="active">{i18n.t("\u0646\u0634\u0637\u0629")}</option>
                <option value="completed">{i18n.t("\u0645\u0643\u062A\u0645\u0644\u0629")}</option>
                <option value="paused">{i18n.t("\u0645\u0648\u0642\u0648\u0641\u0629")}</option>
              </select>
            </div>}

          {/* حالة الموعد */}
          {report.fields.includes('apptStatus') && <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0648\u0639\u062F")}</label>
              <select value={config.apptStatus} onChange={e => setConfig({
            ...config,
            apptStatus: e.target.value
          })} className="input-field">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A")}</option>
                <option value="scheduled">{i18n.t("\u0645\u062C\u062F\u0648\u0644")}</option>
                <option value="completed">{i18n.t("\u0645\u0643\u062A\u0645\u0644")}</option>
                <option value="cancelled">{i18n.t("\u0645\u0644\u063A\u0649")}</option>
                <option value="no_show">{i18n.t("\u063A\u064A\u0627\u0628")}</option>
              </select>
            </div>}

          {/* حالة المعدة */}
          {report.fields.includes('eqStatus') && <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</label>
              <select value={config.eqStatus} onChange={e => setConfig({
            ...config,
            eqStatus: e.target.value
          })} className="input-field">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A")}</option>
                <option value="excellent">{i18n.t("\u0645\u0645\u062A\u0627\u0632")}</option>
                <option value="good">{i18n.t("\u062C\u064A\u062F")}</option>
                <option value="needs_maintenance">{i18n.t("\u064A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629")}</option>
                <option value="out_of_service">{i18n.t("\u062E\u0627\u0631\u062C \u0627\u0644\u062E\u062F\u0645\u0629")}</option>
              </select>
            </div>}

          {/* فئة المستلزم */}
          {report.fields.includes('supplyCategory') && <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0641\u0626\u0629")}</label>
              <select value={config.supplyCategory} onChange={e => setConfig({
            ...config,
            supplyCategory: e.target.value
          })} className="input-field">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0641\u0626\u0627\u062A")}</option>
                <option value="medication">{i18n.t("\u0623\u062F\u0648\u064A\u0629")}</option>
                <option value="topical">{i18n.t("\u0645\u0648\u0636\u0639\u064A \u0648\u0647\u0644\u0627\u0645\u064A\u0627\u062A")}</option>
                <option value="supplement">{i18n.t("\u0645\u0643\u0645\u0644\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629")}</option>
                <option value="consumable">{i18n.t("\u0645\u0633\u062A\u0647\u0644\u0643\u0627\u062A \u0637\u0628\u064A\u0629")}</option>
                <option value="equipment_consumable">{i18n.t("\u0645\u0633\u062A\u0647\u0644\u0643\u0627\u062A \u0645\u0639\u062F\u0627\u062A")}</option>
              </select>
            </div>}
        </div>

        <Button type="submit" loading={loading} className="gap-2">
          <Eye className="w-4 h-4" />{i18n.t("\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0648\u0645\u0639\u0627\u064A\u0646\u062A\u0647")}</Button>
      </form>
    </div>;
}

// ==========================================
// دالة الطباعة (مستقلة)
// ==========================================
function triggerPrintWindow(title, htmlContent) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    toast.error(i18n.t("\u064A\u0631\u062C\u0649 \u0627\u0644\u0633\u0645\u0627\u062D \u0628\u0627\u0644\u0646\u0648\u0627\u0641\u0630 \u0627\u0644\u0645\u0646\u0628\u062B\u0642\u0629"));
    return;
  }
  const fullHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    
    :root {
      --primary: #1D9E75;
      --primary-light: #e1f5ee;
      --success: #3B6D11;
      --danger: #A32D2D;
      --warning: #D69E2E;
      --info: #3182CE;
      --text-main: #1e293b;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --bg-light: #f8fafc;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; 
      font-size: 11pt; 
      line-height: 1.6; 
      color: var(--text-main); 
      padding: 30px; 
      direction: rtl;
      background: #fff;
    }
    
    /* Header & Titles */
    .report-header { 
      text-align: center; 
      margin-bottom: 25px; 
      padding-bottom: 15px; 
      border-bottom: 2px solid var(--primary);
    }
    .report-title { 
      font-size: 22pt; 
      font-weight: 800; 
      color: var(--primary); 
      margin-bottom: 5px; 
    }
    .report-date { 
      font-size: 10pt; 
      color: var(--text-muted); 
      font-weight: 600;
    }

    h1, h2, h3 { color: #0f172a; margin: 25px 0 15px; page-break-after: avoid; }
    h2 { 
      font-size: 14pt; 
      font-weight: 700; 
      border-bottom: 1px solid var(--border); 
      padding-bottom: 6px; 
      color: var(--primary);
    }
    h3 { font-size: 12pt; font-weight: 700; }

    /* Tables */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0; 
      page-break-inside: avoid; 
      font-size: 10pt;
    }
    th, td { 
      border: 1px solid var(--border); 
      padding: 10px 12px; 
      text-align: right; 
    }
    th { 
      background-color: var(--bg-light); 
      font-weight: 700; 
      color: #334155; 
      white-space: nowrap;
    }
    tr:nth-child(even) { background-color: #fcfcfd; }
    
    /* Stat Grids */
    .stat-grid { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 15px; 
      margin: 20px 0; 
      page-break-inside: avoid; 
    }
    .stat-box { 
      border: 1px solid var(--border); 
      padding: 15px; 
      text-align: center; 
      border-radius: 8px; 
      background: var(--bg-light); 
    }
    .stat-value { 
      font-size: 18pt; 
      font-weight: 800; 
      color: #0f172a; 
    }
    .stat-label { 
      font-size: 10pt; 
      color: var(--text-muted); 
      margin-top: 4px; 
      font-weight: 600;
    }
    
    /* Utilities */
    .text-success { color: var(--success) !important; }
    .text-danger { color: var(--danger) !important; }
    .text-primary { color: var(--primary) !important; }
    .text-warning { color: var(--warning) !important; }
    .text-info { color: var(--info) !important; }

    .font-numbers { font-variant-numeric: tabular-nums; }

    /* Print settings */
    @media print { 
      body { padding: 0; }
      .no-print { display: none; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <h1 class="report-title">${title}</h1>
    <p class="report-date">${i18n.t('تاريخ إستخراج التقرير')}: ${new Date().toLocaleDateString(localStorage.getItem('smis-locale') === 'en' ? 'en-US' : 'ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}</p>
  </div>
  ${htmlContent}
</body>
</html>`;
  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
  // Give the window time to render before printing
  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch (e) {
      console.error('Print error:', e);
    }
  }, 500);
}

// ==========================================
// مكون إحصاء مشترك
// ==========================================
function StatBox({
  label,
  value,
  color = 'text-gray-900'
}) {
  return <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
      <p className={`text-3xl font-bold font-numbers ${color}`}>{value ?? '—'}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>;
}

// ==========================================
// عرض: تقرير صحة الفريق
// ==========================================
function TeamHealthPreview({
  data
}) {
  if (!data) return null;
  const {
    summary,
    players,
    injuries
  } = data;
  return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")} value={summary.totalPlayers} />
        <StatBox label={i18n.t("\u062C\u0627\u0647\u0632\u0648\u0646 \u0644\u0644\u0645\u0628\u0627\u0631\u0627\u0629")} value={summary.ready} color="text-success" />
        <StatBox label={i18n.t("\u0645\u0635\u0627\u0628\u0648\u0646 \u062D\u0627\u0644\u064A\u0627\u064B")} value={summary.injured} color="text-danger" />
        <StatBox label={i18n.t("\u0645\u0624\u0634\u0631 \u0635\u062D\u0629 \u0627\u0644\u0641\u0631\u064A\u0642")} value={`${summary.healthIndex}%`} color="text-primary" />
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />{i18n.t("\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 (")}{players?.length || 0})
        </h3>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">#</th>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0627\u0633\u0645")}</th>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0645\u0631\u0643\u0632")}</th>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {players?.map(p => {
              const st = PLAYER_STATUS[p.status] || PLAYER_STATUS.unknown;
              return <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-3 font-numbers font-bold text-gray-400">{p.number}</td>
                    <td className="p-3 font-semibold text-gray-900">{p.name}</td>
                    <td className="p-3 text-gray-600">{p.position}</td>
                    <td className="p-3"><span className={`text-xs font-bold ${st.color}`}>{st.label}</span></td>
                  </tr>;
            })}
            </tbody>
          </table>
        </div>
      </div>

      {injuries?.filter(i => i.status !== 'closed').length > 0 && <div>
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-danger" />{i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629 (")}{injuries.filter(i => i.status !== 'closed').length})
          </h3>
          <div className="space-y-2">
            {injuries.filter(i => i.status !== 'closed').map(inj => {
          const sev = SEVERITY_MAP[inj.severity] || SEVERITY_MAP.mild;
          return <div key={inj.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${sev.color}`}>{sev.label}</span>
                  <span className="font-semibold text-gray-900">{inj.player?.name}</span>
                  <span className="text-gray-500">{inj.injury_type}</span>
                  <span className="text-gray-400 text-xs">{inj.body_area}</span>
                  <span className="mr-auto text-xs text-gray-400 font-numbers">
                    {dayjs(inj.injury_date).format('DD/MM/YYYY')}
                  </span>
                </div>;
        })}
          </div>
        </div>}
    </div>;
}

// ==========================================
// عرض: الملف الطبي للاعب
// ==========================================
function PlayerMedicalPreview({
  data
}) {
  if (!data) return null;
  const {
    player,
    injuries,
    vitals,
    rehabPrograms,
    files,
    summary
  } = data;
  const age = player.date_of_birth ? dayjs().diff(dayjs(player.date_of_birth), 'year') : null;
  return <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-5 border border-primary/10">
        <div className="flex items-center gap-4">
          <Avatar src={player.avatar_url} name={player.name} size="xl" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              <span>{i18n.t("\u0627\u0644\u0631\u0642\u0645:")}<strong className="font-numbers">#{player.number}</strong></span>
              <span>{i18n.t("\u0627\u0644\u0645\u0631\u0643\u0632:")}<strong>{player.position}</strong></span>
              {age && <span>{i18n.t("\u0627\u0644\u0639\u0645\u0631:")}<strong className="font-numbers">{age}{i18n.t("\u0633\u0646\u0629")}</strong></span>}
              {player.blood_type && <span>{i18n.t("\u0641\u0635\u064A\u0644\u0629 \u0627\u0644\u062F\u0645:")}<strong>{player.blood_type}</strong></span>}
            </div>
          </div>
          <div className="text-center">
            <span className={`block text-lg font-bold ${PLAYER_STATUS[player.status]?.color || 'text-gray-500'}`}>
              {PLAYER_STATUS[player.status]?.label || '—'}
            </span>
            <span className="text-xs text-gray-400">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")} value={summary.totalInjuries} color="text-danger" />
        <StatBox label={i18n.t("\u0625\u0635\u0627\u0628\u0627\u062A \u0646\u0634\u0637\u0629")} value={summary.activeInjuries} color="text-warning" />
        <StatBox label={i18n.t("\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644")} value={summary.totalRehab} color="text-primary" />
        <StatBox label={i18n.t("\u0645\u0644\u0641\u0627\u062A \u0645\u0631\u0641\u0648\u0639\u0629")} value={summary.totalFiles} />
      </div>

      {summary.latestVitals && <div>
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-success" />{i18n.t("\u0622\u062E\u0631 \u0645\u0624\u0634\u0631\u0627\u062A \u062D\u064A\u0648\u064A\u0629")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[{
          label: i18n.t("\u0645\u0639\u062F\u0644 \u0627\u0644\u0646\u0628\u0636"),
          value: summary.latestVitals.heart_rate,
          unit: 'bpm',
          ok: (summary.latestVitals.heart_rate || 0) <= 100
        }, {
          label: i18n.t("\u0636\u063A\u0637 \u0627\u0644\u062F\u0645"),
          value: summary.latestVitals.blood_pressure_systolic && `${summary.latestVitals.blood_pressure_systolic}/${summary.latestVitals.blood_pressure_diastolic}`,
          unit: 'mmHg',
          ok: (summary.latestVitals.blood_pressure_systolic || 0) <= 130
        }, {
          label: i18n.t("\u0627\u0644\u062D\u0631\u0627\u0631\u0629"),
          value: summary.latestVitals.temperature,
          unit: '°C',
          ok: (summary.latestVitals.temperature || 0) <= 37.5
        }, {
          label: i18n.t("\u0627\u0644\u0623\u0643\u0633\u062C\u064A\u0646"),
          value: summary.latestVitals.spo2,
          unit: '%',
          ok: (summary.latestVitals.spo2 || 100) >= 95
        }, {
          label: i18n.t("\u0627\u0644\u0648\u0632\u0646"),
          value: summary.latestVitals.weight,
          unit: 'kg',
          ok: true
        }].map((item, i) => <div key={i} className={`p-3 rounded-xl border text-center ${item.ok ? 'bg-success-light border-success/20' : 'bg-danger-light border-danger/20'}`}>
                <p className={`text-xl font-bold font-numbers ${item.ok ? 'text-success' : 'text-danger'}`}>{item.value ?? '—'}</p>
                <p className="text-xs text-gray-500">{item.unit}</p>
                <p className="text-xs text-gray-600 mt-0.5">{item.label}</p>
              </div>)}
          </div>
        </div>}

      {injuries.length > 0 && <div>
          <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-danger" />{i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A (")}{injuries.length})
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}</th>
                  <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0645\u0646\u0637\u0642\u0629")}</th>
                  <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0634\u062F\u0629")}</th>
                  <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}</th>
                  <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {injuries.map(inj => {
              const sev = SEVERITY_MAP[inj.severity] || SEVERITY_MAP.mild;
              return <tr key={inj.id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-900">{inj.injury_type}</td>
                      <td className="p-3 text-gray-600">{inj.body_area}</td>
                      <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sev.color}`}>{sev.label}</span></td>
                      <td className="p-3 font-numbers text-gray-600">{dayjs(inj.injury_date).format('DD/MM/YYYY')}</td>
                      <td className="p-3 text-gray-600">{STATUS_INJ[inj.status]}</td>
                    </tr>;
            })}
              </tbody>
            </table>
          </div>
        </div>}
    </div>;
}

// ==========================================
// عرض: تقرير الإصابات
// ==========================================
function InjuriesPreview({
  data
}) {
  if (!data) return null;
  const {
    summary,
    injuries
  } = data;
  return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")} value={summary.total} />
        <StatBox label={i18n.t("\u0628\u0633\u064A\u0637\u0629 / \u0645\u062A\u0648\u0633\u0637\u0629")} value={(summary.bySeverity?.mild || 0) + (summary.bySeverity?.moderate || 0)} color="text-warning" />
        <StatBox label={i18n.t("\u0634\u062F\u064A\u062F\u0629 / \u062D\u0631\u062C\u0629")} value={(summary.bySeverity?.severe || 0) + (summary.bySeverity?.critical || 0)} color="text-danger" />
        <StatBox label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0648\u0642\u062A \u0627\u0644\u062A\u0639\u0627\u0641\u064A")} value={summary.avgRecoveryDays > 0 ? `${summary.avgRecoveryDays} ${i18n.t('يوم')}` : '—'} color="text-primary" />
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-800 mb-3">{i18n.t("\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")}</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}</th>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0645\u0646\u0637\u0642\u0629")}</th>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0634\u062F\u0629")}</th>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
                <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {injuries.map(inj => {
              const sev = SEVERITY_MAP[inj.severity] || SEVERITY_MAP.mild;
              return <tr key={inj.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{inj.player?.name}</div>
                      <div className="text-xs text-gray-400 font-numbers">#{inj.player?.number}</div>
                    </td>
                    <td className="p-3 text-gray-700">{inj.injury_type}</td>
                    <td className="p-3 text-gray-600">{inj.body_area}</td>
                    <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sev.color}`}>{sev.label}</span></td>
                    <td className="p-3 font-numbers text-gray-600">{dayjs(inj.injury_date).format('DD/MM/YYYY')}</td>
                    <td className="p-3 text-gray-600">{STATUS_INJ[inj.status]}</td>
                  </tr>;
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}

// ==========================================
// عرض: تقرير التأهيل
// ==========================================
function RehabPreview({
  data
}) {
  if (!data) return null;
  const {
    summary,
    programs
  } = data;
  return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0628\u0631\u0627\u0645\u062C")} value={summary.total} />
        <StatBox label={i18n.t("\u0646\u0634\u0637\u0629")} value={summary.active} color="text-primary" />
        <StatBox label={i18n.t("\u0645\u0643\u062A\u0645\u0644\u0629")} value={summary.completed} color="text-success" />
        <StatBox label={i18n.t("\u0645\u0648\u0642\u0648\u0641\u0629")} value={summary.paused} color="text-warning" />
      </div>

      <div className="space-y-3">
        {programs.map(prog => {
        const st = STATUS_REHAB[prog.status] || STATUS_REHAB.active;
        return <div key={prog.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div>
                  <h4 className="font-bold text-gray-900">{prog.program_name}</h4>
                  <p className="text-sm text-gray-500">{prog.player?.name} • #{prog.player?.number}{prog.therapist && ` • ${prog.therapist.name}`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                  <span className="text-sm font-bold font-numbers text-primary">{prog.progress_pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{
              width: `${prog.progress_pct}%`
            }} />
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span>{i18n.t("\u0627\u0644\u0628\u062F\u0627\u064A\u0629:")}<strong className="font-numbers">{dayjs(prog.start_date).format('DD/MM/YYYY')}</strong></span>
                {prog.expected_end_date && <span>{i18n.t("\u0627\u0644\u0646\u0647\u0627\u064A\u0629:")}<strong className="font-numbers">{dayjs(prog.expected_end_date).format('DD/MM/YYYY')}</strong></span>}
                <span>{i18n.t("\u0627\u0644\u062C\u0644\u0633\u0627\u062A:")}<strong className="font-numbers">{prog.sessionStats?.total || 0}</strong> ({prog.sessionStats?.attended || 0}{i18n.t("\u062D\u0636\u0631)")}</span>
              </div>
            </div>;
      })}
      </div>
    </div>;
}

// ==========================================
// عرض: تقرير المؤشرات الحيوية
// ==========================================
function VitalsPreview({
  data
}) {
  if (!data) return null;
  const {
    summary,
    vitals
  } = data;
  return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0642\u0631\u0627\u0621\u0627\u062A")} value={summary.total} />
        <StatBox label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0646\u0628\u0636")} value={summary.avgHeartRate ? `${summary.avgHeartRate} bpm` : '—'} />
        <StatBox label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0623\u0643\u0633\u062C\u064A\u0646")} value={summary.avgSpO2 ? `${summary.avgSpO2}%` : '—'} />
        <StatBox label={i18n.t("\u0642\u0631\u0627\u0621\u0627\u062A \u063A\u064A\u0631 \u0637\u0628\u064A\u0639\u064A\u0629")} value={summary.abnormalCount} color={summary.abnormalCount > 0 ? 'text-danger' : 'text-success'} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0646\u0628\u0636")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0636. \u0627\u0644\u062F\u0645")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062D\u0631\u0627\u0631\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0623\u0643\u0633\u062C\u064A\u0646")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0648\u0632\u0646")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vitals.slice(0, 30).map(v => {
            const abnormal = v.heart_rate > 100 || v.spo2 < 95 || v.temperature > 37.8;
            return <tr key={v.id} className={abnormal ? 'bg-danger-light/30' : 'hover:bg-gray-50'}>
                  <td className="p-3 font-semibold text-gray-900">{v.player?.name || '—'}</td>
                  <td className="p-3 font-numbers text-gray-600">{dayjs(v.recorded_at).format('DD/MM/YYYY')}</td>
                  <td className={`p-3 font-numbers font-bold ${v.heart_rate > 100 ? 'text-danger' : 'text-gray-700'}`}>{v.heart_rate ?? '—'}</td>
                  <td className="p-3 font-numbers text-gray-600">
                    {v.blood_pressure_systolic && v.blood_pressure_diastolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : '—'}
                  </td>
                  <td className={`p-3 font-numbers font-bold ${v.temperature > 37.8 ? 'text-danger' : 'text-gray-700'}`}>{v.temperature ?? '—'}</td>
                  <td className={`p-3 font-numbers font-bold ${v.spo2 < 95 ? 'text-danger' : 'text-gray-700'}`}>{v.spo2 ?? '—'}%</td>
                  <td className="p-3 font-numbers text-gray-600">{v.weight ?? '—'}</td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>
    </div>;
}

// ==========================================
// عرض: تقرير المواعيد
// ==========================================
function AppointmentsPreview({
  data
}) {
  if (!data) return null;
  const {
    summary,
    appointments
  } = data;
  return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F")} value={summary.total} />
        <StatBox label={i18n.t("\u0645\u062C\u062F\u0648\u0644\u0629")} value={summary.scheduled} color="text-info" />
        <StatBox label={i18n.t("\u0645\u0643\u062A\u0645\u0644\u0629")} value={summary.completed} color="text-success" />
        <StatBox label={i18n.t("\u0645\u0644\u063A\u0627\u0629 / \u063A\u064A\u0627\u0628")} value={(summary.cancelled || 0) + (summary.no_show || 0)} color="text-danger" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0645\u0648\u0639\u062F")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0637\u0628\u064A\u0628")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0648\u0642\u062A")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {appointments.map(a => {
            const st = APPT_STATUS[a.status] || APPT_STATUS.scheduled;
            return <tr key={a.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-semibold text-gray-900">{a.player?.name || '—'}</div>
                    <div className="text-xs text-gray-400">#{a.player?.number}</div>
                  </td>
                  <td className="p-3 text-gray-700">{a.appointment_type}</td>
                  <td className="p-3 text-gray-600">{a.doctor?.name || '—'}</td>
                  <td className="p-3 font-numbers text-gray-600">{dayjs(a.scheduled_date).format('DD/MM/YYYY')}</td>
                  <td className="p-3 font-numbers text-gray-600">{a.scheduled_time?.slice(0, 5) || '—'}</td>
                  <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span></td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>
    </div>;
}

// ==========================================
// عرض: تقرير تقييم الأداء
// ==========================================
function PerformancePreview({
  data
}) {
  if (!data) return null;
  const {
    summary,
    performances
  } = data;
  return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A")} value={summary.total} />
        <StatBox label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0639\u0627\u0645")} value={summary.avgOverallScore ? `${summary.avgOverallScore}%` : '—'} color="text-primary" />
        <StatBox label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629")} value={summary.avgReadiness ? `${summary.avgReadiness}%` : '—'} color="text-success" />
        <StatBox label={i18n.t("\u062A\u062D\u0633\u0646 / \u062A\u0631\u0627\u062C\u0639")} value={`${summary.trendUp}↑ / ${summary.trendDown}↓`} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0639\u0627\u0645")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0642\u0648\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062A\u062D\u0645\u0644")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0645\u0631\u0648\u0646\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0627\u062A\u062C\u0627\u0647")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {performances.map(p => <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-semibold text-gray-900">{p.player?.name || '—'}</div>
                  <div className="text-xs text-gray-400">#{p.player?.number}</div>
                </td>
                <td className="p-3 font-numbers text-gray-600">{dayjs(p.evaluation_date).format('DD/MM/YYYY')}</td>
                <td className="p-3 font-numbers font-bold text-primary">{p.overall_score_pct ?? '—'}%</td>
                <td className="p-3 font-numbers text-gray-600">{p.strength_pct ?? '—'}%</td>
                <td className="p-3 font-numbers text-gray-600">{p.endurance_pct ?? '—'}%</td>
                <td className="p-3 font-numbers text-gray-600">{p.flexibility_pct ?? '—'}%</td>
                <td className="p-3 font-numbers text-gray-600">{p.physical_readiness_pct ?? '—'}%</td>
                <td className="p-3 text-sm">
                  {p.trend === 'up' ? '↑' : p.trend === 'down' ? '↓' : '→'}
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}

// ==========================================
// عرض: تقرير المعدات
// ==========================================
function EquipmentPreview({
  data
}) {
  if (!data) return null;
  const {
    summary,
    equipment
  } = data;
  return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0639\u062F\u0627\u062A")} value={summary.total} />
        <StatBox label={i18n.t("\u0645\u0645\u062A\u0627\u0632 / \u062C\u064A\u062F")} value={(summary.excellent || 0) + (summary.good || 0)} color="text-success" />
        <StatBox label={i18n.t("\u064A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629")} value={summary.needs_maintenance || 0} color="text-warning" />
        <StatBox label={i18n.t("\u0635\u064A\u0627\u0646\u0629 \u0645\u0633\u062A\u062D\u0642\u0629 \u0642\u0631\u064A\u0628\u0627\u064B")} value={summary.maintenanceDueSoon} color={summary.maintenanceDueSoon > 0 ? 'text-danger' : 'text-gray-500'} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0645\u0639\u062F\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0645\u0627\u0631\u0643\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0645\u0648\u0642\u0639")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0622\u062E\u0631 \u0635\u064A\u0627\u0646\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0642\u0627\u062F\u0645\u0629")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {equipment.map(eq => {
            const st = EQ_STATUS[eq.status] || EQ_STATUS.good;
            const dueSoon = eq.next_maintenance_date && dayjs(eq.next_maintenance_date).isBefore(dayjs().add(30, 'day'));
            return <tr key={eq.id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold text-gray-900">{eq.name}</td>
                  <td className="p-3 text-gray-600">{eq.brand || '—'}</td>
                  <td className="p-3 text-gray-600">{eq.location || '—'}</td>
                  <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span></td>
                  <td className="p-3 font-numbers text-gray-600">
                    {eq.last_maintenance_date ? dayjs(eq.last_maintenance_date).format('DD/MM/YYYY') : '—'}
                  </td>
                  <td className={`p-3 font-numbers font-bold ${dueSoon ? 'text-warning' : 'text-gray-600'}`}>
                    {eq.next_maintenance_date ? dayjs(eq.next_maintenance_date).format('DD/MM/YYYY') : '—'}
                  </td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>
    </div>;
}

// ==========================================
// عرض: تقرير المستلزمات
// ==========================================
function SuppliesPreview({
  data
}) {
  if (!data) return null;
  const {
    summary,
    supplies
  } = data;
  return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A")} value={summary.total} />
        <StatBox label={i18n.t("\u0645\u062E\u0632\u0648\u0646 \u0645\u0646\u062E\u0641\u0636")} value={summary.lowStock} color={summary.lowStock > 0 ? 'text-warning' : 'text-success'} />
        <StatBox label={i18n.t("\u062A\u0646\u062A\u0647\u064A \u0642\u0631\u064A\u0628\u0627\u064B")} value={summary.expiringSoon} color={summary.expiringSoon > 0 ? 'text-warning' : 'text-gray-500'} />
        <StatBox label={i18n.t("\u0645\u0646\u062A\u0647\u064A\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629")} value={summary.expired} color={summary.expired > 0 ? 'text-danger' : 'text-gray-500'} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0627\u0633\u0645")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0641\u0626\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u062A\u0627\u062D\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u062D\u062F \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0637\u0644\u0628")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0645\u0648\u0642\u0639")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {supplies.map(s => {
            const isLow = s.total_quantity <= (s.reorder_level || 10);
            const isExpired = s.expiry_date && dayjs(s.expiry_date).isBefore(dayjs());
            const isExpiringSoon = s.expiry_date && !isExpired && dayjs(s.expiry_date).isBefore(dayjs().add(60, 'day'));
            return <tr key={s.id} className={isExpired ? 'bg-danger-light/20' : isLow ? 'bg-warning-light/20' : 'hover:bg-gray-50'}>
                  <td className="p-3 font-semibold text-gray-900">{s.name}</td>
                  <td className="p-3 text-gray-600">{SUPPLY_CATEGORIES[s.category] || s.category}</td>
                  <td className={`p-3 font-numbers font-bold ${isLow ? 'text-warning' : 'text-gray-700'}`}>
                    {s.total_quantity} {s.unit || ''}
                  </td>
                  <td className="p-3 font-numbers text-gray-500">{s.reorder_level || 10}</td>
                  <td className={`p-3 font-numbers ${isExpired ? 'text-danger font-bold' : isExpiringSoon ? 'text-warning font-bold' : 'text-gray-600'}`}>
                    {s.expiry_date ? dayjs(s.expiry_date).format('DD/MM/YYYY') : '—'}
                    {isExpired && ' ⚠️'}
                  </td>
                  <td className="p-3 text-gray-500">{s.storage_location || '—'}</td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>
    </div>;
}

// ==========================================
// عرض: تقرير قياسات الجسم
// ==========================================
function MeasurementsPreview({
  data
}) {
  if (!data) return null;
  const {
    summary,
    measurements
  } = data;
  return <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A")} value={summary.total} />
        <StatBox label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0648\u0632\u0646")} value={summary.avgWeight ? `${summary.avgWeight} ${i18n.t('كجم')}` : '—'} color="text-primary" />
        <StatBox label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0646\u0633\u0628\u0629 \u0627\u0644\u062F\u0647\u0648\u0646")} value={summary.avgBodyFat ? `${summary.avgBodyFat}%` : '—'} color="text-warning" />
        <StatBox label={i18n.t("\u0639\u062F\u062F \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")} value={[...new Set(measurements.map(m => m.player_id))].length} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0648\u0632\u0646 (\u0643\u063A)")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062F\u0647\u0648\u0646 %")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u0643\u062A\u0644\u0629 \u0627\u0644\u0639\u0636\u0644\u064A\u0629")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">{i18n.t("\u0627\u0644\u062E\u0635\u0631 (\u0633\u0645)")}</th>
              <th className="text-right p-3 text-xs text-gray-500 font-bold">InBody</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {measurements.map(m => <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="font-semibold text-gray-900">{m.player?.name || '—'}</div>
                  <div className="text-xs text-gray-400">#{m.player?.number}</div>
                </td>
                <td className="p-3 font-numbers text-gray-600">{dayjs(m.measured_at).format('DD/MM/YYYY')}</td>
                <td className="p-3 font-numbers text-gray-700">{m.weight ?? '—'}</td>
                <td className="p-3 font-numbers text-gray-700">{m.body_fat_pct ?? '—'}</td>
                <td className="p-3 font-numbers text-gray-700">{m.muscle_mass_kg ?? '—'}</td>
                <td className="p-3 font-numbers text-gray-700">{m.waist_cm ?? '—'}</td>
                <td className="p-3 font-numbers font-bold text-primary">{m.inbody_score ?? '—'}</td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}

// ==========================================
// الصفحة الرئيسية
// ==========================================
export default function Printing() {
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [playersLoaded, setPlayersLoaded] = useState(false);
  const previewRef = useRef(null);

  // دالة الطباعة (داخل المكون للوصول لـ activeReport)
  const triggerPrint = () => {
    const printContent = document.getElementById('print-area');
    if (!printContent) {
      toast.error(i18n.t("\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u062D\u062A\u0648\u0649 \u0644\u0644\u0637\u0628\u0627\u0639\u0629"));
      return;
    }
    const title = activeReport?.title || i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0637\u0628\u064A");
    triggerPrintWindow(title, printContent.innerHTML);
  };
  const loadPlayers = useCallback(async () => {
    if (playersLoaded) return;
    try {
      const res = await reportsApi.getPlayers();
      if (res.data.success) setPlayers(res.data.data);
      setPlayersLoaded(true);
    } catch {}
  }, [playersLoaded]);
  const handleSelectReport = report => {
    setActiveReport(report);
    setReportData(null);
    loadPlayers();
    setTimeout(() => previewRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    }), 100);
  };
  const handleGenerateReport = async config => {
    setLoading(true);
    setReportData(null);
    try {
      let res;
      switch (activeReport.id) {
        case 'team_health':
          res = await reportsApi.getTeamHealthReport({
            dateFrom: config.dateFrom,
            dateTo: config.dateTo
          });
          break;
        case 'player_medical':
          if (!config.player_id) {
            toast.error(i18n.t("\u0627\u0644\u0631\u062C\u0627\u0621 \u0627\u062E\u062A\u064A\u0627\u0631 \u0644\u0627\u0639\u0628"));
            setLoading(false);
            return;
          }
          res = await reportsApi.getPlayerReport(config.player_id);
          break;
        case 'injuries':
          res = await reportsApi.getInjuryReport({
            dateFrom: config.dateFrom,
            dateTo: config.dateTo,
            severity: config.severity,
            status: config.status
          });
          break;
        case 'rehabilitation':
          res = await reportsApi.getRehabReport({
            status: config.rehabStatus
          });
          break;
        case 'vitals':
          res = await reportsApi.getVitalsReport({
            player_id: config.player_id,
            dateFrom: config.dateFrom,
            dateTo: config.dateTo
          });
          break;
        case 'appointments':
          res = await reportsApi.getAppointmentsReport({
            dateFrom: config.dateFrom,
            dateTo: config.dateTo,
            status: config.apptStatus
          });
          break;
        case 'performance':
          res = await reportsApi.getPerformanceReport({
            player_id: config.player_id,
            dateFrom: config.dateFrom,
            dateTo: config.dateTo
          });
          break;
        case 'equipment':
          res = await reportsApi.getEquipmentReport({
            status: config.eqStatus
          });
          break;
        case 'supplies':
          res = await reportsApi.getSuppliesReport({
            category: config.supplyCategory
          });
          break;
        case 'measurements':
          res = await reportsApi.getMeasurementsReport({
            player_id: config.player_id,
            dateFrom: config.dateFrom,
            dateTo: config.dateTo
          });
          break;
        default:
          return;
      }
      if (res.data.success) {
        setReportData(res.data.data);
        toast.success(i18n.t("\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0646\u062C\u0627\u062D"));
        setTimeout(() => previewRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        }), 200);
      } else {
        toast.error(res.data.message || i18n.t("\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631"));
    } finally {
      setLoading(false);
    }
  };
  const renderPreview = () => {
    if (!reportData) return null;
    switch (activeReport.id) {
      case 'team_health':
        return <TeamHealthPreview data={reportData} />;
      case 'player_medical':
        return <PlayerMedicalPreview data={reportData} />;
      case 'injuries':
        return <InjuriesPreview data={reportData} />;
      case 'rehabilitation':
        return <RehabPreview data={reportData} />;
      case 'vitals':
        return <VitalsPreview data={reportData} />;
      case 'appointments':
        return <AppointmentsPreview data={reportData} />;
      case 'performance':
        return <PerformancePreview data={reportData} />;
      case 'equipment':
        return <EquipmentPreview data={reportData} />;
      case 'supplies':
        return <SuppliesPreview data={reportData} />;
      case 'measurements':
        return <MeasurementsPreview data={reportData} />;
      default:
        return null;
    }
  };
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <Printer className="w-7 h-7 text-primary" />
            <span>{i18n.t("\u0627\u0644\u0637\u0628\u0627\u0639\u0629 \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631")}</span>
          </div>} subtitle={i18n.t("\u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0627\u0631\u064A\u0631 \u0637\u0628\u064A\u0629 \u0648\u0635\u062D\u064A\u0629 \u0634\u0627\u0645\u0644\u0629 \u0648\u0645\u0639\u0627\u064A\u0646\u062A\u0647\u0627 \u0648\u0637\u0628\u0627\u0639\u062A\u0647\u0627")}>
        {reportData && <Button onClick={triggerPrint} className="gap-2 print:hidden">
            <Printer className="w-4 h-4" />{i18n.t("\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0631")}</Button>}
      </PageHeader>

      {/* بطاقات اختيار نوع التقرير */}
      {!activeReport && <div>
          <p className="text-sm text-gray-500 mb-5">{i18n.t("\u0627\u062E\u062A\u0631 \u0646\u0648\u0639 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u0625\u0646\u0634\u0627\u0624\u0647:")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {REPORT_TYPES.map(report => {
          const Icon = report.icon;
          return <button key={report.id} onClick={() => handleSelectReport(report)} className={`card text-right bg-gradient-to-br ${report.color} border ${report.border} hover:shadow-lg transition-all duration-300 group`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${report.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${report.iconColor}`} />
                    </div>
                    <div className="flex-1 text-right">
                      <h3 className="font-bold text-gray-900 mb-1">{report.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-4 text-xs text-primary font-semibold group-hover:gap-2 transition-all">
                    <span>{i18n.t("\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631")}</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                </button>;
        })}
          </div>
        </div>}

      {/* منطقة الإعداد والمعاينة */}
      {activeReport && <div ref={previewRef}>
          {/* شريط التنقل */}
          <div className="flex items-center gap-2 mb-6 print:hidden">
            <button onClick={() => {
          setActiveReport(null);
          setReportData(null);
        }} className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors text-sm font-medium">
              <ChevronRight className="w-4 h-4" />
              <span>{i18n.t("\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631")}</span>
            </button>
            <span className="text-gray-300">›</span>
            <span className="text-gray-900 font-semibold text-sm">{activeReport.title}</span>
          </div>

          {/* إعداد التقرير */}
          <div className="print:hidden">
            <ReportConfigPanel report={activeReport} players={players} onGenerate={handleGenerateReport} loading={loading} />
          </div>

          {/* منطقة المعاينة */}
          {loading && <div className="card space-y-4 print:hidden">
              <Skeleton className="h-24 rounded-xl" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
              <Skeleton className="h-48 rounded-xl" />
            </div>}

          {reportData && !loading && <div className="card" id="print-area">
              {/* ترويسة التقرير */}
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-gray-100">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{activeReport.title}</h1>
                  {reportData.dateRange?.from && <p className="text-sm text-gray-500 mt-1 font-numbers">{i18n.t("\u0627\u0644\u0641\u062A\u0631\u0629:")}{dayjs(reportData.dateRange.from).format('DD/MM/YYYY')} — {dayjs(reportData.dateRange.to).format('DD/MM/YYYY')}
                    </p>}
                  <p className="text-xs text-gray-400 mt-0.5">{i18n.t("\u0635\u062F\u0631 \u0628\u062A\u0627\u0631\u064A\u062E:")}<span className="font-numbers">{dayjs(reportData.generatedAt).format('DD/MM/YYYY - HH:mm')}</span>
                  </p>
                </div>
                <div className="flex gap-2 print:hidden">
                  <Button variant="outline" onClick={() => setReportData(null)} className="gap-1.5 text-sm">
                    <X className="w-3.5 h-3.5" />{i18n.t("\u0645\u0633\u062D")}</Button>
                  <Button onClick={triggerPrint} className="gap-1.5 text-sm">
                    <Printer className="w-3.5 h-3.5" />{i18n.t("\u0637\u0628\u0627\u0639\u0629")}</Button>
                </div>
              </div>

              {/* محتوى التقرير */}
              {renderPreview()}

              {/* تذييل */}
              <div className="mt-8 pt-4 border-t border-gray-100 text-center print:block hidden">
                <p className="text-xs text-gray-400">
                  {reportData.club?.name}{i18n.t("\u2022 \u0646\u0638\u0627\u0645 Sportix \u2022")}{dayjs().format('YYYY')}
                </p>
              </div>
            </div>}
        </div>}
    </div>;
}