import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.data, isAuthenticated: true });
        return data;
      },

      register: async (name, email, password, role) => {
        const { data } = await api.post('/auth/register', { name, email, password, role });
        set({ user: data.data, isAuthenticated: true });
        return data;
      },

      logout: async () => {
        await api.post('/auth/logout');
        set({ user: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
);

export default useAuthStore;
