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
  updateNPCs,
} from './level-utils.js';

export const script = [
  {
    id: 'level7-title',
    trigger: { type: 'time', time: 1000 },
    action: { type: 'showText', text: 'Taso 7', duration: 3000 },
  },
  {
    id: 'electric-dialogue-1',
    trigger: { type: 'time', time: 5000 },
    action: {
      type: 'showText',
      characterName: 'electric',
      text: 'Syötä mulle! Oon vapaana!',
      duration: 3000,
    },
  },
  {
    id: 'sun-fact-1',
    trigger: { type: 'time', time: 13000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'Tiesittekö, että jalkapalloa on pelattu kuussa? Astronautit pelasivat sitä Apollo 14 -lennolla.',
      duration: 5000,
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
  const electric = createElectric(world, characters.electric, {
    x: worldBounds.maxX - config.wallWidth - 300,
  });

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
    obstacles: [],
    npcs: [electric],
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
  const { newState: stateAfterInput } = handleInputs(state, inputState, layers.world, delta);

  const newEventState = updateEvents(state.eventState, script, state, clock);
  const uiMessage = getUIMessageFromEventState(newEventState);

  const stateAfterPhysics = updatePhysics(stateAfterInput, delta);
  const stateAfterNPCs = updateNPCs(stateAfterPhysics, delta, layers);
  let finalState = updateCamera(stateAfterNPCs, app, layers);

  // Win condition check
  const { ball, goal } = finalState;
  if (checkGoal(ball, goal) && !finalState.nextLevel) {
    finalState = { ...finalState, nextLevel: 'level8' };
  }

  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
