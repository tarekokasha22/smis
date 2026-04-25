import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Plus, Search, Filter, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, Calendar, User, Activity, AlertTriangle, CheckCircle2, RefreshCw, BarChart3, Clock, Users, TrendingUp, TrendingDown, Percent, ArrowRight, Download, Printer, X } from 'lucide-react';
import { injuriesApi } from '../../api/endpoints/injuries';
import { playersApi } from '../../api/endpoints/players';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import InjuryFormModal from './InjuryFormModal';
import InjuryDetailModal from './InjuryDetailModal';
import { HorizontalBarChart, DonutChart, BarChart, LineChart, AreaChart } from '../../components/charts';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');
const severityMap = {
  mild: {
    label: i18n.t("\u0628\u0633\u064A\u0637\u0629"),
    color: 'success',
    bg: 'bg-success-light',
    text: 'text-success',
    border: 'border-success/30'
  },
  moderate: {
    label: i18n.t("\u0645\u062A\u0648\u0633\u0637\u0629"),
    color: 'warning',
    bg: 'bg-warning-light',
    text: 'text-warning',
    border: 'border-warning/30'
  },
  severe: {
    label: i18n.t("\u0634\u062F\u064A\u062F\u0629"),
    color: 'danger',
    bg: 'bg-danger-light',
    text: 'text-danger',
    border: 'border-danger/30'
  },
  critical: {
    label: i18n.t("\u062D\u0631\u062C\u0629"),
    color: 'danger',
    bg: 'bg-danger-light',
    text: 'text-danger',
    border: 'border-danger/30'
  }
};
const statusMap = {
  active: {
    label: i18n.t("\u0646\u0634\u0637\u0629"),
    color: 'danger',
    bg: 'bg-danger-light',
    text: 'text-danger',
    icon: AlertTriangle
  },
  recovering: {
    label: i18n.t("\u0642\u064A\u062F \u0627\u0644\u062A\u0639\u0627\u0641\u064A"),
    color: 'warning',
    bg: 'bg-warning-light',
    text: 'text-warning',
    icon: Activity
  },
  closed: {
    label: i18n.t("\u0645\u062A\u0639\u0627\u0641\u0649"),
    color: 'success',
    bg: 'bg-success-light',
    text: 'text-success',
    icon: CheckCircle2
  }
};
const bodySideMap = {
  right: i18n.t("\u0623\u064A\u0645\u0646"),
  left: i18n.t("\u0623\u064A\u0633\u0631"),
  both: i18n.t("\u0643\u0644\u0627\u0647\u0645\u0627")
};
const mechanismMap = {
  collision: i18n.t("\u062A\u0635\u0627\u062F\u0645"),
  overuse: i18n.t("\u0625\u0641\u0631\u0627\u0637 \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645"),
  fatigue: i18n.t("\u0625\u0631\u0647\u0627\u0642"),
  unknown: i18n.t("\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641")
};
const occurredDuringMap = {
  match: i18n.t("\u0645\u0628\u0627\u0631\u0627\u0629"),
  training: i18n.t("\u062A\u062F\u0631\u064A\u0628"),
  other: i18n.t("\u0623\u062E\u0631\u0649")
};
export default function Injuries() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [injuries, setInjuries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [stats, setStats] = useState({});
  const [players, setPlayers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [chartStats, setChartStats] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    player_id: searchParams.get('player_id') || '',
    severity: searchParams.get('severity') || '',
    status: searchParams.get('status') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || ''
  });
  const [viewMode, setViewMode] = useState('cards');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInjury, setSelectedInjury] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [injuryToView, setInjuryToView] = useState(null);
  const [injuryToDelete, setInjuryToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [injuryToRecover, setInjuryToRecover] = useState(null);
  const [recoveryData, setRecoveryData] = useState({
    return_date: '',
    actual_recovery_days: '',
    notes: ''
  });
  const navigate = useNavigate();

  // الانتقال لصفحة التأهيل مع فتح النموذج مسبق الملء بمعلومات الإصابة
  const handleCreateRehab = injury => {
    setIsDetailOpen(false);
    navigate('/rehabilitation', {
      state: {
        openForm: true,
        player_id: injury.player_id,
        injury_id: injury.id,
        player_name: injury.player?.name,
        injury_type: injury.injury_type
      }
    });
  };
  const fetchPlayers = useCallback(async () => {
    try {
      const response = await playersApi.getAll({
        limit: 100,
        is_active: 'true'
      });
      if (response.data.success) {
        setPlayers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  }, []);
  const fetchDoctors = useCallback(async () => {
    try {
      const response = await injuriesApi.getDoctors();
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, []);
  const fetchChartStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const response = await injuriesApi.getStats({
        months: 12
      });
      if (response.data.success) {
        setChartStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching chart stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);
  const fetchInjuries = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        search: filters.search,
        player_id: filters.player_id,
        severity: filters.severity,
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo
      };
      const response = await injuriesApi.getAll(params);
      if (response.data.success) {
        setInjuries(response.data.data);
        setMeta(response.data.meta);
        setStats(response.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching injuries:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);
  useEffect(() => {
    fetchPlayers();
    fetchDoctors();
    fetchChartStats();
  }, [fetchPlayers, fetchDoctors, fetchChartStats]);
  useEffect(() => {
    fetchInjuries();
  }, [fetchInjuries]);
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };
  const handleSearch = e => {
    e.preventDefault();
    handleFilterChange('search', filters.search);
  };
  const handlePageChange = page => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };
  const handleAddInjury = () => {
    setSelectedInjury(null);
    setIsFormOpen(true);
  };
  const handleEditInjury = injury => {
    setSelectedInjury(injury);
    setIsFormOpen(true);
  };
  const handleViewInjury = async injury => {
    try {
      const response = await injuriesApi.getById(injury.id);
      if (response.data.success) {
        setInjuryToView(response.data.data);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error('Error fetching injury details:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0629"));
    }
  };
  const handleSaveInjury = async injuryData => {
    try {
      if (selectedInjury) {
        await injuriesApi.update(selectedInjury.id, injuryData);
        toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0628\u0646\u062C\u0627\u062D"));
      } else {
        await injuriesApi.create(injuryData);
        toast.success(i18n.t("\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0628\u0646\u062C\u0627\u062D"));
      }
      setIsFormOpen(false);
      fetchInjuries();
      fetchChartStats();
    } catch (error) {
      console.error('Error saving injury:', error);
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0625\u0635\u0627\u0628\u0629"));
    }
  };
  const handleOpenRecovery = injury => {
    setInjuryToRecover(injury);
    setRecoveryData({
      return_date: dayjs().format('YYYY-MM-DD'),
      actual_recovery_days: '',
      notes: ''
    });
    setIsRecoveryModalOpen(true);
  };
  const handleRecoverySubmit = async () => {
    if (!injuryToRecover) return;
    try {
      await injuriesApi.close(injuryToRecover.id, recoveryData);
      toast.success(i18n.t("\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0646\u062C\u0627\u062D"));
      setIsRecoveryModalOpen(false);
      setInjuryToRecover(null);
      fetchInjuries();
      fetchChartStats();
    } catch (error) {
      console.error('Error closing injury:', error);
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062A\u0639\u0627\u0641\u064A"));
    }
  };
  const handleDeleteConfirm = async () => {
    if (!injuryToDelete) return;
    try {
      await injuriesApi.delete(injuryToDelete.id);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0628\u0646\u062C\u0627\u062D"));
      setIsDeleteModalOpen(false);
      setInjuryToDelete(null);
      fetchInjuries();
      fetchChartStats();
    } catch (error) {
      console.error('Error deleting injury:', error);
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0630\u0641 \u0627\u0644\u0625\u0635\u0627\u0628\u0629"));
    }
  };
  const getDaysSinceInjury = injuryDate => {
    return dayjs().diff(dayjs(injuryDate), 'day');
  };
  const clearFilters = () => {
    setFilters({
      search: '',
      player_id: '',
      severity: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchParams(new URLSearchParams());
  };
  const hasActiveFilters = filters.search || filters.player_id || filters.severity || filters.status || filters.dateFrom || filters.dateTo;
  const renderInjuryCard = injury => {
    const severityInfo = severityMap[injury.severity] || severityMap.mild;
    const statusInfo = statusMap[injury.status] || statusMap.active;
    const StatusIcon = statusInfo.icon || AlertTriangle;
    const daysSince = getDaysSinceInjury(injury.injury_date);
    const recoveryProgress = injury.status !== 'closed' && injury.expected_recovery_days ? Math.min(100, Math.round(daysSince / injury.expected_recovery_days * 100)) : injury.status === 'closed' ? 100 : 0;
    return <div key={injury.id} className="card hover:shadow-lg transition-all duration-300 border-t-4" style={{
      borderTopColor: severityInfo.color === 'danger' ? '#A32D2D' : severityInfo.color === 'warning' ? '#854F0B' : '#3B6D11'
    }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar src={injury.player?.avatar_url} name={injury.player?.name} size="lg" />
            <div>
              <h3 className="font-bold text-gray-900">{injury.player?.name}</h3>
              <p className="text-sm text-gray-500">
                #{injury.player?.number} • {injury.player?.position}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {statusInfo.label}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="w-4 h-4 text-primary" />
              <span className="font-medium">{injury.injury_type}</span>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${severityInfo.bg} ${severityInfo.text}`}>
              {severityInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{injury.body_area}</span>
              {injury.body_side && <span className="text-xs text-gray-400">({bodySideMap[injury.body_side]})</span>}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="font-numbers">{dayjs(injury.injury_date).format('DD/MM')}</span>
            </div>
          </div>

          {injury.status !== 'closed' && <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{i18n.t("\u062A\u0642\u062F\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</span>
                <span className="font-numbers font-medium">{recoveryProgress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${recoveryProgress >= 100 ? 'bg-success' : recoveryProgress >= 50 ? 'bg-primary' : 'bg-warning'}`} style={{
              width: `${Math.min(recoveryProgress, 100)}%`
            }} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{i18n.t("\u0645\u0646\u0630")}{daysSince}{i18n.t("\u064A\u0648\u0645")}</span>
                {injury.expected_recovery_days && <span>{i18n.t("\u0627\u0644\u0645\u062A\u0648\u0642\u0639:")}{injury.expected_recovery_days}{i18n.t("\u064A\u0648\u0645")}</span>}
              </div>
            </div>}

          {injury.status === 'closed' && injury.actual_recovery_days && <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="w-4 h-4" />
              <span>{i18n.t("\u062A\u0639\u0627\u0641\u0649 \u062E\u0644\u0627\u0644")}{injury.actual_recovery_days}{i18n.t("\u064A\u0648\u0645")}</span>
              {injury.return_date && <span className="text-gray-400">• {dayjs(injury.return_date).format('DD/MM/YYYY')}</span>}
            </div>}

          {injury.is_recurring && <div className="flex items-center gap-2 text-xs text-warning bg-warning-light px-2 py-1 rounded-lg">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{i18n.t("\u0625\u0635\u0627\u0628\u0629 \u0645\u062A\u0643\u0631\u0631\u0629 (")}{injury.recurrence_count}{i18n.t("\u0645\u0631\u0629)")}</span>
            </div>}

          {injury.mechanism && <div className="text-xs text-gray-400">{i18n.t("\u0627\u0644\u0633\u0628\u0628:")}{mechanismMap[injury.mechanism] || injury.mechanism} • {occurredDuringMap[injury.occurred_during] || injury.occurred_during}
            </div>}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => handleViewInjury(injury)} className="flex-1 btn btn-ghost text-sm">
            <Eye className="w-4 h-4 ml-1" />{i18n.t("\u0639\u0631\u0636")}</button>
          <button onClick={() => handleEditInjury(injury)} className="flex-1 btn btn-ghost text-sm">
            <Edit2 className="w-4 h-4 ml-1" />{i18n.t("\u062A\u0639\u062F\u064A\u0644")}</button>
          <button onClick={() => {
          setInjuryToDelete(injury);
          setIsDeleteModalOpen(true);
        }} className="flex-1 btn btn-ghost text-sm text-danger hover:bg-danger-light">
            <Trash2 className="w-4 h-4 ml-1" />{i18n.t("\u0645\u0633\u062D")}</button>
          {injury.status !== 'closed' && <button onClick={() => handleOpenRecovery(injury)} className="flex-1 btn btn-ghost text-sm text-success">
              <CheckCircle2 className="w-4 h-4 ml-1" />{i18n.t("\u062A\u0639\u0627\u0641\u0649")}</button>}
        </div>
      </div>;
  };
  const renderInjuryRow = injury => {
    const severityInfo = severityMap[injury.severity] || severityMap.mild;
    const statusInfo = statusMap[injury.status] || statusMap.active;
    const daysSince = getDaysSinceInjury(injury.injury_date);
    return <tr key={injury.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="py-4 px-4">
          <Link to={`/players/${injury.player_id}`} className="flex items-center gap-3 hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors">
            <Avatar src={injury.player?.avatar_url} name={injury.player?.name} size="sm" />
            <div>
              <p className="font-semibold text-gray-900 hover:text-primary">{injury.player?.name}</p>
              <p className="text-xs text-gray-500">#{injury.player?.number} • {injury.player?.position}</p>
            </div>
          </Link>
        </td>

        <td className="py-4 px-4">
          <div className="text-sm font-medium text-gray-900">{injury.injury_type}</div>
          <div className="text-xs text-gray-500">{injury.body_area}</div>
        </td>

        <td className="py-4 px-4">
          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${severityInfo.bg} ${severityInfo.text}`}>
            {severityInfo.label}
          </span>
        </td>

        <td className="py-4 px-4">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
        </td>

        <td className="py-4 px-4">
          <div className="text-sm font-numbers text-gray-900">{dayjs(injury.injury_date).format('DD/MM/YYYY')}</div>
          {injury.status !== 'closed' && <div className="text-xs text-gray-500">{daysSince}{i18n.t("\u064A\u0648\u0645")}</div>}
        </td>

        <td className="py-4 px-4">
          {injury.expected_recovery_days ? <span className="font-numbers text-sm">{injury.expected_recovery_days}{i18n.t("\u064A\u0648\u0645")}</span> : '-'}
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-1">
            <button onClick={() => handleViewInjury(injury)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary-50 transition-colors" title={i18n.t("\u0639\u0631\u0636")}>
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => handleEditInjury(injury)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary-50 transition-colors" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}>
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => {
            setInjuryToDelete(injury);
            setIsDeleteModalOpen(true);
          }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-danger hover:bg-danger-light transition-colors" title={i18n.t("\u062D\u0630\u0641")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>;
  };
  const renderStatsSection = () => {
    const totalInjuries = stats.total || 0;
    const activeInjuries = stats.byStatus?.active || 0;
    const recoveringInjuries = stats.byStatus?.recovering || 0;
    const closedInjuries = stats.byStatus?.closed || 0;
    const recoveryRate = totalInjuries > 0 ? Math.round(closedInjuries / totalInjuries * 100) : 0;
    return <>
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-danger-light to-white border-danger/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-danger" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{i18n.t("\u0625\u0635\u0627\u0628\u0627\u062A \u0646\u0634\u0637\u0629")}</p>
                <p className="text-2xl font-bold text-danger font-numbers">{activeInjuries}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-warning-light to-white border-warning/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{i18n.t("\u0642\u064A\u062F \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</p>
                <p className="text-2xl font-bold text-warning font-numbers">{recoveringInjuries}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-success-light to-white border-success/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{i18n.t("\u0645\u062A\u0639\u0627\u0641\u0648\u0646")}</p>
                <p className="text-2xl font-bold text-success font-numbers">{closedInjuries}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-white border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")}</p>
                <p className="text-2xl font-bold text-primary font-numbers">{totalInjuries}</p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-info-light to-white border-info/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Percent className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</p>
                <p className="text-2xl font-bold text-info font-numbers">{recoveryRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Section */}
        {showStats && <div className="card mb-6 border-2 border-primary/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />{i18n.t("\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0634\u0627\u0645\u0644")}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />{i18n.t("\u0622\u062E\u0631 12 \u0634\u0647\u0631")}</Badge>
              </div>
            </div>

            {isStatsLoading || !chartStats ? <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-64">
                    <Skeleton className="w-full h-full rounded-xl" />
                  </div>)}
              </div> : <div className="space-y-6">
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Injuries by Body Area */}
                  <div className="lg:col-span-2 bg-gray-50 p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />{i18n.t("\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u062D\u0633\u0628 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062C\u0633\u0645")}</h4>
                    <div className="h-56">
                      <HorizontalBarChart data={(chartStats.byArea || []).map((item, index) => ({
                  name: item.body_area,
                  value: parseInt(item.count),
                  fill: ['#1D9E75', '#0F6E56', '#854F0B', '#A32D2D', '#3B6D11', '#185FA5', '#6c757d'][index % 7]
                }))} dataKey="value" nameKey="name" colors={['#1D9E75', '#0F6E56', '#854F0B', '#A32D2D', '#3B6D11', '#185FA5', '#6c757d']} />
                    </div>
                  </div>

                  {/* Severity Distribution */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-danger" />{i18n.t("\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0634\u062F\u0629")}</h4>
                    <div className="h-56">
                      <DonutChart data={(chartStats.bySeverity || []).map((item, index) => ({
                  name: severityMap[item.severity]?.label || item.severity,
                  value: parseInt(item.count),
                  color: ['#3B6D11', '#854F0B', '#A32D2D', '#A32D2D'][index] || '#6c757d'
                }))} dataKey="value" nameKey="name" />
                    </div>
                  </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />{i18n.t("\u062A\u0648\u0632\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {(chartStats.statusDistribution || []).map(item => {
                const info = statusMap[item.status] || statusMap.active;
                return <div key={item.status} className={`p-4 rounded-xl ${info.bg}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <info.icon className={`w-4 h-4 ${info.text}`} />
                            <span className="text-sm font-medium text-gray-600">{info.label}</span>
                          </div>
                          <p className={`text-2xl font-bold font-numbers ${info.text}`}>{item.count}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {totalInjuries > 0 ? Math.round(parseInt(item.count) / totalInjuries * 100) : 0}{i18n.t("% \u0645\u0646 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A")}</p>
                        </div>;
              })}
                  </div>
                </div>

                {/* Recovery Stats */}
                {chartStats.recoveryStats && chartStats.recoveryStats.length > 0 && <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-warning" />{i18n.t("\u062A\u062D\u0644\u064A\u0644 \u0623\u0648\u0642\u0627\u062A \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {chartStats.recoveryStats.map(item => {
                const avgDays = parseFloat(item.avgDays).toFixed(0);
                const isAboveAvg = avgDays > 21;
                return <div key={item.severity} className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${severityMap[item.severity]?.bg} ${severityMap[item.severity]?.text}`}>
                                {severityMap[item.severity]?.label}
                              </span>
                            </div>
                            <p className={`text-3xl font-bold font-numbers ${isAboveAvg ? 'text-danger' : 'text-success'}`}>
                              {avgDays}
                            </p>
                            <p className="text-xs text-gray-500">{i18n.t("\u064A\u0648\u0645 \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</p>
                            <p className="text-xs text-gray-400 mt-2">{i18n.t("\u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649")}{item.count}{i18n.t("\u0625\u0635\u0627\u0628\u0629")}</p>
                          </div>;
              })}
                    </div>
                  </div>}
              </div>}
          </div>}
      </>;
  };
  return <div className="animate-fade-in">
      {/* Page Header */}
      <PageHeader title={<div className="flex items-center gap-3">
            <HeartPulse className="w-7 h-7 text-danger" />
            <span>{i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")}</span>
            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">({meta.total})</span>
          </div>} subtitle={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0648\u062A\u062A\u0628\u0639 \u062C\u0645\u064A\u0639 \u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}>
        <div className="flex items-center gap-2">
          <Button variant={showStats ? 'primary' : 'outline'} onClick={() => setShowStats(!showStats)} className="gap-2">
            <BarChart3 className="w-4 h-4" />
            {showStats ? i18n.t("\u0625\u062E\u0641\u0627\u0621 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A") : i18n.t("\u0639\u0631\u0636 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A")}
          </Button>
          <Button onClick={handleAddInjury} className="gap-2">
            <Plus className="w-4 h-4" />{i18n.t("\u062A\u0633\u062C\u064A\u0644 \u0625\u0635\u0627\u0628\u0629 \u062C\u062F\u064A\u062F\u0629")}</Button>
        </div>
      </PageHeader>

      {/* Stats Section */}
      {renderStatsSection()}

      {/* Filters Bar */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder={i18n.t("\u0627\u0628\u062D\u062B \u0628\u0646\u0648\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0623\u0648 \u0627\u0644\u0648\u0635\u0641 \u0623\u0648 \u0627\u0633\u0645 \u0627\u0644\u0644\u0627\u0639\u0628...")} value={filters.search} onChange={e => setFilters(prev => ({
              ...prev,
              search: e.target.value
            }))} className="pr-10" />
            </div>
          </form>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.player_id} onChange={e => handleFilterChange('player_id', e.target.value)} className="input-field pr-10 min-w-[150px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</option>
                {players.map(p => <option key={p.id} value={p.id}>#{p.number} - {p.name}</option>)}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.severity} onChange={e => handleFilterChange('severity', e.target.value)} className="input-field pr-10 min-w-[120px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u0627\u0644\u0634\u062F\u0629")}</option>
                <option value="mild">{i18n.t("\u0628\u0633\u064A\u0637\u0629")}</option>
                <option value="moderate">{i18n.t("\u0645\u062A\u0648\u0633\u0637\u0629")}</option>
                <option value="severe">{i18n.t("\u0634\u062F\u064A\u062F\u0629")}</option>
                <option value="critical">{i18n.t("\u062D\u0631\u062C\u0629")}</option>
              </select>
            </div>

            <div className="relative">
              <Activity className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="input-field pr-10 min-w-[120px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</option>
                <option value="active">{i18n.t("\u0646\u0634\u0637\u0629")}</option>
                <option value="recovering">{i18n.t("\u0642\u064A\u062F \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</option>
                <option value="closed">{i18n.t("\u0645\u063A\u0644\u0642\u0629")}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} className="input-field text-sm font-numbers" placeholder={i18n.t("\u0645\u0646")} />
              <span className="text-gray-400">-</span>
              <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} className="input-field text-sm font-numbers" placeholder={i18n.t("\u0625\u0644\u0649")} />
            </div>

            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-gray-500">
                <X className="w-4 h-4" />{i18n.t("\u0645\u0633\u062D \u0627\u0644\u0641\u0644\u0627\u062A\u0631")}</Button>}

            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button type="button" onClick={() => setViewMode('cards')} className={`p-2 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`} title={i18n.t("\u0639\u0631\u0636 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A")}>
                <BarChart3 className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`} title={i18n.t("\u0639\u0631\u0636 \u0627\u0644\u062C\u062F\u0648\u0644")}>
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? viewMode === 'cards' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="card">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="w-32 h-5 mb-2" />
                    <Skeleton className="w-20 h-4" />
                  </div>
                </div>
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-3/4 h-4 mb-2" />
                <Skeleton className="w-1/2 h-4" />
              </div>)}
          </div> : <div className="card">
            <table className="w-full">
              <tbody>
                {[...Array(5)].map((_, i) => <tr key={i}>
                    <td className="py-4 px-4"><Skeleton className="w-40 h-5" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-32 h-5" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-16 h-5" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-16 h-5" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-24 h-5" /></td>
                  </tr>)}
              </tbody>
            </table>
          </div> : injuries.length === 0 ? <div className="card text-center py-16">
          <HeartPulse className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0625\u0635\u0627\u0628\u0627\u062A")}</h3>
          <p className="text-gray-500 mb-6">
            {hasActiveFilters ? i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0625\u0635\u0627\u0628\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0644\u0641\u0644\u0627\u062A\u0631 \u0627\u0644\u0645\u062D\u062F\u062F\u0629") : i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0623\u064A \u0625\u0635\u0627\u0628\u0627\u062A \u062D\u062A\u0649 \u0627\u0644\u0622\u0646")}
          </p>
          <div className="flex items-center justify-center gap-3">
            {hasActiveFilters && <Button variant="outline" onClick={clearFilters}>{i18n.t("\u0645\u0633\u062D \u0627\u0644\u0641\u0644\u0627\u062A\u0631")}</Button>}
            <Button onClick={handleAddInjury}>
              <Plus className="w-4 h-4 ml-2" />{i18n.t("\u062A\u0633\u062C\u064A\u0644 \u0625\u0635\u0627\u0628\u0629 \u062C\u062F\u064A\u062F\u0629")}</Button>
          </div>
        </div> : viewMode === 'cards' ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {injuries.map(renderInjuryCard)}
        </div> : <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0634\u062F\u0629")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                </tr>
              </thead>
              <tbody>{injuries.map(renderInjuryRow)}</tbody>
            </table>
          </div>
        </div>}

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => handlePageChange(meta.page - 1)} disabled={meta.page === 1} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(Math.min(meta.totalPages, 7))].map((_, i) => {
          const page = i + 1;
          const isActive = page === meta.page;
          return <button key={page} onClick={() => handlePageChange(page)} className={`w-10 h-10 rounded-lg font-numbers font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                  {page}
                </button>;
        })}
          </div>

          <button onClick={() => handlePageChange(meta.page + 1)} disabled={meta.page === meta.totalPages} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>}

      {/* Modals */}
      <InjuryFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} injury={selectedInjury} players={players} doctors={doctors} onSave={handleSaveInjury} />

      <InjuryDetailModal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} injury={injuryToView} onEdit={() => {
      setIsDetailOpen(false);
      handleEditInjury(injuryToView);
    }} onRecover={() => {
      setIsDetailOpen(false);
      handleOpenRecovery(injuryToView);
    }} onCreateRehab={handleCreateRehab} />

      <Modal isOpen={isDeleteModalOpen} onClose={() => {
      setIsDeleteModalOpen(false);
      setInjuryToDelete(null);
    }} title={i18n.t("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641")} size="sm">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-danger" />
          </div>
          <p className="text-gray-600 mb-2">{i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0625\u0635\u0627\u0628\u0629\u061F")}</p>
          <p className="text-sm text-gray-500 mb-6">{i18n.t("\u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062A\u0639\u0644\u0642\u0629 \u0628\u0647\u0630\u0647 \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0646\u0647\u0627\u0626\u064A\u0627\u064B")}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
            setIsDeleteModalOpen(false);
            setInjuryToDelete(null);
          }} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">{i18n.t("\u062D\u0630\u0641")}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isRecoveryModalOpen} onClose={() => {
      setIsRecoveryModalOpen(false);
      setInjuryToRecover(null);
    }} title={i18n.t("\u062A\u0633\u062C\u064A\u0644 \u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0644\u0627\u0639\u0628")} size="md">
        <div className="space-y-4">
          <div className="bg-success-light p-4 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-success" />
            <div>
              <p className="font-semibold text-success">{i18n.t("\u062A\u0633\u062C\u064A\u0644 \u062A\u0639\u0627\u0641\u064A")}</p>
              <p className="text-sm text-gray-600">{injuryToRecover?.player?.name}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0639\u0648\u062F\u0629")}</label>
            <input type="date" value={recoveryData.return_date} onChange={e => setRecoveryData(prev => ({
            ...prev,
            return_date: e.target.value
          }))} className="input-field font-numbers" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0641\u0639\u0644\u064A\u0629")}</label>
            <input type="number" value={recoveryData.actual_recovery_days} onChange={e => setRecoveryData(prev => ({
            ...prev,
            actual_recovery_days: e.target.value
          }))} className="input-field font-numbers" placeholder={i18n.t("\u0633\u064A\u062A\u0645 \u062D\u0633\u0627\u0628\u0647\u0627 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B")} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</label>
            <textarea value={recoveryData.notes} onChange={e => setRecoveryData(prev => ({
            ...prev,
            notes: e.target.value
          }))} className="input-field resize-none" rows={3} placeholder={i18n.t("\u0623\u064A \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u0639\u0646 \u0627\u0644\u062A\u0639\u0627\u0641\u064A...")} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => {
            setIsRecoveryModalOpen(false);
            setInjuryToRecover(null);
          }} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button onClick={handleRecoverySubmit} className="flex-1 gap-2">
              <CheckCircle2 className="w-4 h-4" />{i18n.t("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</Button>
          </div>
        </div>
      </Modal>
    </div>;
}