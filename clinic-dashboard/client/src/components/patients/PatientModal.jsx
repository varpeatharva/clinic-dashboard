import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';

const schema = z.object({
  name:    z.string().min(1, 'Name is required'),
  age:     z.coerce.number().min(0).max(150).optional(),
  gender:  z.enum(['Male','Female','Other']).optional(),
  contact: z.string().optional(),
  email:   z.string().email('Invalid email').optional().or(z.literal('')),
});

export default function PatientModal({ onClose, onSuccess, patient }) {
  const { showSuccess, showError } = useUIStore();
  const isEdit = Boolean(patient);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: patient || {},
  });

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/patients/${patient._id}`, formData);
        showSuccess('Patient updated successfully.');
      } else {
        await api.post('/patients', formData);
        showSuccess('Patient created successfully.');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save patient.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit Patient' : 'New Patient'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className={`input ${errors.name ? 'input-error' : ''}`} placeholder="Patient name" {...register('name')} />
            {errors.name && <p className="error-msg">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Age</label>
              <input type="number" className="input" placeholder="Age" {...register('age')} />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" {...register('gender')}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Contact Number</label>
            <input className="input" placeholder="Phone number" {...register('contact')} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className={`input ${errors.email ? 'input-error' : ''}`} placeholder="email@example.com" {...register('email')} />
            {errors.email && <p className="error-msg">{errors.email.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...' : isEdit ? 'Update Patient' : 'Create Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
