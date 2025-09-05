import { Container, Graphics, Circle, Text } from 'pixi.js';
import { config } from '../config.js';

function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

export function createBackground(app, staticLayer) {
  const background = new Graphics();
  background.zIndex = -1;
  staticLayer.addChild(background);
  return background;
}

export function createSun(app, staticLayer) {
  const sun = new Graphics();
  sun.zIndex = 0;
  sun.circle(0, 0, 70).fill({ color: config.colors.sun, alpha: 0.2 });
  sun.circle(0, 0, 50).fill(config.colors.sun);
  staticLayer.addChild(sun);
  return sun;
}

export function createGround(app, staticLayer) {
  const ground = new Graphics();
  staticLayer.addChild(ground);
  return ground;
}

export function createPlayer(world) {
  const player = new Container();
  player.x = 100;
  player.y = 0 - 100; // groundLevelY is 0
  world.addChild(player);

  const head = new Graphics();
  head.rect(0, 0, 50, 40).fill(config.colors.playerSkin);
  player.addChild(head);

  const torso = new Graphics();
  torso.rect(0, 40, 50, 40).fill(config.colors.playerTorso);
  player.addChild(torso);

  const foot = new Container();
  foot.y = 80;
  player.addChild(foot);

  const foot_upper = new Graphics();
  foot_upper.rect(0, 0, 50, 20).fill(config.colors.playerSkin);
  foot.addChild(foot_upper);

  const foot_lower = new Graphics();
  foot_lower.rect(0, 20, 50, 20).fill(config.colors.playerSkin);
  foot.addChild(foot_lower);
  player.width = 50;
  player.height = 100;

  player.foot_upper = foot_upper;
  player.foot_lower = foot_lower;

  return player;
}

export function createBall(world) {
  const ball = new Graphics();
  ball.circle(0, 0, config.ballRadius).fill(config.colors.ball);
  ball.x = 200;
  ball.y = 0 - config.ballRadius; // groundLevelY is 0
  ball.interactive = true;
  ball.cursor = 'pointer';
  ball.hitArea = new Circle(0, 0, config.ballRadius + 40);
  world.addChild(ball);

  const ballBorder = new Graphics();
  ball.addChild(ballBorder);
  ball.ballBorder = ballBorder;

  return ball;
}

export function createLevelText(world, textContent) {
  const text = new Text({
    text: textContent,
    style: { fontFamily: 'Arial', fontSize: 36, fill: 0xcccccc, align: 'center' },
  });
  text.x = 400;
  text.y = -200;
  text.anchor.set(0.5);
  world.addChild(text);
  return text;
}

export function createGroundMarkers(world) {
  const groundMarkers = new Graphics();
  const stripeSpacing = 200;
  const stripeWidth = 5;
  const stripeHeight = 30;
  const startX = Math.ceil(config.worldBounds.minX / stripeSpacing) * stripeSpacing;
  for (let x = startX; x <= config.worldBounds.maxX; x += stripeSpacing) {
    groundMarkers
      .beginFill(0x888888)
      .drawRect(x - stripeWidth / 2, 0 - stripeHeight, stripeWidth, stripeHeight)
      .endFill();
  }
  world.addChild(groundMarkers);
  return groundMarkers;
}

export function createKickIndicator(uiLayer) {
  const kickIndicator = new Graphics();
  uiLayer.addChild(kickIndicator);
  return kickIndicator;
}

export function handleInputs(state, inputState, world) {
  let { player, ball, kickIndicator, kickStart, ballVelocity } = state;

  // Player Movement
  if (inputState.keys['a'] || inputState.keys['ArrowLeft']) player.x -= config.playerSpeed;
  if (inputState.keys['d'] || inputState.keys['ArrowRight']) player.x += config.playerSpeed;

  // Kicking Logic
  const ballScreenPos = world.toGlobal(ball.position);
  const isKickable = isPlayerKickable(player, ball, world);

  if (isKickable && inputState.pointer.isDownThisFrame) {
    kickStart = { x: inputState.pointer.x, y: inputState.pointer.y };
    player.foot_upper.rotation = -0.2;
    player.foot_lower.rotation = 0.2;
    player.foot_lower.x = 10;
  }

  if (kickStart && inputState.pointer.isDown) {
    kickIndicator
      .clear()
      .moveTo(ballScreenPos.x, ballScreenPos.y)
      .lineTo(inputState.pointer.x, inputState.pointer.y)
      .stroke({ color: config.colors.kickIndicator, width: 3, alpha: 0.5 });
  }

  if (kickStart && inputState.pointer.isUpThisFrame) {
    kickIndicator.clear();
    if (isPlayerKickable(player, ball, world)) {
      const kickPower = 0.1 / world.scale.x;
      const dx = inputState.pointer.x - ballScreenPos.x;
      const dy = inputState.pointer.y - ballScreenPos.y;
      ballVelocity = { x: dx * kickPower, y: dy * kickPower };
    }
    kickStart = null;
    player.foot_upper.rotation = 0;
    player.foot_lower.rotation = 0;
    player.foot_lower.x = 0;
  }

  // Proximity Indicator
  if (isKickable || kickStart) {
    ball.ballBorder
      .clear()
      .circle(0, 0, config.ballRadius + 1)
      .stroke({ color: config.colors.ballBorder, width: 3 });
  } else {
    ball.ballBorder.clear();
  }

  return { ...state, player, kickStart, ballVelocity };
}

function isPlayerKickable(player, ball, world) {
  const ballScreenPos = world.toGlobal(ball.position);
  const topLeft = world.toGlobal({ x: player.x, y: player.y });
  const bottomRight = world.toGlobal({ x: player.x + player.width, y: player.y + player.height });
  const rect = { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y };
  const closestX = Math.max(rect.left, Math.min(ballScreenPos.x, rect.right));
  const closestY = Math.max(rect.top, Math.min(ballScreenPos.y, rect.bottom));
  const dist = Math.hypot(ballScreenPos.x - closestX, ballScreenPos.y - closestY);
  return dist < config.kickableDistance * world.scale.x;
}

export function updatePhysics(state, delta) {
  let { ball, ballVelocity } = state;

  // Ball Physics
  ball.x += ballVelocity.x * delta;
  ball.y += ballVelocity.y * delta;

  ballVelocity.x *= config.friction;
  ballVelocity.y += config.gravity * delta;

  // Collision Detection with ground
  if (ball.y + config.ballRadius > 0) {
    ball.y = 0 - config.ballRadius;
    ballVelocity.y *= config.ballBounce;
    if (Math.abs(ballVelocity.y) < 1) ballVelocity.y = 0;
  }

  // World Boundaries
  if (state.player.x < config.worldBounds.minX) {
    state.player.x = config.worldBounds.minX;
  }
  if (state.player.x + state.player.width > config.worldBounds.maxX) {
    state.player.x = config.worldBounds.maxX - state.player.width;
  }

  if (ball.x - config.ballRadius < config.worldBounds.minX) {
    ball.x = config.worldBounds.minX + config.ballRadius;
    ballVelocity.x *= config.ballBounce;
  }
  if (ball.x + config.ballRadius > config.worldBounds.maxX) {
    ball.x = config.worldBounds.maxX - config.ballRadius;
    ballVelocity.x *= config.ballBounce;
  }

  return { ...state, ball, ballVelocity };
}

export function updateCamera(state, app, layers) {
  const { world } = layers;
  const focusPointX = (state.player.x + state.ball.x) / 2;
  const xDist = Math.abs(state.player.x - state.ball.x);
  const yDist = Math.abs(Math.min(state.player.y, state.ball.y));

  const requiredWidth = xDist + config.camera.zoomPaddingX;
  const requiredHeight = yDist + config.camera.zoomPaddingY;

  const scaleX = app.screen.width / requiredWidth;
  const scaleY = app.screen.height / requiredHeight;

  let desiredScale = Math.min(scaleX, scaleY);
  desiredScale = Math.min(1.0, desiredScale);

  const newScale = lerp(world.scale.x, desiredScale, config.camera.smoothing);
  world.scale.set(newScale);

  world.pivot.x = lerp(world.pivot.x, focusPointX, config.camera.smoothing);
  world.position.set(app.screen.width / 2, app.screen.height - config.groundHeight);
  return state; // Camera update does not change state
}

export function handleResize(app, layers, state) {
  app.renderer.resize(window.innerWidth, window.innerHeight);

  const { staticLayer, world } = layers;
  const { background, sun, ground } = state;

  background.clear().rect(0, 0, app.screen.width, app.screen.height).fill(config.colors.background);
  sun.x = app.screen.width - 80;
  sun.y = 80;
  ground
    .clear()
    .rect(0, app.screen.height - config.groundHeight, app.screen.width, config.groundHeight)
    .fill(config.colors.ground);
  world.position.set(app.screen.width / 2, app.screen.height - config.groundHeight);
}
