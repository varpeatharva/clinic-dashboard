import { useState, useEffect, useCallback } from 'react';
import { Users, Calendar, Clock, TrendingDown, Activity } from 'lucide-react';
import Header from '../components/layout/Header';
import KPICard from '../components/ui/KPICard';
import FilterBar, { DEFAULT_FILTERS } from '../components/appointments/FilterBar';
import AppointmentTable from '../components/appointments/AppointmentTable';
import AppointmentModal, { ViewModal } from '../components/appointments/AppointmentModal';
import MonthlyLineChart from '../components/charts/MonthlyLineChart';
import DoctorBarChart from '../components/charts/DoctorBarChart';
import VisitTypeBarChart from '../components/charts/VisitTypeBarChart';
import TimeSlotBarChart from '../components/charts/TimeSlotBarChart';
import api from '../api/axios';
import useUIStore from '../store/uiStore';
import { formatTime } from '../utils/formatters';

export default function Dashboard() {
  const { showError } = useUIStore();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [kpis, setKpis] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [chartData, setChartData] = useState({ monthly: [], byDoctor: [], byVisitType: [], byTimeSlot: [] });
  const [chartsLoading, setChartsLoading] = useState(true);

  const [appointments, setAppointments] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sortBy, setSortBy] = useState('appointment_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const [viewAppt, setViewAppt] = useState(null);
  const [editAppt, setEditAppt] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const buildParams = useCallback(() => {
    const p = {};
    if (filters.startDate) p.startDate = filters.startDate;
    if (filters.endDate)   p.endDate   = filters.endDate;
    if (filters.doctor     !== 'All') p.doctor     = filters.doctor;
    if (filters.status     !== 'All') p.status     = filters.status;
    if (filters.visit_type !== 'All') p.visit_type = filters.visit_type;
    return p;
  }, [filters]);

  // Fetch KPIs
  useEffect(() => {
    const load = async () => {
      setKpiLoading(true);
      try {
        const { data } = await api.get('/analytics/kpis', { params: buildParams() });
        setKpis(data.data);
      } catch { showError('Failed to load KPIs.'); }
      finally { setKpiLoading(false); }
    };
    load();
  }, [filters]);

  // Fetch chart data
  useEffect(() => {
    const load = async () => {
      setChartsLoading(true);
      try {
        const params = buildParams();
        const [monthly, byDoctor, byVisitType, byTimeSlot] = await Promise.all([
          api.get('/analytics/monthly', { params }),
          api.get('/analytics/by-doctor', { params }),
          api.get('/analytics/by-visit-type', { params }),
          api.get('/analytics/by-time-slot', { params }),
        ]);
        setChartData({
          monthly:     monthly.data.data,
          byDoctor:    byDoctor.data.data,
          byVisitType: byVisitType.data.data,
          byTimeSlot:  byTimeSlot.data.data,
        });
      } catch { showError('Failed to load chart data.'); }
      finally { setChartsLoading(false); }
    };
    load();
  }, [filters]);

  // Fetch appointments table
  const fetchAppointments = useCallback(async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get('/appointments', {
        params: { ...buildParams(), page, limit: 10, sortBy, sortOrder },
      });
      setAppointments(data.data?.appointments || []);
      setTotal(data.data?.total || 0);
      setPages(data.data?.pages || 1);
    } catch { showError('Failed to load appointments.'); }
    finally { setTableLoading(false); }
  }, [filters, page, sortBy, sortOrder]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleFilterChange = (updates) => {
    setFilters((f) => ({ ...f, ...updates }));
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortOrder('desc'); }
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete.');
    }
  };

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6 animate-fade-in">

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={() => { setFilters(DEFAULT_FILTERS); setPage(1); }}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Unique Patients"
            value={kpis?.totalPatients ?? '—'}
            icon={Users}
            color="primary"
            subtitle="Active patient base"
            loading={kpiLoading}
          />
          <KPICard
            title="Total Appointments"
            value={kpis?.totalAppointments ?? '—'}
            icon={Calendar}
            color="info"
            subtitle="All time records"
            loading={kpiLoading}
          />
          <KPICard
            title="No-Show Rate"
            value={kpis ? `${kpis.noShowRate}%` : '—'}
            icon={TrendingDown}
            color="warning"
            subtitle={`${kpis?.statusBreakdown?.['No Show'] ?? 0} no-shows`}
            loading={kpiLoading}
          />
          <KPICard
            title="Non-Completion Rate"
            value={kpis ? `${kpis.nonCompletionRate}%` : '—'}
            icon={Activity}
            color="danger"
            subtitle="No show + cancelled"
            loading={kpiLoading}
          />
          <KPICard
            title="Peak Hour"
            value={kpis ? formatTime(kpis.peakHour) : '—'}
            icon={Clock}
            color="success"
            subtitle={kpis ? `${kpis.peakHourCount} appointments` : ''}
            loading={kpiLoading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chartsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card"><div className="skeleton h-52 rounded-lg" /></div>
            ))
          ) : (
            <>
              <MonthlyLineChart data={chartData.monthly} />
              <VisitTypeBarChart data={chartData.byVisitType} />
              <DoctorBarChart data={chartData.byDoctor} />
              <TimeSlotBarChart data={chartData.byTimeSlot} />
            </>
          )}
        </div>

        {/* Appointment Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Appointments</h2>
              <p className="text-xs text-slate-400 mt-0.5">{total} total records</p>
            </div>
            <button onClick={() => setShowBookModal(true)} className="btn-primary">
              <Calendar size={15} />
              Book Appointment
            </button>
          </div>
          <AppointmentTable
            appointments={appointments}
            total={total}
            page={page}
            pages={pages}
            loading={tableLoading}
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

      {/* Modals */}
      {showBookModal && (
        <AppointmentModal
          onClose={() => setShowBookModal(false)}
          onSuccess={fetchAppointments}
        />
      )}
      {editAppt && (
        <AppointmentModal
          appointment={editAppt}
          onClose={() => setEditAppt(null)}
          onSuccess={fetchAppointments}
        />
      )}
      {viewAppt && <ViewModal appt={viewAppt} onClose={() => setViewAppt(null)} />}
    </div>
  );
}
