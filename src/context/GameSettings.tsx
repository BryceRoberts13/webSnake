import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type GameSettings = {
  speed: number;
  gridSize: number;
  theme: string;
  wallMode: 'wrap' | 'collision' | 'portal';
  obstacles: 'none' | 'few' | 'medium' | 'many';
  fruitSpawnMode: 'normal' | 'mixed' | 'timed' | 'random';
};

type GameSettingsContextType = {
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
};

const defaultSettings: GameSettings = {
  speed: 150,
  gridSize: 20,
  theme: 'colorful',
  wallMode: 'portal',
  obstacles: 'none',
  fruitSpawnMode: 'timed'
};

const GameSettingsContext = createContext<GameSettingsContextType | undefined>(undefined);

export const GameSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <GameSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </GameSettingsContext.Provider>
  );
};

export const useGameSettings = () => {
  const context = useContext(GameSettingsContext);
  if (context === undefined) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider');
  }
  return context;
}; 