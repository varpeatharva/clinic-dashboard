import { SearchX } from 'lucide-react';

export default function EmptyState({ title = 'No results found', message = 'Try adjusting your filters or search terms.', icon: Icon = SearchX }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs">{message}</p>
    </div>
  );
}
