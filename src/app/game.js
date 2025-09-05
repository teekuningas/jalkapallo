import * as level1 from './levels/level1.js';
import * as level2 from './levels/level2.js';

export function startGame(app, inputState, layers) {
  const levels = {
    level1: level1,
    level2: level2,
  };
  let currentLevelName = null;
  let levelState = null;

  function changeLevel(levelName) {
    if (currentLevelName === levelName) return;

    // Remove previous resize listener if it exists
    if (levelState && levelState.onResize) {
      window.removeEventListener('resize', levelState.onResize);
    }

    // Clear all layers
    layers.staticLayer.removeChildren();
    layers.world.removeChildren();
    layers.uiLayer.removeChildren();

    currentLevelName = levelName;
    const level = levels[currentLevelName];
    if (level) {
      levelState = level.init(app, layers);
      // Add new resize listener
      if (levelState.onResize) {
        window.addEventListener('resize', levelState.onResize);
        levelState.onResize(); // Initial call
      }
    } else {
      console.error(`Level ${levelName} not found!`);
    }
  }

  // Game Loop
  app.ticker.add((time) => {
    if (!levelState) return;

    const delta = time.deltaTime;

    // 1. Delegate all update logic to the current level
    const newState = levels[currentLevelName].update(levelState, delta, inputState, app, layers);
    levelState = newState;

    // 2. Check for level change request
    if (levelState.nextLevel && levelState.nextLevel !== currentLevelName) {
      changeLevel(levelState.nextLevel);
      return; // Restart loop for new level
    }
  });

  changeLevel('level1');
}
