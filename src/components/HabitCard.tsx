import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, MoreVertical, Trash2 } from 'lucide-react';
import { Habit } from '../types';
import { calculateStreak, getTodayStr } from '../utils';
import { cn } from '../lib/utils';
import { playPop, playSuccess } from '../lib/sounds';
import confetti from 'canvas-confetti';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggle, onDelete }) => {
  const today = getTodayStr();
  const isDone = habit.completions.includes(today);
  const streak = calculateStreak(habit.completions);

  const handleToggle = () => {
    playPop();
    if (!isDone) {
      playSuccess();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#22D3EE', '#A78BFA']
      });
    }
    onToggle(habit.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ translateY: -4 }}
      className="glass-card p-5 group relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-foreground/5 group-hover:bg-primary-gradient group-hover:text-white transition-all duration-500">
            {habit.icon || '✨'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg leading-tight">{habit.name}</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-secondary uppercase font-bold border border-foreground/5">
                {habit.category}
              </span>
            </div>
            <p className="text-sm text-secondary line-clamp-1">{habit.description || 'Daily habit'}</p>
          </div>
        </div>
        
        <button 
          onClick={() => onDelete(habit.id)}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end justify-between mt-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Flame className={cn("w-4 h-4", streak > 0 ? "text-orange-500" : "text-secondary")} />
            <span className={cn("font-bold text-lg", streak > 0 ? "text-gradient" : "text-secondary")}>
              {streak} day{streak !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-xs text-secondary uppercase tracking-wider font-medium">Current Streak</span>
        </div>

        <button
          onClick={handleToggle}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isDone 
              ? "bg-primary-gradient text-white scale-110" 
              : "bg-foreground/5 text-foreground/20 hover:text-foreground/40 hover:bg-foreground/10"
          )}
        >
          <motion.div
            initial={false}
            animate={{ scale: isDone ? 1 : 0.8 }}
          >
            <Check className={cn("w-6 h-6", isDone ? "stroke-[3px]" : "stroke-[2px]")} />
          </motion.div>
        </button>
      </div>

      {/* Background Glow */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary-mid/10 blur-3xl rounded-full group-hover:bg-primary-mid/20 transition-all duration-500" />
    </motion.div>
  );
};
