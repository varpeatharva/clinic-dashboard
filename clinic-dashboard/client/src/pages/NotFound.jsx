import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
          <Activity size={32} className="text-primary" />
        </div>
        <h1 className="text-7xl font-bold text-slate-200 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-2">Page Not Found</h2>
        <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary inline-flex">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
