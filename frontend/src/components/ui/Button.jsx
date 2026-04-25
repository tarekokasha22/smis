import { cn } from '../../utils/helpers';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark rounded-xl shadow-md shadow-primary-500/20 font-medium',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-medium',
  danger: 'bg-danger text-white hover:opacity-90 rounded-xl font-medium shadow-md shadow-danger-500/20',
  ghost: 'text-gray-600 hover:bg-gray-100 rounded-lg font-medium',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'start',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        (disabled || loading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && Icon && iconPosition === 'start' && <Icon className="w-4 h-4" />}
      {children}
      {!loading && Icon && iconPosition === 'end' && <Icon className="w-4 h-4" />}
    </button>
  );
}
