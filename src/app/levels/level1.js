import { config } from '../config.js';
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
} from './level-utils.js';

export const script = [
  {
    id: 'intro1',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'Tervetuloa jalkapallon ihmeelliseen maailmaan!',
      duration: 3000,
    },
  },
  {
    id: 'intro2',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'Voit ohjata hahmoa näppäimistön nuolinäppäimillä',
      duration: 3000,
    },
  },
  {
    id: 'intro3',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'tai koskettamalla vasemman laidan painikkeita.',
      duration: 3000,
    },
  },
  {
    id: 'kickHelp1',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'Ollessasi lähellä palloa, voit potkaista sitä',
      duration: 3000,
    },
  },
  {
    id: 'kickHelp2',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'klikkaamalla tai koskettamalla näyttöä maailmassa kohtaan,',
      duration: 3000,
    },
  },
  {
    id: 'kickHelp3',
    trigger: { type: 'time', time: 1 },
    action: {
      type: 'showText',
      text: 'jonka suuntaan haluat pallon lähtevän.',
      duration: 3000,
    },
  },
  {
    id: 'firstKick',
    trigger: { type: 'event', name: 'ballKicked' },
    action: { type: 'showText', text: 'Erinomaista, juuri noin!', duration: 3000 },
    once: true,
  },
];

export function init(app, layers) {
  const { staticLayer, world, uiLayer } = layers;

  const worldBounds = { minX: -1000, maxX: 1000 };

  // Create all graphics
  const background = createBackground(app, staticLayer);
  const sun = createSun(app, staticLayer);
  const ground = createGround(app, staticLayer);
  const player = createPlayer(world);
  const ball = createBall(world);
  const groundMarkers = createGroundMarkers(world, worldBounds, true);
  const kickIndicator = createKickIndicator(uiLayer);
  const walls = createWalls(world, worldBounds);
  const goal = createGoal(world, worldBounds.maxX - config.wallWidth - 250, 0, 150, 200, 'left');

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
    finalState = { ...finalState, nextLevel: 'level2' };
  }

  return { ...finalState, eventState: newEventState, uiMessage };
}
