import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList, Search, Filter, Download, ChevronLeft, ChevronRight, Eye, Plus, History, User, Calendar, RefreshCw, FileSpreadsheet, Server } from 'lucide-react';
import { auditApi } from '../../api/endpoints/audit';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import { formatDateTime, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
const actionColors = {
  CREATE: {
    label: i18n.t("\u0625\u0646\u0634\u0627\u0621"),
    bg: 'bg-green-100',
    text: 'text-green-700'
  },
  UPDATE: {
    label: i18n.t("\u062A\u0639\u062F\u064A\u0644"),
    bg: 'bg-blue-100',
    text: 'text-blue-700'
  },
  DELETE: {
    label: i18n.t("\u062D\u0630\u0641"),
    bg: 'bg-red-100',
    text: 'text-red-700'
  }
};
const entityLabels = {
  Player: i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628"),
  Injury: i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A"),
  Vital: i18n.t("\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629"),
  Rehabilitation: i18n.t("\u0627\u0644\u062A\u0623\u0647\u064A\u0644"),
  Equipment: i18n.t("\u0627\u0644\u0645\u0639\u062F\u0627\u062A"),
  Supply: i18n.t("\u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A"),
  Appointment: i18n.t("\u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F"),
  Performance: i18n.t("\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0623\u062F\u0627\u0621"),
  User: i18n.t("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646"),
  Club: i18n.t("\u0627\u0644\u0646\u0627\u062F\u064A"),
  BodyMeasurement: i18n.t("\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u0645"),
  SupplyTransaction: i18n.t("\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A"),
  EquipmentMaintenance: i18n.t("\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0639\u062F\u0627\u062A"),
  FileRecord: i18n.t("\u0627\u0644\u0645\u0644\u0641\u0627\u062A")
};
const actionOptions = [{
  value: '',
  label: i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A")
}, {
  value: 'CREATE',
  label: i18n.t("\u0625\u0646\u0634\u0627\u0621")
}, {
  value: 'UPDATE',
  label: i18n.t("\u062A\u0639\u062F\u064A\u0644")
}, {
  value: 'DELETE',
  label: i18n.t("\u062D\u0630\u0641")
}];
export default function AuditLog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [metaData, setMetaData] = useState({
    actions: [],
    entityTypes: [],
    users: []
  });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    action: searchParams.get('action') || '',
    entity_type: searchParams.get('entity_type') || '',
    user_id: searchParams.get('user_id') || '',
    start_date: searchParams.get('start_date') || '',
    end_date: searchParams.get('end_date') || ''
  });
  const [expandedLog, setExpandedLog] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fetchMeta = useCallback(async () => {
    try {
      const response = await auditApi.getMeta();
      if (response.data.success) {
        setMetaData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching meta:', error);
    }
  }, []);
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: 20,
        search: filters.search,
        action: filters.action,
        entity_type: filters.entity_type,
        user_id: filters.user_id,
        start_date: filters.start_date,
        end_date: filters.end_date
      };
      const response = await auditApi.getAll(params);
      if (response.data.success) {
        setLogs(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0633\u062C\u0644 \u0627\u0644\u0646\u0634\u0627\u0637"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
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
  const handleViewDetails = async log => {
    setExpandedLog(log);
    setIsDetailsModalOpen(true);
  };
  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await auditApi.export({
        start_date: filters.start_date,
        end_date: filters.end_date
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(i18n.t("\u062A\u0645 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0633\u062C\u0644 \u0628\u0646\u062C\u0627\u062D"));
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0633\u062C\u0644"));
    } finally {
      setExporting(false);
    }
  };
  const renderLogRow = log => {
    const actionInfo = actionColors[log.action] || {
      label: log.action,
      bg: 'bg-gray-100',
      text: 'text-gray-700'
    };
    const entityLabel = entityLabels[log.entity_type] || log.entity_type;
    return <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
        <td className="py-4 px-4">
          <div className="text-sm text-gray-500 font-numbers">
            {formatDateTime(log.created_at)}
          </div>
        </td>

        <td className="py-4 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-gray-900">{log.user_name || '—'}</span>
          </div>
        </td>

        <td className="py-4 px-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${actionInfo.bg} ${actionInfo.text}`}>
            {actionInfo.label}
          </span>
        </td>

        <td className="py-4 px-4">
          <span className="font-medium text-gray-900">{entityLabel}</span>
        </td>

        <td className="py-4 px-4">
          <div className="text-sm text-gray-600 font-numbers">
            {log.ip_address || '—'}
          </div>
        </td>

        <td className="py-4 px-4">
          <button onClick={() => handleViewDetails(log)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors" title={i18n.t("\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644")}>
            <Eye className="w-4 h-4" />
          </button>
        </td>
      </tr>;
  };
  if (!loading && logs.length === 0 && Object.values(filters).every(v => !v)) {
    return <div className="animate-fade-in">
        <PageHeader title={<div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-primary" />
              <span>{i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0646\u0634\u0627\u0637")}</span>
            </div>} subtitle={i18n.t("\u0633\u062C\u0644 \u0643\u0627\u0645\u0644 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0646\u0638\u0627\u0645")} />
        
        <div className="card text-center py-16">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t("\u0644\u0627 \u064A\u0648\u062C\u062F \u0633\u062C\u0644 \u0646\u0634\u0627\u0637")}</h3>
          <p className="text-gray-500 mb-6">{i18n.t("\u0633\u064A\u0638\u0647\u0631 \u0633\u062C\u0644 \u0627\u0644\u0646\u0634\u0627\u0637 \u0647\u0646\u0627 \u0639\u0646\u062F\u0645\u0627 \u062A\u0642\u0648\u0645 \u0628\u0639\u0645\u0644\u064A\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0646\u0638\u0627\u0645")}</p>
        </div>
      </div>;
  }
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-primary" />
            <span>{i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0646\u0634\u0627\u0637")}</span>
            <span className="text-sm font-normal text-gray-500">({meta.total})</span>
          </div>} subtitle={i18n.t("\u0633\u062C\u0644 \u0643\u0627\u0645\u0644 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0646\u0638\u0627\u0645")}>
        <Button variant="outline" onClick={handleExport} disabled={exporting || meta.total === 0} className="gap-2">
          {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}{i18n.t("\u062A\u0635\u062F\u064A\u0631 CSV")}</Button>
      </PageHeader>

      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder={i18n.t("\u0627\u0644\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0646\u0648\u0639...")} value={filters.search} onChange={e => setFilters(prev => ({
              ...prev,
              search: e.target.value
            }))} className="pr-10" />
            </div>
          </form>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.action} onChange={e => handleFilterChange('action', e.target.value)} className="input-field pr-10 min-w-[140px] appearance-none cursor-pointer">
                {actionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            <div className="relative">
              <Server className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.entity_type} onChange={e => handleFilterChange('entity_type', e.target.value)} className="input-field pr-10 min-w-[160px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0643\u064A\u0627\u0646\u0627\u062A")}</option>
                {metaData.entityTypes.map(type => <option key={type} value={type}>
                    {entityLabels[type] || type}
                  </option>)}
              </select>
            </div>

            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={filters.user_id} onChange={e => handleFilterChange('user_id', e.target.value)} className="input-field pr-10 min-w-[140px] appearance-none cursor-pointer">
                <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646")}</option>
                {metaData.users.map(user => <option key={user.user_id} value={user.user_id}>
                    {user.user_name}
                  </option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input type="date" value={filters.start_date} onChange={e => handleFilterChange('start_date', e.target.value)} className="input-field pr-10 min-w-[140px]" placeholder={i18n.t("\u0645\u0646 \u062A\u0627\u0631\u064A\u062E")} />
              </div>
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
                  <td className="py-4 px-4"><Skeleton className="w-32 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-24 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-16 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-20 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-24 h-5" /></td>
                  <td className="py-4 px-4"><Skeleton className="w-8 h-8" /></td>
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
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0625\u062C\u0631\u0627\u0621")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u0643\u064A\u0627\u0646")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0639\u0646\u0648\u0627\u0646 IP")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">{i18n.t("\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644")}</th>
                  </tr>
                </thead>
                <tbody>{logs.map(renderLogRow)}</tbody>
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
      setExpandedLog(null);
    }} title={i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0646\u0634\u0627\u0637")} size="lg">
        {expandedLog && <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0644\u0648\u0642\u062A")}</p>
                <p className="font-medium">{formatDateTime(expandedLog.created_at)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645")}</p>
                <p className="font-medium">{expandedLog.user_name || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0627\u0644\u0625\u062C\u0631\u0627\u0621")}</p>
                {(() => {
              const info = actionColors[expandedLog.action] || {
                label: expandedLog.action,
                bg: 'bg-gray-100',
                text: 'text-gray-700'
              };
              return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${info.bg} ${info.text}`}>
                      {info.label}
                    </span>;
            })()}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0627\u0644\u0643\u064A\u0627\u0646")}</p>
                <p className="font-medium">{entityLabels[expandedLog.entity_type] || expandedLog.entity_type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0639\u0646\u0648\u0627\u0646 IP")}</p>
                <p className="font-medium font-numbers">{expandedLog.ip_address || '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0645\u0639\u0631\u0641 \u0627\u0644\u0633\u062C\u0644")}</p>
                <p className="font-medium font-numbers">#{expandedLog.id}</p>
              </div>
            </div>

            {expandedLog.new_values && Object.keys(expandedLog.new_values).length > 0 && <div>
                <h4 className="font-semibold text-gray-900 mb-3">{i18n.t("\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629")}</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm font-numbers whitespace-pre-wrap">
                    {JSON.stringify(expandedLog.new_values, null, 2)}
                  </pre>
                </div>
              </div>}

            {expandedLog.old_values && Object.keys(expandedLog.old_values).length > 0 && <div>
                <h4 className="font-semibold text-gray-900 mb-3">{i18n.t("\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0642\u062F\u064A\u0645\u0629")}</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <pre className="text-sm font-numbers whitespace-pre-wrap">
                    {JSON.stringify(expandedLog.old_values, null, 2)}
                  </pre>
                </div>
              </div>}
          </div>}
      </Modal>
    </div>;
}