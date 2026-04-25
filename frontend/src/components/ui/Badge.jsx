import { cn } from '../../utils/helpers';

const badgeVariants = {
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
  neutral: 'bg-gray-100 text-gray-700',
};

export default function Badge({ children, variant = 'neutral', dot = false, className = '' }) {
  return (
    <span className={cn('badge', badgeVariants[variant], className)}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-success',
          variant === 'danger' && 'bg-danger',
          variant === 'warning' && 'bg-warning',
          variant === 'info' && 'bg-info',
          variant === 'neutral' && 'bg-gray-500',
        )} />
      )}
      {children}
    </span>
  );
}
