import { useState, useCallback } from 'react';
import { Eye, Pencil, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { formatDate, formatTime } from '../../utils/formatters';
import useAuthStore from '../../store/authStore';
import { Calendar } from 'lucide-react';

export default function AppointmentTable({
  appointments = [],
  total = 0,
  page = 1,
  pages = 1,
  loading = false,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
  onView,
  onEdit,
  onDelete,
}) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp size={12} className="text-slate-300" />;
    return sortOrder === 'asc'
      ? <ChevronUp size={12} className="text-primary" />
      : <ChevronDown size={12} className="text-primary" />;
  };

  const SortableHeader = ({ field, label }) => (
    <th
      className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap cursor-pointer hover:text-primary select-none group"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon field={field} />
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              {['Patient','Doctor','Date','Time','Visit Type','Status','Actions'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!appointments.length) {
    return <EmptyState title="No appointments found" message="Try adjusting your filters or book a new appointment." icon={Calendar} />;
  }

  return (
    <div>
      <div className="table-wrapper bg-white">
        <table className="table">
          <thead>
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-600">Patient</th>
              <SortableHeader field="doctor" label="Doctor" />
              <SortableHeader field="appointment_date" label="Date" />
              <th className="px-4 py-3 font-semibold text-slate-600">Time</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Visit Type</th>
              <SortableHeader field="status" label="Status" />
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-slate-800">
                      {appt.patient_id?.name || '—'}
                    </p>
                    <p className="text-xs text-slate-400">ID #{appt.patient_id?.patient_id}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{appt.doctor}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(appt.appointment_date)}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatTime(appt.appointment_time)}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {appt.visit_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={appt.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView?.(appt)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEdit?.(appt)}
                      className="p-1.5 text-slate-400 hover:text-success hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => onDelete?.(appt._id)}
                        className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 px-1">
        <p className="text-sm text-slate-500">
          Showing {appointments.length} of <span className="font-semibold">{total}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm text-slate-600 font-medium px-2">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
