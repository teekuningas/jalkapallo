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
} from './level-utils.js';

export const script = [
  {
    id: 'level4-title',
    trigger: { type: 'time', time: 0 },
    action: { type: 'showText', text: 'Taso 4', duration: 3000 },
  },
  {
    id: 'jake-dialogue-1',
    trigger: { type: 'time', time: 4000 },
    action: {
      type: 'showText',
      characterName: 'jake',
      text: 'Mitä siinä ennustuksessa sitten sanotaan?',
      duration: 3000,
    },
  },
  {
    id: 'sun-dialogue-1',
    trigger: { type: 'time', time: 8000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'Muinaisessa ennustuksessa sanotaan, että maailmaan saapuu pelaaja,',
      duration: 3000,
    },
  },
  {
    id: 'sun-dialogue-2',
    trigger: { type: 'time', time: 12000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'joka onnistuu ohittamaan maalivahdin,',
      duration: 3000,
    },
  },
  {
    id: 'sun-dialogue-3',
    trigger: { type: 'time', time: 16000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'joka muinaisista ajoista asti on maailmamme maalia vahtinut.',
      duration: 3000,
    },
  },
  {
    id: 'sun-fact-1',
    trigger: { type: 'time', time: 28000 },
    action: {
      type: 'showText',
      characterName: 'sun',
      text: 'Tiesitkö muuten, että maailman suurin jalkapallostadion on Pohjois-Koreassa? Sinne mahtuu 114 000 ihmistä.',
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
  const obstacle1 = createObstacle(world, 400, 500, 0, 600);
  const obstacle2 = createObstacle(world, 800, 900, 400, 1500);
  const obstacle3 = createObstacle(world, 1200, 1300, 0, 600);

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
    obstacles: [obstacle1, obstacle2, obstacle3],
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
  const { newState: stateAfterInput } = handleInputs(state, inputState, layers.world, delta);

  const newEventState = updateEvents(state.eventState, script, state, clock);
  const uiMessage = getUIMessageFromEventState(newEventState);

  const stateAfterPhysics = updatePhysics(stateAfterInput, delta);
  let finalState = updateCamera(stateAfterPhysics, app, layers);

  // Win condition check
  const { ball, goal } = finalState;
  if (checkGoal(ball, goal) && !finalState.nextLevel) {
    finalState = { ...finalState, nextLevel: 'level5' };
  }

  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
