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
  createObstacle,
  checkGoal,
  initEventsState,
  updateEvents,
  getUIMessageFromEventState,
  updateSpeakerEffects,
  updateSun,
  createElectric,
  updateElectric,
} from './level-utils.js';

export const script = [
  {
    id: 'level8-title',
    trigger: { type: 'time', time: 0 },
    action: { type: 'showText', text: 'Taso 8', duration: 3000 },
  },
  {
    id: 'sun-dialogue-1',
    trigger: { type: 'time', time: 4000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'Olet melkein valmis kohtaamaan viimeisen haasteen.',
      duration: 3000,
    },
  },
  {
    id: 'sun-fact-1',
    trigger: { type: 'time', time: 18000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'Tiesittekö, että nopein maali jalkapallon historiassa tehtiin vain 2 sekunnissa?',
      duration: 5000,
    },
  },
];

export function init(app, layers) {
  const { staticLayer, world, uiLayer } = layers;

  const worldBounds = { minX: -500, maxX: 3000 };

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
  const obstacle1 = createObstacle(world, 200, 300, 0, 200);
  const obstacle2 = createObstacle(world, 700, 800, 0, 200);
  const obstacle3 = createObstacle(world, 1200, 1300, 0, 200);
  const obstacle4 = createObstacle(world, 1700, 1800, 0, 200, true);
  const obstacle5 = createObstacle(world, 2200, 2300, 0, 200);
  const obstacle6 = createObstacle(world, 450, 550, 400, 600);
  const obstacle7 = createObstacle(world, 950, 1050, 400, 600);
  const obstacle8 = createObstacle(world, 1450, 1550, 400, 600);
  const obstacle9 = createObstacle(world, 1950, 2050, 400, 4000);
  const electric = createElectric(world, characters.electric, {
    x: worldBounds.maxX - config.wallWidth - 300,
  });

  // Center the action
  player.x = -45;
  ball.x = 45;

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
    obstacles: [
      obstacle1,
      obstacle2,
      obstacle3,
      obstacle4,
      obstacle5,
      obstacle6,
      obstacle7,
      obstacle8,
      obstacle9,
    ],
    electric,
    // State properties
    worldBounds,
    kickStart: null,
    ballVelocity: { x: 0, y: 0 },
    nextLevel: null,
    onResize: null, // Placeholder
    eventState: initEventsState(),
    uiMessage: null,
  };

  state.characters = [player, sun, electric];

  // The resize handler closes over the state
  const onResize = () => {
    handleResize(app, layers, state);
  };
  state.onResize = onResize;

  return state;
}

export function update(state, delta, inputState, app, layers, clock) {
  const dt = delta / 1000;
  const { newState: stateAfterInput } = handleInputs(state, inputState, layers.world, delta);

  const newEventState = updateEvents(state.eventState, script, state, clock);
  const uiMessage = getUIMessageFromEventState(newEventState);

  let stateAfterPhysics = updatePhysics(stateAfterInput, delta);

  // Explicitly update the electric NPC
  if (stateAfterPhysics.electric) {
    updateElectric(stateAfterPhysics.electric, stateAfterPhysics, dt, layers);
  }

  let finalState = updateCamera(stateAfterPhysics, app, layers);

  // Win condition check
  const { ball, goal } = finalState;
  if (checkGoal(ball, goal) && !finalState.nextLevel) {
    finalState = { ...finalState, nextLevel: 'level9' };
  }

  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
