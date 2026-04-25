import i18n from "../../utils/i18n";
import { translateAptStatusLabel, translateAptTypeLabel } from '../../utils/translateBackend';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Search, Filter, Plus, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Clock, User, MapPin, Check, X, RefreshCw, List, LayoutGrid } from 'lucide-react';
import { appointmentsApi } from '../../api/endpoints/appointments';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import { formatDate, formatTime } from '../../utils/formatters';
import toast from 'react-hot-toast';
const statusColors = {
  scheduled: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    label: i18n.t("\u0645\u062D\u062F\u062F")
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: i18n.t("\u0645\u0643\u062A\u0645\u0644")
  },
  cancelled: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: i18n.t("\u0645\u0644\u063A\u0649")
  },
  no_show: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    label: i18n.t("\u0644\u0645 \u064A\u062D\u0636\u0631")
  },
  rescheduled: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    label: i18n.t("\u0625\u0639\u0627\u062F\u0629 \u062C\u062F\u0648\u0644\u0629")
  }
};
export default function Appointments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [metaData, setMetaData] = useState({
    players: [],
    doctors: [],
    statusOptions: [],
    appointmentTypes: []
  });
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    player_id: searchParams.get('player_id') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || ''
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    player_id: '',
    doctor_id: '',
    appointment_type: '',
    location: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 30,
    notes: ''
  });
  const fetchMeta = useCallback(async () => {
    try {
      const response = await appointmentsApi.getMeta();
      if (response.data.success) {
        setMetaData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  }, []);
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        status: filters.status,
        player_id: filters.player_id,
        start_date: filters.start_date,
        end_date: filters.end_date
      };
      const response = await appointmentsApi.getAll(params);
      if (response.data.success) {
        setAppointments(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
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
  const handleOpenForm = (appointment = null) => {
    if (appointment) {
      setSelectedAppointment(appointment);
      setFormData({
        player_id: appointment.player_id || '',
        doctor_id: appointment.doctor_id || '',
        appointment_type: appointment.appointment_type || '',
        location: appointment.location || '',
        scheduled_date: appointment.scheduled_date || '',
        scheduled_time: appointment.scheduled_time || '',
        duration_minutes: appointment.duration_minutes || 30,
        notes: appointment.notes || ''
      });
    } else {
      setSelectedAppointment(null);
      setFormData({
        player_id: '',
        doctor_id: '',
        appointment_type: '',
        location: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 30,
        notes: ''
      });
    }
    setIsFormOpen(true);
  };
  const handleSave = async () => {
    try {
      if (!formData.player_id || !formData.scheduled_date) {
        toast.error(i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0645\u0637\u0644\u0648\u0628\u0627\u0646"));
        return;
      }
      if (selectedAppointment) {
        await appointmentsApi.update(selectedAppointment.id, formData);
        toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0648\u0639\u062F \u0628\u0646\u062C\u0627\u062D"));
      } else {
        await appointmentsApi.create(formData);
        toast.success(i18n.t("\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0648\u0639\u062F \u0628\u0646\u062C\u0627\u062D"));
      }
      setIsFormOpen(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062D\u0641\u0638"));
    }
  };
  const handleStatusChange = async (appointment, newStatus) => {
    try {
      await appointmentsApi.updateStatus(appointment.id, {
        status: newStatus
      });
      toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0648\u0639\u062F"));
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623"));
    }
  };
  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;
    try {
      await appointmentsApi.delete(appointmentToDelete.id);
      toast.success(i18n.t("\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0645\u0648\u0639\u062F"));
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623"));
    }
  };
  const renderAppointmentRow = appointment => {
    const statusInfo = statusColors[appointment.status] || statusColors.scheduled;
    const player = appointment.player || {};
    const doctor = appointment.doctor || {};
    return <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-500">
                {new Date(appointment.scheduled_date).toLocaleDateString(localStorage.getItem('smis-locale') === 'en' ? 'en-US' : 'ar-EG', {
                weekday: 'short'
              })}
              </div>
              <div className="text-lg font-bold text-gray-900 font-numbers">
                {new Date(appointment.scheduled_date).getDate()}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(appointment.scheduled_date).toLocaleDateString(localStorage.getItem('smis-locale') === 'en' ? 'en-US' : 'ar-EG', {
                month: 'short'
              })}
              </div>
            </div>
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-2 font-numbers text-gray-700">
            <Clock className="w-4 h-4 text-gray-400" />
            {appointment.scheduled_time || '—'}
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <Avatar name={player.name} size="md" />
            <div>
              <p className="font-medium text-gray-900">{player.name || '—'}</p>
              <p className="text-xs text-gray-500">#{player.number || '—'}</p>
            </div>
          </div>
        </td>

        <td className="py-4 px-4">
          <p className="text-gray-700">{doctor.name || '—'}</p>
          <p className="text-xs text-gray-500">{appointment.appointment_type || '—'}</p>
        </td>

        <td className="py-4 px-4">
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
            {statusInfo.label}
          </span>
        </td>

        <td className="py-4 px-4">
          {appointment.location && <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              {appointment.location}
            </div>}
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {appointment.status === 'scheduled' && <>
                <button onClick={() => handleStatusChange(appointment, 'completed')} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-success hover:bg-success/10 transition-colors" title={i18n.t("\u062A\u0645\u064A\u064A\u0632 \u0643\u0645\u0643\u062A\u0645\u0644")}>
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => handleStatusChange(appointment, 'cancelled')} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-danger hover:bg-danger-light transition-colors" title={i18n.t("\u0625\u0644\u063A\u0627\u0621")}>
                  <X className="w-4 h-4" />
                </button>
              </>}
            <button onClick={() => handleOpenForm(appointment)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}>
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => {
            setAppointmentToDelete(appointment);
            setIsDeleteModalOpen(true);
          }} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-danger hover:bg-danger-light transition-colors" title={i18n.t("\u062D\u0630\u0641")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>;
  };
  if (!loading && appointments.length === 0 && Object.values(filters).every(v => !v)) {
    return <div className="animate-fade-in">
        <PageHeader title={<div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <span>{i18n.t("\u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F")}</span>
            </div>} subtitle={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0627\u0644\u0637\u0628\u064A\u0629")}>
          <Button onClick={() => handleOpenForm()} className="gap-2">
            <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0639\u062F")}</Button>
        </PageHeader>

        <div className="card text-center py-16">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0648\u0627\u0639\u064A\u062F")}</h3>
          <p className="text-gray-500 mb-6">{i18n.t("\u0642\u0645 \u0628\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0627\u0639\u064A\u062F \u0644\u0644\u0628\u062F\u0621")}</p>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 ml-2" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0639\u062F")}</Button>
        </div>

        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedAppointment ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0645\u0648\u0639\u062F") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0639\u062F")} size="md" footer={<div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
              <Button onClick={handleSave} className="flex-1">{i18n.t("\u062D\u0641\u0638")}</Button>
            </div>}>
          <AppointmentForm formData={formData} setFormData={setFormData} metaData={metaData} />
        </Modal>
      </div>;
  }
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <span>{i18n.t("\u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F")}</span>
            <span className="text-sm font-normal text-gray-500">({meta.total})</span>
          </div>} subtitle={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0627\u0644\u0637\u0628\u064A\u0629")}>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`} title={i18n.t("\u0639\u0631\u0636 \u0642\u0627\u0626\u0645\u0629")}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`} title={i18n.t("\u0639\u0631\u0636 \u062A\u0642\u0648\u064A\u0645")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <Button onClick={() => handleOpenForm()} className="gap-2">
            <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0639\u062F")}</Button>
        </div>
      </PageHeader>

      {viewMode === 'calendar' ? <CalendarView appointments={appointments} calendarDate={calendarDate} setCalendarDate={setCalendarDate} onAdd={date => {
      setSelectedAppointment(null);
      setFormData({
        player_id: '',
        doctor_id: '',
        appointment_type: '',
        location: '',
        scheduled_date: date,
        scheduled_time: '',
        duration_minutes: 30,
        notes: ''
      });
      setIsFormOpen(true);
    }} onEdit={handleOpenForm} statusColors={statusColors} /> : null}

      {viewMode === 'list' && <>
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="input-field pr-10 min-w-[140px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A")}</option>
                {metaData.statusOptions?.map(opt => <option key={opt.value} value={opt.value}>{translateAptStatusLabel(opt.label)}</option>)}
              </select>
            </div>

            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.player_id} onChange={e => handleFilterChange('player_id', e.target.value)} className="input-field pr-10 min-w-[160px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</option>
                {metaData.players?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Input type="date" value={filters.start_date} onChange={e => handleFilterChange('start_date', e.target.value)} className="input-field min-w-[140px]" placeholder={i18n.t("\u0645\u0646 \u062A\u0627\u0631\u064A\u062E")} />
              <span className="text-gray-400">—</span>
              <Input type="date" value={filters.end_date} onChange={e => handleFilterChange('end_date', e.target.value)} className="input-field min-w-[140px]" placeholder={i18n.t("\u0625\u0644\u0649 \u062A\u0627\u0631\u064A\u062E")} />
            </div>
          </div>
        </div>
      </div>

      {loading ? <div className="card">
          <table className="w-full">
            <tbody>
              {[...Array(5)].map((_, i) => <tr key={i}>
                  <td className="py-4 px-4"><Skeleton className="w-16 h-12" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-20 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-32 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-24 h-5" /></td>
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
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0648\u0642\u062A")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0637\u0628\u064A\u0628/\u0627\u0644\u0646\u0648\u0639")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0645\u0643\u0627\u0646")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                  </tr>
                </thead>
                <tbody>{appointments.map(renderAppointmentRow)}</tbody>
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

      </>} {/* end viewMode === 'list' */}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedAppointment ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0645\u0648\u0639\u062F") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0639\u062F")} size="md" footer={<div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button onClick={handleSave} className="flex-1">{i18n.t("\u062D\u0641\u0638")}</Button>
          </div>}>
        <AppointmentForm formData={formData} setFormData={setFormData} metaData={metaData} />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => {
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
    }} title={i18n.t("\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0645\u0648\u0639\u062F")} size="sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-danger" />
          </div>
          <p className="text-gray-600 mb-6">{i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0625\u0644\u063A\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0639\u062F\u061F")}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
            setIsDeleteModalOpen(false);
            setAppointmentToDelete(null);
          }} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">{i18n.t("\u0646\u0639\u0645\u060C \u0625\u0644\u063A\u0627\u0621")}</Button>
          </div>
        </div>
      </Modal>
    </div>;
}
const ARABIC_DAYS = [i18n.t("\u0627\u0644\u0623\u062D\u062F"), i18n.t("\u0627\u0644\u0627\u062B\u0646\u064A\u0646"), i18n.t("\u0627\u0644\u062B\u0644\u0627\u062B\u0627\u0621"), i18n.t("\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621"), i18n.t("\u0627\u0644\u062E\u0645\u064A\u0633"), i18n.t("\u0627\u0644\u062C\u0645\u0639\u0629"), i18n.t("\u0627\u0644\u0633\u0628\u062A")];
const ARABIC_MONTHS = [i18n.t("\u064A\u0646\u0627\u064A\u0631"), i18n.t("\u0641\u0628\u0631\u0627\u064A\u0631"), i18n.t("\u0645\u0627\u0631\u0633"), i18n.t("\u0623\u0628\u0631\u064A\u0644"), i18n.t("\u0645\u0627\u064A\u0648"), i18n.t("\u064A\u0648\u0646\u064A\u0648"), i18n.t("\u064A\u0648\u0644\u064A\u0648"), i18n.t("\u0623\u063A\u0633\u0637\u0633"), i18n.t("\u0633\u0628\u062A\u0645\u0628\u0631"), i18n.t("\u0623\u0643\u062A\u0648\u0628\u0631"), i18n.t("\u0646\u0648\u0641\u0645\u0628\u0631"), i18n.t("\u062F\u064A\u0633\u0645\u0628\u0631")];
function CalendarView({
  appointments,
  calendarDate,
  setCalendarDate,
  onAdd,
  onEdit,
  statusColors
}) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const appointmentsByDate = {};
  appointments.forEach(appt => {
    const d = appt.scheduled_date?.split('T')[0];
    if (d) {
      if (!appointmentsByDate[d]) appointmentsByDate[d] = [];
      appointmentsByDate[d].push(appt);
    }
  });
  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const dateKey = day => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const isToday = day => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return <div className="card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <button onClick={prevMonth} className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
        <h3 className="text-lg font-bold text-gray-900">
          {ARABIC_MONTHS[month]} {year}
        </h3>
        <button onClick={nextMonth} className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {ARABIC_DAYS.map(day => <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">{day}</div>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
        if (!day) return <div key={`empty-${idx}`} className="h-24" />;
        const key = dateKey(day);
        const dayAppts = appointmentsByDate[key] || [];
        const isTodayDay = isToday(day);
        return <div key={key} className={`h-24 rounded-lg border p-1.5 cursor-pointer hover:bg-gray-50 transition-colors ${isTodayDay ? 'border-primary bg-primary-light' : 'border-gray-100'}`} onClick={() => onAdd(key)}>
              <div className={`text-sm font-numbers font-semibold mb-1 w-6 h-6 rounded-full flex items-center justify-center ${isTodayDay ? 'bg-primary text-white' : 'text-gray-700'}`}>
                {day}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                {dayAppts.slice(0, 3).map(appt => {
              const sc = statusColors[appt.status] || statusColors.scheduled;
              return <div key={appt.id} className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${sc.bg} ${sc.text}`} onClick={e => {
                e.stopPropagation();
                onEdit(appt);
              }} title={`${appt.player?.name} - ${appt.appointment_type || ''}`}>
                      {appt.scheduled_time ? appt.scheduled_time.slice(0, 5) + ' ' : ''}{appt.player?.name?.split(' ')[0]}
                    </div>;
            })}
                {dayAppts.length > 3 && <div className="text-xs text-gray-400 font-numbers">+{dayAppts.length - 3}{i18n.t("\u0622\u062E\u0631\u0648\u0646")}</div>}
              </div>
            </div>;
      })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t flex-wrap">
        {Object.entries(statusColors).map(([key, val]) => <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${val.bg}`} />
            <span className="text-xs text-gray-600">{val.label}</span>
          </div>)}
      </div>
    </div>;
}
function AppointmentForm({
  formData,
  setFormData,
  metaData
}) {
  return <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 *")}</label>
        <select value={formData.player_id} onChange={e => setFormData({
        ...formData,
        player_id: e.target.value
      })} className="input-field w-full" required>
          <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0644\u0627\u0639\u0628")}</option>
          {metaData.players?.map(p => <option key={p.id} value={p.id}>{p.name} - #{p.number}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0637\u0628\u064A\u0628")}</label>
        <select value={formData.doctor_id} onChange={e => setFormData({
        ...formData,
        doctor_id: e.target.value
      })} className="input-field w-full">
          <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0637\u0628\u064A\u0628")}</option>
          {metaData.doctors?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label={i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E *")} type="date" value={formData.scheduled_date} onChange={e => setFormData({
        ...formData,
        scheduled_date: e.target.value
      })} required />
        <Input label={i18n.t("\u0627\u0644\u0648\u0642\u062A")} type="time" value={formData.scheduled_time} onChange={e => setFormData({
        ...formData,
        scheduled_time: e.target.value
      })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0645\u0648\u0639\u062F")}</label>
          <select value={formData.appointment_type} onChange={e => setFormData({
          ...formData,
          appointment_type: e.target.value
        })} className="input-field w-full">
            <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0646\u0648\u0639")}</option>
            {metaData.appointmentTypes?.map(t => <option key={t.value} value={t.value}>{translateAptTypeLabel(t.label)}</option>)}
          </select>
        </div>
        <Input label={i18n.t("\u0627\u0644\u0645\u062F\u0629 (\u062F\u0642\u064A\u0642\u0629)")} type="number" value={formData.duration_minutes} onChange={e => setFormData({
        ...formData,
        duration_minutes: parseInt(e.target.value)
      })} />
      </div>

      <Input label={i18n.t("\u0627\u0644\u0645\u0643\u0627\u0646")} value={formData.location} onChange={e => setFormData({
      ...formData,
      location: e.target.value
    })} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</label>
        <textarea value={formData.notes} onChange={e => setFormData({
        ...formData,
        notes: e.target.value
      })} className="input-field w-full h-24 resize-none" placeholder={i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629...")} />
      </div>

    </div>;
}