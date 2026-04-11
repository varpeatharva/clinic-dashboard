import { TrendingUp } from 'lucide-react';
import clsx from 'clsx';

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'primary', loading }) {
  const colorMap = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-green-100',
    danger:  'text-danger bg-red-100',
    warning: 'text-warning bg-orange-100',
    info:    'text-info bg-blue-100',
  };

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
        <div className="skeleton h-8 w-20 rounded mb-2" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
    );
  }

  return (
    <div className="card hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110', colorMap[color])}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <TrendingUp size={12} />
          {subtitle}
        </p>
      )}
    </div>
  );
}
