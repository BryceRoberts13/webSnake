import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainMenu } from './components/MainMenu';
import { SnakeGame } from './components/SnakeGame';
import { Settings } from './components/Settings';
import { GameSettingsProvider } from './context/GameSettings';

function App() {
  return (
    <GameSettingsProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/game" element={<SnakeGame />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </GameSettingsProvider>
  );
}

export default App;
