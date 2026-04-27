import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { playSuccess } from '../lib/sounds';

interface HabitFormProps {
  onAdd: (habit: { name: string; description: string; icon: string; category: string }) => void;
}

const EMOJIS = ['✨', '🏃', '💧', '📚', '🧘', '🍎', '💪', '🧠', '✍️', '🎸', '🌱', '🛌'];
const CATEGORIES = [
  { name: 'General', icon: '🎯' },
  { name: 'Health', icon: '❤️' },
  { name: 'Mind', icon: '🧘' },
  { name: 'Work', icon: '💼' },
  { name: 'Growth', icon: '📈' },
];

export const HabitForm: React.FC<HabitFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('✨');
  const [category, setCategory] = useState('General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    playSuccess();
    onAdd({ name, description, icon, category });
    setName('');
    setDescription('');
    setIcon('✨');
    setCategory('General');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary w-full py-4 shadow-lg shadow-primary-start/20"
      >
        <Plus className="w-5 h-5" />
        Add New Habit
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50 glass-card p-6 border-white/20"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-mid" />
                  New Habit
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-foreground/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold text-secondary mb-1.5 block">Habit Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Morning Run"
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-start/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-secondary mb-1.5 block">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Small note to keep you going"
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-start/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-secondary mb-1.5 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setCategory(cat.name)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl flex items-center gap-2 text-sm transition-all border",
                          category === cat.name 
                            ? "bg-primary-gradient text-white border-transparent" 
                            : "bg-foreground/5 border-foreground/10 hover:border-foreground/20"
                        )}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase font-bold text-secondary mb-1.5 block">Choose Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setIcon(emoji)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all",
                          icon === emoji ? "bg-primary-gradient text-white scale-110" : "bg-foreground/5 hover:bg-foreground/10"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-3.5 mt-4 text-lg">
                  Create Habit
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
