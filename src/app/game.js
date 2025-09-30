import * as level1 from './levels/level1.js';
import * as level2 from './levels/level2.js';
import * as level3 from './levels/level3.js';
import * as level4 from './levels/level4.js';
import * as level5 from './levels/level5.js';
import * as level6 from './levels/level6.js';
import * as level7 from './levels/level7.js';
import * as level8 from './levels/level8.js';
import * as level9 from './levels/level9.js';
import { characters } from './config.js';

function renderMessage(message, state, layers) {
  const storyMessageElement = document.getElementById('story-message');

  // Clear previous message styles
  storyMessageElement.className = ''; // Remove all classes
  storyMessageElement.style.borderColor = ''; // Clear border color
  storyMessageElement.innerHTML = ''; // Clear content

  if (!message) return;

  if (message.characterName) {
    const character = characters[message.characterName];
    if (!character) {
      console.error(`Character "${message.characterName}" not found.`);
      return;
    }

    storyMessageElement.classList.add('speech-bubble');
    storyMessageElement.style.borderColor = character.color;

    const textElement = document.createElement('p');
    textElement.textContent = message.text;
    storyMessageElement.appendChild(textElement);

    // Add speech bubble indicator
    const indicator = document.createElement('div');
    indicator.className = 'speech-bubble-indicator';
    // Determine arrow direction based on character config
    if (character.speechBubbleDirection) {
      indicator.classList.add(character.speechBubbleDirection);
    } else {
      indicator.classList.add('down'); // Default direction
    }
    storyMessageElement.appendChild(indicator);
  } else {
    // Regular text message
    storyMessageElement.textContent = message.text;
  }
}

export function startGame(app, inputState, layers, clock) {
  const levels = {
    level1,
    level2,
    level3,
    level4,
    level5,
    level6,
    level7,
    level8,
    level9,
  };
  let currentLevelName = null;
  let levelState = null;

  function changeLevel(levelName, forceReload = false) {
    if (currentLevelName === levelName && !forceReload) return;

    clock.reset();

    if (levelState && levelState.onResize) {
      window.removeEventListener('resize', levelState.onResize);
    }

    layers.staticLayer.removeChildren();
    layers.world.removeChildren();
    layers.uiLayer.removeChildren();

    currentLevelName = levelName;
    const level = levels[currentLevelName];
    if (level) {
      levelState = level.init(app, layers);
      if (levelState.onResize) {
        window.addEventListener('resize', levelState.onResize);
        levelState.onResize();
      }
    } else {
      console.error(`Level ${levelName} not found!`);
    }
  }

  app.ticker.add((time) => {
    if (!levelState || clock.isPaused()) return;

    const delta = time.deltaMS;

    const newState = levels[currentLevelName].update(
      levelState,
      delta,
      inputState,
      app,
      layers,
      clock
    );
    levelState = newState;

    renderMessage(levelState.uiMessage, levelState, layers);

    if (levelState.nextLevel && levelState.nextLevel !== currentLevelName) {
      changeLevel(levelState.nextLevel);
      return;
    }
  });

  changeLevel('level9');

  return {
    pause: () => clock.pause(),
    resume: () => clock.play(),
    restart: () => {
      if (currentLevelName) {
        changeLevel(currentLevelName, true);
      }
    },
  };
}
