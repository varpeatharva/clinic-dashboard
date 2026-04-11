import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import useUIStore from '../../store/uiStore';
import clsx from 'clsx';

function Toast({ id, type, message }) {
  const { removeToast } = useUIStore();

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium',
        'animate-slide-in min-w-64 max-w-sm',
        type === 'success' ? 'bg-green-50 border-green-200 text-green-800' 
                           : 'bg-red-50 border-red-200 text-red-800'
      )}
    >
      {type === 'success' ? (
        <CheckCircle size={18} className="text-success flex-shrink-0" />
      ) : (
        <XCircle size={18} className="text-danger flex-shrink-0" />
      )}
      <span className="flex-1">{message}</span>
      <button onClick={() => removeToast(id)} className="hover:opacity-60 transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}
