import { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { DOCTORS, STATUSES, VISIT_TYPES } from '../../utils/formatters';
const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const DEFAULT_FILTERS = {
  startDate: '2025-01-01',
  endDate:   getLocalToday(),
  doctor:    'All',
  status:    'All',
  visit_type:'All',
};

export default function FilterBar({ filters, onFilterChange, onReset }) {
  const hasActiveFilters =
    filters.doctor !== 'All' || filters.status !== 'All' || filters.visit_type !== 'All';

  return (
    <div className="card mb-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-primary" />
        <h3 className="text-sm font-semibold text-slate-700">Filters</h3>
        {hasActiveFilters && (
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-end">
        {/* Date Range */}
        <div>
          <label className="label">From</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">To</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="input"
          />
        </div>

        {/* Doctor */}
        <div>
          <label className="label">Doctor</label>
          <select
            value={filters.doctor}
            onChange={(e) => onFilterChange({ doctor: e.target.value })}
            className="input"
          >
            <option value="All">All Doctors</option>
            {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Visit Type */}
        <div>
          <label className="label">Visit Type</label>
          <select
            value={filters.visit_type}
            onChange={(e) => onFilterChange({ visit_type: e.target.value })}
            className="input"
          >
            <option value="All">All Types</option>
            {VISIT_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="label">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="input"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-3 flex justify-end">
        <button onClick={onReset} className="btn-ghost text-slate-400 hover:text-slate-600">
          <RotateCcw size={14} />
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export { DEFAULT_FILTERS };
