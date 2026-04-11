import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react';
import useAuthStore from '../store/authStore';

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name:     z.string().min(2, 'Name is required'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role:     z.enum(['patient', 'staff']),
});

export default function Login() {
  const { login, register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register: formRegister, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(isRegistering ? registerSchema : loginSchema),
  });

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setServerError('');
    reset();
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      if (isRegistering) {
        await registerUser(data.name, data.email, data.password, data.role);
      } else {
        await login(data.email, data.password);
      }
      
      const { user } = useAuthStore.getState();
      if (user?.role === 'patient') {
        navigate('/patient-portal');
      } else {
        navigate('/');
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-700 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-4 backdrop-blur-sm border border-primary/30">
            <Activity size={32} className="text-primary-100" />
          </div>
          <h1 className="text-3xl font-bold text-white">Healix</h1>
          <p className="text-slate-400 mt-1 text-sm">Healthcare Management System</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">
            {isRegistering ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            {isRegistering ? 'Enter your details to register.' : 'Sign in to your account to continue.'}
          </p>

          {serverError && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm rounded-xl px-4 py-3 mb-4">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`w-full bg-white/10 border text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.name ? 'border-red-400' : 'border-white/20'}`}
                    {...formRegister('name')}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full bg-white/10 border text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.email ? 'border-red-400' : 'border-white/20'}`}
                  {...formRegister('email')}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full bg-white/10 border text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.password ? 'border-red-400' : 'border-white/20'}`}
                  {...formRegister('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Account Type</label>
                <div className="relative">
                  <select
                    className={`w-full bg-slate-800/50 border text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 ${errors.role ? 'border-red-400' : 'border-white/20'}`}
                    {...formRegister('role')}
                    defaultValue="patient"
                  >
                    <option value="patient" className="text-slate-900">Patient</option>
                    <option value="staff" className="text-slate-900">Staff</option>
                  </select>
                </div>
                {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role.message}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button 
              type="button" 
              onClick={toggleMode}
              className="text-xs text-slate-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register as Patient/Staff"}
            </button>
          </div>

          {!isRegistering && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs text-slate-400 font-semibold mb-2">Demo Credentials</p>
              <div className="space-y-1 text-[11px] text-slate-400">
                <p>🔑 Admin: <span className="text-slate-300">admin@clinic.com / Admin@1234</span></p>
                <p>🩺 Staff: <span className="text-slate-300">staff@clinic.com / Staff@1234</span></p>
                <p>👤 Patient: <span className="text-slate-300">aisha@patient.com / 12345678</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
