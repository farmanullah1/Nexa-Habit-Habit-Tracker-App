import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Calendar, Share2, Info, Globe, ExternalLink, LayoutGrid, List, BarChart3, Settings, Volume2, VolumeX } from 'lucide-react';
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
import { cn } from './lib/utils';

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
  const [activeTab, setActiveTab] = useState<'habits' | 'stats'>('habits');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [zenMode, setZenMode] = useState(false);

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

  const handleShare = () => {
    const summary = `🚀 Nexa Habit Progress Update!\n\n🔥 Current Streak: ${stats.totalStreak} Days\n✅ Habits Completed Today: ${stats.completedToday}/${habits.length}\n🏆 Total Achievements: ${stats.achievementList.filter(a => a.isUnlocked).length}\n\nJoin me on Nexa Habit!`;
    navigator.clipboard.writeText(summary);
    sendNotification('Progress Copied!', 'Your achievement summary is ready to share.');
  };

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
            <button 
              onClick={() => setZenMode(!zenMode)}
              className={cn(
                "hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest",
                zenMode ? "bg-primary-gradient text-white shadow-lg" : "glass-card hover:bg-foreground/5 text-secondary"
              )}
            >
              <Sparkles className="w-4 h-4" />
              {zenMode ? 'Zen: ON' : 'Zen Mode'}
            </button>
            <div className="flex items-center gap-1.5 glass-card px-4 py-2 mr-2">
              <a href="https://github.com/farmanullah1" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-foreground/10 rounded-xl transition-all hover:text-primary-mid group">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
              </a>
              <div className="w-[1px] h-4 bg-foreground/10" />
              <a href="https://portfolio-website-link.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-foreground/10 rounded-xl transition-all hover:text-primary-mid group">
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-foreground/10 rounded-xl transition-all"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-primary-mid" /> : <VolumeX className="w-5 h-5 text-secondary" />}
            </button>
            <SkinSwitcher currentSkin={skin} setSkin={setSkin} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </header>

        <main className={cn("space-y-10 transition-all duration-700", zenMode && "max-w-4xl mx-auto")}>
          {/* Main Content Tabs */}
          {!zenMode && (
            <div className="flex justify-center">
              <div className="glass-card p-1.5 flex gap-2 shadow-premium">
                <button 
                  onClick={() => setActiveTab('habits')}
                  className={cn(
                    "relative px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 z-10",
                    activeTab === 'habits' ? "text-white" : "text-secondary hover:text-foreground"
                  )}
                >
                  {activeTab === 'habits' && (
                    <motion.div 
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-primary-gradient rounded-xl -z-10 shadow-lg shadow-primary-start/40"
                    />
                  )}
                  <List className="w-4 h-4" />
                  My Habits
                </button>
                <button 
                  onClick={() => setActiveTab('stats')}
                  className={cn(
                    "relative px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 z-10",
                    activeTab === 'stats' ? "text-white" : "text-secondary hover:text-foreground"
                  )}
                >
                  {activeTab === 'stats' && (
                    <motion.div 
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-primary-gradient rounded-xl -z-10 shadow-lg shadow-primary-start/40"
                    />
                  )}
                  <BarChart3 className="w-4 h-4" />
                  Performance
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {activeTab === 'habits' ? (
              <>
                {/* Left Column: Greeting & Habits */}
                <div className={cn(zenMode ? "lg:col-span-12" : "lg:col-span-8", "space-y-8")}>
                  {!zenMode && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-4xl font-black mb-2 tracking-tight">
                          {greeting}, <span className="text-gradient">Achiever</span> 👋
                        </h2>
                        <div className="flex items-center gap-4 text-secondary">
                          <div className="flex items-center gap-1.5 bg-foreground/5 px-3 py-1 rounded-full border border-foreground/5">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-black italic">{stats.totalStreak} Day Streak</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-foreground/5 px-3 py-1 rounded-full border border-foreground/5">
                            <Calendar className="w-4 h-4 text-primary-mid" />
                            <span className="text-sm font-black italic">{stats.completedToday} / {habits.length} Done</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder="Find your habit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-card backdrop-blur-xl border border-card-border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-start/50 transition-all w-full md:w-64 shadow-inner"
                          />
                        </div>
                        <select
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          className="bg-card backdrop-blur-xl border border-card-border rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all appearance-none cursor-pointer shadow-inner pr-10"
                        >
                          {stats.categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {zenMode && (
                    <div className="text-center space-y-2 mb-12">
                      <h2 className="text-5xl font-black tracking-tighter">Quiet Progress</h2>
                      <p className="text-secondary font-medium uppercase tracking-[0.4em] text-[10px]">Your daily focus, simplified.</p>
                    </div>
                  )}

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
                          className="md:col-span-2 glass-card p-16 flex flex-col items-center text-center space-y-6 bg-gradient-to-br from-card to-primary-start/5 border-dashed border-2 border-primary-start/20"
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
                            className="flex items-center justify-center"
                          >
                            <HabitForm onAdd={addHabit} />
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Right Column: Mini Progress & Achievements */}
                <div className="lg:col-span-4 space-y-8">
                  <section className="glass-card p-8 flex flex-col items-center bg-gradient-to-br from-card to-primary-start/5">
                    <h3 className="font-black text-lg mb-8 self-start uppercase tracking-tighter">Your Focus</h3>
                    <div className="grid grid-cols-2 gap-8 w-full">
                      <ProgressCircle percentage={stats.weeklyProgress} label="Weekly" size={120} />
                      <ProgressCircle percentage={stats.monthlyProgress} label="Monthly" size={120} />
                    </div>
                  </section>
                  <Achievements achievements={stats.achievementList.slice(0, 3)} />
                  {/* Quote Section */}
                  <section className="glass-card p-8 relative overflow-hidden group border-primary-start/10">
                    <div className="relative z-10">
                      <h3 className="text-[10px] uppercase font-black text-primary-mid tracking-[0.3em] mb-4">Daily Vision</h3>
                      <p className="text-2xl font-black italic text-foreground/90 leading-tight">
                        "{quote}"
                      </p>
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary-start/20 blur-3xl rounded-full" />
                  </section>
                </div>
              </>
            ) : (
              <div className="lg:col-span-12 space-y-10">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass-card p-8 bg-gradient-to-br from-card to-primary-start/5">
                    <h3 className="font-black text-xl mb-10 uppercase tracking-tighter">Weekly Trends</h3>
                    <TrendChart habits={habits} />
                  </div>
                  <div className="md:col-span-2 glass-card p-8">
                    <h3 className="font-black text-xl mb-10 uppercase tracking-tighter">30-Day Activity Heatmap</h3>
                    <CalendarHeatmap habits={habits} />
                  </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="glass-card p-10">
                    <h3 className="font-black text-2xl mb-8 uppercase tracking-tighter">Badges & Glory</h3>
                    <Achievements achievements={stats.achievementList} />
                  </div>
                  <div className="space-y-8">
                    <div className="glass-card p-10 flex flex-col items-center">
                      <h3 className="font-black text-2xl mb-8 self-start uppercase tracking-tighter">Global Mastery</h3>
                      <div className="grid grid-cols-2 gap-12">
                        <ProgressCircle percentage={stats.weeklyProgress} label="Weekly" size={160} />
                        <ProgressCircle percentage={stats.monthlyProgress} label="Monthly" size={160} />
                      </div>
                    </div>
                    
                    <div className="glass-card p-10 opacity-60 hover:opacity-100 transition-opacity">
                      <h3 className="font-black text-xl mb-6 uppercase tracking-tighter">Data Vault</h3>
                      <div className="flex gap-4">
                        <button onClick={exportData} className="btn-secondary flex-1">Export Vault</button>
                        <label className="btn-secondary flex-1 cursor-pointer">
                          Import Vault
                          <input type="file" accept=".json" onChange={importData} className="hidden" />
                        </label>
                      </div>
                      <button 
                        onClick={clearAllData}
                        className="w-full mt-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-all border border-red-500/10 rounded-xl hover:bg-red-500/5"
                      >
                        Nuclear Reset
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
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
