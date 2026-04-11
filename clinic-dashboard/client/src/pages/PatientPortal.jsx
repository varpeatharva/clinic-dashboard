import { useState, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import AppointmentModal from '../components/appointments/AppointmentModal';
import api from '../api/axios';
import useUIStore from '../store/uiStore';
import { format } from 'date-fns';

export default function PatientPortal() {
  const { showError, showSuccess } = useUIStore();
  const [myAppointments, setMyAppointments] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchPortalData = useCallback(async () => {
    setLoading(true);
    try {
      const localToday = format(new Date(), 'yyyy-MM-dd');
      const [myRes, todayRes] = await Promise.all([
        api.get('/appointments', { params: { scope: 'mine', limit: 50 } }),
        api.get('/appointments', { params: { limit: 100, localToday } }), // backend restricts it to today
      ]);
      setMyAppointments(myRes.data.data?.appointments || []);
      setTodaySchedule(todayRes.data.data?.appointments || []);
    } catch {
      showError('Failed to load portal data.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  const cancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      showSuccess('Appointment cancelled successfully.');
      fetchPortalData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  const upcomingAppointments = myAppointments.filter(appt => appt.status === 'Scheduled');
  const pastAppointments = myAppointments.filter(appt => appt.status !== 'Scheduled');
  const displayedAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <div>
      <Header title="My Portal" />
      <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary-600 rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden relative">
          <div className="absolute -right-20 -top-20 opacity-20 pointer-events-none">
            <CalendarIcon size={200} />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to your Patient Portal</h1>
            <p className="text-primary-50 max-w-lg text-sm md:text-base">
              Here you can view your upcoming appointments, check today's clinic availability, and easily book new consultations.
            </p>
            <button 
              onClick={() => setShowBookModal(true)} 
              className="mt-6 bg-white text-primary font-bold py-2 px-6 rounded-xl shadow border border-white hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Book Appointment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* My Appointments Panel */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <User size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-slate-800">My Appointments</h2>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${
                    activeTab === 'upcoming' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-all ${
                    activeTab === 'history' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  History
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2].map(i => <div key={i} className="h-20 bg-slate-50 rounded-xl"></div>)}
              </div>
            ) : displayedAppointments.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {displayedAppointments.map(appt => (
                  <div key={appt._id} className="p-4 rounded-xl border border-slate-100 hover:border-primary/30 transition-colors bg-slate-50/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-slate-800">{appt.doctor}</div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-opacity-10 
                        ${appt.status === 'Scheduled' ? 'bg-blue-500 text-blue-600' : ''}
                        ${appt.status === 'Completed' ? 'bg-emerald-500 text-emerald-600' : ''}
                        ${appt.status === 'Cancelled' ? 'bg-red-500 text-red-600' : ''}
                        ${appt.status === 'No Show' ? 'bg-orange-500 text-orange-600' : ''}
                      `}>
                        {appt.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1"><CalendarIcon size={12}/> {format(new Date(appt.appointment_date), 'MMM dd, yyyy')}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/> {appt.appointment_time}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-400 mt-2">{appt.visit_type}</div>
                    
                    {appt.status === 'Scheduled' && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                        <button onClick={() => cancelAppointment(appt._id)} className="text-xs text-red-500 font-semibold hover:text-red-600">Cancel Appointment</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 m-auto">
                <CalendarIcon size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">
                  {activeTab === 'upcoming' ? 'You have no upcoming appointments.' : 'No past appointments found.'}
                </p>
              </div>
            )}
          </div>

          {/* Today's Schedule Panel */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-slate-800">Clinic Schedule (Today)</h2>
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                {format(new Date(), 'MMM dd')}
              </span>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl"></div>)}
              </div>
            ) : todaySchedule.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {todaySchedule.map(appt => (
                  <div key={appt._id} className="flex justify-between items-center p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-1 ring-primary/20">
                        {appt.appointment_time}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{appt.doctor}</p>
                        <p className="text-xs text-slate-500">{appt.visit_type}</p>
                      </div>
                    </div>
                    {appt.patient_id ? (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        Occupied
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-500 font-medium">Available</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Clock size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No appointments scheduled for today.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {showBookModal && (
        <AppointmentModal 
          onClose={() => setShowBookModal(false)} 
          onSuccess={fetchPortalData} 
        />
      )}
    </div>
  );
}
