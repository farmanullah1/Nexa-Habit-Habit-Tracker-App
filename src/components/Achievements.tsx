import React from 'react';
import { Award, Lock, CheckCircle2 } from 'lucide-react';
import { Achievement } from '../types';
import { cn } from '../lib/utils';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Unlocked Achievements
        </h3>
        <span className="text-xs font-bold text-secondary uppercase tracking-widest">
          {achievements.filter(a => a.isUnlocked).length} / {achievements.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "flex items-center gap-4 p-3 rounded-2xl border transition-all duration-300",
              achievement.isUnlocked 
                ? "bg-primary-gradient/10 border-primary-start/20" 
                : "bg-foreground/5 border-transparent opacity-60"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm relative overflow-hidden",
              achievement.isUnlocked ? "bg-primary-gradient text-white" : "bg-foreground/10 text-secondary"
            )}>
              {achievement.isUnlocked ? (
                <>
                  {achievement.icon}
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                </>
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold leading-tight">{achievement.name}</h4>
              <p className="text-[10px] text-secondary mt-0.5">{achievement.description}</p>
            </div>
            {achievement.isUnlocked && (
              <CheckCircle2 className="w-5 h-5 text-primary-mid" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
