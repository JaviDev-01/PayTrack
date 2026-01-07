import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { WorkEntry } from '../types';
import { addDays } from '../utils';

interface StatsChartProps {
  data: WorkEntry[];
  weekStart?: Date; // Optional: If provided, renders the full week Mon-Sun
}

export const StatsChart: React.FC<StatsChartProps> = ({ data, weekStart }) => {
  let chartData;

  if (weekStart) {
    // Generate empty buckets for the full week (Mon-Sun)
    chartData = Array.from({ length: 7 }).map((_, i) => {
      const currentDay = addDays(weekStart, i);
      const dateStr = currentDay.toISOString().split('T')[0];
      const entry = data.find(e => e.date === dateStr);
      
      const dayName = currentDay.toLocaleDateString('es-ES', { weekday: 'short' });
      const isWeekend = currentDay.getDay() === 0 || currentDay.getDay() === 6;

      return {
        name: dayName.charAt(0).toUpperCase() + dayName.slice(1), // Capitalize
        fullDate: dateStr,
        amount: entry ? entry.totalEarned : 0,
        hours: entry ? entry.hours : 0,
        isWeekend: isWeekend
      };
    });
  } else {
    // Fallback legacy mode
    chartData = [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
      .map(entry => ({
        name: new Date(entry.date).toLocaleDateString('es-ES', { weekday: 'short' }),
        fullDate: entry.date,
        amount: entry.totalEarned,
        hours: entry.hours,
        isWeekend: entry.isWeekend
      }));
  }

  const hasData = chartData.some(d => d.amount > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        <BarChart2 size={32} className="mb-2 opacity-20" />
        <span className="text-sm font-medium">Sin actividad esta semana</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full mt-2 animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(value) => `${value}€`}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9', radius: 4 }}
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: 'none', 
              borderRadius: '8px',
              color: '#fff',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              fontSize: '12px'
            }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${value}€`, 'Ganancia']}
            labelFormatter={() => ''}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={32}>
             {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isWeekend ? '#ec4899' : '#4f46e5'} 
                fillOpacity={entry.amount > 0 ? 1 : 0.1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

import { BarChart2 } from 'lucide-react';