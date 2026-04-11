import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import FilterBar, { DEFAULT_FILTERS } from '../components/appointments/FilterBar';
import AppointmentTable from '../components/appointments/AppointmentTable';
import AppointmentModal, { ViewModal } from '../components/appointments/AppointmentModal';
import api from '../api/axios';
import useUIStore from '../store/uiStore';

export default function Appointments() {
  const { showError, showSuccess } = useUIStore();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortBy, setSortBy] = useState('appointment_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewAppt, setViewAppt] = useState(null);
  const [editAppt, setEditAppt] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);



  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const p = {};
      if (filters.startDate) p.startDate = filters.startDate;
      if (filters.endDate)   p.endDate   = filters.endDate;
      if (filters.doctor     !== 'All') p.doctor     = filters.doctor;
      if (filters.status     !== 'All') p.status     = filters.status;
      if (filters.visit_type !== 'All') p.visit_type = filters.visit_type;

      const { data } = await api.get('/appointments', {
        params: { ...p, page, limit: 10, sortBy, sortOrder },
      });
      setAppointments(data.data?.appointments || []);
      setTotal(data.data?.total || 0);
      setPages(data.data?.pages || 1);
    } catch { showError('Failed to load appointments.'); }
    finally { setLoading(false); }
  }, [filters, page, sortBy, sortOrder]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      showSuccess('Appointment deleted.');
      fetchAppointments();
    } catch (err) { showError(err.response?.data?.message || 'Failed to delete.'); }
  };

  return (
    <div>
      <Header title="Appointments" />
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Appointment Schedule</h2>
            <p className="text-xs text-slate-400 mt-0.5">{total} total appointments</p>
          </div>
          <button onClick={() => setShowBookModal(true)} className="btn-primary">
            <Plus size={15} />
            Book Appointment
          </button>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={(updates) => { setFilters(f => ({ ...f, ...updates })); setPage(1); }}
          onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
        />

        <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
          <AppointmentTable
            appointments={appointments}
            total={total}
            page={page}
            pages={pages}
            loading={loading}
            onPageChange={setPage}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onView={setViewAppt}
            onEdit={setEditAppt}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {showBookModal && <AppointmentModal onClose={() => setShowBookModal(false)} onSuccess={fetchAppointments} />}
      {editAppt && <AppointmentModal appointment={editAppt} onClose={() => setEditAppt(null)} onSuccess={fetchAppointments} />}
      {viewAppt && <ViewModal appt={viewAppt} onClose={() => setViewAppt(null)} />}
    </div>
  );
}
