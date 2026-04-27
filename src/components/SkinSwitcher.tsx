import React from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { Skin } from '../types';
import { cn } from '../lib/utils';

interface SkinSwitcherProps {
  currentSkin: Skin;
  setSkin: (skin: Skin) => void;
}

const skins: { name: Skin; colors: string; label: string }[] = [
  { name: 'default', colors: 'from-[#6366F1] to-[#A78BFA]', label: 'Indigo' },
  { name: 'nature', colors: 'from-[#22C55E] to-[#10B981]', label: 'Nature' },
  { name: 'sunset', colors: 'from-[#FB7185] to-[#F97316]', label: 'Sunset' },
  { name: 'ocean', colors: 'from-[#0EA5E9] to-[#14B8A6]', label: 'Ocean' },
  { name: 'neon', colors: 'from-[#A855F7] to-[#EC4899]', label: 'Neon' },
  { name: 'monochrome', colors: 'from-[#374151] to-[#111827]', label: 'Onyx' },
];

export const SkinSwitcher: React.FC<SkinSwitcherProps> = ({ currentSkin, setSkin }) => {
  return (
    <div className="flex items-center gap-2 glass-card p-1.5 px-3">
      <Palette className="w-4 h-4 text-secondary" />
      <div className="flex gap-1.5">
        {skins.map((skin) => (
          <button
            key={skin.name}
            onClick={() => setSkin(skin.name)}
            className="relative w-6 h-6 flex items-center justify-center group"
            title={skin.label}
          >
            {currentSkin === skin.name && (
              <motion.div
                layoutId="skin-active"
                className="absolute inset-0 bg-foreground/10 rounded-full scale-125"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={cn(
              "w-5 h-5 rounded-full bg-gradient-to-br shadow-sm transition-transform group-hover:scale-110 active:scale-90",
              skin.colors,
              currentSkin === skin.name ? "ring-2 ring-foreground/20 ring-offset-2 ring-offset-card" : "opacity-70 group-hover:opacity-100"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
};
