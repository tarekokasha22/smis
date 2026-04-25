import i18n from "../../utils/i18n";

// Translate Arabic position names from backend to English when locale is EN
const POSITION_MAP = {
  'حارس مرمى': 'Goalkeeper',
  'مدافع': 'Defender',
  'مدافع أيمن': 'Right Back',
  'مدافع أيسر': 'Left Back',
  'مدافع وسط': 'Center-back',
  'قلب دفاع': 'Center Back',
  'وسط': 'Midfielder',
  'وسط دفاعي': 'Defensive Midfielder',
  'وسط مدافع': 'Defensive Midfielder',
  'وسط هجومي': 'Attacking Midfielder',
  'وسط ميدان': 'Central Midfielder',
  'وسط أيمن': 'Right Midfielder',
  'وسط أيسر': 'Left Midfielder',
  'لاعب وسط': 'Midfielder',
  'جناح أيمن': 'Right Winger',
  'جناح أيسر': 'Left Winger',
  'جناح': 'Winger',
  'مهاجم': 'Striker',
  'مهاجم مركزي': 'Center Forward',
  'ظهير أيمن': 'Right Fullback',
  'ظهير أيسر': 'Left Fullback',
};
const translatePosition = (pos) => {
  if (!pos) return pos;
  if (localStorage.getItem('smis-locale') !== 'en') return pos;
  return POSITION_MAP[pos] || pos;
};

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Users, Grid3X3, List, Search, Filter, Plus, MoreHorizontal, Eye, Edit2, Trash2, UserCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { playersApi } from '../../api/endpoints/players';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import PlayerFormModal from './PlayerFormModal';
import toast from 'react-hot-toast';

// خيارات الفلترة
const statusOptions = [{
  value: '',
  label: i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A")
}, {
  value: 'ready',
  label: i18n.t("\u062C\u0627\u0647\u0632"),
  color: 'success'
}, {
  value: 'injured',
  label: i18n.t("\u0645\u0635\u0627\u0628"),
  color: 'danger'
}, {
  value: 'rehab',
  label: i18n.t("\u062A\u0623\u0647\u064A\u0644"),
  color: 'info'
}, {
  value: 'suspended',
  label: i18n.t("\u0645\u0648\u0642\u0648\u0641"),
  color: 'warning'
}];
const statusMap = {
  ready: {
    label: i18n.t("\u062C\u0627\u0647\u0632"),
    color: 'success',
    bg: 'bg-success-light',
    text: 'text-success'
  },
  injured: {
    label: i18n.t("\u0645\u0635\u0627\u0628"),
    color: 'danger',
    bg: 'bg-danger-light',
    text: 'text-danger'
  },
  rehab: {
    label: i18n.t("\u062A\u0623\u0647\u064A\u0644"),
    color: 'info',
    bg: 'bg-info-light',
    text: 'text-info'
  },
  suspended: {
    label: i18n.t("\u0645\u0648\u0642\u0648\u0641"),
    color: 'warning',
    bg: 'bg-warning-light',
    text: 'text-warning'
  },
  unknown: {
    label: i18n.t("\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"),
    color: 'gray',
    bg: 'bg-gray-100',
    text: 'text-gray-600'
  }
};
export default function Players() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [stats, setStats] = useState({});
  const [positions, setPositions] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    position: searchParams.get('position') || ''
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // جلب البيانات الوصفية
  const fetchMeta = useCallback(async () => {
    try {
      const response = await playersApi.getMeta();
      if (response.data.success) {
        setPositions(response.data.data.positions || []);
      }
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  }, []);

  // جلب اللاعبين
  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        search: filters.search,
        status: filters.status,
        position: filters.position
      };
      const response = await playersApi.getAll(params);
      if (response.data.success) {
        setPlayers(response.data.data);
        setMeta(response.data.meta);
        setStats(response.data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  // تحديث الفلاتر
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // إعادة تعيين الصفحة عند تغيير الفلاتر
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // البحث
  const handleSearch = e => {
    e.preventDefault();
    handleFilterChange('search', filters.search);
  };

  // تغيير الصفحة
  const handlePageChange = page => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  // فتح نموذج إضافة
  const handleAddPlayer = () => {
    setSelectedPlayer(null);
    setIsFormOpen(true);
  };

  // فتح نموذج تعديل
  const handleEditPlayer = player => {
    setSelectedPlayer(player);
    setIsFormOpen(true);
  };

  // حفظ اللاعب (إضافة/تعديل)
  const handleSavePlayer = async (playerData, photoFile) => {
    try {
      let playerId;
      if (selectedPlayer) {
        // تحديث
        await playersApi.update(selectedPlayer.id, playerData);
        playerId = selectedPlayer.id;
        toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0646\u062C\u0627\u062D"));
      } else {
        // إضافة جديد
        const response = await playersApi.create(playerData);
        playerId = response.data?.data?.id;
        toast.success(i18n.t("\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0646\u062C\u0627\u062D"));
      }

      // رفع الصورة যদি وجد
      if (photoFile && playerId) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        await playersApi.uploadPhoto(playerId, formData);
      }
      setIsFormOpen(false);
      fetchPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0644\u0627\u0639\u0628"));
    }
  };

  // إضافة أمثلة لاعبين
  const handleAddExamplePlayers = async () => {
    try {
      setLoading(true);
      const examples = [{
        name: i18n.t("\u0645\u062D\u0645\u062F \u0627\u0644\u0646\u0645\u0631"),
        number: 10,
        position: i18n.t("\u0645\u0647\u0627\u062C\u0645"),
        nationality: i18n.t("\u0633\u0639\u0648\u062F\u064A"),
        height: 180,
        weight: 75,
        dominant_foot: 'right'
      }, {
        name: i18n.t("\u062E\u0627\u0644\u062F \u0633\u0627\u0644\u0645"),
        number: 29,
        position: i18n.t("\u062C\u0646\u0627\u062D \u0623\u064A\u0633\u0631"),
        nationality: i18n.t("\u0633\u0639\u0648\u062F\u064A"),
        height: 174,
        weight: 71,
        dominant_foot: 'left'
      }, {
        name: i18n.t("\u064A\u0627\u0633\u0631 \u0639\u0628\u062F\u0627\u0644\u0644\u0647"),
        number: 5,
        position: i18n.t("\u0642\u0644\u0628 \u062F\u0641\u0627\u0639"),
        nationality: i18n.t("\u0633\u0639\u0648\u062F\u064A"),
        height: 182,
        weight: 78,
        dominant_foot: 'both'
      }];
      for (const p of examples) {
        await playersApi.create(p);
      }
      toast.success(i18n.t("\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0623\u0645\u062B\u0644\u0629 \u0628\u0646\u062C\u0627\u062D"));
      fetchPlayers();
    } catch (error) {
      console.error('Error adding examples:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0623\u0645\u062B\u0644\u0629"));
      setLoading(false);
    }
  };

  // تأكيد الحذف
  const handleDeleteConfirm = async () => {
    if (!playerToDelete) return;
    try {
      await playersApi.delete(playerToDelete.id);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0646\u062C\u0627\u062D"));
      setIsDeleteModalOpen(false);
      setPlayerToDelete(null);
      fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0630\u0641 \u0627\u0644\u0644\u0627\u0639\u0628"));
    }
  };

  // عرض بطاقة اللاعب (Grid View)
  const renderPlayerCard = player => {
    const statusInfo = statusMap[player.status] || statusMap.unknown;
    return <div key={player.id} onClick={() => navigate(`/players/${player.id}`)} className="card group relative hover:scale-[1.02] transition-transform cursor-pointer">
        {/* Actions on hover */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => navigate(`/players/${player.id}`)} className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-primary hover:bg-primary-50 transition-colors" title={i18n.t("\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644")}>
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleEditPlayer(player)} className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-primary hover:bg-primary-50 transition-colors" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}>
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => {
          setPlayerToDelete(player);
          setIsDeleteModalOpen(true);
        }} className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-danger hover:bg-danger-light transition-colors" title={i18n.t("\u062D\u0630\u0641")}>
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-3">
            <Avatar src={player.avatar_url} name={player.name} size="xl" className="w-20 h-20" />
            <span className={`
              absolute -bottom-1 -right-1 w-8 h-8 rounded-full
              flex items-center justify-center text-xs font-bold font-numbers text-white
              ${player.number < 10 ? 'bg-primary' : 'bg-primary-dark'}
            `}>
              {player.number}
            </span>
          </div>

          {/* Name */}
          <h3 className="font-bold text-gray-900 mb-1">{player.name}</h3>

          {/* Position */}
          <p className="text-sm text-gray-500 mb-3">{translatePosition(player.position)}</p>

          {/* Status */}
          <span className={`
            inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold
            ${statusInfo.bg} ${statusInfo.text}
          `}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {statusInfo.label}
          </span>

          {/* Quick info */}
          <div className="mt-4 pt-4 border-t border-gray-100 w-full grid grid-cols-2 gap-2 text-xs text-gray-500">
            {player.height && <div>{i18n.t("\u0627\u0644\u0637\u0648\u0644:")}<span className="font-numbers font-medium">{player.height}cm</span></div>}
            {player.weight && <div>{i18n.t("\u0627\u0644\u0648\u0632\u0646:")}<span className="font-numbers font-medium">{player.weight}kg</span></div>}
            {player.blood_type && <div>{i18n.t("\u0641. \u0627\u0644\u062F\u0645:")}<span className="font-numbers font-medium">{player.blood_type}</span></div>}
            {player.nationality && <div>{player.nationality}</div>}
          </div>
        </div>
      </div>;
  };

  // عرض صف جدول (Table View)
  const renderPlayerRow = player => {
    const statusInfo = statusMap[player.status] || statusMap.unknown;
    return <tr key={player.id} onClick={() => navigate(`/players/${player.id}`)} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <Avatar src={player.avatar_url} name={player.name} size="md" />
            <div>
              <p className="font-semibold text-gray-900">{player.name}</p>
              {player.nationality && <p className="text-xs text-gray-500">{player.nationality}</p>}
            </div>
          </div>
        </td>

        <td className="py-4 px-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-sm font-bold font-numbers text-gray-700">
            {player.number}
          </span>
        </td>

        <td className="py-4 px-4 text-gray-600">{translatePosition(player.position)}</td>

        <td className="py-4 px-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {statusInfo.label}
          </span>
        </td>

        <td className="py-4 px-4">
          <div className="text-xs text-gray-500 space-y-0.5">
            {player.height && <div className="font-numbers">{player.height} cm</div>}
            {player.weight && <div className="font-numbers">{player.weight} kg</div>}
            {!player.height && !player.weight && <span className="text-gray-400">-</span>}
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
            <button onClick={() => navigate(`/players/${player.id}`)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary-50 transition-colors" title={i18n.t("\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644")}>
              <Eye className="w-4 h-4" />
            </button>
            <button onClick={() => handleEditPlayer(player)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary-50 transition-colors" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}>
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => {
            setPlayerToDelete(player);
            setIsDeleteModalOpen(true);
          }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-danger hover:bg-danger-light transition-colors" title={i18n.t("\u062D\u0630\u0641")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>;
  };
  return <div className="animate-fade-in">
      {/* رأس الصفحة */}
      <PageHeader title={<div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <span>{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646")}</span>
            <span className="text-sm font-normal text-gray-500">({meta.total})</span>
          </div>} subtitle={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0648\u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629")}>
        <Button onClick={handleAddPlayer} className="gap-2">
          <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0644\u0627\u0639\u0628")}</Button>
      </PageHeader>

      {/* شريط الفلاتر والبحث */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* البحث */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder={i18n.t("\u0627\u0644\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0631\u0642\u0645...")} value={filters.search} onChange={e => setFilters(prev => ({
              ...prev,
              search: e.target.value
            }))} className="pr-10" />
            </div>
          </form>

          {/* الفلاتر */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* فلتر الحالة */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="input-field pr-10 min-w-[140px] appearance-none cursor-pointer">
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            {/* فلتر المركز */}
            <div className="relative">
              <UserCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.position} onChange={e => handleFilterChange('position', e.target.value)} className="input-field pr-10 min-w-[140px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0631\u0627\u0643\u0632")}</option>
                {positions.map(pos => <option key={pos} value={pos}>{translatePosition(pos)}</option>)}
              </select>
            </div>

            {/* تبديل العرض */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`} title={i18n.t("\u0639\u0631\u0636 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062A")}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`} title={i18n.t("\u0639\u0631\u0636 \u0627\u0644\u062C\u062F\u0648\u0644")}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
          {Object.entries(stats.byStatus || {}).map(([status, count]) => {
          const info = statusMap[status] || statusMap.unknown;
          return <div key={status} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${info.bg.replace('bg-', 'bg-')}`}></span>
                <span className="text-sm text-gray-600">{info.label}:</span>
                <span className="text-sm font-bold font-numbers">{count}</span>
              </div>;
        })}
        </div>
      </div>

      {/* المحتوى */}
      {loading ?
    // Loading state
    viewMode === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="card">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-20 h-20 rounded-full mb-3" />
                  <Skeleton className="w-32 h-5 mb-2" />
                  <Skeleton className="w-20 h-4" />
                </div>
              </div>)}
          </div> : <div className="card">
            <table className="w-full">
              <tbody>
                {[...Array(5)].map((_, i) => <tr key={i}>
                    <td className="py-4 px-4"><Skeleton className="w-40 h-5" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-10 h-5" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-24 h-5" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-16 h-5" /></td>
                    <td className="py-4 px-4"><Skeleton className="w-20 h-5" /></td>
                  </tr>)}
              </tbody>
            </table>
          </div> : players.length === 0 ?
    // Empty state
    <div className="card text-center py-16">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t("\u0644\u0627 \u064A\u0648\u062C\u062F \u0644\u0627\u0639\u0628\u064A\u0646")}</h3>
          <p className="text-gray-500 mb-6">{i18n.t("\u0642\u0645 \u0628\u0625\u0636\u0627\u0641\u0629 \u0644\u0627\u0639\u0628\u064A\u0646 \u0644\u0644\u0628\u062F\u0621")}</p>
          <div className="flex justify-center gap-3">
            <Button onClick={handleAddPlayer}>
              <Plus className="w-4 h-4 ml-2" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0644\u0627\u0639\u0628")}</Button>
            <Button variant="outline" onClick={handleAddExamplePlayers}>
              <Users className="w-4 h-4 ml-2" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0623\u0645\u062B\u0644\u0629")}</Button>
          </div>
        </div> : viewMode === 'grid' ?
    // Grid view
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {players.map(renderPlayerCard)}
        </div> :
    // Table view
    <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0631\u0642\u0645")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0645\u0631\u0643\u0632")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A")}</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                </tr>
              </thead>
              <tbody>{players.map(renderPlayerRow)}</tbody>
            </table>
          </div>
        </div>}

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => handlePageChange(meta.page - 1)} disabled={meta.page === 1} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {[...Array(meta.totalPages)].map((_, i) => {
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

      {/* نموذج إضافة/تعديل */}
      <PlayerFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} player={selectedPlayer} onSave={handleSavePlayer} positions={positions} />

      {/* نموذج تأكيد الحذف */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => {
      setIsDeleteModalOpen(false);
      setPlayerToDelete(null);
    }} title={i18n.t("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641")} size="sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-danger" />
          </div>
          <p className="text-gray-600 mb-6">{i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0627\u0644\u0644\u0627\u0639\u0628")}<span className="font-bold text-gray-900"> "{playerToDelete?.name}" </span>{i18n.t("\u061F")}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
            setIsDeleteModalOpen(false);
            setPlayerToDelete(null);
          }} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">{i18n.t("\u062D\u0630\u0641")}</Button>
          </div>
        </div>
      </Modal>
    </div>;
}