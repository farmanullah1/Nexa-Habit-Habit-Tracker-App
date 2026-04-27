import React from 'react';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { Habit } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface CalendarHeatmapProps {
  habits: Habit[];
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ habits }) => {
  const today = new Date();
  const last30Days = eachDayOfInterval({
    start: subDays(today, 29),
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
    if (ratio < 0.3) return 1;
    if (ratio < 0.6) return 2;
    if (ratio < 0.9) return 3;
    return 4;
  };

  const intensityColors = [
    'bg-foreground/5',
    'bg-primary-start/20',
    'bg-primary-start/40',
    'bg-primary-start/70',
    'bg-primary-start'
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Activity Heatmap</h3>
        <div className="flex items-center gap-2 text-xs text-secondary">
          <span>Less</span>
          <div className="flex gap-1">
            {intensityColors.map((color, i) => (
              <div key={i} className={cn("w-3 h-3 rounded-[2px]", color)} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2">
        {last30Days.map((date, i) => {
          const count = getCompletionCount(date);
          const intensity = getIntensity(count);
          
          return (
            <motion.div
              key={date.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className="relative group"
            >
              <div
                className={cn(
                  "aspect-square rounded-[4px] transition-all duration-300",
                  intensityColors[intensity]
                )}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {format(date, 'MMM d')}: {count} habits
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <p className="text-[10px] text-secondary mt-4 text-center">
        Showing last 30 days of consistent effort
      </p>
    </div>
  );
};
