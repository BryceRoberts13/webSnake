# Snake Game Project Plan Document

## Table of Contents
1. [Scope & Features](#scope--features)
2. [Technical Design & Architecture](#technical-design--architecture)
3. [Order of Implementation](#order-of-implementation)
4. [Initial Unit Test Suite Suggestions](#initial-unit-test-suite-suggestions)

## Scope & Features

### Core Features (MVP)
- **Game Engine**: Snake movement with discrete steps, collision detection (walls/self), single fruit spawning
- **Controls**: WASD and arrow key input handling
- **User Interface**: Main menu (Play, Settings, High Scores), game canvas, pause overlay (ESC key)
- **Scoring System**: Real-time score display, game over screen with final score
- **Data Persistence**: Top 10 high scores with player name, date, and time stored in LocalStorage
- **Basic Settings**: Minimal settings menu for future expansion
- **Game States**: Menu, playing, paused, game over state management

### Post-MVP Features/Stretch Goals
- **Visual Customization**: Color theme settings, multiple muted color schemes
- **Map Variations**: Adjustable sizes (15x15 to 40x40), looping boundary options
- **Obstacles**: Wall placement system in map interior
- **Advanced Fruit**: Multiple fruits, timer-based spawning options
- **Difficulty Levels**: Speed variations, challenge modes
- **AI Opponents**: Bot snakes with different behavior patterns
- **Multiplayer**: Local multiplayer with shared controls
- **Enhanced Scoring**: Achievement system, streak bonuses

### Explicitly Out of Scope
- **Online Multiplayer**: No server-side components or real-time networking
- **Mobile Optimization**: Desktop-focused experience only
- **User Accounts**: No registration, login, or cloud save systems
- **Monetization**: No advertisements, payments, or premium features
- **Advanced Graphics**: No complex animations, particle effects, or 3D elements
- **Sound System**: No audio effects or background music
- **Social Features**: No sharing, leaderboards, or social media integration

## Technical Design & Architecture

### Technology Stack
- **Frontend Framework**: React 18+ with Vite
  - *Reason*: Modern development experience, fast hot reload, excellent ecosystem
- **Styling**: CSS Modules or Styled Components
  - *Reason*: Component-scoped styling, maintainable CSS architecture
- **Canvas Rendering**: HTML5 Canvas API
  - *Reason*: Direct pixel manipulation, smooth game rendering performance
- **Build Tool**: Vite
  - *Reason*: Fast development server, optimized production builds
- **Package Manager**: npm
  - *Reason*: Standard, reliable dependency management

### Data Structures/Models
```javascript
// Core Game State
GameState = {
  snake: [{ x: number, y: number }], // Array of coordinate objects
  fruit: { x: number, y: number },   // Single coordinate object
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
  score: number,
  gameStatus: 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'
}

// High Score Entry
HighScore = {
  score: number,
  playerName: string,
  date: Date,
  timestamp: number
}

// Game Settings
Settings = {
  mapWidth: number,
  mapHeight: number,
  gameSpeed: number, // milliseconds per move
  colorTheme: string // for post-MVP
}
```

### External Services/APIs
- **None for MVP**: Entirely client-side application
- **GitHub Pages**: Static hosting service (free)
- **Browser LocalStorage**: Built-in persistence (no external dependency)

### Deployment & Hosting Environment
- **Primary**: GitHub Pages static hosting
- **Build Process**: Vite production build generates static files
- **Domain**: Custom subdomain via GitHub Pages (username.github.io/snake-game)
- **Requirements**: Modern web browser with ES6+ support
- **Performance**: Client-side only, no server dependencies

### Key Dependencies & Prerequisites
- **Development Environment**: Node.js 16+, npm, Git
- **Core Libraries**: React, React-DOM (included in Vite React template)
- **Development Tools**: Vite dev server, ESLint, potentially Prettier
- **Knowledge Prerequisites**:
  - React hooks (useState, useEffect, useCallback)
  - HTML5 Canvas API basics
  - Browser LocalStorage API
  - Game loop concepts and requestAnimationFrame

## Order of Implementation

### MVP Implementation Steps

#### Phase 1: Project Foundation (Days 1-2)
1. **Initialize Vite React Project**
   - Create new Vite React app
   - Set up project structure and basic file organization
   - Configure development environment

2. **Basic Component Structure**
   - Create main App component with routing logic
   - Set up basic CSS structure and layout
   - Implement game state management with React hooks

#### Phase 2: Core Game Engine (Days 3-5)
3. **Game Canvas Setup**
   - Create GameCanvas component with HTML5 canvas
   - Implement basic rendering functions (drawSnake, drawFruit, clearCanvas)
   - Set up coordinate system and grid-based positioning

4. **Snake Movement System**
   - Implement snake data structure and movement logic
   - Add keyboard input handling (WASD/arrow keys)
   - Create game loop with requestAnimationFrame

5. **Collision Detection**
   - Add wall collision detection
   - Implement self-collision detection
   - Create game over state transition

#### Phase 3: Game Features (Days 6-8)
6. **Fruit System**
   - Random fruit spawning logic (avoiding snake body)
   - Snake growth mechanics when eating fruit
   - Score increment system

7. **Game State Management**
   - Implement pause/unpause functionality (ESC key)
   - Create proper game state transitions
   - Add game over handling

#### Phase 4: User Interface (Days 9-11)
8. **Main Menu**
   - Create menu component with Play/Settings/High Scores buttons
   - Implement navigation between menu and game
   - Basic styling and layout

9. **High Score System**
   - LocalStorage integration for persistent scores
   - Top 10 score tracking with metadata
   - High score display component

10. **Game Over Screen**
    - Score display and name entry form
    - High score checking and saving
    - Return to menu functionality

#### Phase 5: Polish & Testing (Days 12-14)
11. **Settings Menu Foundation**
    - Basic settings component structure
    - Placeholder for future customization options
    - Settings persistence in LocalStorage

12. **Bug Fixes & Optimization**
    - Performance optimization and smooth gameplay
    - Cross-browser testing and compatibility
    - UI/UX refinements

13. **Deployment Setup**
    - Configure Vite build for GitHub Pages
    - Set up GitHub Actions for automated deployment
    - Test production build and deployment

### Post-MVP Incremental Additions
- **Phase A**: Color themes and visual customization
- **Phase B**: Map size options and boundary settings
- **Phase C**: Obstacle placement system
- **Phase D**: AI opponents and advanced gameplay modes

## Initial Unit Test Suite Suggestions

### Game Engine Module
- **Snake Movement**: Test snake moves correctly in each direction, Test snake doesn't move outside boundaries, Test snake grows by one segment when eating fruit
- **Collision Detection**: Test collision with walls ends game, Test collision with self ends game, Test collision with fruit increases score
- **Fruit Spawning**: Test fruit spawns in empty space, Test fruit doesn't spawn on snake body, Test only one fruit exists at a time

### Game State Management
- **State Transitions**: Test game starts in menu state, Test pause toggles between playing and paused, Test game over state triggers correctly
- **Input Handling**: Test WASD keys change snake direction, Test arrow keys change snake direction, Test ESC key toggles pause
- **Score System**: Test score increments when fruit eaten, Test score resets on new game, Test final score displays correctly

### Data Persistence
- **High Score Storage**: Test high scores save to LocalStorage, Test top 10 scores maintained correctly, Test score metadata includes all required fields
- **Settings Persistence**: Test settings save between sessions, Test default settings load correctly, Test invalid settings handled gracefully
- **Data Validation**: Test handles corrupted LocalStorage data, Test validates score entries before saving, Test handles missing player names

### User Interface
- **Menu Navigation**: Test Play button starts game, Test Settings button opens settings, Test High Scores displays correctly
- **Game Canvas**: Test canvas renders snake correctly, Test canvas renders fruit correctly, Test canvas updates smoothly during gameplay
- **Responsive Interactions**: Test all buttons respond to clicks, Test keyboard inputs register correctly, Test game over screen functions properly
