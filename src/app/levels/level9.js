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
  createTherian,
  createElectric,
  updateElectric,
  updateThomas,
  updateTherianAI,
  updateTherianVisuals,
  createSofa,
  createTV,
  createButton,
  createObstacle,
  collideCircleWithRectangle,
  lerp,
  createFireworks,
  createConfetti,
  updateFireworksAndConfetti,
  createLevelText,
  handleThomasRingCollision,
  handleTherianBallCollision,
} from './level-utils.js';

function intervalMap(value, in_min, in_max, out_min, out_max) {
  return ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export const script = [
  {
    id: 'l9-diag-1',
    trigger: { type: 'time', time: 1000 },
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
    actions: [
      { characterName: 'jake', text: 'Nyt on tilaisuuteni!', duration: 3000, delay: 500 },
      { characterName: 'sun', text: 'Mikä älynväläys!', duration: 3000, delay: 500 },
    ],
  },
  {
    id: 'l9-diag-5',
    trigger: { type: 'condition', check: (s) => s.storyState === 'CELEBRATION' },
    actions: [
      {
        characterName: 'thomas',
        text: 'Mitä, maali!?',
        duration: 3000,
        delay: 500,
      },
      {
        characterName: 'thomas',
        text: 'Huijauksen makua!',
        duration: 3000,
        delay: 500,
      },
      {
        characterName: 'thomas',
        text: 'Voidaanko nyt pelata Kirbyä?',
        duration: 3000,
        delay: 500,
      },
      {
        characterName: 'sun',
        text: 'Ja niin täyttyi muinainen ennustus!',
        duration: 4000,
        delay: 500,
      },
    ],
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

  const therian = createTherian(world, characters.therian, { x: -1000, y: -500 });
  const electric = createElectric(world, characters.electric, { x: -2500, y: 0 });

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
    thomas,
    therian,
    electric,
    worldBounds,
    kickStart: null,
    ballVelocity: { x: 0, y: 0 },
    nextLevel: null,
    onResize: null,
    eventState: initEventsState(),
    uiMessage: null,
    storyState: 'TAUNT',
    tvOn: false,
    thomasState: {
      targetX: null,
      speed: 500, // Increased speed
      patrolDirection: 1,
      patrolTransitionTimer: 0,
    },
    celebration: {
      started: false,
      timer: 0,
    },
    fireworks: createFireworks(world),
    confetti: createConfetti(world),
    theEndText: null,
  };

  state.characters = [player, sun, thomas, therian, electric];

  // Add unique IDs for animations
  player.animationId = 0;
  thomas.animationId = 1;
  therian.animationId = 2;
  electric.animationId = 3;

  const onResize = () => handleResize(app, layers, state);
  state.onResize = onResize;

  return state;
}

function updateLevel9Npcs(state, delta) {
  const { worldBounds, thomasState, player, ball, goal, storyState, thomas, therian, electric } =
    state;
  const dt = delta / 1000;
  let newState = { ...state };

  // --- Thomas-specific story logic ---
  switch (storyState) {
    case 'TAUNT': {
      const goalTargetX = worldBounds.maxX - config.wallWidth - 800;
      thomas.scale.x = 1;
      thomas.x += thomasState.speed * dt;
      if (thomas.x >= goalTargetX) {
        thomas.x = goalTargetX;
        thomas.scale.x = -1;
        newState.storyState = 'PLAY_IMPOSSIBLE';
        thomas.collisionsEnabled = true;
        thomasState.patrolTransitionTimer = 1.0; // Start 1s transition
      }
      break;
    }
    case 'PLAY_IMPOSSIBLE': {
      if (thomasState.patrolTransitionTimer > 0) {
        thomasState.patrolTransitionTimer -= dt;
      }
      const goalX = goal.x;
      const rightmostEntityX = Math.max(player.x, ball.x);
      const baseTargetX = (goalX + rightmostEntityX) / 2;
      const dist = Math.abs(goalX - rightmostEntityX);
      const amplitude = intervalMap(dist, 100, 1500, 10, 150);
      const clampedAmplitude = Math.max(10, Math.min(150, amplitude));
      const transitionFactor = 1.0 - Math.max(0, thomasState.patrolTransitionTimer);
      const offset = Math.sin(Date.now() / 400) * clampedAmplitude * transitionFactor;
      let finalTargetX = baseTargetX + offset;
      finalTargetX = Math.min(finalTargetX, goalX - thomas.bodyWidth / 2);
      thomas.x = lerp(thomas.x, finalTargetX, 0.05);
      if (Math.abs(rightmostEntityX - thomas.x) > 10) {
        thomas.scale.x = Math.sign(rightmostEntityX - thomas.x);
      }
      break;
    }
    case 'TV_EVENT':
    case 'PLAY_POSSIBLE': {
      const sofaTargetX = worldBounds.minX + 380;
      const dir = Math.sign(sofaTargetX - thomas.x);
      if (Math.abs(sofaTargetX - thomas.x) > 5) {
        thomas.x += thomasState.speed * dir * dt;
        thomas.scale.x = -1;
      } else {
        thomas.x = sofaTargetX;
      }
      break;
    }
  }

  // --- Other NPCs (Therian, Electric) story logic ---
  [therian, electric].forEach((npc) => {
    switch (storyState) {
      case 'TV_EVENT':
      case 'PLAY_POSSIBLE': {
        const tvTargetX = worldBounds.minX + 300 + npc.animationId * 60;
        const speed = 400;
        const dir = Math.sign(tvTargetX - npc.x);
        if (Math.abs(tvTargetX - npc.x) > 5) {
          npc.x += speed * dir * dt;
          npc.scale.x = dir;
        }
        if (npc.type === 'therian') {
          npc.y = lerp(npc.y, -200, 0.05); // Fly down to TV height
        }
        break;
      }
    }
  });

  return newState;
}

function updateStory(state) {
  const { ball, button, goal, storyState, tvOn, thomas } = state;
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

      if (thomas) thomas.collisionsEnabled = false;
    }
  }

  if (storyState === 'TV_EVENT') {
    const sofaTargetX = state.worldBounds.minX + 380;
    if (Math.abs(thomas.x - sofaTargetX) < 10) {
      newState.storyState = 'PLAY_POSSIBLE';
    }
  }

  if (storyState === 'PLAY_POSSIBLE' && checkGoal(ball, goal)) {
    newState.storyState = 'CELEBRATION';
    newState.celebration.started = true;
    newState.sun.celebrating = true;
  }

  return newState;
}

function updateCelebration(state, delta, layers, app) {
  if (!state.celebration.started) return state;

  const dt = delta / 1000;
  state.celebration.timer += dt;

  const { player, thomas, therian, electric, sun } = state;
  const { world } = layers;

  // Move all NPCs towards the player with unique wandering
  [thomas, therian, electric].forEach((npc) => {
    const baseTargetX = player.x + (npc.animationId - 1) * 120;
    const wanderX = Math.sin(state.celebration.timer * 2 + npc.animationId) * 40;
    const targetX = baseTargetX + wanderX;

    npc.x = lerp(npc.x, targetX, 0.015);
    npc.scale.x = Math.sign(player.x - npc.x);

    // Therian should fly down to ground level
    if (npc.type === 'therian') {
      npc.y = lerp(npc.y, 0, 0.025);
    }
  });

  // Make everyone jump with unique offsets
  const jumpHeight = 25;
  const jumpSpeed = 4;
  state.characters.forEach((char) => {
    if (char.characterName !== 'sun') {
      const jumpOffset =
        Math.sin(state.celebration.timer * jumpSpeed + char.animationId * 0.5) * jumpHeight;
      char.y = -Math.abs(jumpOffset);
    }
  });

  // Make the sun grow
  if (sun) {
    const targetScale = 2.0;
    sun.scale.set(lerp(sun.scale.x, targetScale, 0.005));
  }

  // Handle fireworks and confetti
  updateFireworksAndConfetti(state, delta, layers, app);

  // Handle "THE END" text
  const endTime = 10; // seconds
  if (state.celebration.timer > endTime && !state.theEndText) {
    const text = createLevelText(world, 'LOPPU');
    text.alpha = 0;
    state.theEndText = text;
  }

  if (state.theEndText) {
    state.theEndText.x = player.x;
    state.theEndText.y = -300;
    state.theEndText.alpha = Math.min(1, state.theEndText.alpha + dt * 0.5);
  }

  return state;
}

export function update(state, delta, inputState, app, layers, clock) {
  const dt = delta / 1000;
  let stateAfterInput = state;
  // Only process inputs if the game has not ended
  if (!state.theEndText) {
    const { newState } = handleInputs(state, inputState, layers.world, delta);
    stateAfterInput = newState;
  }

  let stateAfterStory = updateStory(stateAfterInput);

  // Handle level-specific NPC story logic
  stateAfterStory = updateLevel9Npcs(stateAfterStory, delta);

  let stateAfterCelebration = updateCelebration(stateAfterStory, delta, layers, app);

  const newEventState = updateEvents(
    stateAfterCelebration.eventState,
    script,
    stateAfterCelebration,
    clock
  );
  const uiMessage = getUIMessageFromEventState(newEventState);

  let stateAfterPhysics = updatePhysics(stateAfterCelebration, delta);

  // Handle NPC collisions separately, only when they are actively playing
  if (stateAfterPhysics.storyState === 'PLAY_IMPOSSIBLE') {
    if (stateAfterPhysics.thomas) {
      const { ball, ballVelocity } = handleThomasRingCollision(
        stateAfterPhysics.thomas,
        stateAfterPhysics.ball,
        stateAfterPhysics.ballVelocity
      );
      stateAfterPhysics.ball = ball;
      stateAfterPhysics.ballVelocity = ballVelocity;
    }
    if (stateAfterPhysics.therian) {
      const { ball, ballVelocity } = handleTherianBallCollision(
        stateAfterPhysics.therian,
        stateAfterPhysics.ball,
        stateAfterPhysics.ballVelocity
      );
      stateAfterPhysics.ball = ball;
      stateAfterPhysics.ballVelocity = ballVelocity;
    }
  }

  // Always update visuals for every NPC that has a visual updater
  if (stateAfterPhysics.therian) {
    updateTherianVisuals(stateAfterPhysics.therian, dt);
  }

  // Only run the standard NPC AI if not in a special story state
  const storyIsActive =
    stateAfterPhysics.storyState === 'TV_EVENT' || stateAfterPhysics.storyState === 'PLAY_POSSIBLE';
  if (!stateAfterPhysics.celebration.started && !storyIsActive) {
    if (stateAfterPhysics.therian) {
      updateTherianAI(stateAfterPhysics.therian, stateAfterPhysics, dt);
    }
    if (stateAfterPhysics.electric) {
      updateElectric(stateAfterPhysics.electric, stateAfterPhysics, dt, layers);
    }
    if (stateAfterPhysics.thomas) {
      updateThomas(stateAfterPhysics.thomas, stateAfterPhysics, dt);
    }
  }

  let finalState = updateCamera(stateAfterPhysics, app, layers);
  updateSpeakerEffects({ ...finalState, uiMessage });
  updateSun(finalState);

  return { ...finalState, eventState: newEventState, uiMessage };
}
