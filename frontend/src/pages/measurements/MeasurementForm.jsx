import i18n from "../../utils/i18n";
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementsApi } from '../../api/endpoints/measurements';
import { X, Save, Scale, Activity, Droplet, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
export default function MeasurementForm({
  isOpen,
  onClose,
  measurementToEdit,
  players
}) {
  const queryClient = useQueryClient();
  const isEditing = !!measurementToEdit;
  const [formData, setFormData] = useState({
    player_id: '',
    measured_at: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat_pct: '',
    muscle_mass_kg: '',
    bone_mass_kg: '',
    water_pct: '',
    chest_cm: '',
    waist_cm: '',
    hip_cm: '',
    thigh_cm: '',
    calf_cm: '',
    arm_cm: '',
    neck_cm: '',
    inbody_score: '',
    notes: ''
  });

  // Custom measurements
  const [customTypes, setCustomTypes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smis-custom-measurement-types') || '[]');
    } catch {
      return [];
    }
  });
  const [customValues, setCustomValues] = useState({});
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomType, setNewCustomType] = useState({
    name: '',
    unit: '',
    normalMin: '',
    normalMax: ''
  });
  const [activeTab, setActiveTab] = useState('standard');
  const saveCustomType = () => {
    if (!newCustomType.name.trim()) {
      toast.error(i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0642\u064A\u0627\u0633 \u0645\u0637\u0644\u0648\u0628"));
      return;
    }
    const newType = {
      id: Date.now(),
      ...newCustomType
    };
    const updated = [...customTypes, newType];
    setCustomTypes(updated);
    localStorage.setItem('smis-custom-measurement-types', JSON.stringify(updated));
    setNewCustomType({
      name: '',
      unit: '',
      normalMin: '',
      normalMax: ''
    });
    setShowAddCustom(false);
    toast.success(i18n.t("\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0642\u064A\u0627\u0633 \u0627\u0644\u0645\u062E\u0635\u0635"));
  };
  const removeCustomType = id => {
    const updated = customTypes.filter(t => t.id !== id);
    setCustomTypes(updated);
    localStorage.setItem('smis-custom-measurement-types', JSON.stringify(updated));
    const newVals = {
      ...customValues
    };
    delete newVals[id];
    setCustomValues(newVals);
  };
  useEffect(() => {
    if (measurementToEdit) {
      setFormData({
        ...measurementToEdit,
        measured_at: new Date(measurementToEdit.measured_at).toISOString().split('T')[0]
      });
    }
  }, [measurementToEdit]);
  const saveMutation = useMutation({
    mutationFn: data => {
      // Clean up empty strings to null for optional numerical fields
      const cleanedData = {
        ...data
      };
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '') cleanedData[key] = null;
      });
      return isEditing ? measurementsApi.update(measurementToEdit.id, cleanedData) : measurementsApi.create(cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['measurementsList']);
      queryClient.invalidateQueries(['measurementsStats']);
      toast.success(isEditing ? i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0642\u064A\u0627\u0633 \u0628\u0646\u062C\u0627\u062D") : i18n.t("\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0642\u064A\u0627\u0633 \u0628\u0646\u062C\u0627\u062D"));
      onClose();
    },
    onError: error => {
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062D\u0641\u0638 \u0627\u0644\u0642\u064A\u0627\u0633"));
    }
  });
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.player_id) {
      toast.error(i18n.t("\u0627\u0644\u0631\u062C\u0627\u0621 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0644\u0627\u0639\u0628"));
      return;
    }
    // Append custom measurements to notes
    const customEntries = customTypes.filter(ct => customValues[ct.id] !== '' && customValues[ct.id] !== undefined).map(ct => `${ct.name}: ${customValues[ct.id]}${ct.unit ? ' ' + ct.unit : ''}${ct.normalMin && ct.normalMax ? ` (${i18n.t('طبيعي')}: ${ct.normalMin}-${ct.normalMax})` : ''}`);
    const finalData = {
      ...formData
    };
    if (customEntries.length > 0) {
      finalData.notes = (finalData.notes || '') + (finalData.notes ? '\n' : '') + i18n.t("[\u0642\u064A\u0627\u0633\u0627\u062A \u0645\u062E\u0635\u0635\u0629]\n") + customEntries.join('\n');
    }
    saveMutation.mutate(finalData);
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-2xl text-right overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-100">
          <div className="bg-primary px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl leading-6 font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-white/80" />
              {isEditing ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0642\u064A\u0627\u0633") : i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0642\u064A\u0627\u0633 \u062C\u062F\u064A\u062F")}
            </h3>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setActiveTab('standard')} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'standard' ? 'bg-white text-primary border-b-2 border-primary -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>{i18n.t("\u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629")}</button>
              <button type="button" onClick={() => setActiveTab('custom')} className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${activeTab === 'custom' ? 'bg-white text-primary border-b-2 border-primary -mb-px' : 'text-gray-500 hover:text-gray-700'}`}>
                <Plus className="w-3.5 h-3.5" />{i18n.t("\u0642\u064A\u0627\u0633\u0627\u062A \u0645\u062E\u0635\u0635\u0629")}{customTypes.length > 0 && <span className="w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center">{customTypes.length}</span>}
              </button>
            </div>

            {activeTab === 'custom' && <div className="px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{i18n.t("\u0623\u0636\u0641 \u0642\u064A\u0627\u0633\u0627\u062A \u062C\u0633\u0645 \u0645\u062E\u0635\u0635\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0627\u0644\u0646\u0645\u0648\u0630\u062C \u0627\u0644\u0623\u0633\u0627\u0633\u064A")}</p>
                  <button type="button" onClick={() => setShowAddCustom(!showAddCustom)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
                    <Plus className="w-4 h-4" />{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0642\u064A\u0627\u0633 \u0645\u062E\u0635\u0635")}</button>
                </div>
                {showAddCustom && <div className="bg-primary-50 border border-primary/20 rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-bold text-primary">{i18n.t("\u062A\u0639\u0631\u064A\u0641 \u0642\u064A\u0627\u0633 \u0645\u062E\u0635\u0635 \u062C\u062F\u064A\u062F")}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0642\u064A\u0627\u0633 *")}</label>
                        <input type="text" value={newCustomType.name} onChange={e => setNewCustomType({
                    ...newCustomType,
                    name: e.target.value
                  })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0645\u062D\u064A\u0637 \u0627\u0644\u0639\u062C\u0644")} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{i18n.t("\u0648\u062D\u062F\u0629 \u0627\u0644\u0642\u064A\u0627\u0633")}</label>
                        <input type="text" value={newCustomType.unit} onChange={e => setNewCustomType({
                    ...newCustomType,
                    unit: e.target.value
                  })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0633\u0645\u060C \u0643\u062C\u0645\u060C %")} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{i18n.t("\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0627\u0644\u0637\u0628\u064A\u0639\u064A")}</label>
                        <input type="number" value={newCustomType.normalMin} onChange={e => setNewCustomType({
                    ...newCustomType,
                    normalMin: e.target.value
                  })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{i18n.t("\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0637\u0628\u064A\u0639\u064A")}</label>
                        <input type="number" value={newCustomType.normalMax} onChange={e => setNewCustomType({
                    ...newCustomType,
                    normalMax: e.target.value
                  })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="100" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowAddCustom(false)} className="flex-1 py-2 border border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</button>
                      <button type="button" onClick={saveCustomType} className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark">{i18n.t("\u062D\u0641\u0638 \u0627\u0644\u0642\u064A\u0627\u0633")}</button>
                    </div>
                  </div>}
                {customTypes.length === 0 && !showAddCustom ? <div className="text-center py-10 text-gray-400">
                    <Scale className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u064A\u0627\u0633\u0627\u062A \u0645\u062E\u0635\u0635\u0629 \u0628\u0639\u062F.")}</p>
                    <p className="text-xs mt-1">{i18n.t("\u0627\u0636\u063A\u0637 \"\u0625\u0636\u0627\u0641\u0629 \u0642\u064A\u0627\u0633 \u0645\u062E\u0635\u0635\" \u0644\u0625\u0636\u0627\u0641\u0629 \u0642\u064A\u0627\u0633 \u062C\u062F\u064A\u062F.")}</p>
                  </div> : <div className="grid grid-cols-2 gap-3">
                    {customTypes.map(ct => {
                const val = customValues[ct.id] || '';
                const isAbnormal = val && ct.normalMin && ct.normalMax && (parseFloat(val) < parseFloat(ct.normalMin) || parseFloat(val) > parseFloat(ct.normalMax));
                return <div key={ct.id} className={`p-3 rounded-xl border ${isAbnormal ? 'border-warning/50 bg-warning-light' : 'border-gray-200 bg-gray-50'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-sm font-semibold text-gray-700">{ct.name}</span>
                              {ct.unit && <span className="text-xs text-gray-400 mr-1">({ct.unit})</span>}
                              {ct.normalMin && ct.normalMax && <p className="text-xs text-gray-400">{i18n.t("\u0637\u0628\u064A\u0639\u064A:")}{ct.normalMin} - {ct.normalMax}</p>}
                            </div>
                            <button type="button" onClick={() => removeCustomType(ct.id)} className="p-1 text-gray-300 hover:text-danger transition-colors rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          <input type="number" step="any" value={val} onChange={e => setCustomValues({
                    ...customValues,
                    [ct.id]: e.target.value
                  })} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white" placeholder={i18n.t("\u0623\u062F\u062E\u0644 \u0627\u0644\u0642\u064A\u0645\u0629...")} />
                          {isAbnormal && <p className="text-xs text-warning mt-1">{i18n.t("\u26A0\uFE0F \u062E\u0627\u0631\u062C \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0637\u0628\u064A\u0639\u064A")}</p>}
                        </div>;
              })}
                  </div>}
              </div>}

            {activeTab === 'standard' && <div className="px-6 py-5 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6">

                {/* Basic Info */}
                <div className="col-span-1 md:col-span-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}<span className="text-red-500">*</span></label>
                    <select name="player_id" required className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm" value={formData.player_id} onChange={handleChange} disabled={isEditing}>
                      <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0644\u0627\u0639\u0628...")}</option>
                      {players.map(p => <option key={p.id} value={p.id}>{p.name} - {p.position}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0642\u064A\u0627\u0633")}</label>
                    <input type="date" name="measured_at" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm bg-white" value={formData.measured_at} onChange={handleChange} />
                  </div>
                </div>

                {/* Main Metrics */}
                <div className="col-span-1 space-y-4">
                  <h4 className="text-sm font-bold text-primary-600 border-b border-primary-100 pb-2 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4" />{i18n.t("\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label={i18n.t("\u0627\u0644\u0648\u0632\u0646 (\u0643\u062C\u0645)")} name="weight" value={formData.weight} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label={i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u062F\u0647\u0648\u0646 %")} name="body_fat_pct" value={formData.body_fat_pct} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label={i18n.t("\u0627\u0644\u0643\u062A\u0644\u0629 \u0627\u0644\u0639\u0636\u0644\u064A\u0629 (\u0643\u062C\u0645)")} name="muscle_mass_kg" value={formData.muscle_mass_kg} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label={i18n.t("\u0643\u062A\u0644\u0629 \u0627\u0644\u0639\u0638\u0627\u0645 (\u0643\u062C\u0645)")} name="bone_mass_kg" value={formData.bone_mass_kg} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label={i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0627\u0621 %")} name="water_pct" value={formData.water_pct} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label="InBody Score" name="inbody_score" value={formData.inbody_score} onChange={handleChange} type="number" step="0.1" />
                  </div>
                </div>

                {/* Dimensions */}
                <div className="col-span-1 space-y-4">
                  <h4 className="text-sm font-bold text-orange-600 border-b border-orange-100 pb-2 mb-3 flex items-center gap-2">
                    <Droplet className="w-4 h-4" />{i18n.t("\u0645\u062D\u064A\u0637 \u0627\u0644\u062C\u0633\u0645 (\u0633\u0645)")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label={i18n.t("\u0627\u0644\u0635\u062F\u0631")} name="chest_cm" value={formData.chest_cm} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label={i18n.t("\u0627\u0644\u062E\u0635\u0631")} name="waist_cm" value={formData.waist_cm} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label={i18n.t("\u0627\u0644\u062D\u0648\u0636 (Hip)")} name="hip_cm" value={formData.hip_cm} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label={i18n.t("\u0627\u0644\u0641\u062E\u0630")} name="thigh_cm" value={formData.thigh_cm} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label={i18n.t("\u0627\u0644\u0633\u0645\u0627\u0646\u0629 (Calf)")} name="calf_cm" value={formData.calf_cm} onChange={handleChange} type="number" step="0.1" />
                    <InputGroup label={i18n.t("\u0627\u0644\u0630\u0631\u0627\u0639")} name="arm_cm" value={formData.arm_cm} onChange={handleChange} type="number" step="0.1" />
                  </div>
                </div>

                {/* Notes */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629")}</label>
                  <textarea name="notes" rows="3" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm" placeholder={i18n.t("\u0623\u064A \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u062D\u0648\u0644 \u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u060C \u0627\u0644\u062A\u0637\u0648\u0631\u060C \u0627\u0644\u062E...")} value={formData.notes || ''} onChange={handleChange}></textarea>
                </div>

              </div>
            </div>}

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none">{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</button>
              <button type="submit" disabled={saveMutation.isLoading} className="inline-flex items-center gap-2 px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-md shadow-primary-500/20 text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" />
                {saveMutation.isLoading ? i18n.t("\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...") : i18n.t("\u062D\u0641\u0638 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>;
}
function InputGroup({
  label,
  name,
  value,
  onChange,
  type = "text",
  step
}) {
  return <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input type={type} step={step} name={name} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white" value={value === null ? '' : value} onChange={onChange} />
    </div>;
}