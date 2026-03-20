import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export const InvestmentChart: React.FC<{ data: { year: number; value: number }[] }> = ({ data }) => (
  <div className="h-[200px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3}/><stop offset="95%" stopColor="#C5A059" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`} />
        <Tooltip contentStyle={{ backgroundColor: '#001A3D', borderRadius: '16px', border: '1px solid rgba(197, 160, 89, 0.2)', color: '#fff' }} />
        <Area type="monotone" dataKey="value" stroke="#C5A059" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
