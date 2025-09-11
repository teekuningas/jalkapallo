import { config, characters } from '../config.js';
import {
  createPlayer,
  createBall,
  createGroundMarkers,
  createKickIndicator,
  handleInputs,
  updatePhysics,
  updateCamera,
  handleResize,
  createBackground,
  createSun,
  createGround,
  createWalls,
  createGoal,
  checkGoal,
  initEventsState,
  updateEvents,
  getUIMessageFromEventState,
  updateSpeakerEffects,
  updateSun,
} from './level-utils.js';

export const script = [
  {
    id: 'level2-title',
    trigger: { type: 'time', time: 1000 },
    action: { type: 'showText', text: 'Taso 2', duration: 3000 },
  },
  {
    id: 'sun-dialogue-1',
    trigger: { type: 'time', time: 1000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'Kuka te muuten olette?',
      duration: 3000,
    },
  },
  {
    id: 'jake-dialogue-1',
    trigger: { type: 'time', time: 1000 },
    action: {
      type: 'showText',
      characterName: 'jake',
      text: 'En ole varma.. tämä on kuin uni.',
      duration: 3000,
    },
  },
  {
    id: 'sun-dialogue-2',
    trigger: { type: 'time', time: 1000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'Tiedättekö tehtävänne?',
      duration: 3000,
    },
  },
  {
    id: 'jake-dialogue-2',
    trigger: { type: 'time', time: 1000 },
    action: {
      type: 'showText',
      characterName: 'jake',
      text: '.. tehdä niin paljon maaleja kuin mahdollista?',
      duration: 3000,
    },
  },
  {
    id: 'sun-dialogue-3',
    trigger: { type: 'time', time: 1000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'Teidän tehtävänne on täyttää toteen ennustus!',
      duration: 3000,
    },
  },
];

export function init(app, layers) {
  const { staticLayer, world, uiLayer } = layers;

  const worldBounds = { minX: -1000, maxX: 1000 };

  // Create all graphics
  const background = createBackground(app, staticLayer);
  const sun = createSun(app, staticLayer, characters.sun);
  const ground = createGround(app, staticLayer);
  const player = createPlayer(world, characters.jake);
  const ball = createBall(world);
  const groundMarkers = createGroundMarkers(world, worldBounds, true);
  const kickIndicator = createKickIndicator(uiLayer);
  const walls = createWalls(world, worldBounds);
  // Goal on the left, facing right, with the same clearance as level 1
  const goal = createGoal(world, worldBounds.minX + config.wallWidth + 100, 0, 150, 180, 'right');

  // Center the action
  player.x = 45;
  ball.x = -45;

  const state = {
    // Static graphics
    background,
    sun,
    ground,
    // Dynamic entities
    player,
    ball,
    groundMarkers,
    kickIndicator,
    walls,
    goal,
    // State properties
    worldBounds,
    kickStart: null,
    ballVelocity: { x: 0, y: 0 },
    nextLevel: null,
    onResize: null, // Placeholder
    eventState: initEventsState(),
    uiMessage: null,
  };

  state.characters = [player, sun];

  // The resize handler closes over the state
  const onResize = () => {
    handleResize(app, layers, state);
  };
  state.onResize = onResize;

  return state;
}

export function update(state, delta, inputState, app, layers) {
  const { newState: stateAfterInput, gameEvents } = handleInputs(state, inputState, layers.world);

  const newEventState = updateEvents(state.eventState, script, state, gameEvents, delta);
  const uiMessage = getUIMessageFromEventState(newEventState);

  const stateAfterPhysics = updatePhysics(stateAfterInput, delta);
  let finalState = updateCamera(stateAfterPhysics, app, layers);

  // Win condition check
  const { ball, goal } = finalState;
  if (checkGoal(ball, goal) && !finalState.nextLevel) {
    finalState = { ...finalState, nextLevel: 'level1' };
  }

  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
