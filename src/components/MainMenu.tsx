import { useNavigate } from 'react-router-dom';
import { useGameSettings } from '../context/GameSettings';
import { HighScores } from './HighScores';
import '../styles/MainMenu.css';

export const MainMenu = () => {
  const navigate = useNavigate();
  const { settings } = useGameSettings();

  return (
    <div className={`main-menu ${settings.theme}`}>
      <h1>Snake Game</h1>
      <div className="menu-buttons">
        <button onClick={() => navigate('/game')}>Play Game</button>
        <button onClick={() => navigate('/settings')}>Settings</button>
      </div>
      <HighScores />
    </div>
  );
}; 