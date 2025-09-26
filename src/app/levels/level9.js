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
  createThomas,
  updateNPCs,
  createSofa,
  createTV,
  createButton,
  createObstacle,
  collideCircleWithRectangle,
} from './level-utils.js';

export const script = [
  {
    id: 'level9-title',
    trigger: { type: 'time', time: 1000 },
    action: { type: 'showText', text: 'Taso 9', duration: 3000 },
  },
];

export function init(app, layers) {
  const { staticLayer, world, uiLayer } = layers;

  const worldBounds = { minX: -3000, maxX: 3000 };

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
  const thomas = createThomas(world, characters.thomas, {
    x: worldBounds.maxX - config.wallWidth - 350,
  });
  thomas.scale.x = -1; // Face left

  // Living room assets
  const sofa = createSofa(world, { x: worldBounds.minX + 450, y: 0 });
  const tv = createTV(world, { x: worldBounds.minX + 140, y: -100 });
  const button = createButton(world, { x: worldBounds.minX + 200, y: -400 });

  const obstacle = createObstacle(
    world,
    worldBounds.minX + 950,
    worldBounds.minX + 1050,
    150, // Gap at the bottom
    4000,
    true
  );

  // Center the action
  player.x = -45;
  ball.x = 45;

  const state = {
    // Static graphics
    background,
    sun,
    ground,
    sofa,
    tv,
    button,
    // Dynamic entities
    player,
    ball,
    groundMarkers,
    kickIndicator,
    walls,
    goal,
    obstacles: [obstacle], // Add the new obstacle here
    npcs: [thomas],
    // State properties
    worldBounds,
    kickStart: null,
    ballVelocity: { x: 0, y: 0 },
    nextLevel: null,
    onResize: null, // Placeholder
    eventState: initEventsState(),
    uiMessage: null,
    storyState: 'taunt',
    tvState: { isOn: false },
  };

  state.characters = [player, sun, thomas];

  // The resize handler closes over the state
  const onResize = () => {
    handleResize(app, layers, state);
  };
  state.onResize = onResize;

  return state;
}

function updateStory(state, delta) {
  const { ball, button, tv, tvState } = state;

  // Check for the button press only if the TV is off
  if (!tvState.isOn) {
    const ballCircle = { x: ball.x, y: ball.y, radius: config.ballRadius };
    const buttonRect = button.colliders[0];
    const absoluteButtonRect = {
      x: button.x + buttonRect.x,
      y: button.y + buttonRect.y,
      width: buttonRect.width,
      height: buttonRect.height,
    };

    const collision = collideCircleWithRectangle(ballCircle, absoluteButtonRect);

    if (collision.collided) {
      // --- Turn the TV on ---
      state.tvState.isOn = true;

      // 1. Update button visual
      button.buttonOn.visible = true;
      button.buttonOff.visible = false;

      // 2. Update TV screen visual
      const screenWidth = 15;
      const screenHeight = 140;
      const standWidth = 5;
      const standHeight = 100;
      tv.screen
        .clear()
        .rect(
          standWidth,
          -screenHeight - (standHeight - screenHeight) / 2,
          screenWidth,
          screenHeight
        )
        .fill(0xe0ffff); // Light cyan "on" color
    }
  }
  return state;
}

export function update(state, delta, inputState, app, layers, clock) {
  const { newState: stateAfterInput } = handleInputs(state, inputState, layers.world, delta);

  const newEventState = updateEvents(state.eventState, script, state, clock);
  const uiMessage = getUIMessageFromEventState(newEventState);

  const stateAfterPhysics = updatePhysics(stateAfterInput, delta);
  const stateAfterNPCs = updateNPCs(stateAfterPhysics, delta, layers);

  // --- Story Logic ---
  const stateAfterStory = updateStory(stateAfterNPCs, delta);
  // --- End Story Logic ---

  let finalState = updateCamera(stateAfterStory, app, layers);

  // Win condition check
  const { ball, goal } = finalState;
  if (checkGoal(ball, goal) && !finalState.nextLevel) {
    finalState = { ...finalState, nextLevel: 'level1' };
  }

  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
