export default function PageHeader({ title, subtitle, children, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="text-xl font-bold text-gray-900">{title}</div>
        {subtitle && <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actions}
        {children}
      </div>
    </div>
  );
}
