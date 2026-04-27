import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Calendar, Share2, Info, Github, Globe, ExternalLink, LayoutGrid, List } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { Habit, Skin, Theme } from './types';
import { HabitCard } from './components/HabitCard';
import { HabitForm } from './components/HabitForm';
import { CalendarHeatmap } from './components/CalendarHeatmap';
import { ProgressCircle } from './components/ProgressCircle';
import { TrendChart } from './components/TrendChart';
import { Achievements } from './components/Achievements';
import { ThemeToggle } from './components/ThemeToggle';
import { SkinSwitcher } from './components/SkinSwitcher';
import { calculateStreak, getCompletionPercentage, getRandomQuote, getTodayStr } from './utils';
import { requestNotificationPermission, sendNotification } from './lib/notifications';

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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

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

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
    sendNotification("Notifications Enabled!", "You will now receive habit reminders.");
  };

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

    const filteredHabits = habits.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'All' || h.category === filter;
      return matchesSearch && matchesFilter;
    });

    const categories = ['All', ...Array.from(new Set(habits.map(h => h.category)))];

    // Achievements calculation
    const achievementList = [
      { id: '1', name: 'First Step', description: 'Add your first habit', icon: '🎯', isUnlocked: habits.length > 0 },
      { id: '2', name: 'Consistent', description: 'Reach a 3-day streak', icon: '🔥', isUnlocked: habits.some(h => calculateStreak(h.completions) >= 3) },
      { id: '3', name: 'Habit Master', description: 'Reach a 7-day streak', icon: '👑', isUnlocked: habits.some(h => calculateStreak(h.completions) >= 7) },
      { id: '4', name: 'Productive', description: 'Complete 3 habits today', icon: '⚡', isUnlocked: completedToday >= 3 },
      { id: '5', name: 'Elite', description: 'Complete 5 habits today', icon: '💎', isUnlocked: completedToday >= 5 },
    ];

    return { completedToday, weeklyProgress, monthlyProgress, totalStreak, filteredHabits, categories, achievementList };
  }, [habits, search, filter]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Actions
  const addHabit = (data: { name: string; description: string; icon: string; category: string }) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      ...data,
      color: 'indigo',
      createdAt: new Date().toISOString(),
      completions: [],
      isArchived: false,
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

  const exportData = () => {
    const data = JSON.stringify(habits, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexa-habits-${getTodayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setHabits(imported);
          alert('Data imported successfully!');
        }
      } catch (err) {
        alert('Invalid data format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL habits and progress? This cannot be undone.')) {
      setHabits([]);
      localStorage.clear();
      alert('All data cleared.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob w-96 h-96 bg-primary-start top-[-10%] left-[-10%]" />
        <div className="blob w-80 h-80 bg-primary-mid top-[40%] right-[-10%]" style={{ animationDelay: '2s' }} />
        <div className="blob w-72 h-72 bg-primary-end bottom-[-10%] left-[20%]" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Navbar */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
          <div className="flex items-center gap-3 group cursor-default">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-xl shadow-primary-start/30"
            >
              <Sparkles className="text-white w-7 h-7" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Nexa<span className="text-primary-mid">Habit</span></h1>
              <span className="text-[10px] text-secondary font-black tracking-[0.2em] uppercase opacity-50">Premium Tracker</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 glass-card px-4 py-2 mr-2">
              <a href="https://github.com/farmanullah1" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-foreground/10 rounded-xl transition-all hover:text-primary-mid group">
                <Github className="w-5 h-5" />
              </a>
              <div className="w-[1px] h-4 bg-foreground/10" />
              <a href="https://portfolio-website-link.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-foreground/10 rounded-xl transition-all hover:text-primary-mid group">
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <SkinSwitcher currentSkin={skin} setSkin={setSkin} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Greeting & Habits */}
        <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-1">{greeting}, User 👋</h2>
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
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search habits..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-start/50 transition-all w-full md:w-auto"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-2 text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {stats.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {habits.length === 0 ? (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="md:col-span-2 glass-card p-16 flex flex-col items-center text-center space-y-6 bg-gradient-to-br from-card to-primary-start/5"
                  >
                    <div className="w-24 h-24 bg-primary-gradient rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary-start/40 animate-pulse">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <div className="max-w-sm">
                      <h3 className="text-3xl font-black tracking-tighter mb-2">Elevate Your Life</h3>
                      <p className="text-secondary font-medium opacity-80 leading-relaxed">
                        Join thousands of high-performers tracking their daily progress with Nexa. Add your first habit and unlock your potential.
                      </p>
                    </div>
                    <HabitForm onAdd={addHabit} />
                  </motion.div>
                ) : (
                  <>
                    {stats.filteredHabits.map((habit, index) => (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <HabitCard
                          habit={habit}
                          onToggle={toggleHabit}
                          onDelete={deleteHabit}
                        />
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: stats.filteredHabits.length * 0.05 }}
                    >
                      <HabitForm onAdd={addHabit} />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>

          {/* Activity Heatmap & Trends */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CalendarHeatmap habits={habits} />
            <TrendChart habits={habits} />
          </section>
        </div>

        {/* Right Column: Progress & Achievements */}
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

          {/* Achievements */}
          <Achievements achievements={stats.achievementList} />

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
          <section className="glass-card p-6 flex flex-col gap-4 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer hover:text-primary-mid transition-colors flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  <span className="text-sm font-medium">Import JSON</span>
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
              <button onClick={exportData} className="flex items-center gap-2 hover:text-primary-mid transition-colors">
                <span className="text-sm font-medium">Export</span>
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <div className="border-t border-card-border pt-4 flex flex-col gap-3">
              <button 
                onClick={handleEnableNotifications}
                className="w-full text-xs font-bold uppercase tracking-widest text-secondary hover:text-primary-mid transition-colors flex items-center justify-center gap-2"
              >
                🔔 Enable Reminders
              </button>
              <button 
                onClick={clearAllData}
                className="w-full text-[10px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
              >
                ⚠️ Reset All Data
              </button>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-20 text-center text-secondary text-sm">
        <p>© 2026 Nexa Habit. Built with ❤️ for productivity.</p>
      </footer>
    </div>
  </div>
);
};

export default App;
