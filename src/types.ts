export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  category: string;
  color: string;
  createdAt: string;
  completions: string[]; // Array of YYYY-MM-DD strings
  isArchived: boolean;
}

export type Skin = 'default' | 'nature' | 'sunset' | 'ocean' | 'neon' | 'monochrome';
export type Theme = 'light' | 'dark';

export interface UserStats {
  totalStreak: number;
  completedToday: number;
  totalHabits: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}
