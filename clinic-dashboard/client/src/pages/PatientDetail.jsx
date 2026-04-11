import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Phone, Mail } from 'lucide-react';
import Header from '../components/layout/Header';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, formatTime } from '../utils/formatters';
import api from '../api/axios';
import useUIStore from '../store/uiStore';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useUIStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: res } = await api.get(`/patients/${id}`);
        setData(res.data);
      } catch { showError('Failed to load patient.'); navigate('/patients'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Header title="Patient Detail" />
        <div className="p-6">
          <div className="skeleton h-48 rounded-xl mb-6" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const { patient, appointments } = data;
  const completed = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div>
      <Header title="Patient Detail" />
      <div className="p-6 space-y-6 animate-fade-in">
        <button
          onClick={() => navigate('/patients')}
          className="btn-ghost -ml-1 text-slate-500"
        >
          <ArrowLeft size={16} />
          Back to Patients
        </button>

        {/* Profile Card */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl flex-shrink-0">
              {patient.name[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
              <p className="text-slate-400 text-sm">Patient ID #{patient.patient_id}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                {patient.age && (
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <User size={14} />
                    {patient.age} years old · {patient.gender || 'N/A'}
                  </div>
                )}
                {patient.contact && (
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Phone size={14} />
                    {patient.contact}
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Mail size={14} />
                    {patient.email}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800">{appointments.length}</p>
              <p className="text-xs text-slate-400">Total Visits</p>
              <p className="text-sm font-semibold text-success mt-1">{completed} Completed</p>
            </div>
          </div>
        </div>

        {/* Appointment History */}
        <div className="card">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            Appointment History ({appointments.length})
          </h3>

          {appointments.length === 0 ? (
            <EmptyState title="No appointments" message="This patient has no appointment history." />
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt._id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Calendar size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{appt.visit_type}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(appt.appointment_date)} at {formatTime(appt.appointment_time)} · {appt.doctor}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
