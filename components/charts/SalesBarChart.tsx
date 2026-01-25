'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface HourlyData {
  time: string;
  amount: number;
}

export function SalesBarChart({ data }: { data: HourlyData[] }) {
  // Find max for dynamic styling
  const maxAmount = data.length > 0 ? Math.max(...data.map(d => d.amount)) : 0;

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm h-[400px] w-full">
      <div className="mb-6">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">Hourly Revenue</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Sales Flow</p>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
            }}
            formatter={(value: number) => [`FRW${value.toLocaleString()}`, 'Revenue']}
          />
          <Bar 
            dataKey="amount" 
            radius={[6, 6, 6, 6]} 
            barSize={30}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.amount === maxAmount && maxAmount > 0 ? '#2563eb' : '#dbeafe'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}