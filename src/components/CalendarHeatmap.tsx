import React from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Habit } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface CalendarHeatmapProps {
  habits: Habit[];
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ habits }) => {
  const today = new Date();
  const last35Days = eachDayOfInterval({
    start: subDays(today, 34),
    end: today,
  });

  const getCompletionCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habits.filter(h => h.completions.includes(dateStr)).length;
  };

  const getIntensity = (count: number) => {
    if (habits.length === 0) return 0;
    const ratio = count / habits.length;
    if (ratio === 0) return 0;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  const intensityColors = [
    'bg-foreground/5',
    'bg-primary-start/20 shadow-[0_0_10px_rgba(var(--primary-start),0.1)]',
    'bg-primary-start/40 shadow-[0_0_15px_rgba(var(--primary-start),0.2)]',
    'bg-primary-start/70 shadow-[0_0_20px_rgba(var(--primary-start),0.3)]',
    'bg-primary-start shadow-[0_0_25px_rgba(var(--primary-start),0.4)]'
  ];

  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-secondary">Consistency Map</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-secondary font-black uppercase tracking-widest">
          <span>Less</span>
          <div className="flex gap-1">
            {intensityColors.map((color, i) => (
              <div key={i} className={cn("w-2 h-2 rounded-[2px]", color)} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2.5">
        {last35Days.map((date, i) => {
          const count = getCompletionCount(date);
          const intensity = getIntensity(count);
          
          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.01 }}
              className="relative group/day"
            >
              <div
                className={cn(
                  "aspect-square rounded-[6px] transition-all duration-500 hover:scale-125 hover:z-20 cursor-help",
                  intensityColors[intensity]
                )}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[10px] font-bold rounded-lg opacity-0 group-hover/day:opacity-100 transition-all scale-75 group-hover/day:scale-100 whitespace-nowrap z-30 pointer-events-none shadow-2xl">
                {format(date, 'EEEE, MMM do')}: <span className="text-primary-mid">{count} habits</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-6 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <span key={day} className="text-[9px] font-black uppercase tracking-tighter">{day}</span>
          ))}
        </div>
      </div>

      {/* Grid Shimmer Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-2000" />
      </div>
    </div>
  );
};
