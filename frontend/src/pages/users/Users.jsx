import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users as UsersIcon, Search, Filter, Plus, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, UserCircle, Phone, Mail, Shield, Key, ToggleLeft, ToggleRight } from 'lucide-react';
import { usersApi } from '../../api/endpoints/users';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import { formatDateTime } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
const roleMap = {
  super_admin: {
    label: i18n.t("\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0638\u0627\u0645"),
    color: 'purple'
  },
  club_admin: {
    label: i18n.t("\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0627\u062F\u064A"),
    color: 'danger'
  },
  doctor: {
    label: i18n.t("\u0637\u0628\u064A\u0628"),
    color: 'info'
  },
  physiotherapist: {
    label: i18n.t("\u0623\u062E\u0635\u0627\u0626\u064A \u0639\u0644\u0627\u062C \u0637\u0628\u064A\u0639\u064A"),
    color: 'success'
  },
  coach: {
    label: i18n.t("\u0645\u062F\u0631\u0628"),
    color: 'warning'
  },
  nurse: {
    label: i18n.t("\u0645\u0645\u0631\u0636"),
    color: 'blue'
  },
  nutritionist: {
    label: i18n.t("\u0623\u062E\u0635\u0627\u0626\u064A \u062A\u063A\u0630\u064A\u0629"),
    color: 'teal'
  },
  manager: {
    label: i18n.t("\u0645\u062F\u064A\u0631"),
    color: 'orange'
  },
  analyst: {
    label: i18n.t("\u0645\u062D\u0644\u0644"),
    color: 'gray'
  }
};
export default function Users() {
  const {
    user: currentUser
  } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [roles, setRoles] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    is_active: searchParams.get('is_active') || ''
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'analyst',
    phone: ''
  });
  const fetchMeta = useCallback(async () => {
    try {
      const response = await usersApi.getMeta();
      if (response.data.success) {
        setRoles(response.data.data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  }, []);
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        search: filters.search,
        role: filters.role,
        is_active: filters.is_active
      };
      const response = await usersApi.getAll(params);
      if (response.data.success) {
        setUsers(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
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
  const handleOpenForm = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'analyst',
        phone: user.phone || ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'analyst',
        phone: ''
      });
    }
    setIsFormOpen(true);
  };
  const handleSave = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error(i18n.t("\u0627\u0644\u0627\u0633\u0645 \u0648\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628\u0627\u0646"));
        return;
      }
      if (!selectedUser && !formData.password) {
        toast.error(i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u062C\u062F\u064A\u062F"));
        return;
      }
      if (selectedUser) {
        const {
          password,
          ...updateData
        } = formData;
        await usersApi.update(selectedUser.id, updateData);
        toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D"));
      } else {
        await usersApi.create(formData);
        toast.success(i18n.t("\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D"));
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645"));
    }
  };
  const handleToggleStatus = async user => {
    try {
      const newStatus = !user.is_active;
      await usersApi.toggleStatus(user.id, newStatus);
      toast.success(newStatus ? i18n.t("\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645") : i18n.t("\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645"));
      fetchUsers();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u062D\u0627\u0644\u0629"));
    }
  };
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await usersApi.delete(userToDelete.id);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D"));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645"));
    }
  };
  const renderUserRow = user => {
    const roleInfo = roleMap[user.role] || roleMap.analyst;
    return <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar_url} name={user.name} size="md" />
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              {user.phone && <p className="text-xs text-gray-500 font-numbers">{user.phone}</p>}
            </div>
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{user.email}</span>
          </div>
        </td>

        <td className="py-4 px-4">
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-${roleInfo.color}-100 text-${roleInfo.color}-700`}>
            {roleInfo.label}
          </span>
        </td>

        <td className="py-4 px-4">
          {user.last_login ? <span className="text-sm text-gray-500 font-numbers">{formatDateTime(user.last_login)}</span> : <span className="text-sm text-gray-400">—</span>}
        </td>

        <td className="py-4 px-4">
          <button onClick={() => handleToggleStatus(user)} disabled={currentUser && user.id === currentUser.id} className={`w-10 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${user.is_active ? 'bg-success' : 'bg-gray-300'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${user.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => handleOpenForm(user)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}>
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => {
            if (currentUser && user.id === currentUser.id) {
              toast.error(i18n.t("\u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u062D\u0630\u0641 \u062D\u0633\u0627\u0628\u0643 \u0627\u0644\u062E\u0627\u0635"));
              return;
            }
            setUserToDelete(user);
            setIsDeleteModalOpen(true);
          }} disabled={currentUser && user.id === currentUser.id} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-danger hover:bg-danger-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title={i18n.t("\u062D\u0630\u0641")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>;
  };
  if (!loading && users.length === 0 && Object.values(filters).every(v => !v)) {
    return <div className="animate-fade-in">
        <PageHeader title={<div className="flex items-center gap-3">
              <UsersIcon className="w-6 h-6 text-primary" />
              <span>{i18n.t("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646")}</span>
            </div>} subtitle={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0648\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A")}>
          <Button onClick={() => handleOpenForm()} className="gap-2">
            <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u062E\u062F\u0645")}</Button>
        </PageHeader>

        <div className="card text-center py-16">
          <UserCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t("\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646")}</h3>
          <p className="text-gray-500 mb-6">{i18n.t("\u0642\u0645 \u0628\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0644\u0644\u0628\u062F\u0621")}</p>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 ml-2" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u062E\u062F\u0645")}</Button>
        </div>

        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedUser ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0645\u0633\u062A\u062E\u062F\u0645") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u062E\u062F\u0645")} size="md">
          <div className="space-y-4">
            <Input label={i18n.t("\u0627\u0644\u0627\u0633\u0645")} value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} required />
            <Input label={i18n.t("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A")} type="email" value={formData.email} onChange={e => setFormData({
            ...formData,
            email: e.target.value
          })} required />
            <Input label={selectedUser ? i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 (\u0627\u062A\u0631\u0643\u0647\u0627 \u0641\u0627\u0631\u063A\u0629 \u0625\u0630\u0627 \u0644\u0627 \u062A\u0631\u064A\u062F \u062A\u063A\u064A\u064A\u0631\u0647\u0627)") : i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")} type="password" value={formData.password} onChange={e => setFormData({
            ...formData,
            password: e.target.value
          })} required={!selectedUser} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062F\u0648\u0631")}</label>
              <select value={formData.role} onChange={e => setFormData({
              ...formData,
              role: e.target.value
            })} className="input-field w-full">
                {roles.map(r => <option key={r.value} value={r.value}>{roleMap[r.value]?.label || r.label}</option>)}
              </select>
            </div>
            <Input label={i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641")} value={formData.phone} onChange={e => setFormData({
            ...formData,
            phone: e.target.value
          })} />
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
              <Button onClick={handleSave} className="flex-1">{i18n.t("\u062D\u0641\u0638")}</Button>
            </div>
          </div>
        </Modal>
      </div>;
  }
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <UsersIcon className="w-6 h-6 text-primary" />
            <span>{i18n.t("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646")}</span>
            <span className="text-sm font-normal text-gray-500">({meta.total})</span>
          </div>} subtitle={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0648\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A")}>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u062E\u062F\u0645")}</Button>
      </PageHeader>

      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder={i18n.t("\u0627\u0644\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0628\u0631\u064A\u062F...")} value={filters.search} onChange={e => setFilters(prev => ({
              ...prev,
              search: e.target.value
            }))} className="pr-10" />
            </div>
          </form>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.role} onChange={e => handleFilterChange('role', e.target.value)} className="input-field pr-10 min-w-[160px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u062F\u0648\u0627\u0631")}</option>
                {roles.map(r => <option key={r.value} value={r.value}>{roleMap[r.value]?.label || r.label}</option>)}
              </select>
            </div>

            <div className="relative">
              <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.is_active} onChange={e => handleFilterChange('is_active', e.target.value)} className="input-field pr-10 min-w-[140px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A")}</option>
                <option value="true">{i18n.t("\u0646\u0634\u0637")}</option>
                <option value="false">{i18n.t("\u063A\u064A\u0631 \u0646\u0634\u0637")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? <div className="card">
          <table className="w-full">
            <tbody>
              {[...Array(5)].map((_, i) => <tr key={i}>
                  <td className="py-4 px-4"><Skeleton className="w-40 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-32 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-24 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-24 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-10 h-6" /></td>
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
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u062F\u0648\u0631")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0622\u062E\u0631 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u062D\u0627\u0644\u0629")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                  </tr>
                </thead>
                <tbody>{users.map(renderUserRow)}</tbody>
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

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedUser ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0645\u0633\u062A\u062E\u062F\u0645") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u062E\u062F\u0645")} size="md">
        <div className="space-y-4">
          <Input label={i18n.t("\u0627\u0644\u0627\u0633\u0645")} value={formData.name} onChange={e => setFormData({
          ...formData,
          name: e.target.value
        })} required />
          <Input label={i18n.t("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A")} type="email" value={formData.email} onChange={e => setFormData({
          ...formData,
          email: e.target.value
        })} required />
          <Input label={selectedUser ? i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 (\u0627\u062A\u0631\u0643\u0647\u0627 \u0641\u0627\u0631\u063A\u0629 \u0625\u0630\u0627 \u0644\u0627 \u062A\u0631\u064A\u062F \u062A\u063A\u064A\u064A\u0631\u0647\u0627)") : i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")} type="password" value={formData.password} onChange={e => setFormData({
          ...formData,
          password: e.target.value
        })} required={!selectedUser} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062F\u0648\u0631")}</label>
            <select value={formData.role} onChange={e => setFormData({
            ...formData,
            role: e.target.value
          })} className="input-field w-full">
              {roles.map(r => <option key={r.value} value={r.value}>{roleMap[r.value]?.label || r.label}</option>)}
            </select>
          </div>
          <Input label={i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641")} value={formData.phone} onChange={e => setFormData({
          ...formData,
          phone: e.target.value
        })} />
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button onClick={handleSave} className="flex-1">{i18n.t("\u062D\u0641\u0638")}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }} title={i18n.t("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641")} size="sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-danger" />
          </div>
          <p className="text-gray-600 mb-6">{i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645")}<span className="font-bold text-gray-900"> "{userToDelete?.name}" </span>{i18n.t("\u061F")}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">{i18n.t("\u062D\u0630\u0641")}</Button>
          </div>
        </div>
      </Modal>
    </div>;
}