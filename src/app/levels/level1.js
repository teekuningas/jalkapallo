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
    id: 'intro1',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'Tervetuloa jalkapallon ihmeelliseen maailmaan!',
      duration: 4000,
    },
  },
  {
    id: 'intro2',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'Voit ohjata hahmoa näppäimistön nuolinäppäimillä ..',
      duration: 4000,
    },
  },
  {
    id: 'intro3',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'tai koskettamalla vasemman laidan painikkeita.',
      duration: 4000,
    },
  },
  {
    id: 'kickHelp1',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'Ollessasi pallon lähellä, voit potkaista sitä klikkaamalla tai koskettamalla näyttöä ..',
      duration: 4000,
    },
  },
  {
    id: 'kickHelp2',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'siihen kohtaan, jonka suuntaan haluat pallon lähtevän.',
      duration: 4000,
    },
  },
  {
    id: 'firstKick',
    trigger: { type: 'event', name: 'ballKicked' },
    action: {
      type: 'showText',
      text: 'Tähti on syttynyt!',
      duration: 3000,
      characterName: 'sun',
    },
    once: true,
  },
];

export function init(app, layers) {
  const { staticLayer, world, uiLayer } = layers;

  const worldBounds = { minX: -500, maxX: 1500 };

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
  let finalState = updateCamera(stateAfterPhysics, app, layers);

  // Win condition check
  const { ball, goal } = finalState;
  if (checkGoal(ball, goal) && !finalState.nextLevel) {
    finalState = { ...finalState, nextLevel: 'level2' };
  }

  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
