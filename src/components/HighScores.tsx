import { useEffect, useState } from 'react';
import { getHighScores } from '../utils/highScores';
import '../styles/HighScores.css';

export const HighScores = () => {
  const [scores, setScores] = useState(getHighScores());

  useEffect(() => {
    // Update scores when component mounts and when storage changes
    const handleStorageChange = () => {
      setScores(getHighScores());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (scores.length === 0) {
    return (
      <div className="high-scores">
        <h2>High Scores</h2>
        <p className="no-scores">No scores yet. Play a game!</p>
      </div>
    );
  }

  const getRankLabel = (index: number) => {
    switch (index) {
      case 0:
        return '👑';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `#${index + 1}`;
    }
  };

  return (
    <div className="high-scores">
      <h2>High Scores</h2>
      <div className="scores-list">
        <div className="score-header">
          <div className="rank-score">
            <span className="header-rank">Rank</span>
            <span className="header-score">Score</span>
          </div>
          <span className="header-date">Date</span>
        </div>
        {scores.map((score, index) => (
          <div key={index} className={`score-item rank-${index + 1}`}>
            <div className="rank-score">
              <span className="rank">{getRankLabel(index)}</span>
              <span className="score-value">{score.score.toLocaleString()}</span>
            </div>
            <span className="date">{score.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 