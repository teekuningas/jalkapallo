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
  createTherian,
  updateNPCs,
  createObstacle,
} from './level-utils.js';

export const script = [
  {
    id: 'level5-title',
    trigger: { type: 'time', time: 1 },
    action: { type: 'showText', text: 'Taso 5', duration: 3000 },
  },
  {
    id: 'therian-dialogue-1',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      characterName: 'therian',
      text: 'Hei! Täällä taivaalla!',
      duration: 3000,
    },
  },
  {
    id: 'jake-dialogue-1',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      characterName: 'jake',
      text: 'Hei!',
      duration: 3000,
    },
  },
  {
    id: 'therian-dialogue-2',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      characterName: 'therian',
      text: 'Tarvitsetko apua?',
      duration: 3000,
    },
  },
  {
    id: 'jake-dialogue-2',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      characterName: 'jake',
      text: 'Ootas, syötän sulle.',
      duration: 3000,
    },
  },
];

export function init(app, layers) {
  const { staticLayer, world, uiLayer } = layers;

  const worldBounds = { minX: -500, maxX: 2000 };

  // Create all graphics
  const background = createBackground(app, staticLayer);
  const sun = createSun(app, staticLayer, characters.sun);
  const ground = createGround(app, staticLayer);
  const player = createPlayer(world, characters.jake);
  const ball = createBall(world);
  const groundMarkers = createGroundMarkers(world, worldBounds, true);
  const kickIndicator = createKickIndicator(uiLayer);
  const walls = createWalls(world, worldBounds);
  const goal = createGoal(world, worldBounds.maxX - config.wallWidth - 175, 0, 150, 180, 'left');
  const therian = createTherian(world, characters.therian, { y: -500 });
  const obstacle1 = createObstacle(world, 650, 700, 0, 300);
  const obstacle2 = createObstacle(world, 900, 1900, 250, 300);
  const obstacle3 = createObstacle(world, 720, 1200, 50, 100);

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
    obstacles: [obstacle1, obstacle2, obstacle3],
    npcs: [therian],
    // State properties
    worldBounds,
    kickStart: null,
    ballVelocity: { x: 0, y: 0 },
    nextLevel: null,
    onResize: null, // Placeholder
    eventState: initEventsState(),
    uiMessage: null,
  };

  state.characters = [player, sun, therian];

  // The resize handler closes over the state
  const onResize = () => {
    handleResize(app, layers, state);
  };
  state.onResize = onResize;

  return state;
}

export function update(state, delta, inputState, app, layers, clock) {
  const { newState: stateAfterInput, gameEvents } = handleInputs(
    state,
    inputState,
    layers.world,
    delta
  );

  const newEventState = updateEvents(state.eventState, script, state, gameEvents, clock);
  const uiMessage = getUIMessageFromEventState(newEventState);

  const stateAfterPhysics = updatePhysics(stateAfterInput, delta);
  const stateAfterNPCs = updateNPCs(stateAfterPhysics, delta);
  let finalState = updateCamera(stateAfterNPCs, app, layers);

  // Win condition check
  const { ball, goal } = finalState;
  if (checkGoal(ball, goal) && !finalState.nextLevel) {
    finalState = { ...finalState, nextLevel: 'level1' };
  }

  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
