import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import clsx from 'clsx';

import useAuthStore from './store/authStore';
import useUIStore from './store/uiStore';

import Sidebar from './components/layout/Sidebar';
import ToastContainer from './components/ui/Toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Appointments from './pages/Appointments';
import StaffManagement from './pages/StaffManagement';
import NotFound from './pages/NotFound';
import PatientPortal from './pages/PatientPortal';

// ─── Protected Layout Wrapper ────────────────────────────────────────────────
function AppLayout() {
  const { sidebarOpen } = useUIStore();
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main
        className={clsx(
          'flex-1 min-w-0 transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}

// ─── Route guards ─────────────────────────────────────────────────────────────
function RequireAuth() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireStaff() {
  const { user } = useAuthStore();
  return (user?.role === 'staff' || user?.role === 'admin') ? <Outlet /> : <Navigate to="/patient-portal" replace />;
}

function RequirePatient() {
  const { user } = useAuthStore();
  return user?.role === 'patient' ? <Outlet /> : <Navigate to="/" replace />;
}

function RequireAdmin() {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}

function RedirectIfAuth() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { fetchMe } = useAuthStore();

  // Verify token on mount
  useEffect(() => { fetchMe(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<RedirectIfAuth />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            
            {/* Staff Only Routes */}
            <Route element={<RequireStaff />}>
              <Route path="/"                element={<Dashboard />} />
              <Route path="/patients"        element={<Patients />} />
              <Route path="/patients/:id"    element={<PatientDetail />} />
              <Route path="/appointments"    element={<Appointments />} />
              
              {/* Admin only */}
              <Route element={<RequireAdmin />}>
                <Route path="/staff" element={<StaffManagement />} />
              </Route>
            </Route>

            {/* Patient Only Routes */}
            <Route element={<RequirePatient />}>
              <Route path="/patient-portal" element={<PatientPortal />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}
