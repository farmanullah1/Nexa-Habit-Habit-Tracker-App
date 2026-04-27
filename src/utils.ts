import { format, subDays, isSameDay, parseISO, differenceInDays } from 'date-fns';

export const getTodayStr = () => format(new Date(), 'yyyy-MM-dd');

export const calculateStreak = (completions: string[]): number => {
  if (completions.length === 0) return 0;
  
  const sortedDates = [...completions]
    .map(d => parseISO(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let currentDate = new Date();
  
  // Check if today or yesterday is the start of the streak
  const today = new Date();
  const yesterday = subDays(today, 1);
  
  const hasCompletedToday = sortedDates.some(d => isSameDay(d, today));
  const hasCompletedYesterday = sortedDates.some(d => isSameDay(d, yesterday));

  if (!hasCompletedToday && !hasCompletedYesterday) return 0;

  let checkDate = hasCompletedToday ? today : yesterday;

  for (const date of sortedDates) {
    if (isSameDay(date, checkDate)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (date < checkDate) {
      break;
    }
  }

  return streak;
};

export const getCompletionPercentage = (completions: string[], days: number = 7): number => {
  const today = new Date();
  let count = 0;
  for (let i = 0; i < days; i++) {
    const checkDate = format(subDays(today, i), 'yyyy-MM-dd');
    if (completions.includes(checkDate)) {
      count++;
    }
  }
  return Math.round((count / days) * 100);
};

export const motivationalQuotes = [
  "Quality is not an act, it is a habit.",
  "First we make our habits, then our habits make us.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your habits will determine your future.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "Small changes, big results.",
  "Consistency is the key to all success.",
  "Don't stop until you're proud.",
  "Focus on progress, not perfection.",
  "The secret of your future is hidden in your daily routine."
];

export const getRandomQuote = () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
