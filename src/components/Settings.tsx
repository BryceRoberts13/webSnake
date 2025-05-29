import { useNavigate } from 'react-router-dom';
import { useGameSettings } from '../context/GameSettings';
import '../styles/Settings.css';

export const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useGameSettings();

  const handleSpeedChange = (value: string) => {
    const speedMap = {
      'slow': 200,
      'normal': 150,
      'fast': 100
    };
    updateSettings({ speed: speedMap[value as keyof typeof speedMap] });
  };

  const handleGridSizeChange = (value: string) => {
    updateSettings({ gridSize: parseInt(value) });
  };

  const handleThemeChange = (value: string) => {
    updateSettings({ theme: value });
  };

  const handleWallModeChange = (value: 'wrap' | 'collision' | 'portal') => {
    updateSettings({ wallMode: value });
  };

  const handleObstaclesChange = (value: 'none' | 'few' | 'medium' | 'many') => {
    updateSettings({ obstacles: value });
  };

  const handleFruitSpawnModeChange = (value: 'normal' | 'mixed' | 'timed' | 'random') => {
    updateSettings({ fruitSpawnMode: value });
  };

  return (
    <div className={`settings ${settings.theme}`}>
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Menu
        </button>
        <h1>Settings</h1>
      </div>
      <div className="settings-content">
        <div className="setting-group">
          <h2>Game Settings</h2>
          <div className="setting-item">
            <label htmlFor="difficulty">Game Speed:</label>
            <select
              id="difficulty"
              value={settings.speed === 200 ? 'slow' : settings.speed === 100 ? 'fast' : 'normal'}
              onChange={(e) => handleSpeedChange(e.target.value)}
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
          <div className="setting-item">
            <label htmlFor="gridSize">Grid Size:</label>
            <select
              id="gridSize"
              value={settings.gridSize}
              onChange={(e) => handleGridSizeChange(e.target.value)}
            >
              <option value="15">15x15</option>
              <option value="20">20x20</option>
              <option value="25">25x25</option>
            </select>
          </div>
          <div className="setting-item">
            <label htmlFor="fruitSpawnMode">Fruit Spawn Mode:</label>
            <select
              id="fruitSpawnMode"
              value={settings.fruitSpawnMode}
              onChange={(e) => handleFruitSpawnModeChange(e.target.value as 'normal' | 'mixed' | 'timed' | 'random')}
            >
              <option value="normal">Normal (Regular Fruit Only)</option>
              <option value="mixed">Mixed (Regular + Special)</option>
              <option value="timed">Timed Special (10-60s)</option>
              <option value="random">Random Intervals</option>
            </select>
          </div>
          <div className="setting-item">
            <label htmlFor="wallMode">Wall Mode:</label>
            <select
              id="wallMode"
              value={settings.wallMode}
              onChange={(e) => handleWallModeChange(e.target.value as 'wrap' | 'collision' | 'portal')}
            >
              <option value="collision">Classic (Game Over on Wall Hit)</option>
              <option value="wrap">Wrap Around</option>
              <option value="portal">Portals (Blue & Green)</option>
            </select>
          </div>
          <div className="setting-item">
            <label htmlFor="obstacles">Obstacles:</label>
            <select
              id="obstacles"
              value={settings.obstacles}
              onChange={(e) => handleObstaclesChange(e.target.value as 'none' | 'few' | 'medium' | 'many')}
            >
              <option value="none">None</option>
              <option value="few">Few (5% of grid)</option>
              <option value="medium">Medium (10% of grid)</option>
              <option value="many">Many (15% of grid)</option>
            </select>
          </div>
        </div>
        <div className="setting-group">
          <h2>Visual Settings</h2>
          <div className="setting-item">
            <label htmlFor="theme">Theme:</label>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="colorful">Colorful</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}; 