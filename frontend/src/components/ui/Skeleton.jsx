import { cn } from '../../utils/helpers';

export default function Skeleton({ className = '', rounded = 'rounded-lg' }) {
  return (
    <div className={cn('skeleton', rounded, className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-2.5 w-16" />
        </div>
      </div>
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-3/4" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <div className="skeleton w-8 h-8 rounded-lg" />
          <div className="flex-1 skeleton h-3" />
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-3 w-16" />
        </div>
      ))}
    </div>
  );
}
