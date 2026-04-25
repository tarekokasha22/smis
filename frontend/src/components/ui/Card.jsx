import { cn } from '../../utils/helpers';

export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={cn(
        'card',
        !hover && 'hover:shadow-card',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('flex items-center justify-between pb-4 border-b border-gray-100 mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-base font-bold text-gray-900', className)}>
      {children}
    </h3>
  );
}
