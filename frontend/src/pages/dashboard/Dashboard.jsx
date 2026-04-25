import i18n from "../../utils/i18n";
import {
  translateTitle, translateMessage, translateSubtitle,
  translateBodyArea, translateMechanism, translatePerformanceMetric,
  translateWeekLabel, translatePlayerStatus,
} from '../../utils/translateBackend';
import { useState, useEffect, useCallback } from 'react';
import { Users, HeartPulse, Stethoscope, CheckCircle2, Calendar, AlertTriangle, Wrench, Package, Clock, RefreshCw, Zap, TrendingUp, Activity, ArrowLeft, BarChart3, Shield, Heart, Target, UserCheck, Flame } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { DonutChart, HorizontalBarChart, AreaChart, RadarChart, BarChart } from '../../components/charts';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../api/endpoints/dashboard';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
dayjs.extend(relativeTime);
dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');

// ── Shared color tokens
const COLORS = {
  primary: {
    ring: 'ring-primary/20',
    icon: 'bg-primary/10 text-primary',
    val: 'text-primary',
    grad: 'from-primary/5'
  },
  danger: {
    ring: 'ring-danger/20',
    icon: 'bg-danger/10  text-danger',
    val: 'text-danger',
    grad: 'from-danger/5'
  },
  info: {
    ring: 'ring-info/20',
    icon: 'bg-info/10    text-info',
    val: 'text-info',
    grad: 'from-info/5'
  },
  success: {
    ring: 'ring-success/20',
    icon: 'bg-success/10 text-success',
    val: 'text-success',
    grad: 'from-success/5'
  },
  warning: {
    ring: 'ring-warning/20',
    icon: 'bg-warning/10 text-warning',
    val: 'text-warning',
    grad: 'from-warning/5'
  }
};

// ─────────────────────────────────────────────
// Primary KPI Card
// ─────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  badge,
  color = 'primary',
  loading,
  to
}) {
  const c = COLORS[color] || COLORS.primary;
  const inner = <div className={`card ring-1 ${c.ring} bg-gradient-to-br ${c.grad} to-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`w-12 h-12 rounded-2xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
        {badge && <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${c.ring} ${c.icon} font-numbers`}>
            {badge}
          </span>}
      </div>
      <div className="mt-4">
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <p className={`text-3xl font-bold font-numbers ${c.val}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
      </div>
    </div>;
  if (loading) {
    return <div className="card space-y-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-3" />
          <Skeleton className="w-16 h-8" />
        </div>
      </div>;
  }
  return to ? <Link to={to} className="block h-full">{inner}</Link> : inner;
}

// ─────────────────────────────────────────────
// Secondary Metric Card (compact)
// ─────────────────────────────────────────────
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'primary',
  loading
}) {
  const c = COLORS[color] || COLORS.primary;
  if (loading) {
    return <div className="card py-3 flex gap-3 items-center">
        <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
        <div className="space-y-1.5 flex-1"><Skeleton className="w-20 h-3" /><Skeleton className="w-12 h-5" /></div>
      </div>;
  }
  return <div className={`card py-3 flex items-center gap-3 ring-1 ${c.ring} bg-gradient-to-br ${c.grad} to-white`}>
      <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className={`text-xl font-bold font-numbers leading-tight ${c.val}`}>{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
      </div>
    </div>;
}

// ─────────────────────────────────────────────
// Section Header
// ─────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action
}) {
  return <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>;
}

// ─────────────────────────────────────────────
// Chart Card
// ─────────────────────────────────────────────
function ChartCard({
  title,
  subtitle,
  icon: Icon,
  children,
  loading,
  height = 'h-56',
  className = '',
  action
}) {
  return <div className={`card ${className}`}>
      <SectionHeader icon={Icon || BarChart3} title={title} subtitle={subtitle} action={action} />
      {loading ? <Skeleton className={`w-full ${height} rounded-xl`} /> : <div className={height}>{children}</div>}
    </div>;
}

// ─────────────────────────────────────────────
// Alert Item
// ─────────────────────────────────────────────
function AlertItem({
  alert
}) {
  const S = {
    danger: 'bg-danger-light  border-danger/20  text-danger',
    warning: 'bg-warning-light border-warning/20 text-warning',
    info: 'bg-info-light    border-info/20    text-info'
  };
  const icons = {
    equipment: Wrench,
    supply: Package,
    expiry: Clock,
    injury: HeartPulse,
    appointment: Calendar
  };
  const Icon = icons[alert.category] || AlertTriangle;
  const cls = S[alert.type] || S.info;
  const parts = cls.split(' ');
  const bg = parts.slice(0, 2).join(' ');
  const txt = parts[2];
  return <div className={`flex items-start gap-3 p-3 rounded-xl border ${bg}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${txt}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${txt}`}>{translateTitle(alert.title)}</p>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{translateMessage(alert.message)}</p>
      </div>
    </div>;
}

// ─────────────────────────────────────────────
// Activity Item
// ─────────────────────────────────────────────
function ActivityItem({
  activity
}) {
  const icons = {
    injury: HeartPulse,
    rehab: Activity,
    performance: TrendingUp,
    vital: Heart
  };
  const colorMap = {
    injury: 'bg-danger-light  text-danger',
    rehab: 'bg-info-light    text-info',
    performance: 'bg-success-light text-success',
    vital: 'bg-primary/10    text-primary'
  };
  const Icon = icons[activity.type] || Activity;
  return <div className="flex items-start gap-3 group">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[activity.type] || 'bg-gray-100 text-gray-500'}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0 border-b border-gray-50 pb-3">
        <p className="text-sm font-medium text-gray-900">{translateTitle(activity.title)}</p>
        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
        <span className="text-xs text-gray-400">{dayjs(activity.created_at).fromNow()}</span>
      </div>
    </div>;
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
export default function Dashboard() {
  const {
    club
  } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);else setLoading(true);
    try {
      const [sRes, cRes, aRes, acRes, apRes] = await Promise.allSettled([dashboardApi.getStats(), dashboardApi.getCharts(), dashboardApi.getAlerts(), dashboardApi.getActivity(8), dashboardApi.getTodayAppointments()]);
      if (sRes.status === 'fulfilled' && sRes.value.data.success) setStats(sRes.value.data.data);
      if (cRes.status === 'fulfilled' && cRes.value.data.success) setCharts(cRes.value.data.data);
      if (aRes.status === 'fulfilled' && aRes.value.data.success) setAlerts(aRes.value.data.data.alerts || []);
      if (acRes.status === 'fulfilled' && acRes.value.data.success) setActivity(acRes.value.data.data || []);
      if (apRes.status === 'fulfilled' && apRes.value.data.success) setAppointments(apRes.value.data.data || []);
      setLastRefresh(new Date());
    } catch {
      if (isRefresh) toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u062D\u062F\u064A\u062B"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const s = stats;
  const total = s?.players?.total || 0;
  const injuryPct = total > 0 ? Math.round(s.players.injured / total * 100) : 0;
  const readyPct = total > 0 ? Math.round(s.players.ready / total * 100) : 0;
  const hi = s?.healthIndex ?? 0;
  const hiColor = hi >= 80 ? 'success' : hi >= 60 ? 'warning' : 'danger';
  const hiLabel = hi >= 80 ? i18n.t("\u0645\u0645\u062A\u0627\u0632") : hi >= 60 ? i18n.t("\u064A\u062D\u062A\u0627\u062C \u0645\u062A\u0627\u0628\u0639\u0629") : i18n.t("\u062D\u0627\u0644\u0629 \u062D\u0631\u062C\u0629");
  const hiPulse = hi >= 80 ? 'bg-success' : hi >= 60 ? 'bg-warning' : 'bg-danger';
  const fatigueVal = parseFloat(s?.vitals?.avgFatigue || 0);
  const fatigueColor = fatigueVal >= 7 ? 'danger' : fatigueVal >= 5 ? 'warning' : 'success';
  const dangerAlerts = alerts.filter(a => a.type === 'danger').length;
  return <div className="animate-fade-in space-y-5">

      {/* ── Header ── */}
      <PageHeader title={<div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">{i18n.t("\u0644\u0648\u062D\u0629 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0637\u0628\u064A\u0629")}</span>
              {!loading && s && <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${hiColor === 'success' ? 'bg-success-light text-success' : hiColor === 'warning' ? 'bg-warning-light text-warning' : 'bg-danger-light  text-danger'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${hiPulse}`} />
                    {hiLabel}
                  </span>
                  {dangerAlerts > 0 && <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-danger-light text-danger">
                      <AlertTriangle className="w-3 h-3" />
                      {dangerAlerts}{i18n.t("\u062A\u0646\u0628\u064A\u0647 \u0639\u0627\u062C\u0644")}</span>}
                </div>}
            </div>
          </div>} subtitle={<div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="text-gray-500 font-medium">{club?.name || s?.clubName || i18n.t("\u0627\u0644\u0646\u0627\u062F\u064A")}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">{dayjs().format(i18n.t("dddd\u060C D MMMM YYYY"))}</span>
            {lastRefresh && <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400 text-xs">{i18n.t("\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B")}{dayjs(lastRefresh).fromNow()}</span>
              </>}
          </div>}>
        <Button onClick={() => fetchAll(true)} loading={refreshing} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />{i18n.t("\u062A\u062D\u062F\u064A\u062B")}</Button>
      </PageHeader>

        {/* ── Row 1: Primary KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <KpiCard loading={loading} icon={Users} label={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")} value={s?.players?.total} color="primary" to="/players" sub={i18n.t('{{n}} موقف', { n: s?.players?.suspended || 0 })} />
          <KpiCard loading={loading} icon={HeartPulse} label={i18n.t("\u0645\u0635\u0627\u0628\u0648\u0646 \u062D\u0627\u0644\u064A\u0627\u064B")} value={s?.players?.injured} color="danger" to="/injuries" badge={injuryPct > 0 ? `${injuryPct}%` : undefined} />
          <KpiCard loading={loading} icon={CheckCircle2} label={i18n.t("\u062C\u0627\u0647\u0632\u0648\u0646 \u0644\u0644\u0645\u0628\u0627\u0631\u0627\u0629")} value={s?.players?.ready} color="success" to="/players" badge={readyPct > 0 ? `${readyPct}%` : undefined} />
          <KpiCard loading={loading} icon={Stethoscope} label={i18n.t("\u0625\u0635\u0627\u0628\u0627\u062A \u0646\u0634\u0637\u0629")} value={s?.injuries?.active} color="warning" to="/injuries" sub={i18n.t('متوسط تعافٍ {{n}} يوم', { n: s?.injuries?.avgRecoveryDays || 0 })} />
        </div>

        {/* ── Row 2: Secondary metrics strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard loading={loading} icon={Shield} color={hiColor} label={i18n.t("\u0645\u0624\u0634\u0631 \u0635\u062D\u0629 \u0627\u0644\u0641\u0631\u064A\u0642")} value={`${hi}%`} sub={hiLabel} />
          <MetricCard loading={loading} icon={Flame} color={fatigueColor} label={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062A\u0639\u0628 (7 \u0623\u064A\u0627\u0645)")} value={fatigueVal > 0 ? `${fatigueVal}/10` : i18n.t("\u0644\u0627 \u0628\u064A\u0627\u0646\u0627\u062A")} sub={fatigueVal >= 7 ? i18n.t("\u0645\u0631\u062A\u0641\u0639 - \u064A\u062D\u062A\u0627\u062C \u0631\u0627\u062D\u0629") : fatigueVal >= 5 ? i18n.t("\u0645\u062A\u0648\u0633\u0637") : fatigueVal > 0 ? i18n.t("\u0645\u0642\u0628\u0648\u0644") : i18n.t("\u0644\u0627 \u0642\u064A\u0627\u0633\u0627\u062A")} />
          <MetricCard loading={loading} icon={Calendar} color="primary" label={i18n.t("\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u064A\u0648\u0645")} value={s?.appointments?.today ?? 0} sub={i18n.t('{{n}} هذا الأسبوع', { n: s?.appointments?.thisWeek || 0 })} />
        </div>

        {/* ── Row 3: Squad Availability Trend + Player Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <ChartCard title={i18n.t("\u062A\u0648\u0627\u0641\u0631 \u0627\u0644\u0641\u0631\u064A\u0642")} subtitle={i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0627\u0644\u0645\u062A\u0627\u062D\u064A\u0646 \u0644\u0644\u0639\u0628 \u2014 \u0622\u062E\u0631 12 \u0623\u0633\u0628\u0648\u0639")} icon={TrendingUp} loading={loading} height="h-64">
              <AreaChart data={charts?.availabilityTrend || []} dataKey="availability" xKey="week" color="#1D9E75" unit="%" />
            </ChartCard>
          </div>
          <ChartCard title={i18n.t("\u062A\u0648\u0632\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")} subtitle={i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0644\u0644\u0627\u0639\u0628\u064A\u0646")} icon={Users} loading={loading} height="h-64">
            <DonutChart data={(charts?.playerStatusChart || []).map(d => ({ ...d, name: translatePlayerStatus(d.name) }))} dataKey="value" nameKey="name" centerLabel={i18n.t("\u0644\u0627\u0639\u0628")} />
          </ChartCard>
        </div>

      {/* ── Row 4: Injury Analysis — 3 charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title={i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0628\u0627\u0644\u0645\u0646\u0637\u0642\u0629")} subtitle={i18n.t("\u0623\u0643\u062B\u0631 \u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062C\u0633\u0645 \u062A\u0639\u0631\u0636\u0627\u064B")} icon={HeartPulse} loading={loading} height="h-60">
          <HorizontalBarChart data={(charts?.injuriesByAreaChart || []).map(d => ({
          name: translateBodyArea(d.area),
          value: d.count
        }))} dataKey="value" nameKey="name" />
        </ChartCard>

        <ChartCard title={i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0629")} subtitle={i18n.t("\u0645\u0639\u062F\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u2014 \u0622\u062E\u0631 8 \u0623\u0633\u0627\u0628\u064A\u0639")} icon={BarChart3} loading={loading} height="h-60">
          <BarChart data={(charts?.injuriesByWeekChart || []).map(d => ({ ...d, week: translateWeekLabel(d.week) }))} dataKey="injuries" nameKey="week" colors="#A32D2D" />
        </ChartCard>

        <ChartCard title={i18n.t("\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")} subtitle={i18n.t("\u062A\u0648\u0632\u064A\u0639 \u0622\u0644\u064A\u0629 \u062D\u062F\u0648\u062B \u0627\u0644\u0625\u0635\u0627\u0628\u0629")} icon={Target} loading={loading} height="h-60">
          <DonutChart data={(charts?.injuriesByMechanismChart || []).map(d => ({ ...d, name: translateMechanism(d.name) }))} dataKey="value" nameKey="name" centerLabel={i18n.t("\u0633\u0628\u0628")} />
        </ChartCard>
      </div>

      {/* ── Row 5: Performance Radar + Vitals ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title={i18n.t("\u0623\u062F\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642")} subtitle={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0645\u0642\u0627\u064A\u064A\u0633 \u0627\u0644\u0628\u062F\u0646\u064A\u0629 \u2014 \u0622\u062E\u0631 30 \u064A\u0648\u0645")} icon={Target} loading={loading} height="h-60">
          <RadarChart data={(charts?.performanceRadar || []).map(r => ({ ...r, metric: translatePerformanceMetric(r.metric) }))} />
        </ChartCard>

        <ChartCard title={i18n.t("\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629")} subtitle={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0645\u0639\u062F\u0644 \u0636\u0631\u0628\u0627\u062A \u0627\u0644\u0642\u0644\u0628 \u2014 \u0622\u062E\u0631 30 \u064A\u0648\u0645")} icon={Heart} loading={loading} height="h-60">
          <AreaChart data={(charts?.vitalsChart || []).map(d => ({
          date: d.date,
          value: d.heartRate
        }))} dataKey="value" xKey="date" color="#A32D2D" unit={i18n.t("\u0646\u0628\u0636\u0629/\u062F")} />
        </ChartCard>
      </div>

      {/* ── Row 6: Appointments + Alerts + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Today's Appointments */}
        <div className="card">
          <SectionHeader icon={Calendar} title={i18n.t("\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u064A\u0648\u0645")} subtitle={loading ? '...' : translateSubtitle(`${appointments.length} موعد مجدول`)} action={<Link to="/appointments" className="text-xs text-primary hover:underline flex items-center gap-1">{i18n.t("\u0627\u0644\u0643\u0644")}<ArrowLeft className="w-3 h-3" />
              </Link>} />
          {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div> : appointments.length === 0 ? <div className="text-center py-10">
              <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0648\u0627\u0639\u064A\u062F \u0645\u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u064A\u0648\u0645")}</p>
            </div> : <div className="space-y-2">
              {appointments.map((apt, i) => <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-primary/5 transition-colors">
                  <div className="w-14 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                    <span className="text-xs font-bold text-primary font-numbers">{String(apt.time || '').slice(0, 5)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{apt.player?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{translateMessage(apt.type)}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-400 font-numbers flex-shrink-0">#{apt.player?.number}</span>
                </div>)}
            </div>}
        </div>

        {/* Alerts */}
        <div className="card">
          <SectionHeader icon={AlertTriangle} title={i18n.t("\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0647\u0627\u0645\u0629")} subtitle={loading ? '...' : translateSubtitle(`${alerts.length} تنبيه نشط`)} />
          {loading ? <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div> : alerts.length === 0 ? <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0646\u0628\u064A\u0647\u0627\u062A \u062D\u0627\u0644\u064A\u0627\u064B")}</p>
            </div> : <div className="space-y-2 max-h-72 overflow-y-auto">
              {alerts.map((a, i) => <AlertItem key={i} alert={a} />)}
            </div>}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <SectionHeader icon={Zap} title={i18n.t("\u0622\u062E\u0631 \u0627\u0644\u0646\u0634\u0627\u0637\u0627\u062A")} subtitle={i18n.t("\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u062D\u062F\u064A\u062B\u0629 \u0645\u0646 \u0627\u0644\u0646\u0638\u0627\u0645")} />
          {loading ? <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>)}
            </div> : activity.length === 0 ? <div className="text-center py-10">
              <Zap className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u0634\u0627\u0637\u0627\u062A \u062D\u062F\u064A\u062B\u0629")}</p>
            </div> : <div className="space-y-1">
              {activity.map((a, i) => <ActivityItem key={i} activity={a} />)}
            </div>}
        </div>
      </div>

      {/* ── Injured Players Banner ── */}
      {!loading && (s?.injuries?.active ?? 0) > 0 && <div className="card border-danger/20 bg-gradient-to-r from-danger/5 to-white ring-1 ring-danger/10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-danger" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{i18n.t("\u064A\u0648\u062C\u062F")}{' '}
                  <span className="text-danger font-numbers">{s.injuries.active}</span>{' '}{i18n.t("\u0625\u0635\u0627\u0628\u0629 \u0646\u0634\u0637\u0629 \u062A\u062D\u062A\u0627\u062C \u0645\u062A\u0627\u0628\u0639\u0629")}</p>
                 <p className="text-xs text-gray-500">{i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0648\u0642\u062A \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}{' '}
                   <strong className="font-numbers text-gray-700">{s?.injuries?.avgRecoveryDays || 0}</strong>{' '}{i18n.t("\u064A\u0648\u0645")}{s?.injuries?.recurring > 0 && <span className="mr-2 text-warning">
                       · {s.injuries.recurring}{i18n.t("\u0625\u0635\u0627\u0628\u0629 \u0645\u062A\u0643\u0631\u0631\u0629")}</span>}
                 </p>
              </div>
            </div>
            <Link to="/injuries">
              <Button variant="danger" size="sm" className="gap-2">
                <HeartPulse className="w-4 h-4" />{i18n.t("\u0639\u0631\u0636 \u0633\u062C\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")}</Button>
            </Link>
          </div>
        </div>}

    </div>;
}