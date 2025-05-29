type HighScore = {
  score: number;
  date: string;
};

const HIGH_SCORES_KEY = 'snakeHighScores';
const MAX_HIGH_SCORES = 10;

export const getHighScores = (): HighScore[] => {
  const scores = localStorage.getItem(HIGH_SCORES_KEY);
  return scores ? JSON.parse(scores) : [];
};

export const addHighScore = (score: number): boolean => {
  const scores = getHighScores();
  const newScore: HighScore = {
    score,
    date: new Date().toLocaleDateString()
  };

  scores.push(newScore);
  scores.sort((a, b) => b.score - a.score);
  
  const isHighScore = scores.length <= MAX_HIGH_SCORES || score > scores[MAX_HIGH_SCORES - 1].score;
  
  if (scores.length > MAX_HIGH_SCORES) {
    scores.splice(MAX_HIGH_SCORES);
  }

  localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
  return isHighScore;
}; 