import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-primary">{payload[0].value} appointments</p>
      </div>
    );
  }
  return null;
};

export default function MonthlyLineChart({ data = [] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Appointment Volume</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone" dataKey="count" stroke="#0EA5E9" strokeWidth={2.5}
            dot={{ r: 4, fill: '#0EA5E9', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#0EA5E9' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
