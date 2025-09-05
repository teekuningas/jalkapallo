import {
  createPlayer,
  createBall,
  createLevelText,
  createGroundMarkers,
  createKickIndicator,
  handleInputs,
  updatePhysics,
  updateCamera,
  handleResize,
  createBackground,
  createSun,
  createGround,
} from './level-utils.js';

export function init(app, layers) {
  const { staticLayer, world, uiLayer } = layers;

  // Create all graphics
  const background = createBackground(app, staticLayer);
  const sun = createSun(app, staticLayer);
  const ground = createGround(app, staticLayer);
  const player = createPlayer(world);
  const ball = createBall(world);
  const text = createLevelText(world, 'Level 2');
  const groundMarkers = createGroundMarkers(world);
  const kickIndicator = createKickIndicator(uiLayer);

  // Start player on the other side for level 2
  player.x = 1100;

  const state = {
    // Static graphics
    background,
    sun,
    ground,
    // Dynamic entities
    player,
    ball,
    text,
    groundMarkers,
    kickIndicator,
    // State properties
    kickStart: null,
    ballVelocity: { x: 0, y: 0 },
    nextLevel: null,
    onResize: null, // Placeholder
  };

  // The resize handler closes over the state
  const onResize = () => {
    handleResize(app, layers, state);
  };
  state.onResize = onResize;

  return state;
}

export function update(state, delta, inputState, app, layers) {
  const stateAfterInput = handleInputs(state, inputState, layers.world);
  const stateAfterPhysics = updatePhysics(stateAfterInput, delta);
  const finalState = updateCamera(stateAfterPhysics, app, layers);

  if (finalState.player.x < 100) {
    return { ...finalState, nextLevel: 'level1' };
  }

  return finalState;
}
