import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, UserCog, LogOut, ChevronLeft, ChevronRight,
  Activity, Menu
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import clsx from 'clsx';

const navLinks = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard',        roles: ['admin','staff'] },
  { to: '/patients',      icon: Users,            label: 'Patients',         roles: ['admin','staff'] },
  { to: '/appointments',  icon: Calendar,         label: 'Appointments',     roles: ['admin','staff'] },
  { to: '/staff',         icon: UserCog,          label: 'Staff Management', roles: ['admin'] },
  { to: '/patient-portal',icon: Calendar,         label: 'My Portal',        roles: ['patient'] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleLinks = navLinks.filter((l) => l.roles.includes(user?.role));

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 h-screen bg-sidebar flex flex-col z-40',
          'transition-all duration-300 ease-in-out',
          sidebarOpen 
            ? 'w-64 translate-x-0' 
            : '-translate-x-full w-64 lg:w-16 lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="bg-primary rounded-lg p-1.5">
                <Activity size={18} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">Healix</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {visibleLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx('sidebar-link', isActive && 'active')
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="animate-fade-in">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="border-t border-white/10 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary-100 font-semibold text-sm flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-slate-400 text-xs capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-danger transition-colors p-1 rounded-md hover:bg-white/10"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center text-slate-400 hover:text-danger p-2 rounded-md hover:bg-white/10 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
