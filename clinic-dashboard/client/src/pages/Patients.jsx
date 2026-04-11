import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Header from '../components/layout/Header';
import PatientModal from '../components/patients/PatientModal';
import EmptyState from '../components/ui/EmptyState';
import api from '../api/axios';
import useUIStore from '../store/uiStore';
import useAuthStore from '../store/authStore';

export default function Patients() {
  const { showError, showSuccess } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/patients', { params: { search, page, limit: 10 } });
      setPatients(data.data?.patients || []);
      setTotal(data.data?.total || 0);
      setPages(data.data?.pages || 1);
    } catch { showError('Failed to load patients.'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete patient "${name}" and all their appointments?`)) return;
    try {
      await api.delete(`/patients/${id}`);
      showSuccess('Patient deleted.');
      fetchPatients();
    } catch (err) { showError(err.response?.data?.message || 'Failed to delete.'); }
  };

  return (
    <div>
      <Header title="Patients" />
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Patient Registry</h2>
            <p className="text-xs text-slate-400 mt-0.5">{total} registered patients</p>
          </div>
          <button onClick={() => { setEditPatient(null); setShowModal(true); }} className="btn-primary">
            <Plus size={15} />
            New Patient
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by name or patient ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10 max-w-md"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="table-wrapper bg-white">
            <table className="table">
              <thead><tr>{['Name','Age','Gender','Contact','Email','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>{Array.from({length:10}).map((_,i)=><tr key={i}>{Array.from({length:6}).map((_,j)=><td key={j}><div className="skeleton h-4 w-full rounded"/></td>)}</tr>)}</tbody>
            </table>
          </div>
        ) : patients.length === 0 ? (
          <EmptyState title="No patients found" message="Add your first patient or adjust your search." icon={User} />
        ) : (
          <div>
            <div className="table-wrapper bg-white">
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <button
                          onClick={() => navigate(`/patients/${p._id}`)}
                          className="flex items-center gap-2 hover:text-primary transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs flex-shrink-0">
                            {p.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 hover:text-primary">{p.name}</p>
                            <p className="text-xs text-slate-400">ID #{p.patient_id}</p>
                          </div>
                        </button>
                      </td>
                      <td>{p.age ?? '—'}</td>
                      <td>{p.gender ?? '—'}</td>
                      <td>{p.contact ?? '—'}</td>
                      <td className="text-slate-500">{p.email ?? '—'}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditPatient(p); setShowModal(true); }}
                            className="p-1.5 text-slate-400 hover:text-success hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(p._id, p.name)}
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
              <p className="text-sm text-slate-500">Showing {patients.length} of <span className="font-semibold">{total}</span></p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm text-slate-600 font-medium px-2">Page {page} of {pages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= pages} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <PatientModal
          patient={editPatient}
          onClose={() => { setShowModal(false); setEditPatient(null); }}
          onSuccess={fetchPatients}
        />
      )}
    </div>
  );
}
