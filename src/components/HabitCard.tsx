import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Check, Flame, Trash2, Calendar, Target } from 'lucide-react';
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
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#22D3EE', '#A78BFA'],
        ticks: 200
      });
    }
    onToggle(habit.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
      <Tilt
        perspective={1000}
        glareEnable={true}
        glareMaxOpacity={0.15}
        glareColor="white"
        glarePosition="all"
        scale={1.02}
        transitionSpeed={1500}
        className="h-full"
      >
        <div className="glass-card p-6 h-full group relative flex flex-col justify-between border-white/10 dark:border-white/5">
          <div>
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-foreground/5 group-hover:bg-primary-gradient group-hover:text-white transition-all duration-700 shadow-inner group-hover:shadow-lg group-hover:shadow-primary-start/40 group-hover:rotate-6">
                  {habit.icon || '✨'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-xl leading-tight group-hover:text-gradient transition-all">{habit.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-start/10 text-primary-mid uppercase font-black tracking-tighter border border-primary-start/20">
                      {habit.category}
                    </span>
                    <span className="text-[10px] text-secondary flex items-center gap-1 font-medium">
                      <Target className="w-3 h-3" />
                      Daily
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => onDelete(habit.id)}
                className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-red-500 transition-all duration-300 hover:rotate-90"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-secondary line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
              {habit.description || 'Focus on your consistency and build a better routine today.'}
            </p>
          </div>

          <div className="flex items-end justify-between mt-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Flame className={cn("w-6 h-6", streak > 0 ? "text-orange-500 animate-pulse" : "text-secondary")} />
                  {streak > 5 && <div className="absolute inset-0 bg-orange-500/50 blur-lg rounded-full animate-ping" />}
                </div>
                <span className={cn("font-black text-2xl italic tracking-tighter", streak > 0 ? "text-gradient" : "text-secondary")}>
                  {streak}
                </span>
              </div>
              <span className="text-[10px] text-secondary uppercase font-black tracking-widest">Active Streak</span>
            </div>

            <button
              onClick={handleToggle}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl",
                isDone 
                  ? "bg-primary-gradient text-white scale-110 rotate-[360deg] shadow-primary-start/40" 
                  : "bg-foreground/5 text-foreground/20 hover:text-foreground/40 hover:bg-foreground/10 hover:scale-105 active:scale-95"
              )}
            >
              <Check className={cn("w-7 h-7 transition-transform duration-500", isDone ? "scale-100 stroke-[4px]" : "scale-75 stroke-[2px]")} />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="absolute bottom-0 left-0 h-1 bg-primary-gradient transition-all duration-1000 ease-out" 
               style={{ width: `${(streak % 30) * 3.33}%`, opacity: streak > 0 ? 0.5 : 0 }} />
        </div>
      </Tilt>
    </motion.div>
  );
};
