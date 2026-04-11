import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2, X, Shield } from 'lucide-react';
import Header from '../components/layout/Header';
import EmptyState from '../components/ui/EmptyState';
import api from '../api/axios';
import useUIStore from '../store/uiStore';
import { format } from 'date-fns';

const schema = z.object({
  name:     z.string().min(1, 'Name required'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters').optional().or(z.literal('')),
  role:     z.enum(['admin','staff']),
});

function UserModal({ user: editUser, onClose, onSuccess }) {
  const { showSuccess, showError } = useUIStore();
  const isEdit = Boolean(editUser);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: editUser ? { name: editUser.name, email: editUser.email, role: editUser.role, password: '' } : { role: 'staff' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    // Remove empty password for edits
    if (isEdit && !data.password) delete data.password;
    try {
      if (isEdit) await api.put(`/users/${editUser._id}`, data);
      else await api.post('/users', data);
      showSuccess(isEdit ? 'User updated.' : 'User created.');
      onSuccess?.();
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save user.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit Staff Member' : 'Add Staff Member'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input className={`input ${errors.name ? 'input-error':''}`} placeholder="Name" {...register('name')} />
            {errors.name && <p className="error-msg">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email *</label>
            <input className={`input ${errors.email ? 'input-error':''}`} placeholder="email@clinic.com" {...register('email')} />
            {errors.email && <p className="error-msg">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password {isEdit && <span className="text-slate-400 font-normal">(leave blank to keep current)</span>}</label>
            <input type="password" className={`input ${errors.password ? 'input-error':''}`} placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="error-msg">{errors.password.message}</p>}
          </div>
          <div>
            <label className="label">Role *</label>
            <select className="input" {...register('role')}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving...': isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StaffManagement() {
  const { showError, showSuccess } = useUIStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.data || []);
    } catch { showError('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      showSuccess('User deleted.');
      fetchUsers();
    } catch (err) { showError(err.response?.data?.message || 'Failed to delete.'); }
  };

  return (
    <div>
      <Header title="Staff Management" />
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Team Members</h2>
            <p className="text-xs text-slate-400 mt-0.5">{users.length} staff accounts</p>
          </div>
          <button onClick={() => { setEditUser(null); setShowModal(true); }} className="btn-primary">
            <Plus size={15} />
            Add Staff
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({length:4}).map((_,i) => <div key={i} className="skeleton h-16 rounded-xl"/>)}
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="No staff members" message="Add your first staff account." icon={Shield} />
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="card flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-scheduled' : 'bg-slate-100 text-slate-600'}`}>
                  {u.role}
                </span>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Joined {format(new Date(u.createdAt), 'MMM dd, yyyy')}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditUser(u); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-success hover:bg-green-50 rounded-lg transition-colors"><Pencil size={14}/></button>
                  <button onClick={() => handleDelete(u._id, u.name)} className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
