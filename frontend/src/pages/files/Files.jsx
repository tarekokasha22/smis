import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FolderOpen, Upload, Search, Filter, Grid, List, Download, Trash2, Edit2, Eye, FileText, Image, Film, Archive, File, Lock, Unlock, X, Plus, ChevronLeft, ChevronRight, User, Calendar, HardDrive, Tag, AlertTriangle, CheckCircle2, CloudUpload, RefreshCw } from 'lucide-react';
import { filesApi } from '../../api/endpoints/files';
import { playersApi } from '../../api/endpoints/players';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import useAuthStore from '../../store/authStore';
dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');

// ==========================================
// ثوابت وأدوات مساعدة
// ==========================================
const FILE_TYPES = {
  xray: {
    label: i18n.t("\u0623\u0634\u0639\u0629 \u0633\u064A\u0646\u064A\u0629"),
    color: 'bg-purple-100 text-purple-700',
    icon: Image
  },
  mri: {
    label: i18n.t("\u0631\u0646\u064A\u0646 \u0645\u063A\u0646\u0627\u0637\u064A\u0633\u064A"),
    color: 'bg-blue-100 text-blue-700',
    icon: Image
  },
  scan: {
    label: i18n.t("\u0645\u0633\u062D \u0636\u0648\u0626\u064A"),
    color: 'bg-cyan-100 text-cyan-700',
    icon: Image
  },
  report: {
    label: i18n.t("\u062A\u0642\u0631\u064A\u0631 \u0637\u0628\u064A"),
    color: 'bg-green-100 text-green-700',
    icon: FileText
  },
  contract: {
    label: i18n.t("\u0639\u0642\u062F"),
    color: 'bg-yellow-100 text-yellow-700',
    icon: FileText
  },
  lab: {
    label: i18n.t("\u0646\u062A\u0627\u0626\u062C \u0645\u062E\u0628\u0631\u064A\u0629"),
    color: 'bg-orange-100 text-orange-700',
    icon: FileText
  },
  other: {
    label: i18n.t("\u0623\u062E\u0631\u0649"),
    color: 'bg-gray-100 text-gray-700',
    icon: File
  }
};
const MIME_ICONS = {
  'image/': {
    icon: Image,
    color: 'text-purple-500',
    bg: 'bg-purple-50'
  },
  'video/': {
    icon: Film,
    color: 'text-pink-500',
    bg: 'bg-pink-50'
  },
  'application/pdf': {
    icon: FileText,
    color: 'text-red-500',
    bg: 'bg-red-50'
  },
  'application/zip': {
    icon: Archive,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50'
  },
  'application/vnd.ms-excel': {
    icon: FileText,
    color: 'text-green-600',
    bg: 'bg-green-50'
  },
  'application/vnd.openxmlformats': {
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  default: {
    icon: File,
    color: 'text-gray-500',
    bg: 'bg-gray-50'
  }
};
function getFileIcon(mimeType) {
  if (!mimeType) return MIME_ICONS.default;
  if (mimeType.startsWith('image/')) return MIME_ICONS['image/'];
  if (mimeType.startsWith('video/')) return MIME_ICONS['video/'];
  const entry = Object.entries(MIME_ICONS).find(([key]) => mimeType.startsWith(key));
  return entry ? entry[1] : MIME_ICONS.default;
}
function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function isImageFile(mimeType) {
  return mimeType && mimeType.startsWith('image/');
}
function isPdfFile(mimeType) {
  return mimeType === 'application/pdf';
}

// ==========================================
// نافذة رفع ملف جديد
// ==========================================
function UploadModal({
  isOpen,
  onClose,
  onSuccess,
  players
}) {
  const [form, setForm] = useState({
    player_id: '',
    file_type: 'other',
    description: '',
    tags: '',
    is_confidential: false,
    custom_name: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      setForm({
        player_id: '',
        file_type: 'other',
        description: '',
        tags: '',
        is_confidential: false,
        custom_name: ''
      });
      setSelectedFile(null);
      setProgress(0);
    }
  }, [isOpen]);
  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error(i18n.t("\u0627\u0644\u0631\u062C\u0627\u0621 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0644\u0641"));
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'custom_name') return; // handled separately
      if (v !== '' && v !== null) formData.append(k, v.toString());
    });
    if (form.custom_name.trim()) {
      formData.append('file_name', form.custom_name.trim());
    }
    setUploading(true);
    setProgress(0);
    try {
      await filesApi.upload(formData, progressEvent => {
        const pct = Math.round(progressEvent.loaded * 100 / progressEvent.total);
        setProgress(pct);
      });
      toast.success(i18n.t("\u062A\u0645 \u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641 \u0628\u0646\u062C\u0627\u062D"));
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("\u0641\u0634\u0644 \u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641"));
    } finally {
      setUploading(false);
    }
  };
  const uploadFooter = <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={uploading}>{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
      <Button form="upload-form" type="submit" loading={uploading} className="flex-1 gap-2" disabled={!selectedFile}>
        <CloudUpload className="w-4 h-4" />{i18n.t("\u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641")}</Button>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={i18n.t("\u0631\u0641\u0639 \u0645\u0644\u0641 \u062C\u062F\u064A\u062F")} size="lg" footer={uploadFooter}>
      <form id="upload-form" onSubmit={handleSubmit} className="space-y-4">
        {/* منطقة الإسقاط */}
        <div onDrop={handleDrop} onDragOver={e => {
        e.preventDefault();
        setIsDragging(true);
      }} onDragLeave={() => setIsDragging(false)} onClick={() => !selectedFile && fileInputRef.current?.click()} className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary-50 scale-[1.01]' : selectedFile ? 'border-success bg-success-light' : 'border-gray-200 hover:border-primary hover:bg-gray-50'}`}>
          <input ref={fileInputRef} type="file" className="hidden" onChange={e => setSelectedFile(e.target.files[0])} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.mp4,.avi,.zip" />
          {selectedFile ? <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-10 h-10 text-success" />
              <p className="font-bold text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              <button type="button" onClick={e => {
            e.stopPropagation();
            setSelectedFile(null);
          }} className="text-xs text-danger hover:underline mt-1">{i18n.t("\u0625\u0632\u0627\u0644\u0629 \u0627\u0644\u0645\u0644\u0641")}</button>
            </div> : <div className="flex flex-col items-center gap-3">
              <CloudUpload className={`w-12 h-12 ${isDragging ? 'text-primary' : 'text-gray-300'}`} />
              <div>
                <p className="font-semibold text-gray-700">{i18n.t("\u0627\u0633\u062D\u0628 \u0627\u0644\u0645\u0644\u0641 \u0647\u0646\u0627 \u0623\u0648 \u0627\u0646\u0642\u0631 \u0644\u0644\u0627\u062E\u062A\u064A\u0627\u0631")}</p>
                <p className="text-xs text-gray-400 mt-1">{i18n.t("PDF, \u0635\u0648\u0631, Word, Excel, \u0641\u064A\u062F\u064A\u0648, ZIP \u2022 \u062D\u062F 50 MB")}</p>
              </div>
            </div>}
        </div>

        {/* شريط التقدم */}
        {uploading && <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{i18n.t("\u062C\u0627\u0631\u064D \u0627\u0644\u0631\u0641\u0639...")}</span>
              <span className="font-numbers">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{
            width: `${progress}%`
          }} />
            </div>
          </div>}

        {/* اسم الملف المخصص */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)")}</label>
          <input type="text" value={form.custom_name} onChange={e => setForm({
          ...form,
          custom_name: e.target.value
        })} className="input-field" placeholder={i18n.t("\u0627\u062A\u0631\u0643\u0647 \u0641\u0627\u0631\u063A\u0627\u064B \u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0623\u0635\u0644\u064A...")} />
          <p className="text-xs text-gray-400 mt-0.5">{i18n.t("\u064A\u0645\u0643\u0646\u0643 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0639\u0631\u0628\u064A \u0644\u0644\u0645\u0644\u0641")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* اللاعب */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 \u0627\u0644\u0645\u0631\u062A\u0628\u0637")}</label>
            <select value={form.player_id} onChange={e => setForm({
            ...form,
            player_id: e.target.value
          })} className="input-field">
              <option value="">{i18n.t("\u0645\u0644\u0641 \u0639\u0627\u0645 (\u063A\u064A\u0631 \u0645\u0631\u062A\u0628\u0637 \u0628\u0644\u0627\u0639\u0628)")}</option>
              {players.map(p => <option key={p.id} value={p.id}>#{p.number} - {p.name}</option>)}
            </select>
          </div>

          {/* نوع الملف */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0641")}</label>
            <select value={form.file_type} onChange={e => setForm({
            ...form,
            file_type: e.target.value
          })} className="input-field">
              {Object.entries(FILE_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>
        </div>

        {/* الوصف */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0648\u0635\u0641 \u0627\u0644\u0645\u0644\u0641")}</label>
          <textarea value={form.description} onChange={e => setForm({
          ...form,
          description: e.target.value
        })} className="input-field resize-none h-16" placeholder={i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644 \u062D\u0648\u0644 \u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0644\u0641...")} />
        </div>

        {/* الوسوم */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            <Tag className="w-3.5 h-3.5 inline ml-1" />{i18n.t("\u0627\u0644\u0648\u0633\u0648\u0645 (tags)")}</label>
          <input type="text" value={form.tags} onChange={e => setForm({
          ...form,
          tags: e.target.value
        })} className="input-field" placeholder={i18n.t("\u0631\u0643\u0628\u0629, \u0625\u0635\u0627\u0628\u0629, MRI (\u0627\u0641\u0635\u0644 \u0628\u0641\u0627\u0635\u0644\u0629)")} />
        </div>

        {/* سري */}
        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 border border-gray-200">
          <input type="checkbox" checked={form.is_confidential} onChange={e => setForm({
          ...form,
          is_confidential: e.target.checked
        })} className="w-4 h-4 rounded accent-danger" />
          <div>
            <p className="font-semibold text-gray-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-danger" />{i18n.t("\u0645\u0644\u0641 \u0633\u0631\u064A \u0648\u0645\u0642\u064A\u0651\u062F")}</p>
            <p className="text-xs text-gray-500">{i18n.t("\u0644\u0646 \u064A\u0638\u0647\u0631 \u0647\u0630\u0627 \u0627\u0644\u0645\u0644\u0641 \u0625\u0644\u0627 \u0644\u0644\u0623\u0637\u0628\u0627\u0621 \u0648\u0627\u0644\u0645\u062F\u064A\u0631\u064A\u0646")}</p>
          </div>
        </label>

      </form>
    </Modal>;
}

// ==========================================
// نافذة تعديل الملف
// ==========================================
function EditModal({
  isOpen,
  onClose,
  file,
  onSuccess,
  players
}) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (isOpen && file) {
      setForm({
        file_name: file.file_name,
        player_id: file.player_id || '',
        file_type: file.file_type || 'other',
        description: file.description || '',
        tags: file.tags || '',
        is_confidential: file.is_confidential || false
      });
    }
  }, [isOpen, file]);
  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      await filesApi.update(file.id, form);
      toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0644\u0641 \u0628\u0646\u062C\u0627\u062D"));
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(i18n.t("\u0641\u0634\u0644 \u0627\u0644\u062A\u062D\u062F\u064A\u062B"));
    } finally {
      setSaving(false);
    }
  };
  if (!file) return null;
  const editFooter = <div className="flex gap-3">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
      <Button form="edit-file-form" type="submit" loading={saving} className="flex-1">{i18n.t("\u062D\u0641\u0638 \u0627\u0644\u062A\u0639\u062F\u064A\u0644\u0627\u062A")}</Button>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0644\u0641")} size="md" footer={editFooter}>
      <form id="edit-file-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641")}</label>
          <input type="text" value={form.file_name || ''} onChange={e => setForm({
          ...form,
          file_name: e.target.value
        })} className="input-field" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628 \u0627\u0644\u0645\u0631\u062A\u0628\u0637")}</label>
            <select value={form.player_id || ''} onChange={e => setForm({
            ...form,
            player_id: e.target.value
          })} className="input-field">
              <option value="">{i18n.t("\u0645\u0644\u0641 \u0639\u0627\u0645")}</option>
              {players.map(p => <option key={p.id} value={p.id}>#{p.number} - {p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0641")}</label>
            <select value={form.file_type || 'other'} onChange={e => setForm({
            ...form,
            file_type: e.target.value
          })} className="input-field">
              {Object.entries(FILE_TYPES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0648\u0635\u0641")}</label>
          <textarea value={form.description || ''} onChange={e => setForm({
          ...form,
          description: e.target.value
        })} className="input-field resize-none h-16" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0648\u0633\u0648\u0645")}</label>
          <input type="text" value={form.tags || ''} onChange={e => setForm({
          ...form,
          tags: e.target.value
        })} className="input-field" placeholder="tag1, tag2" />
        </div>

        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 border border-gray-200">
          <input type="checkbox" checked={form.is_confidential || false} onChange={e => setForm({
          ...form,
          is_confidential: e.target.checked
        })} className="w-4 h-4 rounded accent-danger" />
          <span className="font-semibold text-gray-800 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-danger" />{i18n.t("\u0633\u0631\u064A \u0648\u0645\u0642\u064A\u0651\u062F")}</span>
        </label>

      </form>
    </Modal>;
}

// ==========================================
// نافذة معاينة الملف
// ==========================================
function PreviewModal({
  isOpen,
  onClose,
  file,
  canEdit,
  canDelete,
  setDeleteFile
}) {
  if (!isOpen || !file) return null;
  const backendBase = '';
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-white/60" />
            <span className="text-white font-medium text-sm truncate max-w-xs">{file.file_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${backendBase}${file.file_path}`} download={file.file_name} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />{i18n.t("\u062A\u062D\u0645\u064A\u0644")}</a>
            {canDelete && <button onClick={() => {
            onClose();
            setDeleteFile(file);
          }} className="flex items-center gap-1.5 text-xs text-danger hover:text-white bg-danger/10 hover:bg-danger/80 px-3 py-1.5 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5" />{i18n.t("\u062D\u0630\u0641")}</button>}
            <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          {isImageFile(file.mime_type) ? <img src={`${backendBase}${file.file_path}`} alt={file.file_name} className="max-w-full max-h-full object-contain rounded-lg" onError={e => {
          e.target.style.display = 'none';
        }} /> : isPdfFile(file.mime_type) ? <iframe src={`${backendBase}${file.file_path}`} title={file.file_name} className="w-full h-[70vh] rounded-lg bg-white" /> : <div className="text-center text-white/60 py-20">
              <File className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium text-white/80">{file.file_name}</p>
              <p className="text-sm mt-2 mb-6">{i18n.t("\u0644\u0627 \u064A\u0645\u0643\u0646 \u0645\u0639\u0627\u064A\u0646\u0629 \u0647\u0630\u0627 \u0627\u0644\u0646\u0648\u0639 \u0645\u0646 \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0645\u0628\u0627\u0634\u0631\u0629")}</p>
              <a href={`${backendBase}${file.file_path}`} download={file.file_name} className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                <Download className="w-4 h-4" />{i18n.t("\u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0644\u0641")}</a>
            </div>}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center gap-4 text-xs text-white/50">
          <span>{formatFileSize(file.file_size)}</span>
          <span>•</span>
          <span>{dayjs(file.created_at).format('DD/MM/YYYY - HH:mm')}</span>
          {file.uploader && <><span>•</span><span>{i18n.t("\u0631\u064F\u0641\u0639 \u0628\u0648\u0627\u0633\u0637\u0629:")}{file.uploader.name}</span></>}
        </div>
      </div>
    </div>;
}

// ==========================================
// بطاقة ملف (Grid View)
// ==========================================
function FileCard({
  file,
  canEdit,
  canDelete,
  onPreview,
  onEdit,
  onDelete
}) {
  const {
    icon: Icon,
    color: iconColor,
    bg: iconBg
  } = getFileIcon(file.mime_type);
  const typeInfo = FILE_TYPES[file.file_type] || FILE_TYPES.other;
  const tags = file.tags ? file.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  return <div className="card group hover:shadow-lg transition-all duration-300 flex flex-col gap-3 relative overflow-hidden">
      {/* شارة السري */}
      {file.is_confidential && <div className="absolute top-3 left-3 z-10">
          <span className="flex items-center gap-1 text-[10px] font-bold text-danger bg-danger-light px-1.5 py-0.5 rounded-full border border-danger/20">
            <Lock className="w-2.5 h-2.5" />{i18n.t("\u0633\u0631\u064A")}</span>
        </div>}

      {/* أيقونة الملف / معاينة */}
      <div className={`relative h-32 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden ${iconBg} border border-gray-100`} onClick={() => onPreview(file)}>
        {isImageFile(file.mime_type) ? <img src={file.file_path} alt={file.file_name} className="w-full h-full object-cover" onError={e => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }} /> : null}
        <div className={`${isImageFile(file.mime_type) ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
          <Icon className={`w-14 h-14 ${iconColor} opacity-70`} />
        </div>
        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />{i18n.t("\u0645\u0639\u0627\u064A\u0646\u0629")}</span>
        </div>
      </div>

      {/* اسم الملف */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate" title={file.file_name}>
          {file.file_name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          <span className="text-[10px] text-gray-400 font-numbers">{formatFileSize(file.file_size)}</span>
        </div>
      </div>

      {/* بيانات اللاعب */}
      {file.player && <Link to={`/players/${file.player.id}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-primary transition-colors bg-gray-50 p-2 rounded-lg">
          <User className="w-3.5 h-3.5" />
          <span className="font-medium truncate">{file.player.name}</span>
          <span className="text-gray-400 font-numbers">#{file.player.number}</span>
        </Link>}

      {/* الوسوم */}
      {tags.length > 0 && <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, i) => <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              #{tag}
            </span>)}
          {tags.length > 3 && <span className="text-[10px] text-gray-400">+{tags.length - 3}</span>}
        </div>}

      {/* التاريخ وأزرار */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-[11px] text-gray-400 font-numbers flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {dayjs(file.created_at).format('DD/MM/YYYY')}
        </span>
        <div className="flex items-center gap-1">
          <a href={file.file_path} download={file.file_name} target="_blank" rel="noreferrer" className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-info hover:bg-info-light transition-colors" title={i18n.t("\u062A\u062D\u0645\u064A\u0644")}>
            <Download className="w-3.5 h-3.5" />
          </a>
          {canEdit && <button onClick={() => onEdit(file)} className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}>
              <Edit2 className="w-3.5 h-3.5" />
            </button>}
          {canDelete && <button onClick={() => onDelete(file)} className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-danger hover:bg-danger-light transition-colors" title={i18n.t("\u062D\u0630\u0641")}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>}
        </div>
      </div>
    </div>;
}

// ==========================================
// صف الملف في القائمة (List View)
// ==========================================
function FileRow({
  file,
  canEdit,
  canDelete,
  onPreview,
  onEdit,
  onDelete
}) {
  const {
    icon: Icon,
    color: iconColor,
    bg: iconBg
  } = getFileIcon(file.mime_type);
  const typeInfo = FILE_TYPES[file.file_type] || FILE_TYPES.other;
  return <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      {/* اسم الملف */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="min-w-0">
            <button onClick={() => onPreview(file)} className="font-semibold text-gray-900 hover:text-primary transition-colors text-sm text-right truncate block max-w-[200px]" title={file.file_name}>
              {file.file_name}
            </button>
            <div className="flex items-center gap-2 mt-0.5">
              {file.is_confidential && <Lock className="w-3 h-3 text-danger flex-shrink-0" />}
              <span className="text-[11px] text-gray-400 font-numbers">{formatFileSize(file.file_size)}</span>
            </div>
          </div>
        </div>
      </td>

      {/* النوع */}
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
      </td>

      {/* اللاعب */}
      <td className="px-4 py-3">
        {file.player ? <Link to={`/players/${file.player.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
            <Avatar src={file.player.avatar_url} name={file.player.name} size="xs" />
            <span className="text-sm text-gray-700 font-medium">{file.player.name}</span>
          </Link> : <span className="text-sm text-gray-400">—</span>}
      </td>

      {/* رُفع بواسطة */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600">{file.uploader?.name || '—'}</span>
      </td>

      {/* التاريخ */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-500 font-numbers">{dayjs(file.created_at).format('DD/MM/YYYY')}</span>
      </td>

      {/* الإجراءات */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => onPreview(file)} className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors" title={i18n.t("\u0645\u0639\u0627\u064A\u0646\u0629")}>
            <Eye className="w-4 h-4" />
          </button>
          <a href={file.file_path} download={file.file_name} target="_blank" rel="noreferrer" className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-info hover:bg-info-light transition-colors" title={i18n.t("\u062A\u062D\u0645\u064A\u0644")}>
            <Download className="w-4 h-4" />
          </a>
          {canEdit && <button onClick={() => onEdit(file)} className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors" title={i18n.t("\u062A\u0639\u062F\u064A\u0644")}>
              <Edit2 className="w-4 h-4" />
            </button>}
          {canDelete && <button onClick={() => onDelete(file)} className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-danger hover:bg-danger-light transition-colors" title={i18n.t("\u062D\u0630\u0641")}>
              <Trash2 className="w-4 h-4" />
            </button>}
        </div>
      </td>
    </tr>;
}

// ==========================================
// الصفحة الرئيسية
// ==========================================
export default function Files() {
  const {
    hasRole
  } = useAuthStore();
  const canEdit = hasRole(['super_admin', 'club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']);
  const canDelete = hasRole(['super_admin', 'club_admin', 'doctor', 'manager']);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    player_id: searchParams.get('player_id') || '',
    file_type: searchParams.get('file_type') || ''
  });

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFile, setEditFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteFile, setDeleteFile] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: parseInt(searchParams.get('page')) || 1,
        limit: viewMode === 'grid' ? 16 : 20,
        ...filters
      };
      const [filesRes, statsRes, playersRes] = await Promise.all([filesApi.getAll(params), filesApi.getStats(), playersApi.getAll({
        limit: 500
      })]);
      if (filesRes.data.success) {
        setFiles(filesRes.data.data);
        setMeta(filesRes.data.meta);
      }
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (playersRes.data.success) setPlayers(playersRes.data.data);
    } catch (error) {
      toast.error(i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters, viewMode]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (value) newParams.set(key, value);else newParams.delete(key);
    setSearchParams(newParams);
  };
  const handleDeleteConfirm = async () => {
    if (!deleteFile) return;
    setDeleting(true);
    try {
      await filesApi.delete(deleteFile.id);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0644\u0641 \u0628\u0646\u062C\u0627\u062D"));
      setDeleteFile(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("\u0641\u0634\u0644 \u0627\u0644\u062D\u0630\u0641"));
    } finally {
      setDeleting(false);
    }
  };
  const totalSize = stats?.totalSize || 0;
  const totalFiles = stats?.totalFiles || 0;
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <FolderOpen className="w-7 h-7 text-primary" />
            <span>{i18n.t("\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631")}</span>
          </div>} subtitle={i18n.t("\u0645\u0633\u062A\u0648\u062F\u0639 \u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0648\u0627\u0644\u0648\u062B\u0627\u0626\u0642 \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629 \u0628\u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0648\u0627\u0644\u0646\u0627\u062F\u064A")}>
        <div className="flex items-center gap-2">
          {/* عرض */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
              <Upload className="w-4 h-4" />{i18n.t("\u0631\u0641\u0639 \u0645\u0644\u0641")}</Button>
        </div>
      </PageHeader>

      {/* بطاقات الإحصائيات */}
      {stats && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-primary-50 to-white border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0644\u0641\u0627\u062A")}</p>
                <p className="text-2xl font-bold text-gray-900 font-numbers">{totalFiles}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="card bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0627\u0644\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0629")}</p>
                <p className="text-2xl font-bold text-gray-900 font-numbers">{formatFileSize(totalSize)}</p>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="card bg-danger-light/30 border-danger/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0645\u0644\u0641\u0627\u062A \u0633\u0631\u064A\u0629")}</p>
                <p className="text-2xl font-bold text-danger font-numbers">{stats.confidentialCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-danger" />
              </div>
            </div>
          </div>

          <div className="card bg-success-light/30 border-success/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{i18n.t("\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631")}</p>
                <p className="text-2xl font-bold text-success font-numbers">{stats.thisMonthCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <CloudUpload className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>}

      {/* شريط البحث والفلترة */}
      <div className="card mb-6 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder={i18n.t("\u0627\u0628\u062D\u062B \u0628\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641\u060C \u0627\u0644\u0648\u0635\u0641\u060C \u0627\u0644\u0648\u0633\u0648\u0645...")} value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} className="input-field pr-10" />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={filters.player_id} onChange={e => handleFilterChange('player_id', e.target.value)} className="input-field min-w-[150px]">
              <option value="">{i18n.t("\u0643\u0644 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={filters.file_type} onChange={e => handleFilterChange('file_type', e.target.value)} className="input-field min-w-[140px]">
              <option value="">{i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0646\u0648\u0627\u0639")}</option>
              {Object.entries(FILE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {(filters.search || filters.player_id || filters.file_type) && <button onClick={() => {
            setFilters({
              search: '',
              player_id: '',
              file_type: ''
            });
            setSearchParams(new URLSearchParams());
          }} className="text-xs text-danger hover:underline px-2">{i18n.t("\u0645\u0633\u062D \u0627\u0644\u0641\u0644\u0627\u062A\u0631")}</button>}
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      {loading ? viewMode === 'grid' ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div> : <div className="card">
            {[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0">
                <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                <Skeleton className="flex-1 h-4" />
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-20 h-4" />
              </div>)}
          </div> : files.length === 0 ? <div className="card text-center py-24">
          <FolderOpen className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">{i18n.t("\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u0644\u0641\u0627\u062A")}</h3>
          <p className="text-gray-400 mb-6">{i18n.t("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0645\u0644\u0641\u0627\u062A \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0645\u0639\u0627\u064A\u064A\u0631\u0643")}</p>
          {canEdit && <Button onClick={() => setIsUploadOpen(true)} className="mx-auto gap-2">
              <Upload className="w-4 h-4" />{i18n.t("\u0631\u0641\u0639 \u0623\u0648\u0644 \u0645\u0644\u0641")}</Button>}
        </div> : <>
          {/* إجمالي */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900 font-numbers">{meta.total}</span>{i18n.t("\u0645\u0644\u0641")}</p>
          </div>

          {viewMode === 'grid' ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {files.map(file => <FileCard key={file.id} file={file} canEdit={canEdit} canDelete={canDelete} onPreview={setPreviewFile} onEdit={f => {
          setEditFile(f);
          setIsEditOpen(true);
        }} onDelete={setDeleteFile} />)}
            </div> : <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-right p-4 text-xs font-bold text-gray-500">{i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0641")}</th>
                      <th className="text-right p-4 text-xs font-bold text-gray-500">{i18n.t("\u0627\u0644\u0646\u0648\u0639")}</th>
                      <th className="text-right p-4 text-xs font-bold text-gray-500">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
                      <th className="text-right p-4 text-xs font-bold text-gray-500">{i18n.t("\u0631\u064F\u0641\u0639 \u0628\u0648\u0627\u0633\u0637\u0629")}</th>
                      <th className="text-right p-4 text-xs font-bold text-gray-500">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
                      <th className="text-right p-4 text-xs font-bold text-gray-500">{i18n.t("\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map(file => <FileRow key={file.id} file={file} canEdit={canEdit} canDelete={canDelete} onPreview={setPreviewFile} onEdit={f => {
                setEditFile(f);
                setIsEditOpen(true);
              }} onDelete={setDeleteFile} />)}
                  </tbody>
                </table>
              </div>
            </div>}

          {/* الترقيم */}
          {meta.totalPages > 1 && <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={meta.page <= 1} onClick={() => {
            const p = new URLSearchParams(searchParams);
            p.set('page', String(meta.page - 1));
            setSearchParams(p);
          }}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="px-4 text-sm font-numbers font-medium text-gray-600">
                  {meta.page} / {meta.totalPages}
                </span>
                <Button variant="outline" disabled={meta.page >= meta.totalPages} onClick={() => {
            const p = new URLSearchParams(searchParams);
            p.set('page', String(meta.page + 1));
            setSearchParams(p);
          }}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>}
        </>}

      {/* Modals */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onSuccess={fetchData} players={players} />

      <EditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} file={editFile} onSuccess={fetchData} players={players} />

      <PreviewModal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} file={previewFile} canEdit={canEdit} canDelete={canDelete} setDeleteFile={setDeleteFile} />

      {/* نافذة تأكيد الحذف */}
      <Modal isOpen={!!deleteFile} onClose={() => setDeleteFile(null)} title={i18n.t("\u062D\u0630\u0641 \u0627\u0644\u0645\u0644\u0641")} size="sm">
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-danger-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-danger" />
          </div>
          <p className="text-gray-800 font-semibold mb-1">{i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u062D\u0630\u0641\u061F")}</p>
          <p className="text-sm text-gray-500 mb-6 truncate max-w-xs mx-auto" title={deleteFile?.file_name}>
            "{deleteFile?.file_name}"
          </p>
          <div className="bg-warning-light border border-warning/20 rounded-xl p-3 mb-6 text-right">
            <p className="text-xs text-warning flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{i18n.t("\u0633\u064A\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0644\u0641 \u0646\u0647\u0627\u0626\u064A\u0627\u064B \u0645\u0646 \u0627\u0644\u062E\u0627\u062F\u0645 \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621")}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteFile(null)} className="flex-1">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting} className="flex-1">{i18n.t("\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641")}</Button>
          </div>
        </div>
      </Modal>
    </div>;
}