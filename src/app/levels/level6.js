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
    id: 'level6-title',
    trigger: { type: 'time', time: 1000 },
    action: { type: 'showText', text: 'Taso 6', duration: 3000 },
  },
  {
    id: 'therian-dialogue-1',
    trigger: { type: 'time', time: 5000 },
    action: {
      type: 'showText',
      characterName: 'therian',
      text: 'Se oli hauskaa. Uudestaan?',
      duration: 3000,
    },
  },
  {
    id: 'jake-dialogue-1',
    trigger: { type: 'time', time: 9000 },
    action: {
      type: 'showText',
      characterName: 'jake',
      text: 'Ok! Vielä kerran!',
      duration: 3000,
    },
  },
  {
    id: 'sun-fact-1',
    trigger: { type: 'time', time: 17000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'Tiesittekö, että ammattilaisjalkapalloilija juoksee keskimäärin 11 kilometriä yhden ottelun aikana?',
      duration: 5000,
    },
  },
];

export function init(app, layers) {
  const { staticLayer, world, uiLayer } = layers;

  const worldBounds = { minX: -1500, maxX: 1000 };

  // Create all graphics
  const background = createBackground(app, staticLayer);
  const sun = createSun(app, staticLayer, characters.sun);
  const ground = createGround(app, staticLayer);
  const player = createPlayer(world, characters.jake);
  const ball = createBall(world);
  const groundMarkers = createGroundMarkers(world, worldBounds, true);
  const kickIndicator = createKickIndicator(uiLayer);
  const walls = createWalls(world, worldBounds);
  const goal = createGoal(world, worldBounds.minX + config.wallWidth + 100, 0, 150, 150, 'right');
  const therian = createTherian(world, characters.therian, { y: -500 });
  const obstacle1 = createObstacle(world, 150, 200, 0, 100);
  const obstacle2 = createObstacle(world, -300, -250, 0, 150, true);
  const obstacle3 = createObstacle(world, -1400, -500, 150, 200);
  const obstacle4 = createObstacle(world, -300, 0, 150, 200);

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
    obstacles: [obstacle1, obstacle2, obstacle3, obstacle4],
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
  const { newState: stateAfterInput } = handleInputs(state, inputState, layers.world, delta);

  const newEventState = updateEvents(state.eventState, script, state, clock);
  const uiMessage = getUIMessageFromEventState(newEventState);

  const stateAfterPhysics = updatePhysics(stateAfterInput, delta);
  const stateAfterNPCs = updateNPCs(stateAfterPhysics, delta, layers);
  let finalState = updateCamera(stateAfterNPCs, app, layers);

  // Win condition check
  const { ball, goal } = finalState;
  if (checkGoal(ball, goal) && !finalState.nextLevel) {
    finalState = { ...finalState, nextLevel: 'level7' };
  }

  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
