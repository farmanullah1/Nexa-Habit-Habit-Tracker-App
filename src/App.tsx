import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Calendar, Settings2, Share2, Info } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { Habit, Skin, Theme } from './types';
import { HabitCard } from './components/HabitCard';
import { HabitForm } from './components/HabitForm';
import { CalendarHeatmap } from './components/CalendarHeatmap';
import { ProgressCircle } from './components/ProgressCircle';
import { ThemeToggle } from './components/ThemeToggle';
import { SkinSwitcher } from './components/SkinSwitcher';
import { calculateStreak, getCompletionPercentage, getRandomQuote, getTodayStr } from './utils';

const App: React.FC = () => {
  // State
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('nexa-habits');
    return saved ? JSON.parse(saved) : [];
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('nexa-theme') as Theme) || 'dark';
  });
  const [skin, setSkin] = useState<Skin>(() => {
    return (localStorage.getItem('nexa-skin') as Skin) || 'default';
  });
  const [quote, setQuote] = useState(getRandomQuote());

  // Persistence
  useEffect(() => {
    localStorage.setItem('nexa-habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('nexa-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nexa-skin', skin);
    document.documentElement.setAttribute('data-skin', skin);
  }, [skin]);

  // Derived Stats
  const stats = useMemo(() => {
    const today = getTodayStr();
    const completedToday = habits.filter(h => h.completions.includes(today)).length;
    const weeklyProgress = habits.length > 0 
      ? Math.round(habits.reduce((acc, h) => acc + getCompletionPercentage(h.completions, 7), 0) / habits.length)
      : 0;
    const monthlyProgress = habits.length > 0
      ? Math.round(habits.reduce((acc, h) => acc + getCompletionPercentage(h.completions, 30), 0) / habits.length)
      : 0;
    const totalStreak = habits.length > 0 
      ? Math.max(...habits.map(h => calculateStreak(h.completions)))
      : 0;

    return { completedToday, weeklyProgress, monthlyProgress, totalStreak };
  }, [habits]);

  // Actions
  const addHabit = (data: { name: string; description: string; icon: string }) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      ...data,
      color: 'indigo',
      createdAt: new Date().toISOString(),
      completions: [],
    };
    setHabits([newHabit, ...habits]);
  };

  const toggleHabit = (id: string) => {
    const today = getTodayStr();
    setHabits(habits.map(h => {
      if (h.id === id) {
        const completions = h.completions.includes(today)
          ? h.completions.filter(d => d !== today)
          : [...h.completions, today];
        return { ...h, completions };
      }
      return h;
    }));
  };

  const deleteHabit = (id: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      setHabits(habits.filter(h => h.id !== id));
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Navbar */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center shadow-lg shadow-primary-start/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase">Nexa<span className="text-primary-mid">Habit</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <SkinSwitcher currentSkin={skin} setSkin={setSkin} />
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Greeting & Habits */}
        <div className="lg:col-span-8 space-y-8">
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold mb-2">Good Day, User 👋</h2>
              <div className="flex items-center gap-4 text-secondary">
                <div className="flex items-center gap-1.5 bg-foreground/5 px-3 py-1 rounded-full">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{stats.totalStreak} Day Streak</span>
                </div>
                <div className="flex items-center gap-1.5 bg-foreground/5 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4 text-primary-mid" />
                  <span className="text-sm font-medium">{stats.completedToday} / {habits.length} Done Today</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggle={toggleHabit}
                    onDelete={deleteHabit}
                  />
                ))}
              </AnimatePresence>
              <HabitForm onAdd={addHabit} />
            </div>
          </section>

          {/* Activity Heatmap */}
          <section>
            <CalendarHeatmap habits={habits} />
          </section>
        </div>

        {/* Right Column: Progress & Quote */}
        <div className="lg:col-span-4 space-y-8">
          {/* Progress Section */}
          <section className="glass-card p-8 flex flex-col items-center">
            <h3 className="font-bold text-lg mb-8 self-start">Overall Progress</h3>
            <div className="grid grid-cols-2 gap-8 w-full">
              <ProgressCircle percentage={stats.weeklyProgress} label="Weekly" />
              <ProgressCircle percentage={stats.monthlyProgress} label="Monthly" />
            </div>
            
            <div className="mt-10 grid grid-cols-2 gap-4 w-full">
              <div className="bg-foreground/5 p-4 rounded-2xl">
                <p className="text-xs text-secondary font-bold uppercase mb-1">Avg. Streak</p>
                <p className="text-xl font-bold">{habits.length > 0 ? Math.round(habits.reduce((acc, h) => acc + calculateStreak(h.completions), 0) / habits.length) : 0} Days</p>
              </div>
              <div className="bg-foreground/5 p-4 rounded-2xl">
                <p className="text-xs text-secondary font-bold uppercase mb-1">Weekly Done</p>
                <p className="text-xl font-bold">{habits.reduce((acc, h) => acc + h.completions.filter(d => differenceInDays(new Date(), parseISO(d)) <= 7).length, 0)}</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-card-border w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-secondary font-medium">Daily Goal</span>
                <span className="text-sm font-bold">{Math.round((stats.completedToday / (habits.length || 1)) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.completedToday / (habits.length || 1)) * 100}%` }}
                  className="h-full bg-primary-gradient"
                />
              </div>
            </div>
          </section>

          {/* Quote Section */}
          <section className="glass-card p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xs uppercase font-bold text-primary-mid tracking-widest mb-4">Daily Motivation</h3>
              <p className="text-xl font-medium leading-relaxed italic text-foreground/90">
                "{quote}"
              </p>
            </div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-start/10 blur-3xl rounded-full" />
          </section>

          {/* Footer Info */}
          <section className="glass-card p-6 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium">Offline Storage Enabled</span>
            </div>
            <button className="p-2 hover:bg-foreground/5 rounded-lg transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </section>
        </div>
      </main>

      <footer className="mt-20 text-center text-secondary text-sm">
        <p>© 2026 Nexa Habit. Built with ❤️ for productivity.</p>
      </footer>
    </div>
  );
};

export default App;
