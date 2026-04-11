import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatTime } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-500 mb-1">{formatTime(label)}</p>
        <p className="text-sm font-bold text-primary">{payload[0].value} appointments</p>
        {payload[0].payload.isPeak && (
          <p className="text-xs text-warning mt-1">⭐ Peak Hour</p>
        )}
      </div>
    );
  }
  return null;
};

export default function TimeSlotBarChart({ data = [] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">Peak Time Slots</h3>
      <p className="text-xs text-slate-400 mb-4">Highlighted slots are peak hours</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.isPeak ? '#F97316' : '#0EA5E9'} opacity={entry.isPeak ? 1 : 0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
