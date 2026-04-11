import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Search } from 'lucide-react';
import { DOCTORS, STATUSES, VISIT_TYPES, TIME_SLOTS, formatDate, formatTime } from '../../utils/formatters';
import StatusBadge from '../ui/StatusBadge';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const appointmentSchema = z.object({
  patient_id:       z.string().min(1, 'Please select a patient'),
  doctor:           z.enum(['Dr Shah', 'Dr Lewis', 'Dr Ahmed'], { message: 'Please select a doctor' }),
  appointment_date: z.string().min(1, 'Date is required'),
  appointment_time: z.enum(['09:00','09:30','10:00','11:00','12:00','14:00','15:30','16:00'], { message: 'Select a time slot' }),
  visit_type:       z.enum(['Check-up','Vaccination','Follow-up','Consultation'], { message: 'Select visit type' }),
  status:           z.enum(['Scheduled','Completed','Cancelled','No Show']).optional(),
});

const newPatientSchema = z.object({
  name:    z.string().min(1, 'Name is required'),
  age:     z.coerce.number().min(0).max(150).optional(),
  gender:  z.enum(['Male','Female','Other']).optional(),
  contact: z.string().optional(),
  email:   z.string().email().optional().or(z.literal('')),
});

// ─── View Modal ──────────────────────────────────────────────────────────────
function ViewModal({ appt, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Appointment Details</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-slate-400 mb-1">Patient</p><p className="font-semibold text-slate-800">{appt.patient_id?.name}</p></div>
            <div><p className="text-xs text-slate-400 mb-1">Patient ID</p><p className="font-semibold text-slate-800">#{appt.patient_id?.patient_id}</p></div>
            <div><p className="text-xs text-slate-400 mb-1">Doctor</p><p className="font-semibold text-slate-800">{appt.doctor}</p></div>
            <div><p className="text-xs text-slate-400 mb-1">Visit Type</p><p className="font-semibold text-slate-800">{appt.visit_type}</p></div>
            <div><p className="text-xs text-slate-400 mb-1">Date</p><p className="font-semibold text-slate-800">{formatDate(appt.appointment_date)}</p></div>
            <div><p className="text-xs text-slate-400 mb-1">Time</p><p className="font-semibold text-slate-800">{formatTime(appt.appointment_time)}</p></div>
            <div><p className="text-xs text-slate-400 mb-1">Status</p><StatusBadge status={appt.status} /></div>
            <div><p className="text-xs text-slate-400 mb-1">Appointment ID</p><p className="font-semibold text-slate-800">#{appt.appointment_id}</p></div>
          </div>
        </div>
        <div className="p-6 pt-0">
          <button onClick={onClose} className="btn-secondary w-full justify-center">Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Appointment Modal ──────────────────────────────────────────────────
export default function AppointmentModal({ onClose, onSuccess, appointment }) {
  const { showSuccess, showError } = useUIStore();
  const { user } = useAuthStore();
  const isEdit = Boolean(appointment);
  const isPatientRole = user?.role === 'patient';

  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ? {
      patient_id:       appointment.patient_id?._id || '',
      doctor:           appointment.doctor,
      appointment_date: appointment.appointment_date?.split('T')[0],
      appointment_time: appointment.appointment_time,
      visit_type:       appointment.visit_type,
      status:           appointment.status,
    } : { 
      status: 'Scheduled', 
      patient_id: isPatientRole ? user.patient_ref : '' 
    },
  });

  const newPatientForm = useForm({ resolver: zodResolver(newPatientSchema) });

  // Fetch patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await api.get(`/patients?search=${patientSearch}&limit=50`);
        setPatients(data.data?.patients || []);
      } catch {}
    };
    fetchPatients();
  }, [patientSearch]);

  const handleCreatePatient = async (formData) => {
    setCreatingPatient(true);
    try {
      const { data } = await api.post('/patients', formData);
      const newPt = data.data;
      setPatients((prev) => [newPt, ...prev]);
      setValue('patient_id', newPt._id);
      setShowNewPatientForm(false);
      newPatientForm.reset();
      showSuccess(`Patient "${newPt.name}" created and selected.`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create patient.');
    } finally {
      setCreatingPatient(false);
    }
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/appointments/${appointment._id}`, formData);
        showSuccess('Appointment updated successfully.');
      } else {
        await api.post('/appointments', formData);
        showSuccess('Appointment booked successfully.');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Edit Appointment' : 'Book New Appointment'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Patient Selection (Hidden for patients) */}
          {!isPatientRole && (
            <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label">Patient *</label>
              <button
                type="button"
                onClick={() => setShowNewPatientForm(!showNewPatientForm)}
                className="text-xs text-primary hover:text-primary-600 flex items-center gap-1 font-medium"
              >
                <Plus size={12} />
                {showNewPatientForm ? 'Cancel' : 'Add New Patient'}
              </button>
            </div>

            {/* Inline new patient form */}
            {showNewPatientForm ? (
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
                <p className="text-xs font-semibold text-slate-600">New Patient Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input placeholder="Full name *" className={`input ${newPatientForm.formState.errors.name ? 'input-error' : ''}`} {...newPatientForm.register('name')} />
                    {newPatientForm.formState.errors.name && <p className="error-msg">{newPatientForm.formState.errors.name.message}</p>}
                  </div>
                  <input type="number" placeholder="Age" className="input" {...newPatientForm.register('age')} />
                  <select className="input" {...newPatientForm.register('gender')}>
                    <option value="">Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                  <input placeholder="Contact number" className="input" {...newPatientForm.register('contact')} />
                  <input placeholder="Email" className="input" {...newPatientForm.register('email')} />
                </div>
                <button
                  type="button"
                  disabled={creatingPatient}
                  onClick={newPatientForm.handleSubmit(handleCreatePatient)}
                  className="btn-primary text-xs py-1.5"
                >
                  {creatingPatient ? 'Creating...' : 'Create & Select Patient'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search patient by name..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="input pl-8"
                  />
                </div>
                <select
                  className={`input ${errors.patient_id ? 'input-error' : ''}`}
                  {...register('patient_id')}
                >
                  <option value="">Select a patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (ID #{p.patient_id})
                    </option>
                  ))}
                </select>
                {errors.patient_id && <p className="error-msg">{errors.patient_id.message}</p>}
              </div>
            )}
          </div>
          )}

          {/* Doctor */}
          <div>
            <label className="label">Doctor *</label>
            <select className={`input ${errors.doctor ? 'input-error' : ''}`} {...register('doctor')}>
              <option value="">Select doctor</option>
              {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.doctor && <p className="error-msg">{errors.doctor.message}</p>}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                className={`input ${errors.appointment_date ? 'input-error' : ''}`}
                {...register('appointment_date')}
              />
              {errors.appointment_date && <p className="error-msg">{errors.appointment_date.message}</p>}
            </div>
            <div>
              <label className="label">Time Slot *</label>
              <select className={`input ${errors.appointment_time ? 'input-error' : ''}`} {...register('appointment_time')}>
                <option value="">Select time</option>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
              </select>
              {errors.appointment_time && <p className="error-msg">{errors.appointment_time.message}</p>}
            </div>
          </div>

          {/* Visit Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Visit Type *</label>
              <select className={`input ${errors.visit_type ? 'input-error' : ''}`} {...register('visit_type')}>
                <option value="">Select type</option>
                {VISIT_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              {errors.visit_type && <p className="error-msg">{errors.visit_type.message}</p>}
            </div>
            {isEdit && (
              <div>
                <label className="label">Status</label>
                <select className="input" {...register('status')}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : isEdit ? 'Update Appointment' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { ViewModal };
