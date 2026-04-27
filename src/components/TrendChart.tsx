import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Habit } from '../types';

interface TrendChartProps {
  habits: Habit[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-2 border-primary-start/20 shadow-2xl backdrop-blur-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">{label}</p>
        <p className="text-sm font-black text-gradient">
          {payload[0].value} <span className="text-foreground/50 font-medium">Habits Done</span>
        </p>
      </div>
    );
  }
  return null;
};

export const TrendChart: React.FC<TrendChartProps> = ({ habits }) => {
  const data = React.useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return last7Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = habits.filter(h => h.completions.includes(dateStr)).length;
      return {
        name: format(date, 'EEE'),
        completed: count,
      };
    });
  }, [habits]);

  return (
    <div className="glass-card p-6 h-[300px] flex flex-col group">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-secondary">Weekly Momentum</h3>
        <div className="flex items-center gap-1.5 bg-primary-start/10 px-3 py-1 rounded-full border border-primary-start/10">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-start animate-pulse" />
          <span className="text-[10px] font-black uppercase text-primary-mid tracking-widest">Live Feed</span>
        </div>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary-start)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--primary-start)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(var(--foreground), 0.03)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900 }} 
              dy={15}
            />
            <YAxis hide domain={[0, 'dataMax + 1']} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary-start)', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="var(--primary-start)" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
              animationDuration={2000}
              className="drop-shadow-[0_0_15px_rgba(var(--primary-start),0.3)]"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
