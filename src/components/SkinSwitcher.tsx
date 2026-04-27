import React from 'react';
import { Palette } from 'lucide-react';
import { Skin } from '../types';
import { cn } from '../lib/utils';

interface SkinSwitcherProps {
  currentSkin: Skin;
  setSkin: (skin: Skin) => void;
}

const skins: { name: Skin; colors: string }[] = [
  { name: 'default', colors: 'bg-indigo-500' },
  { name: 'nature', colors: 'bg-green-500' },
  { name: 'sunset', colors: 'bg-orange-500' },
  { name: 'ocean', colors: 'bg-sky-500' },
  { name: 'neon', colors: 'bg-purple-500' },
  { name: 'monochrome', colors: 'bg-gray-500' },
];

export const SkinSwitcher: React.FC<SkinSwitcherProps> = ({ currentSkin, setSkin }) => {
  return (
    <div className="flex items-center gap-2 glass-card p-2">
      <Palette className="w-5 h-5 text-secondary" />
      <div className="flex gap-1.5">
        {skins.map((skin) => (
          <button
            key={skin.name}
            onClick={() => setSkin(skin.name)}
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-all duration-200",
              skin.colors,
              currentSkin === skin.name ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
            )}
            title={skin.name}
          />
        ))}
      </div>
    </div>
  );
};
