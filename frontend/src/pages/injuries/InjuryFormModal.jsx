import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { User, Activity, Calendar, AlertTriangle, Clock, FileText, Stethoscope, RefreshCw, Save, X, ChevronLeft } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
const severityOptions = [{
  value: 'mild',
  label: i18n.t("\u0628\u0633\u064A\u0637\u0629"),
  color: 'bg-success text-white'
}, {
  value: 'moderate',
  label: i18n.t("\u0645\u062A\u0648\u0633\u0637\u0629"),
  color: 'bg-warning text-white'
}, {
  value: 'severe',
  label: i18n.t("\u0634\u062F\u064A\u062F\u0629"),
  color: 'bg-danger text-white'
}, {
  value: 'critical',
  label: i18n.t("\u062D\u0631\u062C\u0629"),
  color: 'bg-danger text-white'
}];
const mechanismOptions = [{
  value: 'collision',
  label: i18n.t("\u062A\u0635\u0627\u062F\u0645")
}, {
  value: 'overuse',
  label: i18n.t("\u0625\u0641\u0631\u0627\u0637 \u0641\u064A \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645")
}, {
  value: 'fatigue',
  label: i18n.t("\u0625\u0631\u0647\u0627\u0642")
}, {
  value: 'unknown',
  label: i18n.t("\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641")
}];
const occurredDuringOptions = [{
  value: 'match',
  label: i18n.t("\u0645\u0628\u0627\u0631\u0627\u0629")
}, {
  value: 'training',
  label: i18n.t("\u062A\u062F\u0631\u064A\u0628")
}, {
  value: 'other',
  label: i18n.t("\u0623\u062E\u0631\u0649")
}];
const bodySideOptions = [{
  value: 'right',
  label: i18n.t("\u0623\u064A\u0645\u0646")
}, {
  value: 'left',
  label: i18n.t("\u0623\u064A\u0633\u0631")
}, {
  value: 'both',
  label: i18n.t("\u0643\u0644\u0627\u0647\u0645\u0627")
}];
const bodyAreaOptions = [i18n.t("\u0627\u0644\u0631\u0643\u0628\u0629"), i18n.t("\u0627\u0644\u0643\u0627\u062D\u0644"), i18n.t("\u0627\u0644\u0642\u062F\u0645"), i18n.t("\u0627\u0644\u0648\u062A\u0631 \u0627\u0644\u0631\u0636\u0641\u064A"), i18n.t("\u0627\u0644\u0633\u0627\u0642"), i18n.t("\u0627\u0644\u0641\u062E\u0630"), i18n.t("\u0627\u0644\u0648\u0631\u0643"), i18n.t("\u0627\u0644\u0638\u0647\u0631"), i18n.t("\u0627\u0644\u0643\u062A\u0641"), i18n.t("\u0627\u0644\u0630\u0631\u0627\u0639"), i18n.t("\u0627\u0644\u0645\u0631\u0641\u0642"), i18n.t("\u0627\u0644\u0631\u0633\u063A"), i18n.t("\u0627\u0644\u064A\u062F"), i18n.t("\u0627\u0644\u0631\u0623\u0633"), i18n.t("\u0627\u0644\u0648\u062C\u0647"), i18n.t("\u0627\u0644\u0631\u0642\u0628\u0629"), i18n.t("\u0627\u0644\u0628\u0637\u0646"), i18n.t("\u0627\u0644\u062D\u0648\u0636"), i18n.t("\u0627\u0644\u0636\u0644\u0639"), i18n.t("\u0623\u062E\u0631\u0649")];
const injuryTypeExamples = [i18n.t("\u0627\u0644\u062A\u0648\u0627\u0621"), i18n.t("\u0634\u062F \u0639\u0636\u0644\u064A"), i18n.t("\u062A\u0645\u0632\u0642 \u0639\u0636\u0644\u064A"), i18n.t("\u0627\u0644\u062A\u0647\u0627\u0628"), i18n.t("\u0643\u0633\u0631"), i18n.t("\u062E\u0634\u0648\u0646\u0629"), i18n.t("\u0627\u0644\u062A\u0647\u0627\u0628 \u0623\u0648\u062A\u0627\u0631"), i18n.t("\u0625\u0635\u0627\u0628\u0629 \u063A\u0636\u0631\u0648\u0641"), i18n.t("\u0627\u0644\u062A\u0626\u0627\u0645 \u0639\u0638\u0645\u064A"), i18n.t("\u0643\u062F\u0645\u0629"), i18n.t("\u0625\u0631\u0647\u0627\u0642"), i18n.t("\u0623\u062E\u0631\u0649")];
export default function InjuryFormModal({
  isOpen,
  onClose,
  injury,
  players,
  onSave,
  doctors
}) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    player_id: '',
    injury_type: '',
    body_area: '',
    body_side: '',
    severity: 'moderate',
    expected_recovery_days: '',
    injury_date: '',
    return_date: '',
    treating_doctor_id: '',
    mechanism: 'unknown',
    occurred_during: 'training',
    is_recurring: false,
    recurrence_count: '',
    description: '',
    treatment_plan: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const tabs = [{
    id: 'basic',
    label: i18n.t("\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629"),
    icon: Activity
  }, {
    id: 'details',
    label: i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0629"),
    icon: FileText
  }, {
    id: 'treatment',
    label: i18n.t("\u062E\u0637\u0629 \u0627\u0644\u0639\u0644\u0627\u062C"),
    icon: Stethoscope
  }];
  useEffect(() => {
    if (injury) {
      setFormData({
        player_id: injury.player_id || '',
        injury_type: injury.injury_type || '',
        body_area: injury.body_area || '',
        body_side: injury.body_side || '',
        severity: injury.severity || 'moderate',
        expected_recovery_days: injury.expected_recovery_days || '',
        injury_date: injury.injury_date || '',
        return_date: injury.return_date || '',
        treating_doctor_id: injury.treating_doctor_id || '',
        mechanism: injury.mechanism || 'unknown',
        occurred_during: injury.occurred_during || 'training',
        is_recurring: injury.is_recurring || false,
        recurrence_count: injury.recurrence_count || '',
        description: injury.description || '',
        treatment_plan: injury.treatment_plan || ''
      });
      setSelectedPlayer(injury.player);
    } else {
      setFormData({
        player_id: '',
        injury_type: '',
        body_area: '',
        body_side: '',
        severity: 'moderate',
        expected_recovery_days: '',
        injury_date: new Date().toISOString().split('T')[0],
        return_date: '',
        treating_doctor_id: doctors?.length > 0 ? doctors[0].id : '',
        mechanism: 'unknown',
        occurred_during: 'training',
        is_recurring: false,
        recurrence_count: '',
        description: '',
        treatment_plan: ''
      });
      setSelectedPlayer(null);
    }
    setActiveTab('basic');
    setErrors({});
  }, [injury, isOpen, doctors]);
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
  const handlePlayerSelect = playerId => {
    handleChange('player_id', playerId);
    const player = players.find(p => p.id === parseInt(playerId));
    setSelectedPlayer(player || null);
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.player_id) {
      newErrors.player_id = i18n.t("\u064A\u062C\u0628 \u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u0644\u0627\u0639\u0628");
    }
    if (!formData.injury_type.trim()) {
      newErrors.injury_type = i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0645\u0637\u0644\u0648\u0628");
    }
    if (!formData.body_area.trim()) {
      newErrors.body_area = i18n.t("\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0645\u0637\u0644\u0648\u0628\u0629");
    }
    if (!formData.severity) {
      newErrors.severity = i18n.t("\u0634\u062F\u0629 \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0645\u0637\u0644\u0648\u0628\u0629");
    }
    if (!formData.expected_recovery_days) {
      newErrors.expected_recovery_days = i18n.t("\u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629 \u0645\u0637\u0644\u0648\u0628\u0629");
    } else if (formData.expected_recovery_days < 1 || formData.expected_recovery_days > 365) {
      newErrors.expected_recovery_days = i18n.t("\u0623\u062F\u062E\u0644 \u0639\u062F\u062F \u0623\u064A\u0627\u0645 \u0635\u062D\u064A\u062D (1-365)");
    }
    if (!formData.injury_date) {
      newErrors.injury_date = i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0645\u0637\u0644\u0648\u0628");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) {
      if (errors.player_id || errors.injury_type || errors.body_area || errors.severity) {
        setActiveTab('basic');
      }
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        player_id: parseInt(formData.player_id),
        expected_recovery_days: parseInt(formData.expected_recovery_days),
        treating_doctor_id: formData.treating_doctor_id ? parseInt(formData.treating_doctor_id) : null,
        recurrence_count: formData.is_recurring ? parseInt(formData.recurrence_count) || 1 : 0,
        return_date: formData.return_date || null
      };
      await onSave(dataToSubmit);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderBasicInfo = () => <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}<span className="text-danger">*</span>
        </label>
        <select value={formData.player_id} onChange={e => handlePlayerSelect(e.target.value)} className={`input-field ${errors.player_id ? 'border-danger' : ''}`}>
          <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0644\u0627\u0639\u0628...")}</option>
          {players.map(player => <option key={player.id} value={player.id}>
              #{player.number} - {player.name}
            </option>)}
        </select>
        {errors.player_id && <p className="text-danger text-xs mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {errors.player_id}
          </p>}

        {selectedPlayer && <div className="mt-3 p-3 bg-primary-50 rounded-lg flex items-center gap-3">
            <Avatar src={selectedPlayer.avatar_url} name={selectedPlayer.name} size="md" />
            <div>
              <p className="font-semibold text-gray-900">{selectedPlayer.name}</p>
              <p className="text-sm text-gray-500">
                #{selectedPlayer.number} • {selectedPlayer.position}
              </p>
            </div>
          </div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}<span className="text-danger">*</span>
          </label>
          <Input value={formData.injury_type} onChange={e => handleChange('injury_type', e.target.value)} error={errors.injury_type} placeholder={i18n.t("\u0645\u062B\u0627\u0644: \u0627\u0644\u062A\u0648\u0627\u0621\u060C \u0634\u062F \u0639\u0636\u0644\u064A...")} icon={Activity} />
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs text-gray-400">{i18n.t("\u0623\u0645\u062B\u0644\u0629:")}</span>
            {injuryTypeExamples.slice(0, 5).map(type => <button key={type} type="button" onClick={() => handleChange('injury_type', type)} className="text-xs text-primary hover:underline">
                {type}
              </button>)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062C\u0633\u0645")}<span className="text-danger">*</span>
          </label>
          <select value={formData.body_area} onChange={e => handleChange('body_area', e.target.value)} className={`input-field ${errors.body_area ? 'border-danger' : ''}`}>
            <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062C\u0633\u0645...")}</option>
            {bodyAreaOptions.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
          {errors.body_area && <p className="text-danger text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errors.body_area}
            </p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u062C\u0627\u0646\u0628 \u0627\u0644\u062C\u0633\u0645")}</label>
          <div className="flex gap-3">
            {bodySideOptions.map(option => <label key={option.value} className={`flex-1 cursor-pointer rounded-lg border p-3 text-center transition-colors ${formData.body_side === option.value ? 'border-primary bg-primary-50 text-primary' : 'border-gray-200 hover:border-primary/50'}`}>
                <input type="radio" name="body_side" value={option.value} checked={formData.body_side === option.value} onChange={e => handleChange('body_side', e.target.value)} className="sr-only" />
                <span className="text-sm font-medium">{option.label}</span>
              </label>)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}<span className="text-danger">*</span>
          </label>
          <Input type="date" value={formData.injury_date} onChange={e => handleChange('injury_date', e.target.value)} error={errors.injury_date} icon={Calendar} className="font-numbers" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0634\u062F\u0629")}<span className="text-danger">*</span>
          </label>
          <div className="flex gap-2">
            {severityOptions.map(option => <label key={option.value} className={`flex-1 cursor-pointer rounded-lg border p-3 text-center transition-colors ${formData.severity === option.value ? `${option.color} border-transparent` : 'border-gray-200 hover:border-primary/50'}`}>
                <input type="radio" name="severity" value={option.value} checked={formData.severity === option.value} onChange={e => handleChange('severity', e.target.value)} className="sr-only" />
                <span className="text-sm font-medium">{option.label}</span>
              </label>)}
          </div>
          {errors.severity && <p className="text-danger text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {errors.severity}
            </p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629")}<span className="text-danger">*</span>
          </label>
          <Input type="number" min="1" max="365" value={formData.expected_recovery_days} onChange={e => handleChange('expected_recovery_days', e.target.value)} error={errors.expected_recovery_days} placeholder={i18n.t("\u0645\u062B\u0627\u0644: 14")} icon={Clock} className="font-numbers" />
        </div>
      </div>
    </div>;
  const renderDetails = () => <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0622\u0644\u064A\u0629 \u0627\u0644\u062D\u062F\u0648\u062B")}</label>
          <select value={formData.mechanism} onChange={e => handleChange('mechanism', e.target.value)} className="input-field">
            {mechanismOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0645\u0643\u0627\u0646 \u0627\u0644\u062D\u062F\u0648\u062B")}</label>
          <select value={formData.occurred_during} onChange={e => handleChange('occurred_during', e.target.value)} className="input-field">
            {occurredDuringOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062C")}</label>
        <select value={formData.treating_doctor_id} onChange={e => handleChange('treating_doctor_id', e.target.value)} className="input-field">
          <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0637\u0628\u064A\u0628...")}</option>
          {doctors && doctors.map(doctor => <option key={doctor.id} value={doctor.id}>
              {doctor.name} ({doctor.role === 'doctor' ? i18n.t("\u0637\u0628\u064A\u0628") : i18n.t("\u0623\u062E\u0635\u0627\u0626\u064A \u0639\u0644\u0627\u062C \u0637\u0628\u064A\u0639\u064A")})
            </option>)}
        </select>
      </div>

      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input type="checkbox" id="is_recurring" checked={formData.is_recurring} onChange={e => handleChange('is_recurring', e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
        <label htmlFor="is_recurring" className="flex items-center gap-2 cursor-pointer">
          <RefreshCw className="w-4 h-4 text-warning" />
          <span className="text-sm font-medium text-gray-700">{i18n.t("\u0625\u0635\u0627\u0628\u0629 \u0645\u062A\u0643\u0631\u0631\u0629")}</span>
        </label>
      </div>

      {formData.is_recurring && <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0639\u062F\u062F \u0645\u0631\u0627\u062A \u0627\u0644\u062A\u0643\u0631\u0627\u0631")}</label>
          <Input type="number" min="1" max="20" value={formData.recurrence_count} onChange={e => handleChange('recurrence_count', e.target.value)} placeholder={i18n.t("\u0645\u062B\u0627\u0644: 3")} icon={RefreshCw} className="font-numbers" />
        </div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0648\u0635\u0641 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}</label>
        <textarea value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder={i18n.t("\u0648\u0635\u0641 \u062A\u0641\u0635\u064A\u0644\u064A \u0644\u0644\u0625\u0635\u0627\u0628\u0629 \u0648\u0643\u064A\u0641 \u062D\u062F\u062B\u062A...")} rows={4} className="input-field resize-none" />
      </div>
    </div>;
  const renderTreatment = () => <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u062E\u0637\u0629 \u0627\u0644\u0639\u0644\u0627\u062C")}</label>
        <textarea value={formData.treatment_plan} onChange={e => handleChange('treatment_plan', e.target.value)} placeholder={i18n.t("\u062E\u0637\u0629 \u0627\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u0645\u0642\u062A\u0631\u062D\u0629 \u0648\u0627\u0644\u062E\u0637\u0648\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0644\u062A\u0639\u0627\u0641\u064A...")} rows={6} className="input-field resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0639\u0648\u062F\u0629 \u0627\u0644\u0645\u062A\u0648\u0642\u0639")}</label>
        <Input type="date" value={formData.return_date} onChange={e => handleChange('return_date', e.target.value)} icon={Calendar} className="font-numbers" />
      </div>

      <div className="bg-info-light p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Stethoscope className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-info">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0629 \u0645\u0647\u0645\u0629")}</p>
            <p className="text-xs text-info/80 mt-1">{i18n.t("\u0633\u064A\u062A\u0645 \u0631\u0628\u0637 \u0628\u0631\u0646\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0628\u0647\u0630\u0647 \u0627\u0644\u0625\u0635\u0627\u0628\u0629. \u064A\u0645\u0643\u0646 \u062A\u0639\u062F\u064A\u0644 \u062E\u0637\u0629 \u0627\u0644\u062A\u0623\u0647\u064A\u0644 \u0644\u0627\u062D\u0642\u0627\u064B \u0645\u0646 \u0642\u0633\u0645 \u0627\u0644\u062A\u0623\u0647\u064A\u0644.")}</p>
          </div>
        </div>
      </div>
    </div>;
  return <Modal isOpen={isOpen} onClose={onClose} title={injury ? i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0625\u0635\u0627\u0628\u0629") : i18n.t("\u062A\u0633\u062C\u064A\u0644 \u0625\u0635\u0627\u0628\u0629 \u062C\u062F\u064A\u062F\u0629")} size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col" style={{
      maxHeight: '80vh'
    }}>
        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const hasErrors = tab.id === 'basic' && (errors.player_id || errors.injury_type || errors.body_area || errors.severity);
          return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${isActive ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-4 h-4" />
                {tab.label}
                {hasErrors && <span className="w-2 h-2 rounded-full bg-danger" />}
              </button>;
        })}
        </div>

        <div className="flex-1 overflow-y-auto px-1">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'treatment' && renderTreatment()}
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
          <div className="flex gap-2">
            {activeTab !== 'basic' && <Button type="button" variant="ghost" onClick={() => {
            const currentIndex = tabs.findIndex(t => t.id === activeTab);
            setActiveTab(tabs[currentIndex - 1].id);
          }}>{i18n.t("\u0627\u0644\u0633\u0627\u0628\u0642")}</Button>}
            {activeTab !== 'treatment' && <Button type="button" variant="outline" onClick={() => {
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
                  {injury ? i18n.t("\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A") : i18n.t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}
                </>}
            </Button>
          </div>
        </div>
      </form>
    </Modal>;
}