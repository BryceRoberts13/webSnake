import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSettings } from '../context/GameSettings';
import { addHighScore } from '../utils/highScores';
import '../styles/SnakeGame.css';

type Position = {
  x: number;
  y: number;
};

type Apple = Position & {
  type: 'regular' | 'golden' | 'purple';
  timeoutId?: number;
  id: string; // Add unique identifier for each apple
};

type Portal = {
  start: Position;
  end: Position;
  size: number;
  color: 'blue' | 'green';
  orientation: 'horizontal' | 'vertical';
};

const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const SPECIAL_APPLE_DURATION = 10000; // 10 seconds
const SPECIAL_APPLE_CHANCE = 0.1; // 10% chance per food spawn
const MIN_SPECIAL_SPAWN_INTERVAL = 10000; // 10 seconds
const MAX_SPECIAL_SPAWN_INTERVAL = 60000; // 60 seconds
const MIN_PORTAL_SIZE = 2;
const MAX_PORTAL_SIZE = 5;

export const SnakeGame = () => {
  const navigate = useNavigate();
  const { settings } = useGameSettings();
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [foods, setFoods] = useState<Apple[]>([{ x: 15, y: 15, type: 'regular', id: 'initial' }]);
  const [obstacles, setObstacles] = useState<Position[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(settings.speed);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [nextSpecialSpawnTime, setNextSpecialSpawnTime] = useState<number | null>(null);
  const [specialFoodTimer, setSpecialFoodTimer] = useState<number | null>(null);
  const [portals, setPortals] = useState<Portal[]>([]);
  const [portalCooldown, setPortalCooldown] = useState<{ [key: string]: boolean }>({});

  const cellSize = useMemo(() => {
    return `calc((90vmin / ${settings.gridSize}))`;
  }, [settings.gridSize]);

  const generateObstacles = useCallback(() => {
    const obstacleCount = {
      'none': 0,
      'few': Math.floor(settings.gridSize * settings.gridSize * 0.05),
      'medium': Math.floor(settings.gridSize * settings.gridSize * 0.10),
      'many': Math.floor(settings.gridSize * settings.gridSize * 0.15)
    }[settings.obstacles];

    const newObstacles: Position[] = [];
    const center = Math.floor(settings.gridSize / 2);
    
    // Keep trying to add obstacles until we reach the desired count
    while (newObstacles.length < obstacleCount) {
      const obstacle = {
        x: Math.floor(Math.random() * settings.gridSize),
        y: Math.floor(Math.random() * settings.gridSize)
      };

      // Don't place obstacles near the snake's starting position
      const isTooCloseToStart = Math.abs(obstacle.x - center) <= 2 && Math.abs(obstacle.y - center) <= 2;
      
      // Check if position is already occupied
      const isOccupied = newObstacles.some(o => o.x === obstacle.x && o.y === obstacle.y);

      if (!isTooCloseToStart && !isOccupied) {
        newObstacles.push(obstacle);
      }
    }

    setObstacles(newObstacles);
  }, [settings.gridSize, settings.obstacles]);

  const generateRandomInterval = () => {
    return Math.floor(Math.random() * (MAX_SPECIAL_SPAWN_INTERVAL - MIN_SPECIAL_SPAWN_INTERVAL)) + MIN_SPECIAL_SPAWN_INTERVAL;
  };

  const generateFood = useCallback(() => {
    const newFood = () => ({
      x: Math.floor(Math.random() * settings.gridSize),
      y: Math.floor(Math.random() * settings.gridSize),
    });

    let foodPosition = newFood();
    while (
      snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y) ||
      obstacles.some(obstacle => obstacle.x === foodPosition.x && obstacle.y === foodPosition.y) ||
      foods.some(food => food.x === foodPosition.x && food.y === foodPosition.y)
    ) {
      foodPosition = newFood();
    }

    let type: Apple['type'] = 'regular';
    let timeoutId: number | undefined;
    let interval: number;

    switch (settings.fruitSpawnMode) {
      case 'normal':
        type = 'regular';
        break;
      
      case 'mixed':
        if (Math.random() < SPECIAL_APPLE_CHANCE) {
          type = Math.random() < 0.5 ? 'golden' : 'purple';
          timeoutId = setTimeout(() => {
            setFoods(prev => prev.filter(f => f.id !== newApple.id));
          }, SPECIAL_APPLE_DURATION);
        }
        break;
      
      case 'timed':
        type = 'regular';
        if (!nextSpecialSpawnTime || Date.now() >= nextSpecialSpawnTime) {
          interval = generateRandomInterval();
          setNextSpecialSpawnTime(Date.now() + interval);
          const timer = setTimeout(() => {
            const specialType = Math.random() < 0.5 ? 'golden' : 'purple';
            const specialFood: Apple = {
              ...newFood(),
              type: specialType,
              id: `special-${Date.now()}`,
              timeoutId: undefined
            };
            
            // Make sure the new special food doesn't overlap
            while (
              snake.some(segment => segment.x === specialFood.x && segment.y === specialFood.y) ||
              obstacles.some(obstacle => obstacle.x === specialFood.x && obstacle.y === specialFood.y) ||
              foods.some(food => food.x === specialFood.x && food.y === specialFood.y)
            ) {
              const newPos = newFood();
              specialFood.x = newPos.x;
              specialFood.y = newPos.y;
            }

            // Set timeout to remove the special food
            const removeTimer = setTimeout(() => {
              setFoods(prev => prev.filter(f => f.id !== specialFood.id));
            }, SPECIAL_APPLE_DURATION);
            specialFood.timeoutId = removeTimer;

            setFoods(prev => [...prev, specialFood]);
          }, interval);
          setSpecialFoodTimer(timer);
        }
        break;
      
      case 'random':
        interval = generateRandomInterval() / 3; // More frequent spawns
        timeoutId = setTimeout(() => {
          const newType: Apple['type'] = Math.random() < 0.3 ? 'regular' : Math.random() < 0.5 ? 'golden' : 'purple';
          setFoods(prev => {
            const filtered = prev.filter(f => f.id !== newApple.id);
            return [...filtered, { ...foodPosition, type: newType, id: `random-${Date.now()}` }];
          });
        }, interval);
        break;
    }

    const newApple: Apple = { ...foodPosition, type, timeoutId, id: `food-${Date.now()}` };
    return newApple;
  }, [snake, settings.gridSize, settings.fruitSpawnMode, obstacles, foods, nextSpecialSpawnTime]);

  const generatePortals = useCallback(() => {
    const newPortals: Portal[] = [];
    const colors: ('blue' | 'green')[] = ['blue', 'green'];

    for (const color of colors) {
      const size = Math.floor(Math.random() * (MAX_PORTAL_SIZE - MIN_PORTAL_SIZE + 1)) + MIN_PORTAL_SIZE;
      
      // Generate first portal of the pair
      let portal1 = generateRandomPortal(size);
      while (isPortalOverlapping(portal1, newPortals)) {
        portal1 = generateRandomPortal(size);
      }
      portal1.color = color;
      newPortals.push(portal1);

      // Generate second portal of the pair
      let portal2 = generateRandomPortal(size);
      while (isPortalOverlapping(portal2, newPortals)) {
        portal2 = generateRandomPortal(size);
      }
      portal2.color = color;
      newPortals.push(portal2);
    }

    setPortals(newPortals);
  }, [settings.gridSize]);

  const generateRandomPortal = (size: number): Portal => {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    const maxPos = settings.gridSize - size;
    let portal: Portal;

    switch (side) {
      case 0: // top
        portal = {
          start: { x: Math.floor(Math.random() * maxPos), y: 0 },
          end: { x: 0, y: 0 },
          size,
          color: 'blue',
          orientation: 'horizontal'
        };
        portal.end = { x: portal.start.x + size - 1, y: 0 };
        break;
      case 1: // right
        portal = {
          start: { x: settings.gridSize - 1, y: Math.floor(Math.random() * maxPos) },
          end: { x: settings.gridSize - 1, y: 0 },
          size,
          color: 'blue',
          orientation: 'vertical'
        };
        portal.end = { x: settings.gridSize - 1, y: portal.start.y + size - 1 };
        break;
      case 2: // bottom
        portal = {
          start: { x: Math.floor(Math.random() * maxPos), y: settings.gridSize - 1 },
          end: { x: 0, y: settings.gridSize - 1 },
          size,
          color: 'blue',
          orientation: 'horizontal'
        };
        portal.end = { x: portal.start.x + size - 1, y: settings.gridSize - 1 };
        break;
      default: // left
        portal = {
          start: { x: 0, y: Math.floor(Math.random() * maxPos) },
          end: { x: 0, y: 0 },
          size,
          color: 'blue',
          orientation: 'vertical'
        };
        portal.end = { x: 0, y: portal.start.y + size - 1 };
    }

    return portal;
  };

  const isPortalOverlapping = (portal: Portal, existingPortals: Portal[]): boolean => {
    for (const existing of existingPortals) {
      if (portal.orientation === 'horizontal') {
        if (existing.orientation === 'horizontal' && portal.start.y === existing.start.y) {
          // Check horizontal overlap
          const portalRange = { start: portal.start.x, end: portal.end.x };
          const existingRange = { start: existing.start.x, end: existing.end.x };
          if (!(portalRange.end < existingRange.start || portalRange.start > existingRange.end)) {
            return true;
          }
        }
      } else {
        if (existing.orientation === 'vertical' && portal.start.x === existing.start.x) {
          // Check vertical overlap
          const portalRange = { start: portal.start.y, end: portal.end.y };
          const existingRange = { start: existing.start.y, end: existing.end.y };
          if (!(portalRange.end < existingRange.start || portalRange.start > existingRange.end)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const checkPortalCollision = (head: Position): { position: Position; newDirection: Position } | null => {
    if (settings.wallMode !== 'portal') return null;

    // First check if we're about to hit a wall
    const isAtWall = head.x < 0 || head.x >= settings.gridSize || head.y < 0 || head.y >= settings.gridSize;
    if (!isAtWall) return null;

    // Determine which wall we're hitting and the position along that wall
    let wallPosition: Position;
    if (head.x < 0) {
      wallPosition = { x: 0, y: snake[0].y };
    } else if (head.x >= settings.gridSize) {
      wallPosition = { x: settings.gridSize - 1, y: snake[0].y };
    } else if (head.y < 0) {
      wallPosition = { x: snake[0].x, y: 0 };
    } else {
      wallPosition = { x: snake[0].x, y: settings.gridSize - 1 };
    }

    // Check if we're hitting a portal
    for (const portal of portals) {
      // Skip if snake just used this color portal
      if (portalCooldown[portal.color]) continue;

      const isInPortal = portal.orientation === 'horizontal'
        ? (wallPosition.y === portal.start.y && wallPosition.x >= portal.start.x && wallPosition.x <= portal.end.x)
        : (wallPosition.x === portal.start.x && wallPosition.y >= portal.start.y && wallPosition.y <= portal.end.y);

      if (isInPortal) {
        // Find the matching portal
        const exitPortal = portals.find(p => p.color === portal.color && p !== portal);
        if (!exitPortal) continue;

        // Set cooldown for this portal color
        setPortalCooldown(prev => ({ ...prev, [portal.color]: true }));
        setTimeout(() => {
          setPortalCooldown(prev => ({ ...prev, [portal.color]: false }));
        }, 1000);

        // Calculate exit position and new direction
        let exitPos: Position;
        let newDirection: Position;

        if (exitPortal.orientation === 'horizontal') {
          const relativePos = (wallPosition.x - portal.start.x) / portal.size;
          exitPos = {
            x: Math.floor(exitPortal.start.x + relativePos * exitPortal.size),
            y: exitPortal.start.y // Exit right at the portal
          };
          // If at top wall, move down; if at bottom wall, move up
          newDirection = { x: 0, y: exitPortal.start.y === 0 ? 1 : -1 };
        } else {
          const relativePos = (wallPosition.y - portal.start.y) / portal.size;
          exitPos = {
            x: exitPortal.start.x, // Exit right at the portal
            y: Math.floor(exitPortal.start.y + relativePos * exitPortal.size)
          };
          // If at left wall, move right; if at right wall, move left
          newDirection = { x: exitPortal.start.x === 0 ? 1 : -1, y: 0 };
        }

        // Schedule portal relocation
        setTimeout(() => {
          const newPortals = portals.filter(p => p.color !== portal.color);
          const size = portal.size;
          
          let newPortal1 = generateRandomPortal(size);
          while (isPortalOverlapping(newPortal1, newPortals)) {
            newPortal1 = generateRandomPortal(size);
          }
          newPortal1.color = portal.color;
          
          let newPortal2 = generateRandomPortal(size);
          while (isPortalOverlapping(newPortal2, [...newPortals, newPortal1])) {
            newPortal2 = generateRandomPortal(size);
          }
          newPortal2.color = portal.color;
          
          setPortals([...newPortals, newPortal1, newPortal2]);
        }, 1000);

        return { position: exitPos, newDirection };
      }
    }
    return null;
  };

  const resetGame = () => {
    const center = Math.floor(settings.gridSize / 2);
    setSnake([{ x: center, y: center }]);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setCurrentSpeed(settings.speed);
    generateObstacles();
    setFoods([generateFood()]);
    setNextSpecialSpawnTime(null);
    if (specialFoodTimer) {
      clearTimeout(specialFoodTimer);
    }
    if (settings.wallMode === 'portal') {
      generatePortals();
    }
    setPortalCooldown({});
  };

  const handleGameOver = () => {
    setGameOver(true);
    const isHighScore = addHighScore(score);
    if (isHighScore) {
      // We'll show this in the game over screen
      setIsNewHighScore(true);
    }
  };

  const checkCollision = (head: Position) => {
    // Wall collision (only check in collision mode)
    if (settings.wallMode === 'collision') {
      if (
        head.x < 0 ||
        head.x >= settings.gridSize ||
        head.y < 0 ||
        head.y >= settings.gridSize
      ) {
        handleGameOver();
        return true;
      }
    }

    // Self collision
    if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      handleGameOver();
      return true;
    }

    // Obstacle collision
    if (obstacles.some((obstacle) => obstacle.x === head.x && obstacle.y === head.y)) {
      handleGameOver();
      return true;
    }

    return false;
  };

  const handleFoodCollection = (head: Position) => {
    const collidedFood = foods.find(food => food.x === head.x && food.y === head.y);
    if (collidedFood) {
      switch (collidedFood.type) {
        case 'golden':
          setScore(prev => prev + 5);
          setCurrentSpeed(prev => Math.max(prev * 0.8, 50)); // Speed up, but not faster than 50ms
          break;
        case 'purple':
          setScore(prev => prev + 3);
          setSnake(prev => prev.slice(0, Math.max(prev.length - 3, 1))); // Decrease length but keep at least 1 segment
          break;
        default:
          setScore(prev => prev + 1);
      }
      if (collidedFood.timeoutId) {
        clearTimeout(collidedFood.timeoutId);
      }
      
      // Remove the eaten food and generate a new one if it was the regular food
      setFoods(prev => {
        const filtered = prev.filter(f => f.id !== collidedFood.id);
        if (collidedFood.type === 'regular') {
          return [...filtered, generateFood()];
        }
        return filtered;
      });
      return true;
    }
    return false;
  };

  const isWallCollision = (head: Position): boolean => {
    if (settings.wallMode !== 'portal') {
      return (
        head.x < 0 ||
        head.x >= settings.gridSize ||
        head.y < 0 ||
        head.y >= settings.gridSize
      );
    }

    // For portal mode, check if we're at a wall but not in a portal
    if (head.x < 0 || head.x >= settings.gridSize || head.y < 0 || head.y >= settings.gridSize) {
      // We're at a wall, check if we're in a portal
      const isInPortal = portals.some(portal => {
        if (portal.orientation === 'horizontal') {
          return (
            (head.y === 0 || head.y === settings.gridSize - 1) && // At top or bottom wall
            head.x >= portal.start.x && 
            head.x <= portal.end.x
          );
        } else {
          return (
            (head.x === 0 || head.x === settings.gridSize - 1) && // At left or right wall
            head.y >= portal.start.y && 
            head.y <= portal.end.y
          );
        }
      });

      return !isInPortal; // If not in portal, it's a collision
    }

    return false;
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const newSnake = [...snake];
    let head = {
      x: newSnake[0].x + direction.x,
      y: newSnake[0].y + direction.y,
    };

    // Check for portal teleportation first
    const portalResult = checkPortalCollision(head);
    if (portalResult) {
      head = portalResult.position;
      setDirection(portalResult.newDirection);
    } else if (settings.wallMode === 'wrap') {
      // Wrap around logic
      head.x = (head.x + settings.gridSize) % settings.gridSize;
      head.y = (head.y + settings.gridSize) % settings.gridSize;
    } else if (isWallCollision(head)) {
      // If not going through a portal and hitting a wall, game over
      handleGameOver();
      return;
    }

    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    if (!handleFoodCollection(head)) {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, foods, gameOver, isPaused, settings.wallMode, portals, portalCooldown]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameOver) {
          setIsPaused(prev => !prev);
        }
        return;
      }

      if (isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, isPaused, gameOver]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, currentSpeed);
    return () => {
      clearInterval(gameInterval);
      // Clear any food-related timeouts
      foods.forEach(food => {
        if (food.timeoutId) {
          clearTimeout(food.timeoutId);
        }
      });
      if (specialFoodTimer) {
        clearTimeout(specialFoodTimer);
      }
    };
  }, [moveSnake, currentSpeed, foods, specialFoodTimer]);

  useEffect(() => {
    resetGame();
  }, [settings.gridSize, settings.obstacles]);

  const handleMainMenu = () => {
    navigate('/');
  };

  return (
    <div className={`game-container ${settings.theme}`}>
      <button className="back-button" onClick={handleMainMenu}>
        ← Back to Menu
      </button>
      <div className="score">Score: {score}</div>
      <div className="game-board">
        {snake.map((segment, index) => (
          <div
            key={index}
            className="snake-segment"
            style={{
              left: `calc(${segment.x} * ${cellSize})`,
              top: `calc(${segment.y} * ${cellSize})`,
              width: cellSize,
              height: cellSize,
            }}
          />
        ))}
        {foods.map((food) => (
          <div
            key={food.id}
            className={`food ${food.type}`}
            style={{
              left: `calc(${food.x} * ${cellSize})`,
              top: `calc(${food.y} * ${cellSize})`,
              width: cellSize,
              height: cellSize,
            }}
          />
        ))}
        {obstacles.map((obstacle, index) => (
          <div
            key={`obstacle-${index}`}
            className="obstacle"
            style={{
              left: `calc(${obstacle.x} * ${cellSize})`,
              top: `calc(${obstacle.y} * ${cellSize})`,
              width: cellSize,
              height: cellSize,
            }}
          />
        ))}
        {settings.wallMode === 'portal' && portals.map((portal, index) => {
          const portalCells = [];
          if (portal.orientation === 'horizontal') {
            const width = portal.size * parseFloat(cellSize.replace('calc((90vmin / 20))', '90vmin'));
            portalCells.push(
              <div
                key={`portal-${index}`}
                className={`portal ${portal.color}`}
                style={{
                  left: `calc(${portal.start.x} * ${cellSize})`,
                  top: portal.start.y === 0 ? '0' : '100%',
                  transform: portal.start.y === 0 ? 'translateY(-2px)' : 'translateY(2px)',
                  width: `${width}px`,
                  height: '4px',
                }}
              />
            );
          } else {
            const height = portal.size * parseFloat(cellSize.replace('calc((90vmin / 20))', '90vmin'));
            portalCells.push(
              <div
                key={`portal-${index}`}
                className={`portal ${portal.color}`}
                style={{
                  top: `calc(${portal.start.y} * ${cellSize})`,
                  left: portal.start.x === 0 ? '0' : '100%',
                  transform: portal.start.x === 0 ? 'translateX(-2px)' : 'translateX(2px)',
                  width: '4px',
                  height: `${height}px`,
                }}
              />
            );
          }
          return portalCells;
        })}
      </div>
      {isPaused && !gameOver && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2>Game Paused</h2>
            <div className="pause-buttons">
              <button onClick={() => setIsPaused(false)}>Resume</button>
              <button onClick={handleMainMenu}>Main Menu</button>
            </div>
            <p className="pause-tip">Press Space to Resume</p>
          </div>
        </div>
      )}
      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          {isNewHighScore && <h3 className="new-high-score">New High Score!</h3>}
          <p className="final-score">Final Score: {score}</p>
          <div className="pause-buttons">
            <button onClick={resetGame}>Play Again</button>
            <button onClick={handleMainMenu}>Main Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}; 