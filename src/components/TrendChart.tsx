import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Habit } from '../types';

interface TrendChartProps {
  habits: Habit[];
}

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
    <div className="glass-card p-6 h-[300px] flex flex-col">
      <h3 className="font-bold text-lg mb-6">Weekly Trend</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="100%">
                <stop offset="5%" stopColor="var(--primary-start)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary-start)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--background)', 
                borderColor: 'var(--card-border)',
                borderRadius: '12px',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="var(--primary-start)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
