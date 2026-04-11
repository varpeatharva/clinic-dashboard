import { format, parseISO } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  try { return format(typeof date === 'string' ? parseISO(date) : date, 'MMM dd, yyyy'); }
  catch { return '—'; }
};

export const formatTime = (time) => {
  if (!time) return '—';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

export const getStatusClass = (status) => {
  const map = {
    'Completed': 'badge-completed',
    'Scheduled': 'badge-scheduled',
    'Cancelled': 'badge-cancelled',
    'No Show':   'badge-noshow',
  };
  return map[status] || 'badge bg-slate-100 text-slate-600';
};

export const DOCTORS = ['Dr Shah', 'Dr Lewis', 'Dr Ahmed'];
export const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];
export const VISIT_TYPES = ['Check-up', 'Vaccination', 'Follow-up', 'Consultation'];
export const TIME_SLOTS = ['09:00','09:30','10:00','11:00','12:00','14:00','15:30','16:00'];
