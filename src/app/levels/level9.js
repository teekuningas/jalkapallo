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
  lerp,
} from './level-utils.js';

function intervalMap(value, in_min, in_max, out_min, out_max) {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export const script = [
  {
    id: 'l9-diag-1',
    trigger: { type: 'time', time: 500 },
    action: { characterName: 'thomas', text: 'Et ikinä tee maalia minua vastaan!', duration: 3000 },
  },
  {
    id: 'l9-diag-3',
    trigger: { type: 'condition', check: (s) => s.storyState === 'TV_EVENT' },
    action: { characterName: 'thomas', text: 'Hei! Kirby!', duration: 3000 },
  },
  {
    id: 'l9-diag-4',
    trigger: { type: 'condition', check: (s) => s.storyState === 'PLAY_POSSIBLE' },
    action: { characterName: 'jake', text: 'Nyt on tilaisuuteni!', duration: 3000 },
  },
  {
    id: 'l9-diag-5',
    trigger: { type: 'condition', check: (s) => s.storyState === 'CELEBRATION' },
    action: {
      characterName: 'thomas',
      text: 'Jee, hieno maali! Voidaanko nyt pelata Kirbyä?',
      duration: 4000,
    },
  },
];

export function init(app, layers) {
  const { staticLayer, world, uiLayer } = layers;

  const worldBounds = { minX: -3000, maxX: 1500 };

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

  const thomas = createThomas(world, characters.thomas, { x: 150 });
  thomas.scale.x = 1; // Face right initially
  thomas.collisionsEnabled = false; // Collision is off by default

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

  player.x = -45;
  ball.x = 45;

  const state = {
    background,
    sun,
    ground,
    sofa,
    tv,
    button,
    player,
    ball,
    groundMarkers,
    kickIndicator,
    walls,
    goal,
    obstacles: [obstacle],
    npcs: [thomas],
    worldBounds,
    kickStart: null,
    ballVelocity: { x: 0, y: 0 },
    nextLevel: null,
    onResize: null,
    eventState: initEventsState(),
    uiMessage: null,
    storyState: 'TAUNT',
    playerIsControllable: false,
    tvOn: false,
    thomas: {
      targetX: null,
      speed: 500, // Increased speed
      patrolDirection: 1,
    },
  };

  state.characters = [player, sun, thomas];

  const onResize = () => handleResize(app, layers, state);
  state.onResize = onResize;

  return state;
}

function updateThomasLevel9(state, delta) {
  const { npcs, worldBounds, thomas: thomasState, player, ball, goal } = state;
  const thomas = npcs.find((n) => n.type === 'thomas');
  if (!thomas) return state;

  const dt = delta / 1000;
  let newState = { ...state };

  // --- Main Story State Machine ---
  switch (state.storyState) {
    case 'TAUNT': {
      const goalTargetX = worldBounds.maxX - config.wallWidth - 800;
      thomas.scale.x = 1;
      thomas.x += thomasState.speed * dt;
      if (thomas.x >= goalTargetX) {
        thomas.x = goalTargetX;
        thomas.scale.x = -1;
        newState.storyState = 'PLAY_IMPOSSIBLE';
        newState.playerIsControllable = true;
        thomas.collisionsEnabled = true;
      }
      break;
    }
    case 'PLAY_IMPOSSIBLE': {
      const goalX = goal.x;
      const rightmostEntityX = Math.max(player.x, ball.x);

      const baseTargetX = (goalX + rightmostEntityX) / 2;

      const dist = Math.abs(goalX - rightmostEntityX);
      const amplitude = intervalMap(dist, 100, 1500, 10, 150);
      const clampedAmplitude = Math.max(10, Math.min(150, amplitude));

      const offset = Math.sin(Date.now() / 400) * clampedAmplitude;
      let finalTargetX = baseTargetX + offset;

      // Clamp the target to prevent going behind the goal
      finalTargetX = Math.min(finalTargetX, goalX - thomas.bodyWidth / 2);

      thomas.x = lerp(thomas.x, finalTargetX, 0.05);

      // Update facing direction
      if (Math.abs(rightmostEntityX - thomas.x) > 10) {
        thomas.scale.x = Math.sign(rightmostEntityX - thomas.x);
      }

      break;
    }
    case 'TV_EVENT': {
      const sofaTargetX = worldBounds.minX + 380;
      thomas.scale.x = -1;
      thomas.x -= thomasState.speed * dt;
      if (thomas.x <= sofaTargetX) {
        thomas.x = sofaTargetX;
        newState.storyState = 'PLAY_POSSIBLE';
        newState.playerIsControllable = true;
      }
      break;
    }
    case 'PLAY_POSSIBLE':
      // Thomas stays on the sofa
      break;
    case 'CELEBRATION': {
      const celebrationTargetX = state.player.x + 100;
      const dir = Math.sign(celebrationTargetX - thomas.x);
      if (dir !== 0) {
        thomas.scale.x = dir;
        thomas.x += thomasState.speed * dir * dt;
        if (Math.abs(thomas.x - celebrationTargetX) < 10) {
          thomas.x = celebrationTargetX;
        }
      }
      break;
    }
  }

  return newState;
}

function updateStory(state) {
  const { ball, button, goal, storyState, tvOn, npcs } = state;
  let newState = { ...state };

  if (storyState === 'PLAY_IMPOSSIBLE' && !tvOn) {
    const ballCircle = { x: ball.x, y: ball.y, radius: config.ballRadius };
    const buttonRect = button.colliders[0];
    const absoluteButtonRect = {
      x: button.x + buttonRect.x,
      y: button.y + buttonRect.y,
      width: buttonRect.width,
      height: buttonRect.height,
    };

    if (collideCircleWithRectangle(ballCircle, absoluteButtonRect).collided) {
      newState.tvOn = true;
      button.buttonOn.visible = true;
      button.buttonOff.visible = false;
      state.tv.screen.clear().rect(5, -120, 15, 140).fill(0xe0ffff);

      newState.storyState = 'TV_EVENT';
      newState.playerIsControllable = false;

      const thomas = npcs.find((n) => n.type === 'thomas');
      if (thomas) thomas.collisionsEnabled = false; // <<<--- Disable collisions
    }
  }

  if (storyState === 'PLAY_POSSIBLE' && checkGoal(ball, goal)) {
    newState.storyState = 'CELEBRATION';
    newState.playerIsControllable = false;
  }

  return newState;
}

export function update(state, delta, inputState, app, layers, clock) {
  const { newState: stateAfterInput } = handleInputs(state, inputState, layers.world, delta);

  let stateAfterStory = updateStory(stateAfterInput);
  stateAfterStory = updateThomasLevel9(stateAfterStory, delta);

  const newEventState = updateEvents(stateAfterStory.eventState, script, stateAfterStory, clock);
  const uiMessage = getUIMessageFromEventState(newEventState);

  const stateAfterPhysics = updatePhysics(stateAfterStory, delta);
  const stateAfterNPCs = updateNPCs(stateAfterPhysics, delta, layers);

  let finalState = updateCamera(stateAfterNPCs, app, layers);
  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
