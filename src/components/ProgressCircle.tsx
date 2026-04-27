import React from 'react';
import { motion } from 'framer-motion';

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label: string;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 10,
  label 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group" style={{ width: size, height: size }}>
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-primary-start/5 scale-110 group-hover:bg-primary-start/10 transition-all duration-700" />
        
        <svg className="w-full h-full transform -rotate-90 relative z-10">
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-foreground/5"
          />
          {/* Progress Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "circOut" }}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--primary-start)" />
              <stop offset="50%" stopColor="var(--primary-mid)" />
              <stop offset="100%" stopColor="var(--primary-end)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className="text-3xl font-black tracking-tighter">{percentage}<span className="text-sm opacity-50 ml-0.5">%</span></span>
        </div>
      </div>
      <span className="text-[10px] uppercase font-black text-secondary tracking-[0.2em]">{label}</span>
    </div>
  );
};
