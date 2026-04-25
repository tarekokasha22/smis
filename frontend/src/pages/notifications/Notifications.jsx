import i18n from "../../utils/i18n";
import { translateTitle, translateMessage } from '../../utils/translateBackend';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Bell, Search, Filter, Check, CheckCheck, Trash2, ChevronLeft, ChevronRight, AlertCircle, Calendar, HeartPulse, Stethoscope, Wrench, Pill, Activity, Info } from 'lucide-react';
import { notificationsApi } from '../../api/endpoints/notifications';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import { formatDateTime, timeAgo } from '../../utils/formatters';
import toast from 'react-hot-toast';
const getTypeKey = type => {
  if (!type) return 'system';
  if (type.startsWith('injury')) return 'injury';
  if (type.startsWith('rehab')) return 'rehab';
  if (type.startsWith('appointment')) return 'appointment';
  if (type.startsWith('equipment')) return 'equipment';
  if (type.startsWith('supply') || type.startsWith('vital')) return 'supplies';
  return type;
};
const typeIcons = {
  injury: HeartPulse,
  rehab: Stethoscope,
  appointment: Calendar,
  equipment: Wrench,
  supplies: Pill,
  system: Info,
  performance: Activity
};
const typeColors = {
  injury: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: 'text-red-500'
  },
  rehab: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: 'text-blue-500'
  },
  appointment: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    icon: 'text-purple-500'
  },
  equipment: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    icon: 'text-orange-500'
  },
  supplies: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: 'text-green-500'
  },
  system: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: 'text-gray-500'
  },
  performance: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    icon: 'text-cyan-500'
  }
};
const priorityColors = {
  low: 'bg-gray-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500'
};
export default function Notifications() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    unreadCount: 0
  });
  const [filters, setFilters] = useState({
    is_read: searchParams.get('is_read') || '',
    type: searchParams.get('type') || ''
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        is_read: filters.is_read,
        type: filters.type
      };
      const response = await notificationsApi.getAll(params);
      if (response.data.success) {
        setNotifications(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
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
  const handlePageChange = page => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };
  const handleViewDetails = async notification => {
    setSelectedNotification(notification);
    setIsDetailsModalOpen(true);
    if (!notification.is_read) {
      try {
        await notificationsApi.markAsRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? {
          ...n,
          is_read: true
        } : n));
        setMeta(prev => ({
          ...prev,
          unreadCount: Math.max(0, prev.unreadCount - 1)
        }));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      toast.success(i18n.t("\u062A\u0645 \u062A\u0639\u0644\u064A\u0645 \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0643\u0645\u0642\u0631\u0648\u0621\u0629"));
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623"));
    }
  };
  const handleDelete = async notification => {
    try {
      await notificationsApi.delete(notification.id);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631"));
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623"));
    }
  };
  const renderNotificationRow = notification => {
    const typeInfo = typeColors[getTypeKey(notification.type)] || typeColors.system;
    const Icon = typeIcons[getTypeKey(notification.type)] || Info;
    return <tr key={notification.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-blue-50/50' : ''}`} onClick={() => handleViewDetails(notification)}>
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${typeInfo.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${typeInfo.icon}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {!notification.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>}
                <p className={`font-medium text-gray-900 truncate ${!notification.is_read ? 'font-semibold' : ''}`}>
                  {translateTitle(notification.title)}
                </p>
              </div>
              {notification.body && <p className="text-sm text-gray-500 truncate mt-0.5">{translateMessage(notification.body)}</p>}
            </div>
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${priorityColors[notification.priority]}`} title={notification.priority}></span>
            {!notification.is_read && <ChevronLeft className="w-4 h-4 text-gray-400" />}
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="text-sm text-gray-500 font-numbers whitespace-nowrap">
            {timeAgo(notification.created_at)}
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-1">
            {!notification.is_read && <button onClick={e => {
            e.stopPropagation();
            handleViewDetails(notification);
          }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-success hover:bg-success/10 transition-colors" title={i18n.t("\u062A\u0639\u0644\u064A\u0645 \u0643\u0645\u0642\u0631\u0648\u0621")}>
                <Check className="w-4 h-4" />
              </button>}
            <button onClick={e => {
            e.stopPropagation();
            handleDelete(notification);
          }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-danger hover:bg-danger-light transition-colors" title={i18n.t("\u062D\u0630\u0641")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>;
  };
  if (!loading && notifications.length === 0 && Object.values(filters).every(v => !v)) {
    return <div className="animate-fade-in">
        <PageHeader title={<div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              <span>{i18n.t("\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A")}</span>
              {meta.unreadCount > 0 && <span className="text-sm font-normal text-gray-500">({meta.unreadCount}{i18n.t("\u063A\u064A\u0631 \u0645\u0642\u0631\u0648\u0621)")}</span>}
            </div>} subtitle={i18n.t("\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A")}>
          <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
            <CheckCheck className="w-4 h-4" />{i18n.t("\u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0643\u0644 \u0643\u0645\u0642\u0631\u0648\u0621")}</Button>
        </PageHeader>

        <div className="card text-center py-16">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0625\u0634\u0639\u0627\u0631\u0627\u062A")}</h3>
          <p className="text-gray-500">{i18n.t("\u0633\u062A\u0638\u0647\u0631 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0647\u0646\u0627 \u0639\u0646\u062F \u062D\u062F\u0648\u062B \u0623\u062D\u062F\u0627\u062B \u062C\u062F\u064A\u062F\u0629")}</p>
        </div>
      </div>;
  }
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-primary" />
            <span>{i18n.t("\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A")}</span>
            {meta.unreadCount > 0 && <span className="text-sm font-normal text-gray-500">({meta.unreadCount}{i18n.t("\u063A\u064A\u0631 \u0645\u0642\u0631\u0648\u0621)")}</span>}
          </div>} subtitle={i18n.t("\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A")}>
        <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
          <CheckCheck className="w-4 h-4" />{i18n.t("\u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0643\u0644 \u0643\u0645\u0642\u0631\u0648\u0621")}</Button>
      </PageHeader>

      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={filters.is_read} onChange={e => handleFilterChange('is_read', e.target.value)} className="input-field pr-10 min-w-[160px] appearance-none cursor-pointer">
              <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A")}</option>
              <option value="false">{i18n.t("\u063A\u064A\u0631 \u0645\u0642\u0631\u0648\u0621\u0629")}</option>
              <option value="true">{i18n.t("\u0645\u0642\u0631\u0648\u0621\u0629")}</option>
            </select>
          </div>

          <div className="relative">
            <Bell className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} className="input-field pr-10 min-w-[160px] appearance-none cursor-pointer">
              <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0646\u0648\u0627\u0639")}</option>
              <option value="injury">{i18n.t("\u0625\u0635\u0627\u0628\u0627\u062A")}</option>
              <option value="rehab">{i18n.t("\u062A\u0623\u0647\u064A\u0644")}</option>
              <option value="appointment">{i18n.t("\u0645\u0648\u0627\u0639\u064A\u062F")}</option>
              <option value="equipment">{i18n.t("\u0645\u0639\u062F\u0627\u062A")}</option>
              <option value="supplies">{i18n.t("\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A")}</option>
              <option value="system">{i18n.t("\u0646\u0638\u0627\u0645")}</option>
              <option value="performance">{i18n.t("\u0623\u062F\u0627\u0621")}</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <div className="card">
          <table className="w-full">
            <tbody>
              {[...Array(5)].map((_, i) => <tr key={i}>
                  <td className="py-4 px-4"><Skeleton className="w-48 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-8 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-20 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-16 h-8" /></td>
                </tr>)}
            </tbody>
          </table>
        </div> : <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0625\u0634\u0639\u0627\u0631")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                  </tr>
                </thead>
                <tbody>{notifications.map(renderNotificationRow)}</tbody>
              </table>
            </div>
          </div>

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
        </>}

      <Modal isOpen={isDetailsModalOpen} onClose={() => {
      setIsDetailsModalOpen(false);
      setSelectedNotification(null);
    }} title={i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631")} size="md">
        {selectedNotification && <div className="space-y-4">
            <div className="flex items-start gap-4">
              {(() => {
            const typeInfo = typeColors[selectedNotification.type] || typeColors.system;
            const Icon = typeIcons[selectedNotification.type] || Info;
            return <div className={`w-12 h-12 rounded-xl ${typeInfo.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${typeInfo.icon}`} />
                  </div>;
          })()}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{translateTitle(selectedNotification.title)}</h3>
                <p className="text-sm text-gray-500 font-numbers mt-1">
                  {formatDateTime(selectedNotification.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <span className={`w-3 h-3 rounded-full ${priorityColors[selectedNotification.priority]}`}></span>
              </div>
            </div>

            {selectedNotification.body && <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{translateMessage(selectedNotification.body)}</p>
              </div>}

            {selectedNotification.related_entity_type && selectedNotification.related_entity_id && <div className="text-sm">
                <span className="text-gray-500">{i18n.t("\u0630\u0648 \u0635\u0644\u0629 \u0628\u0640:")}</span>
                <span className="font-medium text-primary">
                  {selectedNotification.related_entity_type} #{selectedNotification.related_entity_id}
                </span>
              </div>}

            <div className="flex gap-3 pt-4">
              {!selectedNotification.is_read && <Button onClick={async () => {
            await notificationsApi.markAsRead(selectedNotification.id);
            setNotifications(prev => prev.map(n => n.id === selectedNotification.id ? {
              ...n,
              is_read: true
            } : n));
            setMeta(prev => ({
              ...prev,
              unreadCount: Math.max(0, prev.unreadCount - 1)
            }));
            setIsDetailsModalOpen(false);
            toast.success(i18n.t("\u062A\u0645 \u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0643\u0645\u0642\u0631\u0648\u0621"));
          }} className="flex-1 gap-2">
                  <Check className="w-4 h-4" />{i18n.t("\u062A\u0639\u0644\u064A\u0645 \u0643\u0645\u0642\u0631\u0648\u0621")}</Button>}
              <Button variant="danger" onClick={async () => {
            await notificationsApi.delete(selectedNotification.id);
            setIsDetailsModalOpen(false);
            fetchNotifications();
            toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631"));
          }} className="flex-1 gap-2">
                <Trash2 className="w-4 h-4" />{i18n.t("\u062D\u0630\u0641")}</Button>
            </div>
          </div>}
      </Modal>
    </div>;
}