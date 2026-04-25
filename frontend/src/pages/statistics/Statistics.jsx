import i18n from "../../utils/i18n";
import {
  translateFileType,
  translateBodyArea,
  translateSeverity,
  translateCondition,
  translateMechanism,
  translateInjuryType,
  translatePerformanceMetric,
  translateEquipmentStatus,
  translateSupplyCategory,
  translatePosition,
  translateWeekLabel,
  translateAptStatusLabel,
} from '../../utils/translateBackend';
import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3, TrendingUp, TrendingDown, Activity, Users, HeartPulse, Dumbbell, Shield, Clock, CheckCircle2, AlertTriangle, Percent, Calendar, Filter, X, Download, Printer, Package, FileText, Zap, Target, LayoutDashboard, Info, Award, Flame, ArrowLeft, RefreshCw, Eye } from 'lucide-react';
import { statsApi } from '../../api/endpoints/stats';
import PageHeader from '../../components/layout/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { HorizontalBarChart, DonutChart, BarChart, LineChart, AreaChart, RadarChart } from '../../components/charts';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');

// =====================================================================
// بيانات تجريبية واقعية — تُستخدم عند غياب بيانات فعلية من قاعدة البيانات
// =====================================================================
const DEMO_DATA = {
  snapshot: {
    totalPlayers: 24,
    readyPlayers: 17,
    injuredPlayers: 5,
    rehabPlayers: 2,
    healthIndex: 71
  },
  injuries: {
    countInPeriod: 14,
    recurrenceRate: 21.4,
    byType: [{
      name: i18n.t("\u0625\u062C\u0647\u0627\u062F \u0639\u0636\u0644\u064A"),
      value: 5
    }, {
      name: i18n.t("\u0627\u0644\u062A\u0648\u0627\u0621 \u0643\u0627\u062D\u0644"),
      value: 4
    }, {
      name: i18n.t("\u0631\u0628\u0627\u0637 \u0631\u0643\u0628\u0629"),
      value: 2
    }, {
      name: i18n.t("\u062A\u0645\u0632\u0642 \u0639\u0636\u0644\u064A"),
      value: 2
    }, {
      name: i18n.t("\u0643\u0633\u0631"),
      value: 1
    }],
    byArea: [{
      name: i18n.t("\u0631\u0643\u0628\u0629"),
      value: 5
    }, {
      name: i18n.t("\u0643\u0627\u062D\u0644"),
      value: 4
    }, {
      name: i18n.t("\u0641\u062E\u0630"),
      value: 3
    }, {
      name: i18n.t("\u0638\u0647\u0631"),
      value: 1
    }, {
      name: i18n.t("\u0643\u062A\u0641"),
      value: 1
    }],
    byPosition: [{
      name: i18n.t("\u0648\u0633\u0637 \u0627\u0644\u0645\u0644\u0639\u0628"),
      value: 6
    }, {
      name: i18n.t("\u0645\u062F\u0627\u0641\u0639"),
      value: 4
    }, {
      name: i18n.t("\u0645\u0647\u0627\u062C\u0645"),
      value: 3
    }, {
      name: i18n.t("\u062D\u0627\u0631\u0633 \u0645\u0631\u0645\u0649"),
      value: 1
    }],
    bySeverity: [{
      name: i18n.t("\u0628\u0633\u064A\u0637\u0629"),
      key: 'mild',
      value: 5
    }, {
      name: i18n.t("\u0645\u062A\u0648\u0633\u0637\u0629"),
      key: 'moderate',
      value: 5
    }, {
      name: i18n.t("\u0634\u062F\u064A\u062F\u0629"),
      key: 'severe',
      value: 3
    }, {
      name: i18n.t("\u062D\u0631\u062C\u0629"),
      key: 'critical',
      value: 1
    }],
    byOccasion: [{
      name: i18n.t("\u062A\u062F\u0631\u064A\u0628"),
      value: 9
    }, {
      name: i18n.t("\u0645\u0628\u0627\u0631\u0627\u0629"),
      value: 5
    }],
    byMechanism: [{
      name: i18n.t("\u0625\u062C\u0647\u0627\u062F"),
      value: 6
    }, {
      name: i18n.t("\u062A\u0635\u0627\u062F\u0645"),
      value: 4
    }, {
      name: i18n.t("\u0625\u0631\u0647\u0627\u0642"),
      value: 3
    }, {
      name: i18n.t("\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"),
      value: 1
    }],
    avgRecoveryByType: [{
      injuryType: i18n.t("\u0631\u0628\u0627\u0637 \u0631\u0643\u0628\u0629"),
      avgDays: 45,
      sampleSize: 2
    }, {
      injuryType: i18n.t("\u062A\u0645\u0632\u0642 \u0639\u0636\u0644\u064A"),
      avgDays: 30,
      sampleSize: 2
    }, {
      injuryType: i18n.t("\u0627\u0644\u062A\u0648\u0627\u0621 \u0643\u0627\u062D\u0644"),
      avgDays: 21,
      sampleSize: 4
    }, {
      injuryType: i18n.t("\u0625\u062C\u0647\u0627\u062F \u0639\u0636\u0644\u064A"),
      avgDays: 14,
      sampleSize: 5
    }, {
      injuryType: i18n.t("\u0643\u0633\u0631"),
      avgDays: 56,
      sampleSize: 1
    }]
  },
  trainingLoad: {
    injuriesPerPlayerMonth: 0.24
  },
  rehab: {
    activePrograms: 2,
    completedInPeriod: 9,
    efficiencyRatio: 1.08,
    sessions: {
      total: 54,
      attended: 48,
      missed: 4,
      cancelled: 2
    }
  },
  availability: {
    weekly: [{
      label: i18n.t("\u064A\u0648\u0644\u064A\u0648 \u0623"),
      availabilityRate: 91.7,
      available: 22,
      unavailable: 2
    }, {
      label: i18n.t("\u064A\u0648\u0644\u064A\u0648 \u0628"),
      availabilityRate: 83.3,
      available: 20,
      unavailable: 4
    }, {
      label: i18n.t("\u0623\u063A\u0633\u0637\u0633 \u0623"),
      availabilityRate: 87.5,
      available: 21,
      unavailable: 3
    }, {
      label: i18n.t("\u0623\u063A\u0633\u0637\u0633 \u0628"),
      availabilityRate: 79.2,
      available: 19,
      unavailable: 5
    }, {
      label: i18n.t("\u0633\u0628\u062A\u0645\u0628\u0631 \u0623"),
      availabilityRate: 83.3,
      available: 20,
      unavailable: 4
    }, {
      label: i18n.t("\u0633\u0628\u062A\u0645\u0628\u0631 \u0628"),
      availabilityRate: 91.7,
      available: 22,
      unavailable: 2
    }, {
      label: i18n.t("\u0623\u0643\u062A\u0648\u0628\u0631 \u0623"),
      availabilityRate: 95.8,
      available: 23,
      unavailable: 1
    }, {
      label: i18n.t("\u0623\u0643\u062A\u0648\u0628\u0631 \u0628"),
      availabilityRate: 87.5,
      available: 21,
      unavailable: 3
    }, {
      label: i18n.t("\u0646\u0648\u0641\u0645\u0628\u0631 \u0623"),
      availabilityRate: 83.3,
      available: 20,
      unavailable: 4
    }, {
      label: i18n.t("\u0646\u0648\u0641\u0645\u0628\u0631 \u0628"),
      availabilityRate: 91.7,
      available: 22,
      unavailable: 2
    }]
  },
  equipment: {
    byStatus: [{
      name: i18n.t("\u0645\u0645\u062A\u0627\u0632"),
      key: 'excellent',
      value: 9
    }, {
      name: i18n.t("\u062C\u064A\u062F"),
      key: 'good',
      value: 7
    }, {
      name: i18n.t("\u064A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629"),
      key: 'needs_maintenance',
      value: 3
    }, {
      name: i18n.t("\u062E\u0627\u0631\u062C \u0627\u0644\u062E\u062F\u0645\u0629"),
      key: 'out_of_service',
      value: 1
    }],
    topUtilization: [{
      id: 1,
      name: i18n.t("\u062C\u0647\u0627\u0632 \u0627\u0644\u0625\u0637\u0627\u0644\u0629 \u0627\u0644\u0645\u062A\u0642\u062F\u0645"),
      usageCount: 91,
      status: 'excellent',
      location: i18n.t("\u0627\u0644\u0635\u0627\u0644\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629")
    }, {
      id: 2,
      name: i18n.t("\u062F\u0631\u0627\u062C\u0629 \u0627\u0644\u062A\u0623\u0647\u064A\u0644"),
      usageCount: 78,
      status: 'good',
      location: i18n.t("\u063A\u0631\u0641\u0629 \u0627\u0644\u062A\u0623\u0647\u064A\u0644")
    }, {
      id: 3,
      name: i18n.t("\u062D\u0648\u0636 \u0627\u0644\u0645\u0627\u0621 \u0627\u0644\u0628\u0627\u0631\u062F"),
      usageCount: 65,
      status: 'excellent',
      location: i18n.t("\u0627\u0644\u0635\u0627\u0644\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629")
    }, {
      id: 4,
      name: i18n.t("\u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0648\u062C\u0627\u062A \u0641\u0648\u0642 \u0627\u0644\u0635\u0648\u062A\u064A\u0629"),
      usageCount: 58,
      status: 'good',
      location: i18n.t("\u0627\u0644\u0639\u064A\u0627\u062F\u0629")
    }, {
      id: 5,
      name: i18n.t("\u062C\u0647\u0627\u0632 TENS"),
      usageCount: 44,
      status: 'excellent',
      location: i18n.t("\u0627\u0644\u0639\u064A\u0627\u062F\u0629")
    }, {
      id: 6,
      name: i18n.t("\u0633\u0631\u064A\u0631 \u0627\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u0637\u0628\u064A\u0639\u064A"),
      usageCount: 41,
      status: 'good',
      location: i18n.t("\u0627\u0644\u0639\u064A\u0627\u062F\u0629")
    }]
  },
  supplies: {
    burnByCategory: [{
      category: 'medication',
      label: i18n.t("\u0623\u062F\u0648\u064A\u0629"),
      quantity: 158
    }, {
      category: 'consumable',
      label: i18n.t("\u0645\u0633\u062A\u0647\u0644\u0643\u0627\u062A"),
      quantity: 224
    }, {
      category: 'topical',
      label: i18n.t("\u0645\u0648\u0636\u0639\u064A\u0629"),
      quantity: 88
    }, {
      category: 'supplement',
      label: i18n.t("\u0645\u0643\u0645\u0644\u0627\u062A"),
      quantity: 72
    }, {
      category: 'equipment_consumable',
      label: i18n.t("\u0645\u0633\u062A\u0647\u0644\u0643\u0627\u062A \u0623\u062C\u0647\u0632\u0629"),
      quantity: 38
    }]
  },
  appointments: {
    byStatus: [{
      name: i18n.t("\u0645\u0643\u062A\u0645\u0644"),
      key: 'completed',
      value: 32
    }, {
      name: i18n.t("\u0645\u062C\u062F\u0648\u0644"),
      key: 'scheduled',
      value: 8
    }, {
      name: i18n.t("\u0645\u0644\u063A\u0649"),
      key: 'cancelled',
      value: 4
    }, {
      name: i18n.t("\u0644\u0645 \u064A\u062D\u0636\u0631"),
      key: 'no_show',
      value: 2
    }]
  },
  performance: {
    monthlyTrend: [{
      month: '2024-08',
      avgScore: 71.5,
      count: 8
    }, {
      month: '2024-09',
      avgScore: 73.2,
      count: 10
    }, {
      month: '2024-10',
      avgScore: 75.8,
      count: 12
    }, {
      month: '2024-11',
      avgScore: 74.9,
      count: 11
    }, {
      month: '2024-12',
      avgScore: 77.3,
      count: 9
    }, {
      month: '2025-01',
      avgScore: 79.1,
      count: 10
    }, {
      month: '2025-02',
      avgScore: 78.4,
      count: 8
    }, {
      month: '2025-03',
      avgScore: 81.2,
      count: 10
    }]
  },
  vitals: {
    readingsCount: 184,
    abnormalCount: 14,
    abnormalRatePct: 7.6
  },
  files: {
    byType: [{
      name: i18n.t("\u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629"),
      key: 'xray',
      value: 18
    }, {
      name: i18n.t("\u0631\u0646\u064A\u0646 \u0645\u063A\u0646\u0627\u0637\u064A\u0633\u064A"),
      key: 'mri',
      value: 9
    }, {
      name: i18n.t("\u062A\u0642\u0627\u0631\u064A\u0631 \u0637\u0628\u064A\u0629"),
      key: 'report',
      value: 27
    }, {
      name: i18n.t("\u0645\u062E\u062A\u0628\u0631"),
      key: 'lab',
      value: 14
    }, {
      name: i18n.t("\u0641\u062D\u0648\u0635\u0627\u062A"),
      key: 'scan',
      value: 6
    }]
  },
  bodyMeasurements: {
    recordsInPeriod: 52
  },
  performanceRadar: [{
    metric: i18n.t("\u0627\u0644\u0642\u0648\u0629"),
    value: 76,
    fullMark: 100
  }, {
    metric: i18n.t("\u0627\u0644\u062A\u062D\u0645\u0644"),
    value: 81,
    fullMark: 100
  }, {
    metric: i18n.t("\u0627\u0644\u0645\u0631\u0648\u0646\u0629"),
    value: 69,
    fullMark: 100
  }, {
    metric: i18n.t("\u0627\u0644\u0631\u0634\u0627\u0642\u0629"),
    value: 74,
    fullMark: 100
  }, {
    metric: i18n.t("\u0631\u062F\u0629 \u0627\u0644\u0641\u0639\u0644"),
    value: 83,
    fullMark: 100
  }],
  performanceKpis: {
    overallScore: 76.6,
    physicalReadiness: 80.3,
    mentalReadiness: 73.1,
    vo2Max: 51.8,
    maxSpeed: 30.5
  },
  injuriesByWeek: [{
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 30"),
    value: 1
  }, {
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 31"),
    value: 3
  }, {
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 32"),
    value: 2
  }, {
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 33"),
    value: 0
  }, {
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 34"),
    value: 2
  }, {
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 35"),
    value: 1
  }, {
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 36"),
    value: 3
  }, {
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 37"),
    value: 1
  }, {
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 38"),
    value: 0
  }, {
    week: i18n.t("\u0623\u0633\u0628\u0648\u0639 39"),
    value: 1
  }],
  meta: {
    dateFrom: '2024-07-01',
    dateTo: '2025-06-30',
    season: '2024-2025'
  }
};

// =============================================================
// إعداد التبويبات
// =============================================================
const TABS = [{
  id: 'overview',
  label: i18n.t("\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629"),
  icon: LayoutDashboard,
  color: 'text-primary'
}, {
  id: 'injuries',
  label: i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A"),
  icon: HeartPulse,
  color: 'text-danger'
}, {
  id: 'rehabilitation',
  label: i18n.t("\u0627\u0644\u062A\u0623\u0647\u064A\u0644"),
  icon: Dumbbell,
  color: 'text-info'
}, {
  id: 'performance',
  label: i18n.t("\u0627\u0644\u0623\u062F\u0627\u0621"),
  icon: TrendingUp,
  color: 'text-success'
}, {
  id: 'equipment',
  label: i18n.t("\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A"),
  icon: Package,
  color: 'text-warning'
}];
const SEASON_OPTIONS = [{
  value: '2023-2024',
  label: i18n.t("\u0645\u0648\u0633\u0645 2023\u20132024")
}, {
  value: '2024-2025',
  label: i18n.t("\u0645\u0648\u0633\u0645 2024\u20132025")
}, {
  value: '2025-2026',
  label: i18n.t("\u0645\u0648\u0633\u0645 2025\u20132026")
}, {
  value: '2026-2027',
  label: i18n.t('موسم 2026–2027')
}];

// =============================================================
// توليد الرؤى الذكية من البيانات
// =============================================================
function generateInsights(stats) {
  if (!stats) return [];
  const insights = [];
  const hi = stats.snapshot?.healthIndex ?? 0;
  if (hi >= 80) insights.push({
    type: 'success',
    icon: Shield,
    text: i18n.t('مؤشر صحة الفريق ممتاز — {{hi}}% من اللاعبين جاهزون للمباراة', { hi })
  });else if (hi >= 60) insights.push({
    type: 'warning',
    icon: AlertTriangle,
    text: i18n.t('مؤشر صحة الفريق متوسط ({{hi}}%) — راجع الحالات المصابة', { hi })
  });else insights.push({
    type: 'danger',
    icon: Flame,
    text: i18n.t('مؤشر صحة الفريق منخفض ({{hi}}%) — تدخل عاجل مطلوب', { hi })
  });
  const rec = stats.injuries?.recurrenceRate ?? 0;
  if (rec > 25) insights.push({
    type: 'warning',
    icon: AlertTriangle,
    text: i18n.t('نسبة إصابات متكررة مرتفعة ({{rec}}%) — مراجعة برامج التأهيل ضرورية', { rec })
  });else if (rec <= 10 && stats.injuries?.countInPeriod > 0) insights.push({
    type: 'success',
    icon: CheckCircle2,
    text: i18n.t('نسبة الإصابات المتكررة منخفضة ({{rec}}%) — برامج التأهيل فعّالة', { rec })
  });
  const sess = stats.rehab?.sessions;
  if (sess?.total > 0) {
    const rate = Math.round(sess.attended / sess.total * 100);
    if (rate >= 90) insights.push({
      type: 'success',
      icon: Award,
      text: i18n.t('معدل حضور جلسات التأهيل ممتاز ({{rate}}%)', { rate })
    });else if (rate < 75) insights.push({
      type: 'warning',
      icon: Clock,
      text: i18n.t('معدل حضور التأهيل منخفض ({{rate}}%) — متابعة اللاعبين مطلوبة', { rate })
    });
  }
  const abnRate = stats.vitals?.abnormalRatePct ?? 0;
  if (abnRate > 20) insights.push({
    type: 'danger',
    icon: Activity,
    text: i18n.t('{{abnRate}}% من قراءات المؤشرات الحيوية خارج النطاق الطبيعي', { abnRate })
  });else if (abnRate <= 10 && stats.vitals?.readingsCount > 0) insights.push({
    type: 'success',
    icon: Activity,
    text: i18n.t('المؤشرات الحيوية للفريق ضمن النطاق الطبيعي ({{abnRate}}% شاذة فقط)', { abnRate })
  });
  return insights.slice(0, 4);
}

// =============================================================
// مكوّن بطاقة KPI
// =============================================================
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  primary,
  light,
  border
}) {
  return <div className="rounded-xl p-5 flex items-start gap-4 border" style={{
    backgroundColor: light,
    borderColor: border
  }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{
      backgroundColor: primary + '22'
    }}>
        <Icon className="w-6 h-6" style={{
        color: primary
      }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 mb-0.5 leading-relaxed">{label}</p>
        <p className="text-2xl font-bold font-numbers" style={{
        color: primary
      }}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>;
}

// =============================================================
// مكوّن قسم الرسم البياني
// =============================================================
function ChartSection({
  title,
  icon: Icon,
  iconColor = '#1D9E75',
  link,
  linkLabel = i18n.t("\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644"),
  children,
  className = ''
}) {
  return <div className={`bg-gray-50 p-4 rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Icon className="w-4 h-4" style={{
          color: iconColor
        }} />
          {title}
        </h4>
        {link && <Link to={link} className="text-xs font-medium flex items-center gap-1 hover:underline" style={{
        color: iconColor
      }}>
            {linkLabel}
            <ArrowLeft className="w-3 h-3" />
          </Link>}
      </div>
      <div className="h-64">
        {children}
      </div>
    </div>;
}

// =============================================================
// المكوّن الرئيسي
// =============================================================
export default function Statistics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [stats, setStats] = useState(DEMO_DATA);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [filters, setFilters] = useState({
    season: searchParams.get('season') || '2025-2026',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || ''
  });
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        season: filters.season,
        ...(filters.dateFrom && filters.dateTo ? {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        } : {})
      };
      const res = await statsApi.getAnalytics(params);
      if (res.data.success) {
        const d = res.data.data;
        const hasRealData = (d.snapshot?.totalPlayers ?? 0) > 0 || (d.injuries?.countInPeriod ?? 0) > 0;
        if (hasRealData) {
          setStats(d);
          setIsDemo(false);
        } else {
          setIsDemo(true);
        }
      }
    } catch {
      toast.error(i18n.t("\u062A\u0639\u0630\u0651\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062E\u0627\u062F\u0645 \u2014 \u064A\u062A\u0645 \u0639\u0631\u0636 \u0628\u064A\u0627\u0646\u0627\u062A \u062A\u062C\u0631\u064A\u0628\u064A\u0629"));
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  const handleFilterChange = (key, value) => {
    const updated = {
      ...filters,
      [key]: value
    };
    setFilters(updated);
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);else p.delete(key);
    setSearchParams(p);
  };
  const handleTabChange = tabId => {
    setActiveTab(tabId);
    const p = new URLSearchParams(searchParams);
    p.set('tab', tabId);
    setSearchParams(p);
  };
  const clearFilters = () => {
    setFilters({
      season: '2025-2026',
      dateFrom: '',
      dateTo: ''
    });
    setSearchParams(new URLSearchParams());
  };
  const hasActiveFilters = filters.dateFrom || filters.dateTo || filters.season !== '2025-2026';

  // =============================================================
  // القيم المشتقة
  // =============================================================
  const weeklyData = stats?.availability?.weekly ?? [];
  const avgAvailability = weeklyData.length > 0 ? (weeklyData.reduce((s, w) => s + w.availabilityRate, 0) / weeklyData.length).toFixed(1) : stats?.snapshot?.totalPlayers > 0 ? (stats.snapshot.readyPlayers / stats.snapshot.totalPlayers * 100).toFixed(1) : '0.0';
  const recoveryItems = stats?.injuries?.avgRecoveryByType ?? [];
  const totalRecoveryDays = recoveryItems.reduce((s, t) => s + (t.avgDays ?? 0) * t.sampleSize, 0);
  const totalRecoverySamples = recoveryItems.reduce((s, t) => s + t.sampleSize, 0);
  const avgRecoveryDays = totalRecoverySamples > 0 ? Math.round(totalRecoveryDays / totalRecoverySamples) : 0;
  const sessions = stats?.rehab?.sessions ?? {
    total: 0,
    attended: 0,
    missed: 0,
    cancelled: 0
  };
  const attendanceRate = sessions.total > 0 ? Math.round(sessions.attended / sessions.total * 100) : 0;
  const insights = generateInsights(stats);

  // خريطة الألوان
  const COLORS = {
    primary: '#1D9E75',
    primaryLight: '#E1F5EE',
    primaryBorder: '#1D9E75',
    success: '#3B6D11',
    successLight: '#EAF3DE',
    successBorder: '#3B6D11',
    warning: '#854F0B',
    warningLight: '#FAEEDA',
    warningBorder: '#854F0B',
    danger: '#A32D2D',
    dangerLight: '#FCEBEB',
    dangerBorder: '#A32D2D',
    info: '#185FA5',
    infoLight: '#E6F1FB',
    infoBorder: '#185FA5'
  };
  const EQ_STATUS_COLORS = {
    excellent: '#1D9E75',
    good: '#185FA5',
    needs_maintenance: '#854F0B',
    out_of_service: '#A32D2D'
  };
  const APT_STATUS_COLORS = {
    completed: '#1D9E75',
    scheduled: '#185FA5',
    cancelled: '#A32D2D',
    no_show: '#854F0B',
    rescheduled: '#854F0B'
  };
  const FILE_TYPE_COLORS = {
    xray: '#A32D2D',
    mri: '#185FA5',
    report: '#1D9E75',
    lab: '#854F0B',
    scan: '#6c757d',
    other: '#adb5bd'
  };
  const SEV_COLORS = {
    mild: '#3B6D11',
    moderate: '#854F0B',
    severe: '#A32D2D',
    critical: '#212529'
  };

  // =============================================================
  // تبويب نظرة عامة
  // =============================================================
  const renderOverview = () => {
    const playerStatusData = [{
      name: i18n.t("\u062C\u0627\u0647\u0632"),
      value: stats.snapshot.readyPlayers,
      color: '#1D9E75'
    }, {
      name: i18n.t("\u0645\u0635\u0627\u0628"),
      value: stats.snapshot.injuredPlayers,
      color: '#A32D2D'
    }, {
      name: i18n.t("\u062A\u0623\u0647\u064A\u0644"),
      value: stats.snapshot.rehabPlayers,
      color: '#185FA5'
    }, {
      name: i18n.t("\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"),
      value: Math.max(0, stats.snapshot.totalPlayers - stats.snapshot.readyPlayers - stats.snapshot.injuredPlayers - stats.snapshot.rehabPlayers),
      color: '#6c757d'
    }].filter(i => i.value > 0);
    const availabilityChartData = weeklyData.map(w => ({
      date: translateWeekLabel(w.label),
      value: w.availabilityRate
    }));
    const performanceTrendData = (stats.performance?.monthlyTrend ?? []).map(p => ({
      date: p.month,
      value: p.avgScore
    }));
    const appointmentsData = (stats.appointments?.byStatus ?? []).map(a => ({
      name: translateAptStatusLabel(a.name),
      value: a.value,
      color: APT_STATUS_COLORS[a.key] ?? '#6c757d'
    }));
    const filesData = (stats.files?.byType ?? []).map(f => ({
      name: translateFileType(f.name),
      value: f.value,
      color: FILE_TYPE_COLORS[f.key] ?? '#6c757d'
    }));
    return <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label={i18n.t("\u0645\u0624\u0634\u0631 \u0635\u062D\u0629 \u0627\u0644\u0641\u0631\u064A\u0642")} value={`${stats.snapshot.healthIndex}%`} sub={i18n.t('{{ready}} من {{total}} لاعب جاهز', { ready: stats.snapshot.readyPlayers, total: stats.snapshot.totalPlayers })} icon={Shield} primary={COLORS.primary} light={COLORS.primaryLight} border={COLORS.primaryBorder + '40'} />
          <KpiCard label={i18n.t("\u0645\u0639\u062F\u0644 \u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629")} value={`${avgAvailability}%`} sub={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u062E\u0644\u0627\u0644 \u0627\u0644\u0641\u062A\u0631\u0629")} icon={CheckCircle2} primary={COLORS.success} light={COLORS.successLight} border={COLORS.successBorder + '40'} />
          <KpiCard label={i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0629")} value={stats.injuries.countInPeriod} sub={i18n.t('{{pct}}% منها متكررة', { pct: stats.injuries.recurrenceRate })} icon={HeartPulse} primary={COLORS.danger} light={COLORS.dangerLight} border={COLORS.dangerBorder + '40'} />
          <KpiCard label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A")} value={i18n.t('{{n}} يوم', { n: avgRecoveryDays })} sub={i18n.t("\u0645\u0646 \u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0645\u063A\u0644\u0642\u0629")} icon={Clock} primary={COLORS.warning} light={COLORS.warningLight} border={COLORS.warningBorder + '40'} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label={i18n.t("\u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644 \u0627\u0644\u0646\u0634\u0637\u0629")} value={stats.rehab.activePrograms} sub={i18n.t('{{n}} مكتملة في الفترة', { n: stats.rehab.completedInPeriod })} icon={Dumbbell} primary={COLORS.info} light={COLORS.infoLight} border={COLORS.infoBorder + '40'} />
          <KpiCard label={i18n.t("\u0645\u0639\u062F\u0644 \u062D\u0636\u0648\u0631 \u0627\u0644\u062A\u0623\u0647\u064A\u0644")} value={`${attendanceRate}%`} sub={i18n.t('{{attended}} من {{total}} جلسة', { attended: sessions.attended, total: sessions.total })} icon={Activity} primary={attendanceRate >= 85 ? COLORS.success : COLORS.warning} light={attendanceRate >= 85 ? COLORS.successLight : COLORS.warningLight} border={(attendanceRate >= 85 ? COLORS.successBorder : COLORS.warningBorder) + '40'} />
          <KpiCard label={i18n.t("\u0642\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629")} value={stats.vitals.readingsCount} sub={i18n.t('{{pct}}% خارج النطاق الطبيعي', { pct: stats.vitals.abnormalRatePct })} icon={Zap} primary={COLORS.primary} light={COLORS.primaryLight} border={COLORS.primaryBorder + '40'} />
          <KpiCard label={i18n.t("\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u0645 \u0627\u0644\u0645\u0633\u062C\u0644\u0629")} value={stats.bodyMeasurements.recordsInPeriod} sub={i18n.t("\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0646\u0627\u0647\u0631\u0648\u0628\u0648\u0645\u062A\u0631\u064A\u0629")} icon={Target} primary={COLORS.info} light={COLORS.infoLight} border={COLORS.infoBorder + '40'} />
        </div>

        {/* Insights Panel */}
        {insights.length > 0 && <div className="rounded-xl border bg-white p-5" style={{
        borderColor: '#e9ecef'
      }}>
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-primary" />{i18n.t("\u0631\u0624\u0649 \u0630\u0643\u064A\u0629 \u0644\u0644\u0645\u0648\u0633\u0645")}{isDemo && <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-warning-light text-warning mr-2">{i18n.t("\u0628\u064A\u0627\u0646\u0627\u062A \u062A\u062C\u0631\u064A\u0628\u064A\u0629")}</span>}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.map((ins, i) => <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${ins.type === 'success' ? 'bg-success-light' : ins.type === 'warning' ? 'bg-warning-light' : 'bg-danger-light'}`}>
                  <ins.icon className={`w-4 h-4 mt-0.5 shrink-0 ${ins.type === 'success' ? 'text-success' : ins.type === 'warning' ? 'text-warning' : 'text-danger'}`} />
                  <p className={`text-sm ${ins.type === 'success' ? 'text-success' : ins.type === 'warning' ? 'text-warning' : 'text-danger'}`}>{ins.text}</p>
                </div>)}
            </div>
          </div>}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSection title={i18n.t("\u062A\u0648\u0632\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")} icon={Users} iconColor={COLORS.primary} link="/players" linkLabel={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}>
            <DonutChart data={playerStatusData} dataKey="value" nameKey="name" centerLabel={i18n.t("\u0644\u0627\u0639\u0628")} />
          </ChartSection>
          <ChartSection title={i18n.t("\u0645\u0646\u062D\u0646\u0649 \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A")} icon={TrendingUp} iconColor={COLORS.success} link="/players">
            <AreaChart data={availabilityChartData} dataKey="value" xKey="date" color={COLORS.success} unit="%" />
          </ChartSection>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSection title={i18n.t("\u062A\u0637\u0648\u0631 \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0634\u0647\u0631\u064A")} icon={TrendingUp} iconColor={COLORS.info} link="/performance" linkLabel={i18n.t("\u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0623\u062F\u0627\u0621")}>
            <LineChart data={performanceTrendData} dataKey="value" xKey="date" color={COLORS.info} label={i18n.t("\u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0639\u0627\u0645")} unit="%" />
          </ChartSection>
          <ChartSection title={i18n.t("\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u062D\u0633\u0628 \u0627\u0644\u062D\u0627\u0644\u0629")} icon={Calendar} iconColor={COLORS.warning} link="/appointments" linkLabel={i18n.t("\u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F")}>
            <DonutChart data={appointmentsData} dataKey="value" nameKey="name" centerLabel={i18n.t("\u0645\u0648\u0639\u062F")} />
          </ChartSection>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSection title={i18n.t("\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0646\u0648\u0639")} icon={FileText} iconColor={COLORS.danger} link="/files" linkLabel={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0644\u0641\u0627\u062A")}>
            <DonutChart data={filesData} dataKey="value" nameKey="name" centerLabel={i18n.t("\u0645\u0644\u0641")} />
          </ChartSection>
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 border border-primary/20 flex flex-col justify-between">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />{i18n.t("\u0645\u0644\u062E\u0635 \u0627\u0644\u0645\u0648\u0633\u0645 \u0627\u0644\u0633\u0631\u064A\u0639")}</h4>
            <div className="space-y-3">
              {[{
              label: i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646"),
              value: stats.snapshot.totalPlayers,
              max: 30
            }, {
              label: i18n.t("\u0627\u0644\u062C\u0627\u0647\u0632\u0648\u0646 \u0644\u0644\u0645\u0628\u0627\u0631\u0627\u0629"),
              value: stats.snapshot.readyPlayers,
              max: stats.snapshot.totalPlayers
            }, {
              label: i18n.t("\u0627\u0644\u0645\u0635\u0627\u0628\u0648\u0646 \u062D\u0627\u0644\u064A\u0627\u064B"),
              value: stats.snapshot.injuredPlayers,
              max: stats.snapshot.totalPlayers,
              danger: true
            }, {
              label: i18n.t("\u0641\u064A \u0627\u0644\u062A\u0623\u0647\u064A\u0644"),
              value: stats.snapshot.rehabPlayers,
              max: stats.snapshot.totalPlayers,
              info: true
            }].map((item, i) => <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-bold font-numbers text-gray-800">{item.value}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${item.max > 0 ? item.value / item.max * 100 : 0}%`,
                  backgroundColor: item.danger ? COLORS.danger : item.info ? COLORS.info : COLORS.primary
                }} />
                  </div>
                </div>)}
            </div>
            <div className="mt-4 pt-3 border-t border-primary/20">
              <Link to="/injuries" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">{i18n.t("\u062A\u062D\u0644\u064A\u0644 \u062A\u0641\u0635\u064A\u0644\u064A \u0644\u0644\u0625\u0635\u0627\u0628\u0627\u062A")}<ArrowLeft className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>;
  };

  // =============================================================
  // تبويب الإصابات
  // =============================================================
  const renderInjuries = () => {
    const bySeverityData = (stats.injuries?.bySeverity ?? []).map(s => ({
      name: translateSeverity(s.name),
      value: s.value,
      color: SEV_COLORS[s.key] ?? '#6c757d'
    }));
    const recoveryData = (stats.injuries?.avgRecoveryByType ?? []).map(r => ({
      name: translateInjuryType(r.injuryType),
      value: r.avgDays ?? 0
    }));
    const injByWeekData = (stats.injuriesByWeek ?? []).map(r => ({
      date: translateWeekLabel(r.week),
      value: r.value
    }));
    const byAreaData = (stats.injuries?.byArea ?? []).map(i => ({ name: translateBodyArea(i.name), value: i.value }));
    const byOccasionData = (stats.injuries?.byOccasion ?? []).map(i => ({ name: translateCondition(i.name), value: i.value }));
    const byMechanismData = (stats.injuries?.byMechanism ?? []).map(i => ({ name: translateMechanism(i.name), value: i.value }));
    const byPositionData = (stats.injuries?.byPosition ?? []).map(i => ({ name: translatePosition(i.name), value: i.value }));
    const byTypeData = (stats.injuries?.byType ?? []).map(i => ({ name: translateInjuryType(i.name), value: i.value }));
    return <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label={i18n.t("\u0625\u0635\u0627\u0628\u0627\u062A \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0629")} value={stats.injuries.countInPeriod} sub={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629")} icon={HeartPulse} primary={COLORS.danger} light={COLORS.dangerLight} border={COLORS.dangerBorder + '40'} />
          <KpiCard label={i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u0643\u0631\u0627\u0631")} value={`${stats.injuries.recurrenceRate}%`} sub={i18n.t("\u0625\u0635\u0627\u0628\u0627\u062A \u0645\u062A\u0643\u0631\u0631\u0629 \u0644\u0646\u0641\u0633 \u0627\u0644\u0644\u0627\u0639\u0628")} icon={Percent} primary={COLORS.warning} light={COLORS.warningLight} border={COLORS.warningBorder + '40'} />
          <KpiCard label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062A\u0639\u0627\u0641\u064A")} value={`${avgRecoveryDays} ${i18n.t('يوم')}`} sub={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0645\u062F\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0645\u064F\u0633\u062C\u0651\u0644\u0629")} icon={Clock} primary={COLORS.info} light={COLORS.infoLight} border={COLORS.infoBorder + '40'} />
          <KpiCard label={i18n.t("\u0645\u0639\u062F\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0627\u0644\u0634\u0647\u0631\u064A")} value={stats.trainingLoad?.injuriesPerPlayerMonth?.toFixed(2) ?? '—'} sub={i18n.t("\u0625\u0635\u0627\u0628\u0629/\u0644\u0627\u0639\u0628/\u0634\u0647\u0631")} icon={Activity} primary={COLORS.primary} light={COLORS.primaryLight} border={COLORS.primaryBorder + '40'} />
        </div>

        {/* Row 1: Area + Severity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSection title={i18n.t("\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u062D\u0633\u0628 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062C\u0633\u0645")} icon={Activity} iconColor={COLORS.primary} link="/injuries" linkLabel={i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")}>
            <HorizontalBarChart data={byAreaData} dataKey="value" nameKey="name" unit={i18n.t("\u0625\u0635\u0627\u0628\u0629")} />
          </ChartSection>
          <ChartSection title={i18n.t("\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0634\u062F\u0629")} icon={AlertTriangle} iconColor={COLORS.danger}>
            <DonutChart data={bySeverityData} dataKey="value" nameKey="name" centerLabel={i18n.t("\u0625\u0635\u0627\u0628\u0629")} />
          </ChartSection>
        </div>

        {/* Row 2: Occasion + Mechanism */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSection title={i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u062D\u0633\u0628 \u0638\u0631\u0648\u0641 \u0627\u0644\u062D\u062F\u0648\u062B")} icon={Calendar} iconColor={COLORS.info}>
            <BarChart data={byOccasionData} dataKey="value" nameKey="name" colors={COLORS.info} unit={i18n.t("\u0625\u0635\u0627\u0628\u0629")} />
          </ChartSection>
          <ChartSection title={i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u062D\u0633\u0628 \u0622\u0644\u064A\u0629 \u0627\u0644\u062D\u062F\u0648\u062B")} icon={Flame} iconColor={COLORS.warning}>
            <BarChart data={byMechanismData} dataKey="value" nameKey="name" colors={COLORS.warning} unit={i18n.t("\u0625\u0635\u0627\u0628\u0629")} />
          </ChartSection>
        </div>

        {/* Row 3: By Position + By Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSection title={i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u062D\u0633\u0628 \u0645\u0631\u0643\u0632 \u0627\u0644\u0644\u0627\u0639\u0628")} icon={Users} iconColor={COLORS.success} link="/players">
            <HorizontalBarChart data={byPositionData} dataKey="value" nameKey="name" unit={i18n.t("\u0625\u0635\u0627\u0628\u0629")} />
          </ChartSection>
          <ChartSection title={i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0646\u0648\u0639")} icon={HeartPulse} iconColor={COLORS.danger}>
            <HorizontalBarChart data={byTypeData} dataKey="value" nameKey="name" unit={i18n.t("\u0625\u0635\u0627\u0628\u0629")} />
          </ChartSection>
        </div>

        {/* Row 4: Recovery by Type (full width) */}
        <ChartSection title={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u062D\u0633\u0628 \u0646\u0648\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")} icon={Clock} iconColor={COLORS.warning} link="/injuries" className="lg:col-span-2">
          <BarChart data={recoveryData} dataKey="value" nameKey="name" colors={COLORS.warning} unit={i18n.t("\u064A\u0648\u0645")} />
        </ChartSection>

        {/* Row 5: Injuries by Week */}
        <ChartSection title={i18n.t("\u0645\u0639\u062F\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A \u062E\u0644\u0627\u0644 \u0627\u0644\u0645\u0648\u0633\u0645")} icon={TrendingUp} iconColor={COLORS.danger} link="/injuries">
          <AreaChart data={injByWeekData} dataKey="value" xKey="date" color={COLORS.danger} unit={i18n.t("\u0625\u0635\u0627\u0628\u0629")} />
        </ChartSection>

        {/* Quick link */}
        <div className="flex justify-center">
          <Link to="/injuries">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />{i18n.t("\u0639\u0631\u0636 \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A\u0629")}</Button>
          </Link>
        </div>
      </div>;
  };

  // =============================================================
  // تبويب التأهيل
  // =============================================================
  const renderRehabilitation = () => {
    const sessionAttendanceData = [{
      name: i18n.t("\u062D\u0636\u0631"),
      value: sessions.attended,
      color: '#1D9E75'
    }, {
      name: i18n.t("\u063A\u0627\u0628"),
      value: sessions.missed,
      color: '#A32D2D'
    }, {
      name: i18n.t("\u0645\u0644\u063A\u0649"),
      value: sessions.cancelled,
      color: '#854F0B'
    }].filter(i => i.value > 0);
    const availabilityChartData = weeklyData.map(w => ({
      date: translateWeekLabel(w.label),
      value: w.availabilityRate
    }));
    const effRatio = stats.rehab?.efficiencyRatio;
    const effLabel = effRatio != null ? effRatio <= 1 ? i18n.t('{{n}}% أسرع من المتوقع', { n: (1 / effRatio * 100 - 100).toFixed(1) }) : i18n.t('{{n}}% أبطأ من المتوقع', { n: ((effRatio - 1) * 100).toFixed(1) }) : '—';
    const effColor = effRatio != null && effRatio <= 1 ? COLORS.success : COLORS.warning;
    return <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label={i18n.t("\u0628\u0631\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644 \u0646\u0634\u0637\u0629")} value={stats.rehab.activePrograms} sub={i18n.t("\u0628\u0631\u0627\u0645\u062C \u062C\u0627\u0631\u064A\u0629 \u062D\u0627\u0644\u064A\u0627\u064B")} icon={Dumbbell} primary={COLORS.info} light={COLORS.infoLight} border={COLORS.infoBorder + '40'} />
          <KpiCard label={i18n.t("\u0628\u0631\u0627\u0645\u062C \u0645\u0643\u062A\u0645\u0644\u0629")} value={stats.rehab.completedInPeriod} sub={i18n.t("\u0645\u0643\u062A\u0645\u0644\u0629 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u062A\u0631\u0629")} icon={CheckCircle2} primary={COLORS.success} light={COLORS.successLight} border={COLORS.successBorder + '40'} />
          <KpiCard label={i18n.t("\u0645\u0639\u062F\u0644 \u062D\u0636\u0648\u0631 \u0627\u0644\u062C\u0644\u0633\u0627\u062A")} value={`${attendanceRate}%`} sub={i18n.t('{{attended}}/{{total}} جلسة', { attended: sessions.attended, total: sessions.total })} icon={Activity} primary={attendanceRate >= 85 ? COLORS.success : COLORS.warning} light={attendanceRate >= 85 ? COLORS.successLight : COLORS.warningLight} border={(attendanceRate >= 85 ? COLORS.successBorder : COLORS.warningBorder) + '40'} />
          <KpiCard label={i18n.t("\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A")} value={effRatio != null ? effRatio.toFixed(2) : '—'} sub={effLabel} icon={Zap} primary={effColor} light={effColor + '15'} border={effColor + '40'} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSection title={i18n.t("\u062D\u0636\u0648\u0631 \u062C\u0644\u0633\u0627\u062A \u0627\u0644\u062A\u0623\u0647\u064A\u0644")} icon={Activity} iconColor={COLORS.primary}>
            {sessions.total > 0 ? <DonutChart data={sessionAttendanceData} dataKey="value" nameKey="name" centerLabel={i18n.t("\u062C\u0644\u0633\u0629")} /> : <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                <Activity className="w-10 h-10 text-gray-200" />
                <p className="text-sm">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u062C\u0644\u0633\u0627\u062A \u062A\u0623\u0647\u064A\u0644 \u0645\u0633\u062C\u0651\u0644\u0629 \u0641\u064A \u0647\u0630\u0647 \u0627\u0644\u0641\u062A\u0631\u0629")}</p>
                <Link to="/rehabilitation" className="text-xs text-primary hover:underline">{i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062A\u0623\u0647\u064A\u0644")}</Link>
              </div>}
          </ChartSection>
          <ChartSection title={i18n.t("\u0645\u0646\u062D\u0646\u0649 \u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A")} icon={Users} iconColor={COLORS.success} link="/players">
            <AreaChart data={availabilityChartData} dataKey="value" xKey="date" color={COLORS.success} unit="%" />
          </ChartSection>
        </div>

        {/* Sessions Summary Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-info" />{i18n.t("\u0645\u0644\u062E\u0635 \u062C\u0644\u0633\u0627\u062A \u0627\u0644\u062A\u0623\u0647\u064A\u0644")}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{
            label: i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062C\u0644\u0633\u0627\u062A"),
            value: sessions.total,
            color: COLORS.info
          }, {
            label: i18n.t("\u062C\u0644\u0633\u0627\u062A \u062D\u0636\u0631\u0647\u0627 \u0627\u0644\u0644\u0627\u0639\u0628"),
            value: sessions.attended,
            color: COLORS.success
          }, {
            label: i18n.t("\u063A\u064A\u0627\u0628"),
            value: sessions.missed,
            color: COLORS.danger
          }, {
            label: i18n.t("\u0645\u0644\u063A\u0627\u0629"),
            value: sessions.cancelled,
            color: COLORS.warning
          }].map((item, i) => <div key={i} className="text-center p-3 rounded-xl bg-gray-50">
                <p className="text-2xl font-bold font-numbers" style={{
              color: item.color
            }}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>)}
          </div>
        </div>

        {/* Weekly Availability Detail */}
        {weeklyData.length > 0 && <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />{i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0629")}</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {weeklyData.map((w, i) => <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 shrink-0">{translateWeekLabel(w.label)}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${w.availabilityRate}%`,
                backgroundColor: w.availabilityRate >= 85 ? COLORS.success : w.availabilityRate >= 70 ? COLORS.warning : COLORS.danger
              }} />
                  </div>
                  <span className="text-xs font-bold font-numbers w-12 text-left shrink-0" style={{
              color: w.availabilityRate >= 85 ? COLORS.success : w.availabilityRate >= 70 ? COLORS.warning : COLORS.danger
            }}>
                    {w.availabilityRate}%
                  </span>
                  {w.unavailable != null && <span className="text-xs text-gray-400 w-16 shrink-0">{w.unavailable}{i18n.t("\u063A\u0627\u0626\u0628")}</span>}
                </div>)}
            </div>
          </div>}

        <div className="flex justify-center">
          <Link to="/rehabilitation">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />{i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0628\u0631\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644")}</Button>
          </Link>
        </div>
      </div>;
  };

  // =============================================================
  // تبويب الأداء
  // =============================================================
  const renderPerformance = () => {
    const performanceTrend = (stats.performance?.monthlyTrend ?? []).map(p => ({
      date: p.month,
      value: p.avgScore
    }));
    const kpis = stats.performanceKpis ?? {};
    return <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0639\u0627\u0645")} value={kpis.overallScore != null ? `${kpis.overallScore}%` : '—'} sub={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629")} icon={Award} primary={COLORS.primary} light={COLORS.primaryLight} border={COLORS.primaryBorder + '40'} />
          <KpiCard label={i18n.t("\u0627\u0644\u0627\u0633\u062A\u0639\u062F\u0627\u062F \u0627\u0644\u0628\u062F\u0646\u064A")} value={kpis.physicalReadiness != null ? `${kpis.physicalReadiness}%` : '—'} sub={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0628\u062F\u0646\u064A\u0629")} icon={Dumbbell} primary={COLORS.success} light={COLORS.successLight} border={COLORS.successBorder + '40'} />
          <KpiCard label={i18n.t("\u0627\u0644\u0627\u0633\u062A\u0639\u062F\u0627\u062F \u0627\u0644\u0646\u0641\u0633\u064A")} value={kpis.mentalReadiness != null ? `${kpis.mentalReadiness}%` : '—'} sub={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062C\u0627\u0647\u0632\u064A\u0629 \u0627\u0644\u0646\u0641\u0633\u064A\u0629")} icon={Zap} primary={COLORS.info} light={COLORS.infoLight} border={COLORS.infoBorder + '40'} />
          <KpiCard label={i18n.t("\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 VO\u2082")} value={kpis.vo2Max != null ? `${kpis.vo2Max}` : '—'} sub={i18n.t("\u0645\u0644/\u0643\u063A/\u062F\u0642\u064A\u0642\u0629")} icon={Activity} primary={COLORS.warning} light={COLORS.warningLight} border={COLORS.warningBorder + '40'} />
        </div>

        {/* Radar + Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSection title={i18n.t("\u062E\u0645\u0627\u0633\u064A \u0645\u0624\u0634\u0631\u0627\u062A \u0623\u062F\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642 (\u0631\u0627\u062F\u0627\u0631)")} icon={Target} iconColor={COLORS.primary} link="/performance" linkLabel={i18n.t("\u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0623\u062F\u0627\u0621")}>
            <RadarChart data={(stats.performanceRadar ?? []).map(r => ({ ...r, metric: translatePerformanceMetric(r.metric) }))} />
          </ChartSection>
          <ChartSection title={i18n.t("\u062A\u0637\u0648\u0631 \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0634\u0647\u0631\u064A")} icon={TrendingUp} iconColor={COLORS.info}>
            <LineChart data={performanceTrend} dataKey="value" xKey="date" color={COLORS.info} label={i18n.t("\u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0639\u0627\u0645")} unit="%" />
          </ChartSection>
        </div>

        {/* Vitals Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />{i18n.t("\u0645\u0644\u062E\u0635 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629 \u0644\u0644\u0641\u062A\u0631\u0629")}<Link to="/vitals" className="text-xs text-primary font-medium mr-auto flex items-center gap-1 hover:underline">{i18n.t("\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629")}<ArrowLeft className="w-3 h-3" />
            </Link>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[{
            label: i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0642\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629"),
            value: stats.vitals.readingsCount,
            icon: Activity,
            color: COLORS.primary,
            light: COLORS.primaryLight
          }, {
            label: i18n.t("\u0642\u0631\u0627\u0621\u0627\u062A \u0634\u0627\u0630\u0629"),
            value: stats.vitals.abnormalCount,
            icon: AlertTriangle,
            color: COLORS.danger,
            light: COLORS.dangerLight
          }, {
            label: i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u0634\u0630\u0648\u0630"),
            value: `${stats.vitals.abnormalRatePct}%`,
            icon: Percent,
            color: stats.vitals.abnormalRatePct > 20 ? COLORS.danger : stats.vitals.abnormalRatePct > 10 ? COLORS.warning : COLORS.success,
            light: stats.vitals.abnormalRatePct > 20 ? COLORS.dangerLight : stats.vitals.abnormalRatePct > 10 ? COLORS.warningLight : COLORS.successLight
          }].map((item, i) => <div key={i} className="text-center p-4 rounded-xl" style={{
            backgroundColor: item.light
          }}>
                <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{
              backgroundColor: item.color + '22'
            }}>
                  <item.icon className="w-5 h-5" style={{
                color: item.color
              }} />
                </div>
                <p className="text-2xl font-bold font-numbers" style={{
              color: item.color
            }}>{item.value}</p>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </div>)}
          </div>
        </div>

        {/* Max Speed + Body Measurements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-gray-50 rounded-xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{
            backgroundColor: COLORS.warning + '22'
          }}>
              <Flame className="w-7 h-7" style={{
              color: COLORS.warning
            }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{i18n.t("\u0623\u0642\u0635\u0649 \u0633\u0631\u0639\u0629 \u0645\u0633\u062C\u0644\u0629")}</p>
              <p className="text-3xl font-bold font-numbers" style={{
              color: COLORS.warning
            }}>
                {kpis.maxSpeed != null ? kpis.maxSpeed : '—'} <span className="text-lg font-normal text-gray-400">{i18n.t("\u0643\u0645/\u0633\u0627\u0639\u0629")}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">{i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0623\u0639\u0644\u0649 \u0633\u0631\u0639\u0629 \u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{
            backgroundColor: COLORS.info + '22'
          }}>
              <Target className="w-7 h-7" style={{
              color: COLORS.info
            }} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{i18n.t("\u0642\u064A\u0627\u0633\u0627\u062A \u062C\u0633\u0645 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</p>
              <p className="text-3xl font-bold font-numbers" style={{
              color: COLORS.info
            }}>
                {stats.bodyMeasurements.recordsInPeriod} <span className="text-lg font-normal text-gray-400">{i18n.t("\u0642\u064A\u0627\u0633")}</span>
              </p>
              <Link to="/measurements" className="text-xs text-info font-medium flex items-center gap-1 mt-1 hover:underline" style={{
              color: COLORS.info
            }}>{i18n.t("\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u062F\u064A\u0629")}<ArrowLeft className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>;
  };

  // =============================================================
  // تبويب المعدات والمستلزمات
  // =============================================================
  const renderEquipment = () => {
    const equipStatusData = (stats.equipment?.byStatus ?? []).map(e => ({
      name: translateEquipmentStatus(e.name),
      value: e.value,
      color: EQ_STATUS_COLORS[e.key] ?? '#6c757d'
    }));
    const suppliesData = (stats.supplies?.burnByCategory ?? []).map(s => ({
      name: translateSupplyCategory(s.label),
      value: s.quantity
    }));
    const filesData = (stats.files?.byType ?? []).map(f => ({
      name: translateFileType(f.name),
      value: f.value,
      color: FILE_TYPE_COLORS[f.key] ?? '#6c757d'
    }));
    const totalEquipment = equipStatusData.reduce((s, e) => s + e.value, 0);
    const needsMaintenance = (stats.equipment?.byStatus ?? []).find(e => e.key === 'needs_maintenance')?.value ?? 0;
    const outOfService = (stats.equipment?.byStatus ?? []).find(e => e.key === 'out_of_service')?.value ?? 0;
    const totalSuppliesBurn = suppliesData.reduce((s, i) => s + i.value, 0);
    return <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0637\u0628\u064A\u0629")} value={totalEquipment} sub={i18n.t("\u0623\u062C\u0647\u0632\u0629 \u0641\u064A \u0633\u062C\u0644 \u0627\u0644\u062C\u0631\u062F")} icon={Package} primary={COLORS.primary} light={COLORS.primaryLight} border={COLORS.primaryBorder + '40'} />
          <KpiCard label={i18n.t("\u062A\u062D\u062A\u0627\u062C \u0635\u064A\u0627\u0646\u0629")} value={needsMaintenance} sub={i18n.t("\u062C\u0647\u0627\u0632 \u064A\u062D\u062A\u0627\u062C \u062A\u062F\u062E\u0644\u0627\u064B")} icon={AlertTriangle} primary={needsMaintenance > 0 ? COLORS.warning : COLORS.success} light={needsMaintenance > 0 ? COLORS.warningLight : COLORS.successLight} border={(needsMaintenance > 0 ? COLORS.warningBorder : COLORS.successBorder) + '40'} />
          <KpiCard label={i18n.t("\u062E\u0627\u0631\u062C \u0627\u0644\u062E\u062F\u0645\u0629")} value={outOfService} sub={i18n.t("\u062C\u0647\u0627\u0632 \u0645\u062A\u0648\u0642\u0641 \u0639\u0646 \u0627\u0644\u0639\u0645\u0644")} icon={X} primary={outOfService > 0 ? COLORS.danger : COLORS.success} light={outOfService > 0 ? COLORS.dangerLight : COLORS.successLight} border={(outOfService > 0 ? COLORS.dangerBorder : COLORS.successBorder) + '40'} />
          <KpiCard label={i18n.t("\u0627\u0633\u062A\u0647\u0644\u0627\u0643 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A")} value={totalSuppliesBurn} sub={i18n.t("\u0648\u062D\u062F\u0629 \u0645\u064F\u0635\u0631\u064E\u0651\u0641\u0629 \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0629")} icon={Zap} primary={COLORS.info} light={COLORS.infoLight} border={COLORS.infoBorder + '40'} />
        </div>

        {/* Equipment Status Chart */}
        <ChartSection title={i18n.t("\u062A\u0648\u0632\u064A\u0639 \u062D\u0627\u0644\u0629 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0637\u0628\u064A\u0629")} icon={Package} iconColor={COLORS.primary} link="/equipment" linkLabel={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A")}>
          {equipStatusData.length > 0 ? <DonutChart data={equipStatusData} dataKey="value" nameKey="name" centerLabel={i18n.t("\u062C\u0647\u0627\u0632")} /> : <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
              <Package className="w-10 h-10 text-gray-200" />
              <p className="text-sm">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0623\u062C\u0647\u0632\u0629")}</p>
              <Link to="/equipment" className="text-xs text-primary hover:underline">{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0639\u062F\u0629")}</Link>
            </div>}
        </ChartSection>

        {/* Supplies + Files */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ChartSection title={i18n.t("\u0627\u0633\u062A\u0647\u0644\u0627\u0643 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0641\u0626\u0629")} icon={Zap} iconColor={COLORS.info} link="/supplies" linkLabel={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A")}>
            {suppliesData.length > 0 ? <BarChart data={suppliesData} dataKey="value" nameKey="name" colors={COLORS.info} unit={i18n.t("\u0648\u062D\u062F\u0629")} /> : <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                <Zap className="w-10 h-10 text-gray-200" />
                <p className="text-sm">{i18n.t("\u0644\u0627 \u064A\u0648\u062C\u062F \u0627\u0633\u062A\u0647\u0644\u0627\u0643 \u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0645\u0633\u062C\u0651\u0644 \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0629")}</p>
                <p className="text-xs text-gray-400">{i18n.t("\u0633\u062C\u0651\u0644 \u0645\u0639\u0627\u0645\u0644\u0627\u062A \u0635\u0631\u0641 \u0644\u0639\u0631\u0636 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A")}</p>
              </div>}
          </ChartSection>
          <ChartSection title={i18n.t("\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0646\u0648\u0639")} icon={FileText} iconColor={COLORS.danger} link="/files" linkLabel={i18n.t("\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631")}>
            {filesData.length > 0 ? <DonutChart data={filesData} dataKey="value" nameKey="name" centerLabel={i18n.t("\u0645\u0644\u0641")} /> : <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                <FileText className="w-10 h-10 text-gray-200" />
                <p className="text-sm">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0644\u0641\u0627\u062A \u0637\u0628\u064A\u0629 \u0641\u064A \u0627\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629")}</p>
                <Link to="/files" className="text-xs text-primary hover:underline">{i18n.t("\u0631\u0641\u0639 \u0645\u0644\u0641 \u0637\u0628\u064A")}</Link>
              </div>}
          </ChartSection>
        </div>

        <div className="flex justify-center gap-3">
          <Link to="/equipment">
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />{i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629")}</Button>
          </Link>
          <Link to="/supplies">
            <Button variant="outline" className="gap-2">
              <Package className="w-4 h-4" />{i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A")}</Button>
          </Link>
        </div>
      </div>;
  };

  // =============================================================
  // حالة التحميل
  // =============================================================
  const renderSkeleton = () => <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl p-5 bg-gray-100 h-24" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(2)].map((_, i) => <div key={i} className="rounded-xl p-4 bg-gray-100 h-80" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(2)].map((_, i) => <div key={i} className="rounded-xl p-4 bg-gray-100 h-80" />)}
      </div>
    </div>;
  const activeTabConfig = TABS.find(t => t.id === activeTab);

  // =============================================================
  // الرسم الرئيسي
  // =============================================================
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" />
            <span>{i18n.t("\u0627\u0644\u0625\u062D\u0635\u0627\u0621\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631")}</span>
            {isDemo && !loading && <span className="text-xs font-normal px-2.5 py-1 rounded-full bg-warning-light text-warning border border-warning/20">{i18n.t("\u0628\u064A\u0627\u0646\u0627\u062A \u062A\u062C\u0631\u064A\u0628\u064A\u0629")}</span>}
          </div>} subtitle={`${i18n.t('تحليل شامل لأداء الفريق')} — ${SEASON_OPTIONS.find(s => s.value === filters.season)?.label ?? ''}`}>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchStats} className="gap-2 text-gray-500">
            <RefreshCw className="w-4 h-4" />{i18n.t("\u062A\u062D\u062F\u064A\u062B")}</Button>
          <Link to="/printing">
            <Button variant="outline" size="sm" className="gap-2">
              <Printer className="w-4 h-4" />{i18n.t("\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0631")}</Button>
          </Link>
        </div>
      </PageHeader>

      {/* Filters Bar */}
      <div className="card mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{i18n.t("\u0627\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u0632\u0645\u0646\u064A\u0629:")}</span>
          </div>

          <select value={filters.season} onChange={e => handleFilterChange('season', e.target.value)} className="input-field min-w-[180px] appearance-none cursor-pointer text-sm">
            {SEASON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <div className="flex items-center gap-2">
            <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} className="input-field text-sm font-numbers" placeholder={i18n.t("\u0645\u0646")} />
            <span className="text-gray-400">—</span>
            <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} className="input-field text-sm font-numbers" placeholder={i18n.t("\u0625\u0644\u0649")} />
          </div>

          {hasActiveFilters && <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-3.5 h-3.5" />{i18n.t("\u0645\u0633\u062D")}</button>}

          <div className="sm:mr-auto flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            {filters.dateFrom && filters.dateTo ? `${dayjs(filters.dateFrom).format('D MMM YYYY')} — ${dayjs(filters.dateTo).format('D MMM YYYY')}` : `${stats?.meta?.dateFrom ?? '—'} — ${stats?.meta?.dateTo ?? '—'}`}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-5 p-1">
        <div className="flex items-center gap-1 overflow-x-auto">
          {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>;
        })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pb-8">
        {loading ? renderSkeleton() : activeTab === 'overview' ? renderOverview() : activeTab === 'injuries' ? renderInjuries() : activeTab === 'rehabilitation' ? renderRehabilitation() : activeTab === 'performance' ? renderPerformance() : renderEquipment()}
      </div>
    </div>;
}