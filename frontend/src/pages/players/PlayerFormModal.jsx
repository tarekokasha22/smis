import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { User, Phone, Activity, FileText, Calendar, Ruler, Weight, Droplet, Footprints, Upload, X, ChevronLeft, Save, UserCircle, AlertCircle, Plus, Trash2, GripVertical } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const dominantFootOptions = [{
  value: 'right',
  label: i18n.t("\u0627\u0644\u0642\u062F\u0645 \u0627\u0644\u064A\u0645\u0646\u0649")
}, {
  value: 'left',
  label: i18n.t("\u0627\u0644\u0642\u062F\u0645 \u0627\u0644\u064A\u0633\u0631\u0649")
}, {
  value: 'both',
  label: i18n.t("\u0643\u0644\u062A\u0627\u0647\u0645\u0627")
}];

// أمثلة على المراكز
const positionExamples = [i18n.t("\u062D\u0627\u0631\u0633 \u0645\u0631\u0645\u0649"), i18n.t("\u0645\u062F\u0627\u0641\u0639 \u0623\u064A\u0645\u0646"), i18n.t("\u0645\u062F\u0627\u0641\u0639 \u0623\u064A\u0633\u0631"), i18n.t("\u0642\u0644\u0628 \u062F\u0641\u0627\u0639"), i18n.t("\u0648\u0633\u0637 \u062F\u0641\u0627\u0639\u064A"), i18n.t("\u0648\u0633\u0637 \u0623\u064A\u0645\u0646"), i18n.t("\u0648\u0633\u0637 \u0623\u064A\u0633\u0631"), i18n.t("\u0648\u0633\u0637 \u0645\u0647\u0627\u062C\u0645"), i18n.t("\u0645\u0647\u0627\u062C\u0645"), i18n.t("\u062C\u0646\u0627\u062D \u0623\u064A\u0645\u0646"), i18n.t("\u062C\u0646\u0627\u062D \u0623\u064A\u0633\u0631")];
export default function PlayerFormModal({
  isOpen,
  onClose,
  player,
  onSave,
  positions
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    number: '',
    position: '',
    nationality: '',
    date_of_birth: '',
    height: '',
    weight: '',
    blood_type: '',
    dominant_foot: '',
    avatar_url: '',
    // Contact
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    // Medical history
    chronic_conditions: '',
    surgeries_history: '',
    previous_injuries: '',
    current_medications: '',
    // Contract
    contract_start: '',
    contract_end: '',
    notes: '',
    // Custom fields
    custom_fields: {}
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // للحقول الإضافية المؤقتة
  const [customFieldsList, setCustomFieldsList] = useState([]);
  const [newCustomField, setNewCustomField] = useState({
    key: '',
    value: ''
  });

  // التبويبات
  const tabs = [{
    id: 'basic',
    label: i18n.t("\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629"),
    icon: User
  }, {
    id: 'contact',
    label: i18n.t("\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644"),
    icon: Phone
  }, {
    id: 'medical',
    label: i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0637\u0628\u064A"),
    icon: Activity
  }, {
    id: 'contract',
    label: i18n.t("\u0639\u0642\u062F \u0627\u0644\u0644\u0627\u0639\u0628"),
    icon: FileText
  }];

  // تعبئة النموذج عند التعديل
  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || '',
        number: player.number || '',
        position: player.position || '',
        nationality: player.nationality || '',
        date_of_birth: player.date_of_birth || '',
        height: player.height || '',
        weight: player.weight || '',
        blood_type: player.blood_type || '',
        dominant_foot: player.dominant_foot || '',
        avatar_url: player.avatar_url || '',
        phone: player.phone || '',
        emergency_contact_name: player.emergency_contact_name || '',
        emergency_contact_phone: player.emergency_contact_phone || '',
        chronic_conditions: player.chronic_conditions || '',
        surgeries_history: player.surgeries_history || '',
        previous_injuries: player.previous_injuries || '',
        current_medications: player.current_medications || '',
        contract_start: player.contract_start || '',
        contract_end: player.contract_end || '',
        notes: player.notes || '',
        custom_fields: player.custom_fields || {}
      });
      setPreviewImage(player.avatar_url);
      // تحويل custom_fields إلى قائمة
      if (player.custom_fields) {
        setCustomFieldsList(Object.entries(player.custom_fields).map(([key, value], index) => ({
          id: index,
          key,
          value
        })));
      } else {
        setCustomFieldsList([]);
      }
    } else {
      // إعادة تعيين
      setFormData({
        name: '',
        number: '',
        position: '',
        nationality: '',
        date_of_birth: '',
        height: '',
        weight: '',
        blood_type: '',
        dominant_foot: '',
        avatar_url: '',
        phone: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        chronic_conditions: '',
        surgeries_history: '',
        previous_injuries: '',
        current_medications: '',
        contract_start: '',
        contract_end: '',
        notes: '',
        custom_fields: {}
      });
      setPreviewImage(null);
      setPhotoFile(null);
      setActiveTab('basic');
      setCustomFieldsList([]);
    }
    setErrors({});
    setNewCustomField({
      key: '',
      value: ''
    });
  }, [player, isOpen]);
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // إزالة الخطأ عند التعديل
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {
          ...prev
        };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);
  const validateForm = () => {
    const newErrors = {};

    // حقول مطلوبة
    if (!formData.name.trim()) {
      newErrors.name = i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0644\u0627\u0639\u0628 \u0645\u0637\u0644\u0648\u0628");
    }
    if (!formData.number) {
      newErrors.number = i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0642\u0645\u064A\u0635 \u0645\u0637\u0644\u0648\u0628");
    } else if (isNaN(formData.number) || formData.number < 1 || formData.number > 99) {
      newErrors.number = i18n.t("\u0631\u0642\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D (1-99)");
    }
    if (!formData.position.trim()) {
      newErrors.position = i18n.t("\u0627\u0644\u0645\u0631\u0643\u0632 \u0645\u0637\u0644\u0648\u0628");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) {
      // الانتقال للتبويب الأول يوجد به خطأ
      if (errors.name || errors.number || errors.position) {
        setActiveTab('basic');
      }
      return;
    }
    setIsSubmitting(true);
    try {
      // تحويل القيم الرقمية
      const dataToSubmit = {
        ...formData,
        number: parseInt(formData.number),
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        date_of_birth: formData.date_of_birth || null,
        blood_type: formData.blood_type || null,
        dominant_foot: formData.dominant_foot || null,
        contract_start: formData.contract_start || null,
        contract_end: formData.contract_end || null,
        custom_fields: customFieldsList.reduce((acc, field) => {
          if (field.key && field.key.trim()) {
            acc[field.key.trim()] = field.value || '';
          }
          return acc;
        }, {})
      };
      await onSave(dataToSubmit, photoFile);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // إضافة حقل مخصص جديد
  const handleAddCustomField = () => {
    if (newCustomField.key.trim()) {
      setCustomFieldsList(prev => [...prev, {
        id: Date.now(),
        key: newCustomField.key.trim(),
        value: newCustomField.value
      }]);
      setNewCustomField({
        key: '',
        value: ''
      });
    }
  };

  // حذف حقل مخصص
  const handleRemoveCustomField = id => {
    setCustomFieldsList(prev => prev.filter(field => field.id !== id));
  };

  // تعديل حقل مخصص
  const handleUpdateCustomField = (id, field, value) => {
    setCustomFieldsList(prev => prev.map(item => item.id === id ? {
      ...item,
      [field]: value
    } : item));
  };
  const renderBasicInfo = () => <div className="space-y-4">
      {/* صورة اللاعب */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Avatar src={previewImage} name={formData.name} size="2xl" className="w-28 h-28" />
          <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors shadow-lg">
            <Upload className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      {/* الاسم والرقم */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644")}<span className="text-danger">*</span>
          </label>
          <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} error={errors.name} placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0645\u062D\u0645\u062F \u0623\u062D\u0645\u062F \u0639\u0628\u062F\u0627\u0644\u0644\u0647")} icon={UserCircle} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0642\u0645\u064A\u0635")}<span className="text-danger">*</span>
          </label>
          <Input type="number" min="1" max="99" value={formData.number} onChange={e => handleChange('number', e.target.value)} error={errors.number} placeholder={i18n.t("\u0645\u062B\u0627\u0644: 10")} className="font-numbers" />
        </div>
      </div>

      {/* المركز والجنسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0645\u0631\u0643\u0632")}<span className="text-danger">*</span>
          </label>
          <Input value={formData.position} onChange={e => handleChange('position', e.target.value)} error={errors.position} placeholder={i18n.t("\u0627\u0643\u062A\u0628 \u0627\u0644\u0645\u0631\u0643\u0632...")} icon={UserCircle} />
          {/* أمثلة على المراكز */}
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs text-gray-400">{i18n.t("\u0623\u0645\u062B\u0644\u0629:")}</span>
            {positionExamples.slice(0, 6).map(pos => <button key={pos} type="button" onClick={() => handleChange('position', pos)} className="text-xs text-primary hover:underline">
                {pos}
              </button>)}
            <span className="text-xs text-gray-400">...</span>
          </div>
          {errors.position && <p className="text-danger text-xs mt-1">{errors.position}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062C\u0646\u0633\u064A\u0629")}</label>
          <Input value={formData.nationality} onChange={e => handleChange('nationality', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0633\u0639\u0648\u062F\u064A\u060C \u0645\u0635\u0631\u064A\u060C \u062C\u0632\u0627\u0626\u0631\u064A")} />
        </div>
      </div>

      {/* تاريخ الميلاد */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u064A\u0644\u0627\u062F")}</label>
        <Input type="date" value={formData.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} icon={Calendar} />
      </div>

      {/* الطول والوزن */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0637\u0648\u0644 (\u0633\u0645)")}</label>
          <Input type="number" value={formData.height} onChange={e => handleChange('height', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: 180")} icon={Ruler} className="font-numbers" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0648\u0632\u0646 (\u0643\u062C\u0645)")}</label>
          <Input type="number" value={formData.weight} onChange={e => handleChange('weight', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: 75")} icon={Weight} className="font-numbers" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0641\u0635\u064A\u0644\u0629 \u0627\u0644\u062F\u0645")}</label>
          <select value={formData.blood_type} onChange={e => handleChange('blood_type', e.target.value)} className="input-field">
            <option value="">{i18n.t("\u0627\u062E\u062A\u0631")}</option>
            {bloodTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </div>

      {/* القدم المفضلة */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0642\u062F\u0645 \u0627\u0644\u0645\u0641\u0636\u0644\u0629")}</label>
        <div className="flex gap-3">
          {dominantFootOptions.map(option => <label key={option.value} className={`flex-1 cursor-pointer rounded-lg border p-3 text-center transition-colors ${formData.dominant_foot === option.value ? 'border-primary bg-primary-50 text-primary' : 'border-gray-200 hover:border-primary/50'}`}>
              <input type="radio" name="dominant_foot" value={option.value} checked={formData.dominant_foot === option.value} onChange={e => handleChange('dominant_foot', e.target.value)} className="sr-only" />
              <div className="flex flex-col items-center gap-1">
                <Footprints className="w-5 h-5" />
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </label>)}
        </div>
      </div>

      {/* الحقول المخصصة */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0639\u0644\u0648\u0645\u0629 \u0645\u062E\u0635\u0635\u0629")}</h4>
        <div className="flex items-start gap-2 mb-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input value={newCustomField.key || ''} onChange={e => setNewCustomField(prev => ({
            ...prev,
            key: e.target.value
          }))} placeholder={i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0629 (\u0645\u062B\u0627\u0644: \u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629)")} className="text-sm" />
            <Input value={newCustomField.value || ''} onChange={e => setNewCustomField(prev => ({
            ...prev,
            value: e.target.value
          }))} placeholder={i18n.t("\u0627\u0644\u0642\u064A\u0645\u0629")} className="text-sm" onKeyPress={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomField();
            }
          }} />
          </div>
          <Button type="button" variant="outline" onClick={handleAddCustomField} disabled={!newCustomField.key || !newCustomField.key.trim()} className="gap-1 min-w-[100px]">
            <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629")}</Button>
        </div>

        {/* أمثلة */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">{i18n.t("\u0623\u0645\u062B\u0644\u0629:")}</p>
          <div className="flex flex-wrap gap-2">
            {[{
            key: i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629"),
            value: '1234567890'
          }, {
            key: i18n.t("\u0631\u0642\u0645 \u062C\u0648\u0627\u0632 \u0627\u0644\u0633\u0641\u0631"),
            value: 'A12345678'
          }, {
            key: i18n.t("\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0634\u0647\u0631\u064A"),
            value: i18n.t("15000 \u0631\u064A\u0627\u0644")
          }, {
            key: i18n.t("\u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u0639\u0645\u0631\u064A\u0629"),
            value: i18n.t("\u062A\u062D\u062A 21")
          }].map((example, idx) => <button key={idx} type="button" onClick={() => {
            setNewCustomField({
              key: example.key,
              value: ''
            });
          }} className="text-xs bg-primary-50 text-primary hover:bg-primary-100 px-2 py-1 rounded transition-colors">
                {example.key}
              </button>)}
          </div>
        </div>

        {/* عرض الحقول المخصصة المضافة */}
        {customFieldsList.length > 0 && <div className="space-y-3 mt-4 border-t border-gray-100 pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">{i18n.t("\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0636\u0627\u0641\u0629:")}</h5>
            {customFieldsList.map(field => <div key={field.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                 <GripVertical className="w-4 h-4 text-gray-400" />
                 <Input value={field.key} onChange={e => handleUpdateCustomField(field.id, 'key', e.target.value)} className="flex-1 text-sm bg-white" />
                 <Input value={field.value} onChange={e => handleUpdateCustomField(field.id, 'value', e.target.value)} className="flex-1 text-sm bg-white" />
                 <button type="button" onClick={() => handleRemoveCustomField(field.id)} className="p-2 text-gray-400 hover:text-danger hover:bg-danger-light rounded-lg transition-colors">
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>)}
          </div>}
      </div>
    </div>;
  const renderContactInfo = () => <div className="space-y-4">
      <div className="bg-info-light p-4 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <p className="text-sm text-info">{i18n.t("\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u062A\u0633\u062A\u062E\u062F\u0645 \u0644\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0637\u0627\u0631\u0626 \u0641\u064A \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A")}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641")}</label>
        <Input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: 0501234567")} icon={Phone} className="font-numbers" dir="ltr" />
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="font-semibold text-gray-900 mb-4">{i18n.t("\u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0627\u0644\u0637\u0627\u0631\u0626\u0629")}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0633\u0645 \u062C\u0647\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644")}</label>
            <Input value={formData.emergency_contact_name} onChange={e => handleChange('emergency_contact_name', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0648\u0627\u0644\u062F \u0627\u0644\u0644\u0627\u0639\u0628 - \u062E\u0627\u0644\u062F \u0623\u062D\u0645\u062F")} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 (\u0637\u0648\u0627\u0631\u0626)")}</label>
            <Input type="tel" value={formData.emergency_contact_phone} onChange={e => handleChange('emergency_contact_phone', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: 0559876543")} icon={Phone} className="font-numbers" dir="ltr" />
          </div>
        </div>
      </div>
    </div>;
  const renderMedicalHistory = () => <div className="space-y-4">
      <div className="bg-warning-light p-4 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warning">{i18n.t("\u0647\u0630\u0647 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0633\u0631\u064A\u0629 \u0648\u062A\u0633\u062A\u062E\u062F\u0645 \u0641\u0642\u0637 \u0644\u0644\u0623\u063A\u0631\u0627\u0636 \u0627\u0644\u0637\u0628\u064A\u0629")}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0623\u0645\u0631\u0627\u0636 \u0627\u0644\u0645\u0632\u0645\u0646\u0629")}</label>
        <textarea value={formData.chronic_conditions} onChange={e => handleChange('chronic_conditions', e.target.value)} placeholder={i18n.t("\u0623\u064A \u0623\u0645\u0631\u0627\u0636 \u0645\u0632\u0645\u0646\u0629 \u064A\u0639\u0627\u0646\u064A \u0645\u0646\u0647\u0627 \u0627\u0644\u0644\u0627\u0639\u0628 (\u0633\u0643\u0631\u064A\u060C \u0636\u063A\u0637\u060C \u0631\u0628\u0648\u060C \u0625\u0644\u062E)")} rows={3} className="input-field resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0631\u0627\u062D\u064A\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629")}</label>
        <textarea value={formData.surgeries_history} onChange={e => handleChange('surgeries_history', e.target.value)} placeholder={i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062C\u0631\u0627\u062D\u064A\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629 \u0645\u0639 \u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E (\u0645\u062B\u0627\u0644: \u0639\u0645\u0644\u064A\u0629 \u063A\u0636\u0631\u0648\u0641 \u0627\u0644\u0631\u0643\u0628\u0629 2022)")} rows={3} className="input-field resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0633\u0627\u0628\u0642\u0629")}</label>
        <textarea value={formData.previous_injuries} onChange={e => handleChange('previous_injuries', e.target.value)} placeholder={i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629 (\u0645\u062B\u0627\u0644: \u0627\u0644\u062A\u0648\u0627\u0621 \u0627\u0644\u0643\u0627\u062D\u0644 \u0627\u0644\u0645\u062A\u0643\u0631\u0631\u060C \u0634\u062F \u0639\u0636\u0644\u064A \u0641\u064A \u0627\u0644\u0641\u062E\u0630)")} rows={3} className="input-field resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629")}</label>
        <textarea value={formData.current_medications} onChange={e => handleChange('current_medications', e.target.value)} placeholder={i18n.t("\u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0627\u0644\u062A\u064A \u064A\u062A\u0646\u0627\u0648\u0644\u0647\u0627 \u0627\u0644\u0644\u0627\u0639\u0628 \u0628\u0634\u0643\u0644 \u0645\u0646\u062A\u0638\u0645 (\u0645\u062B\u0627\u0644: \u0641\u064A\u062A\u0627\u0645\u064A\u0646\u0627\u062A\u060C \u0645\u0643\u0645\u0644\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629)")} rows={2} className="input-field resize-none" />
      </div>
    </div>;
  const renderContractInfo = () => <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0628\u062F\u0627\u064A\u0629 \u0627\u0644\u0639\u0642\u062F")}</label>
          <Input type="date" value={formData.contract_start} onChange={e => handleChange('contract_start', e.target.value)} icon={Calendar} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0639\u0642\u062F")}</label>
          <Input type="date" value={formData.contract_end} onChange={e => handleChange('contract_end', e.target.value)} icon={Calendar} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629")}</label>
        <textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} placeholder={i18n.t("\u0623\u064A \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0637\u0628\u064A\u0629 \u0623\u0648 \u0625\u062F\u0627\u0631\u064A\u0629 \u0625\u0636\u0627\u0641\u064A\u0629 (\u0645\u062B\u0627\u0644: \u064A\u062D\u062A\u0627\u062C \u0644\u0645\u0648\u0639\u062F \u0637\u0628\u064A \u0634\u0647\u0631\u064A\u060C \u0645\u0645\u0646\u0648\u0639 \u0645\u0646 \u0627\u0644\u0645\u062C\u0647\u0648\u062F \u0627\u0644\u0639\u0627\u0644\u064A)")} rows={4} className="input-field resize-none" />
      </div>

      {/* معلومات العقد */}
      {formData.contract_start && formData.contract_end && <div className="bg-primary-50 p-4 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">{i18n.t("\u0645\u062F\u0629 \u0627\u0644\u0639\u0642\u062F")}</h4>
          <p className="text-sm text-gray-600">
            {Math.ceil((new Date(formData.contract_end) - new Date(formData.contract_start)) / (1000 * 60 * 60 * 24 * 30))}{i18n.t("\u0634\u0647\u0631")}</p>
        </div>}
    </div>;
  const renderCustomFields = () => <div className="space-y-4">
      <div className="bg-primary-50 p-4 rounded-lg mb-4">
        <div className="flex items-start gap-3">
          <Plus className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-700 font-medium">{i18n.t("\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u0645\u062E\u0635\u0635\u0629")}</p>
            <p className="text-xs text-gray-500 mt-1">{i18n.t("\u0623\u0636\u0641 \u0623\u064A \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u062A\u062D\u062A\u0627\u062C\u0647\u0627 \u0639\u0646 \u0627\u0644\u0644\u0627\u0639\u0628 (\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629\u060C \u0631\u0642\u0645 \u062C\u0648\u0627\u0632 \u0627\u0644\u0633\u0641\u0631\u060C \u0627\u0644\u0631\u0627\u062A\u0628\u060C \u0625\u0644\u062E)")}</p>
          </div>
        </div>
      </div>

      {/* قائمة الحقول المخصصة */}
      {customFieldsList.length > 0 && <div className="space-y-3">
          {customFieldsList.map((field, index) => <div key={field.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input value={field.key} onChange={e => handleUpdateCustomField(field.id, 'key', e.target.value)} placeholder={i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0629 (\u0645\u062B\u0627\u0644: \u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629)")} className="text-sm" />
                <Input value={field.value} onChange={e => handleUpdateCustomField(field.id, 'value', e.target.value)} placeholder={i18n.t("\u0627\u0644\u0642\u064A\u0645\u0629 (\u0645\u062B\u0627\u0644: 1234567890)")} className="text-sm" />
              </div>
              <button type="button" onClick={() => handleRemoveCustomField(field.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-danger hover:bg-danger-light transition-colors" title={i18n.t("\u062D\u0630\u0641")}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>)}
        </div>}

      {/* إضافة حقل جديد */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0645\u0639\u0644\u0648\u0645\u0629 \u062C\u062F\u064A\u062F\u0629")}</h4>
        <div className="flex items-start gap-2">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input value={newCustomField.key} onChange={e => setNewCustomField(prev => ({
            ...prev,
            key: e.target.value
          }))} placeholder={i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0629 (\u0645\u062B\u0627\u0644: \u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629\u060C \u0627\u0644\u0631\u0627\u062A\u0628\u060C \u0627\u0644\u0641\u0626\u0629)")} className="text-sm" />
            <Input value={newCustomField.value} onChange={e => setNewCustomField(prev => ({
            ...prev,
            value: e.target.value
          }))} placeholder={i18n.t("\u0627\u0644\u0642\u064A\u0645\u0629")} className="text-sm" />
          </div>
          <Button type="button" variant="outline" onClick={handleAddCustomField} disabled={!newCustomField.key.trim()} className="gap-1">
            <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629")}</Button>
        </div>
      </div>

      {/* أمثلة */}
      <div className="mt-4">
        <p className="text-sm text-gray-500 mb-2">{i18n.t("\u0623\u0645\u062B\u0644\u0629 \u0639\u0644\u0649 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629:")}</p>
        <div className="flex flex-wrap gap-2">
          {[{
          key: i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064A\u0629"),
          value: '1234567890'
        }, {
          key: i18n.t("\u0631\u0642\u0645 \u062C\u0648\u0627\u0632 \u0627\u0644\u0633\u0641\u0631"),
          value: 'A12345678'
        }, {
          key: i18n.t("\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0634\u0647\u0631\u064A"),
          value: i18n.t("15000 \u0631\u064A\u0627\u0644")
        }, {
          key: i18n.t("\u0631\u0642\u0645 \u0627\u0644\u062A\u0623\u0645\u064A\u0646"),
          value: 'INS-123456'
        }, {
          key: i18n.t("\u0627\u0644\u0641\u0626\u0629 \u0627\u0644\u0639\u0645\u0631\u064A\u0629"),
          value: i18n.t("\u062A\u062D\u062A 21")
        }, {
          key: i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0644\u0627\u0639\u0628 \u0641\u064A \u0627\u0644\u0627\u062A\u062D\u0627\u062F"),
          value: 'FF-2024-001'
        }].map((example, idx) => <button key={idx} type="button" onClick={() => {
          setNewCustomField({
            key: example.key,
            value: ''
          });
        }} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors">
              {example.key}
            </button>)}
        </div>
      </div>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={player ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0644\u0627\u0639\u0628") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0644\u0627\u0639\u0628 \u062C\u062F\u064A\u062F")} size="2xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-[80vh]">
        {/* التبويبات */}
        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasErrors = tab.id === 'basic' && (errors.name || errors.number || errors.position);
          return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${isActive ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
                {hasErrors && <span className="w-2 h-2 rounded-full bg-danger" />}
              </button>;
        })}
        </div>

        {/* محتوى التبويب */}
        <div className="flex-1 overflow-y-auto px-1">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'contact' && renderContactInfo()}
          {activeTab === 'medical' && renderMedicalHistory()}
          {activeTab === 'contract' && renderContractInfo()}
        </div>

        {/* أزرار التنقل والحفظ */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
          <div className="flex gap-2">
            {activeTab !== 'basic' && <Button type="button" variant="ghost" onClick={() => {
            const currentIndex = tabs.findIndex(t => t.id === activeTab);
            setActiveTab(tabs[currentIndex - 1].id);
          }}>{i18n.t("\u0627\u0644\u0633\u0627\u0628\u0642")}</Button>}
            {activeTab !== 'custom' && <Button type="button" variant="outline" onClick={() => {
            const currentIndex = tabs.findIndex(t => t.id === activeTab);
            setActiveTab(tabs[currentIndex + 1].id);
          }}>{i18n.t("\u0627\u0644\u062A\u0627\u0644\u064A")}<ChevronLeft className="w-4 h-4 mr-1" />
              </Button>}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{i18n.t("\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...")}</> : <>
                  <Save className="w-4 h-4" />
                  {player ? i18n.t("\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0644\u0627\u0639\u0628")}
                </>}
            </Button>
          </div>
        </div>
      </form>
    </Modal>;
}