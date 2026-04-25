import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function TrendIcon({ direction }) {
  if (direction === 'up') return <TrendingUp className="w-3.5 h-3.5 text-success" />;
  if (direction === 'down') return <TrendingDown className="w-3.5 h-3.5 text-danger" />;
  return <Minus className="w-3.5 h-3.5 text-gray-400" />;
}

const colorStyles = {
  primary: { bg: 'bg-primary-50', text: 'text-primary' },
  danger: { bg: 'bg-danger-light', text: 'text-danger' },
  warning: { bg: 'bg-warning-light', text: 'text-warning' },
  info: { bg: 'bg-info-light', text: 'text-info' },
  success: { bg: 'bg-success-light', text: 'text-success' },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  subtitle,
  onClick,
  className = '',
}) {
  const styles = colorStyles[color] || colorStyles.primary;

  return (
    <div
      onClick={onClick}
      className={`card relative overflow-hidden group ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} ${className}`}
    >
      <div className="flex items-start justify-between relative">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1 font-medium">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 font-numbers tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
          </p>

          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <TrendIcon direction={trend.direction} />
              <span className="text-xs text-gray-500">{trend.label}</span>
            </div>
          )}

          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${styles.bg} ${styles.text}`}>
            <Icon className="w-7 h-7" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {trend && trend.percentage && (
        <div className="absolute bottom-3 left-5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.direction === 'up' ? 'bg-success-light text-success' : ''
          } ${trend.direction === 'down' ? 'bg-danger-light text-danger' : ''}
          ${trend.direction === 'stable' ? 'bg-gray-100 text-gray-600' : ''}`}>
            {trend.direction === 'up' ? '+' : ''}{trend.percentage}%
          </span>
        </div>
      )}

      <div className={`absolute bottom-0 left-0 right-0 h-1 ${styles.bg}`} />
    </div>
  );
}
