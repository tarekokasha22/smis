import i18n from "../../utils/i18n";
import { Link } from 'react-router-dom';
import { User, Activity, Calendar, Clock, AlertTriangle, CheckCircle2, Stethoscope, RefreshCw, Edit2, FileText, ArrowRight, Dumbbell, Phone, Mail, TrendingUp, TrendingDown, Minus, UserCheck } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
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
const bodySideMap = {
  right: i18n.t("\u0623\u064A\u0645\u0646"),
  left: i18n.t("\u0623\u064A\u0633\u0631"),
  both: i18n.t("\u0643\u0644\u0627\u0647\u0645\u0627")
};
function TrendIcon({
  direction
}) {
  if (direction === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
  if (direction === 'down') return <TrendingDown className="w-4 h-4 text-danger" />;
  return <Minus className="w-4 h-4 text-gray-400" />;
}
function InfoCard({
  icon: Icon,
  label,
  value,
  color = 'gray'
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary',
    success: 'bg-success-light text-success',
    warning: 'bg-warning-light text-warning',
    danger: 'bg-danger-light text-danger',
    info: 'bg-info-light text-info',
    gray: 'bg-gray-50 text-gray-600'
  };
  const IconComponent = Icon;
  return <div className="bg-gray-50 p-3 rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-900 font-numbers">{value}</p>
    </div>;
}
export default function InjuryDetailModal({
  isOpen,
  onClose,
  injury,
  onEdit,
  onRecover,
  onCreateRehab
}) {
  if (!injury) return null;
  const severityInfo = severityMap[injury.severity] || severityMap.moderate;
  const statusInfo = statusMap[injury.status] || statusMap.active;
  const StatusIcon = statusInfo.icon || AlertTriangle;
  const daysSince = injury.daysSinceInjury || dayjs().diff(dayjs(injury.injury_date), 'day');
  const daysRemaining = injury.daysRemaining;
  const recoveryProgress = injury.status !== 'closed' && injury.expected_recovery_days ? Math.min(100, Math.round(daysSince / injury.expected_recovery_days * 100)) : injury.status === 'closed' ? 100 : 0;
  const isRecoveryAhead = injury.actual_recovery_days && injury.expected_recovery_days ? injury.actual_recovery_days < injury.expected_recovery_days : false;
  const formatDate = date => {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY');
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={i18n.t("\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")} size="xl">
      <div className="space-y-6">
        {/* Player Card */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary-50 to-white rounded-xl border border-primary/20">
          <Avatar src={injury.player?.avatar_url} name={injury.player?.name} size="xl" className="w-16 h-16" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Link to={`/players/${injury.player_id}`} className="text-xl font-bold text-gray-900 hover:text-primary transition-colors" onClick={onClose}>
                {injury.player?.name}
              </Link>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                <StatusIcon className="w-4 h-4" />
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              #{injury.player?.number} • {injury.player?.position}
            </p>
            {injury.player?.nationality && <p className="text-xs text-gray-400">{injury.player.nationality}</p>}
          </div>
          <div className="text-left">
            <Link to={`/players/${injury.player_id}`} onClick={onClose}>
              <Button variant="outline" size="sm" className="gap-1">
                <UserCheck className="w-4 h-4" />{i18n.t("\u0645\u0644\u0641 \u0627\u0644\u0644\u0627\u0639\u0628")}</Button>
            </Link>
          </div>
        </div>

        {/* Recovery Progress */}
        {injury.status === 'closed' ? <div className="bg-success-light p-4 rounded-xl border border-success/30">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <div>
                <p className="font-bold text-success text-lg">{i18n.t("\u062A\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0628\u0646\u062C\u0627\u062D")}</p>
                <p className="text-sm text-gray-600">{i18n.t("\u062A\u0639\u0627\u0641\u0649 \u0627\u0644\u0644\u0627\u0639\u0628 \u062E\u0644\u0627\u0644")}<span className="font-bold text-success">{injury.actual_recovery_days}</span>{i18n.t("\u064A\u0648\u0645")}{injury.return_date && <span>{i18n.t("\u2022 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0639\u0648\u062F\u0629:")}{formatDate(injury.return_date)}</span>}
                </p>
              </div>
            </div>
            {injury.expected_recovery_days && <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">{i18n.t("\u0627\u0644\u0645\u062A\u0648\u0642\u0639:")}</span>
                <span className="font-medium">{injury.expected_recovery_days}{i18n.t("\u064A\u0648\u0645")}</span>
                <span className={`flex items-center gap-1 ${isRecoveryAhead ? 'text-success' : 'text-danger'}`}>
                  <TrendIcon direction={isRecoveryAhead ? 'up' : 'down'} />
                  {isRecoveryAhead ? i18n.t('{{n}} يوم أبكر', { n: injury.expected_recovery_days - injury.actual_recovery_days }) : i18n.t('{{n}} يوم متأخر', { n: injury.actual_recovery_days - injury.expected_recovery_days })}
                </span>
              </div>}
          </div> : <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{i18n.t("\u062A\u0642\u062F\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A")}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary font-numbers">{recoveryProgress}%</span>
                {daysRemaining !== null && daysRemaining > 0 && <Badge variant="warning">{i18n.t("\u0645\u062A\u0628\u0642\u064A")}{daysRemaining}{i18n.t("\u064A\u0648\u0645")}</Badge>}
                {daysRemaining === 0 && <Badge variant="danger">{i18n.t("\u0627\u0646\u062A\u0647\u0649 \u0627\u0644\u0645\u062A\u0648\u0642\u0639!")}</Badge>}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div className={`h-3 rounded-full transition-all ${recoveryProgress >= 100 ? 'bg-success' : recoveryProgress >= 75 ? 'bg-primary' : recoveryProgress >= 50 ? 'bg-info' : 'bg-warning'}`} style={{
            width: `${Math.min(recoveryProgress, 100)}%`
          }} />
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{i18n.t("\u0645\u0646\u0630")}{daysSince}{i18n.t("\u064A\u0648\u0645")}</span>
              <span>{i18n.t("\u0645\u0646\u0630")}{dayjs(injury.injury_date).format('DD/MM/YYYY')}</span>
            </div>
          </div>}

        {/* Injury Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <InfoCard icon={Activity} label={i18n.t("\u0646\u0648\u0639 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")} value={<span className="font-bold">{injury.injury_type}</span>} color="primary" />
          <InfoCard icon={User} label={i18n.t("\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062C\u0633\u0645")} value={<span>
                {injury.body_area}
                {injury.body_side && <span className="text-gray-400 text-xs"> ({bodySideMap[injury.body_side]})</span>}
              </span>} color="info" />
          <InfoCard icon={AlertTriangle} label={i18n.t("\u0627\u0644\u0634\u062F\u0629")} value={<span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${severityInfo.bg} ${severityInfo.text}`}>
                {severityInfo.label}
              </span>} color={severityInfo.color} />
          <InfoCard icon={Calendar} label={i18n.t("\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0635\u0627\u0628\u0629")} value={<span className="font-numbers">{formatDate(injury.injury_date)}</span>} color="gray" />
          <InfoCard icon={Clock} label={i18n.t("\u0623\u064A\u0627\u0645 \u0627\u0644\u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629")} value={<span className="font-numbers">{injury.expected_recovery_days || '-'}{i18n.t("\u064A\u0648\u0645")}</span>} color="warning" />
          <InfoCard icon={Stethoscope} label={i18n.t("\u0627\u0644\u0637\u0628\u064A\u0628 \u0627\u0644\u0645\u0639\u0627\u0644\u062C")} value={<span className="font-medium">{injury.treatingDoctor?.name || '-'}</span>} color="gray" />
          <InfoCard icon={Activity} label={i18n.t("\u0627\u0644\u064A\u0629 \u0627\u0644\u062D\u062F\u0648\u062B")} value={<span>{mechanismMap[injury.mechanism] || '-'}</span>} color="gray" />
          <InfoCard icon={Calendar} label={i18n.t("\u0645\u0643\u0627\u0646 \u0627\u0644\u062D\u062F\u0648\u062B")} value={<span>{occurredDuringMap[injury.occurred_during] || '-'}</span>} color="gray" />
        </div>

        {/* Recurring Warning */}
        {injury.is_recurring && <div className="flex items-center gap-3 p-4 bg-warning-light rounded-xl border border-warning/30">
            <RefreshCw className="w-6 h-6 text-warning flex-shrink-0" />
            <div>
              <p className="font-bold text-warning">{i18n.t("\u0625\u0635\u0627\u0628\u0629 \u0645\u062A\u0643\u0631\u0631\u0629")}</p>
              <p className="text-sm text-gray-600">{i18n.t("\u0647\u0630\u0647 \u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u062D\u062F\u062B\u062A")}{' '}
                <span className="font-bold text-warning">{injury.recurrence_count || 1}</span>{' '}{i18n.t("\u0645\u0631\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u0644\u0627\u0639\u0628")}</p>
            </div>
          </div>}

        {/* Description */}
        {injury.description && <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
              <FileText className="w-4 h-4 text-primary" />{i18n.t("\u0648\u0635\u0641 \u0627\u0644\u0625\u0635\u0627\u0628\u0629")}</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{injury.description}</p>
          </div>}

        {/* Treatment Plan */}
        {injury.treatment_plan && <div className="bg-primary-50 p-4 rounded-xl border border-primary/20">
            <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-2">
              <Stethoscope className="w-4 h-4" />{i18n.t("\u062E\u0637\u0629 \u0627\u0644\u0639\u0644\u0627\u062C")}</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{injury.treatment_plan}</p>
          </div>}

        {/* Rehab Program (hasOne) */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <Dumbbell className="w-4 h-4 text-primary" />{i18n.t("\u0628\u0631\u0646\u0627\u0645\u062C \u0627\u0644\u062A\u0623\u0647\u064A\u0644 \u0627\u0644\u0645\u0631\u062A\u0628\u0637")}</h4>
          {injury.rehabilitation ? <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-gray-900">{injury.rehabilitation.program_name}</h5>
                <Badge variant={injury.rehabilitation.status === 'active' ? 'success' : injury.rehabilitation.status === 'completed' ? 'primary' : 'warning'}>
                  {injury.rehabilitation.status === 'active' ? i18n.t("\u0646\u0634\u0637") : injury.rehabilitation.status === 'completed' ? i18n.t("\u0645\u0643\u062A\u0645\u0644") : i18n.t("\u0645\u062A\u0648\u0642\u0641")}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">{i18n.t("\u0627\u0644\u0645\u0631\u062D\u0644\u0629:")}</span>{' '}
                  <span className="font-medium">{injury.rehabilitation.phase_label || i18n.t('المرحلة {{n}}', { n: injury.rehabilitation.phase })}</span>
                </div>
                <div>
                  <span className="text-gray-500">{i18n.t("\u0627\u0644\u062A\u0642\u062F\u0645:")}</span>{' '}
                  <span className="font-medium font-numbers">{injury.rehabilitation.progress_pct || 0}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                <div className="h-2 rounded-full bg-primary transition-all" style={{
              width: `${injury.rehabilitation.progress_pct || 0}%`
            }} />
              </div>
              {injury.rehabilitation.expected_end_date && <p className="text-xs text-gray-400 mt-2">{i18n.t("\u0627\u0644\u0645\u062A\u0648\u0642\u0639:")}{formatDate(injury.rehabilitation.expected_end_date)}
                </p>}
            </div> : <div className="bg-gray-50 p-6 rounded-xl text-center">
              <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">{i18n.t("\u0644\u0627 \u064A\u0648\u062C\u062F \u0628\u0631\u0646\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644 \u0645\u0631\u062A\u0628\u0637")}</p>
              {injury.status !== 'closed' && onCreateRehab && <Button onClick={() => onCreateRehab(injury)} className="gap-2 mx-auto" size="sm">
                  <Dumbbell className="w-4 h-4" />{i18n.t("\u0625\u0646\u0634\u0627\u0621 \u0628\u0631\u0646\u0627\u0645\u062C \u062A\u0623\u0647\u064A\u0644")}</Button>}
              {injury.status === 'closed' && <p className="text-xs text-gray-400 mt-1">{i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0629 \u0645\u063A\u0644\u0642\u0629")}</p>}
            </div>}
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            {injury.creator && <span>{i18n.t("\u0633\u062C\u0644 \u0628\u0648\u0627\u0633\u0637\u0629:")}{injury.creator.name}</span>}
            {injury.treatingDoctor?.email && <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {injury.treatingDoctor.email}
              </span>}
          </div>
          <span className="font-numbers">{dayjs(injury.created_at).format('DD/MM/YYYY HH:mm')}</span>
        </div>

        {/* Notes */}
        {injury.notes && <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <h4 className="text-sm font-bold text-yellow-700 mb-2">{i18n.t("\u0645\u0644\u0627\u062D\u0638\u0627\u062A")}</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{injury.notes}</p>
          </div>}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onEdit} className="flex-1 gap-2">
            <Edit2 className="w-4 h-4" />{i18n.t("\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A")}</Button>
          {injury.status !== 'closed' && <Button onClick={onRecover} className="flex-1 gap-2">
              <CheckCircle2 className="w-4 h-4" />{i18n.t("\u062A\u0633\u062C\u064A\u0644 \u062A\u0639\u0627\u0641\u064A \u0627\u0644\u0644\u0627\u0639\u0628")}</Button>}
        </div>
      </div>
    </Modal>;
}