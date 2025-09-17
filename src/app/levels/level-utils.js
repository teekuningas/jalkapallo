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

export function createSun(app, staticLayer, characterConfig) {
  const sun = new Graphics();
  sun.zIndex = 0;
  sun.circle(0, 0, 50).fill(config.colors.sun);
  staticLayer.addChild(sun);

  const halo = new Graphics();
  const beamCount = 10;
  const innerRadius = 70;
  const beamLength = 20;
  halo.stroke({ color: config.colors.sun, width: 5, alpha: 0.8 });
  for (let i = 0; i < beamCount; i++) {
    const θ = (i / beamCount) * Math.PI * 2;
    const x1 = Math.cos(θ) * innerRadius;
    const y1 = Math.sin(θ) * innerRadius;
    const x2 = Math.cos(θ) * (innerRadius + beamLength);
    const y2 = Math.sin(θ) * (innerRadius + beamLength);
    halo.moveTo(x1, y1).lineTo(x2, y2);
  }
  halo.stroke();
  sun.addChild(halo);
  sun.halo = halo;

  // Add a speech-related glowing circle
  const border = new Graphics();
  border.circle(0, 0, 60).stroke({ color: characterConfig.glowColor, width: 5 });
  border.visible = false;
  sun.addChild(border);

  sun.border = border;
  sun.characterName = characterConfig.name.toLowerCase();

  return sun;
}

export function createGround(app, staticLayer) {
  const ground = new Graphics();
  staticLayer.addChild(ground);
  return ground;
}

export function createPlayer(world, characterConfig) {
  const player = new Container();
  player.x = 0;
  player.y = 0; // groundLevelY is 0
  world.addChild(player);

  const head = new Graphics();
  head.rect(0, 0, 50, 40).fill(config.colors.playerSkin);
  player.addChild(head);

  // torso (shirt)
  const torso = new Graphics();
  torso.rect(0, 40, 50, 40).fill(config.colors.playerShirt);
  player.addChild(torso);

  const foot = new Container();
  foot.y = 80;
  player.addChild(foot);

  // upper leg (pants)
  const foot_upper = new Graphics();
  foot_upper.rect(0, 0, 50, 20).fill(config.colors.playerPants);

  // hip joint at the very left edge
  foot_upper.pivot.set(0, 0);

  foot.addChild(foot_upper);

  // lower leg (socks)
  const foot_lower = new Graphics();
  foot_lower.rect(0, 0, 50, 20).fill(config.colors.playerSocks);

  // position this Graphics 20px below the upper leg
  foot_lower.y = 20;

  // pivot at its own top-left corner
  foot_lower.pivot.set(0, 0);

  foot.addChild(foot_lower);

  player.width = 50;
  player.height = 120;

  // Set the pivot point to the bottom-center of the player's graphics.
  // This means player.x and player.y will now refer to this point.
  player.pivot.x = player.width / 2;
  player.pivot.y = player.height;

  player.foot_upper = foot_upper;
  player.foot_lower = foot_lower;

  const border = new Graphics();
  // The player's graphics are drawn from (0,0) to (width, height).
  // The border needs to surround this area, relative to the player's (0,0) origin.
  const padding = 10;
  border
    .roundRect(-padding, -padding, player.width + padding * 2, player.height + padding * 2, 15)
    .stroke({ color: characterConfig.glowColor, width: 5 });
  border.visible = false;
  player.addChild(border);

  player.border = border;
  player.characterName = characterConfig.name.toLowerCase();

  return player;
}

export function createTherian(world, characterConfig, initialPosition) {
  const therian = new Container();
  therian.x = initialPosition.x || 0;
  therian.y = initialPosition.y || -1000; // Flying height
  world.addChild(therian);

  const cloak = new Graphics();
  therian.addChild(cloak);
  therian.cloak = cloak; // so we can access it in update

  // Tail
  const tail = new Graphics();
  tail.beginFill(config.colors.therianTail);
  tail.drawRect(-60, 10, 60, 20);
  tail.endFill();
  therian.addChild(tail);

  // Legs
  const backLeg = new Graphics();
  backLeg.beginFill(config.colors.therianLegs);
  backLeg.drawRect(10, 40, 20, 30);
  backLeg.endFill();
  therian.addChild(backLeg);

  const frontLeg = new Graphics();
  frontLeg.beginFill(config.colors.therianLegs);
  frontLeg.drawRect(40, 40, 20, 30);
  frontLeg.endFill();
  therian.addChild(frontLeg);

  // Torso
  const torso = new Container();
  therian.addChild(torso);

  const back = new Graphics();
  back.beginFill(config.colors.therianBack);
  back.drawRect(0, 0, 80, 30);
  back.endFill();
  torso.addChild(back);

  const stomach = new Graphics();
  stomach.beginFill(config.colors.therianStomach);
  stomach.drawRect(0, 30, 80, 10);
  stomach.endFill();
  torso.addChild(stomach);

  // Head
  const head = new Container();
  head.x = 70;
  head.y = 10;
  therian.addChild(head);

  const face = new Graphics();
  face.beginFill(config.colors.therianHead);
  face.drawRect(0, -10, 40, 40);
  face.endFill();
  head.addChild(face);

  const snout = new Graphics();
  snout.beginFill(config.colors.therianEars); // white snout
  snout.drawPolygon([40, 10, 50, 15, 40, 20]);
  head.addChild(snout);

  const ear1 = new Graphics();
  ear1.beginFill(config.colors.therianEars);
  ear1.drawPolygon([10, -10, 30, -10, 20, -30]);
  head.addChild(ear1);

  const ear2 = new Graphics();
  ear2.beginFill(config.colors.therianEars);
  ear2.drawPolygon([0, -10, 20, -10, 10, -30]);
  head.addChild(ear2);

  const bounds = therian.getLocalBounds();

  therian.pivot.x = bounds.x + bounds.width / 2;
  therian.pivot.y = bounds.y + bounds.height / 2;

  const border = new Graphics();
  const padding = 15;
  border
    .roundRect(
      bounds.x - padding,
      bounds.y - padding,
      bounds.width + padding * 2,
      bounds.height + padding * 2,
      15
    )
    .stroke({ color: characterConfig.glowColor, width: 5 });
  border.visible = false;
  therian.addChild(border);

  therian.border = border;
  therian.characterName = characterConfig.name.toLowerCase();
  therian.direction = 1; // 1 for right, -1 for left
  therian.speed = 200;

  return therian;
}

export function createBall(world) {
  const ball = new Graphics();
  ball.circle(0, 0, config.ballRadius).fill(config.colors.ball);
  ball.x = 0;
  ball.y = 0 - config.ballRadius; // groundLevelY is 0
  world.addChild(ball);

  const ballBorder = new Graphics();
  ball.addChild(ballBorder);
  ball.ballBorder = ballBorder;

  return ball;
}

export function createLevelText(world, textContent) {
  const text = new Text({
    text: textContent,
    style: { fontFamily: 'Arial', fontSize: 54, fill: 0xffffff, align: 'center' },
  });
  text.x = 400;
  text.y = -200;
  text.anchor.set(0.5);
  world.addChild(text);
  return text;
}

export function createGroundMarkers(world, worldBounds, hasWalls) {
  const groundMarkers = new Graphics();
  const stripeSpacing = 200;
  const stripeWidth = 5;
  const stripeHeight = 30;

  const minX = worldBounds.minX + (hasWalls ? config.wallWidth : 0);
  const maxX = worldBounds.maxX - (hasWalls ? config.wallWidth : 0);

  const startX = Math.ceil(minX / stripeSpacing) * stripeSpacing;
  for (let x = startX; x <= maxX; x += stripeSpacing) {
    groundMarkers
      .beginFill(0x888888)
      .drawRect(x - stripeWidth / 2, 0 - stripeHeight, stripeWidth, stripeHeight)
      .endFill();
  }
  world.addChild(groundMarkers);
  return groundMarkers;
}

export function createWalls(world, worldBounds) {
  const wallWidth = config.wallWidth;
  const wallHeight = 8000;
  const brickHeight = 50;
  const mortarHeight = 10;

  const createWall = (xPos) => {
    const wall = new Graphics();
    wall.x = xPos;
    wall.y = 0;

    for (let y = 0; y < wallHeight; y += brickHeight + mortarHeight) {
      // Yellow brick
      wall.beginFill(0xffd700); // "bricky yellow"
      wall.drawRect(-wallWidth / 2, -y - brickHeight, wallWidth, brickHeight);
      wall.endFill();

      // Gray mortar
      wall.beginFill(0x888888); // gray
      wall.drawRect(-wallWidth / 2, -y - brickHeight - mortarHeight, wallWidth, mortarHeight);
      wall.endFill();
    }
    world.addChild(wall);
    return wall;
  };

  const leftWall = createWall(worldBounds.minX + wallWidth / 2);
  const rightWall = createWall(worldBounds.maxX - wallWidth / 2);

  return [leftWall, rightWall];
}

export function createKickIndicator(uiLayer) {
  const kickIndicator = new Graphics();
  uiLayer.addChild(kickIndicator);
  return kickIndicator;
}

export function updateProximityIndicator(ball, isKickable) {
  if (isKickable) {
    ball.ballBorder
      .clear()
      .circle(0, 0, config.ballRadius + 1)
      .stroke({ color: config.colors.ballBorder, width: 3 });
  } else {
    ball.ballBorder.clear();
  }
}

export function handleInputs(state, inputState, world, delta) {
  let { player, ball, kickIndicator, kickStart, ballVelocity } = state;
  const gameEvents = [];

  const dt = delta / 1000;

  // Player Movement
  if (inputState.keys['a'] || inputState.keys['ArrowLeft']) player.x -= config.playerSpeed * dt;
  if (inputState.keys['d'] || inputState.keys['ArrowRight']) player.x += config.playerSpeed * dt;

  // Kicking Logic
  const isKickable = isPlayerKickable(player, ball, world);
  updateProximityIndicator(ball, isKickable);

  if (inputState.pointer.isDownThisFrame) {
    kickStart = { x: inputState.pointer.x, y: inputState.pointer.y };
    updatePlayerFoot(player, ball, world, inputState);
  }

  if (kickStart && inputState.pointer.isDown) {
    const ballScreenPos = world.toGlobal(ball.position);
    kickIndicator
      .clear()
      .moveTo(ballScreenPos.x, ballScreenPos.y)
      .lineTo(inputState.pointer.x, inputState.pointer.y)
      .stroke({ color: config.colors.kickIndicator, width: 3, alpha: 0.5 });
    updatePlayerFoot(player, ball, world, inputState);
  }

  if (kickStart && inputState.pointer.isUpThisFrame) {
    kickIndicator.clear();
    if (isPlayerKickable(player, ball, world)) {
      const ballScreenPos = world.toGlobal(ball.position);
      const kickPower = (0.1 * 60) / world.scale.x;
      const dx = inputState.pointer.x - ballScreenPos.x;
      const dy = inputState.pointer.y - ballScreenPos.y;
      ballVelocity = { x: dx * kickPower, y: dy * kickPower };
      gameEvents.push('ballKicked');
    }
    kickStart = null;
    resetPlayerFoot(player);
  }

  const newState = { ...state, player, kickStart, ballVelocity };
  return { newState, gameEvents };
}

function updatePlayerFoot(player, ball, world, inputState) {
  const ballScreenPos = world.toGlobal(ball.position);
  const dx = inputState.pointer.x - ballScreenPos.x;
  const dir = dx >= 0 ? 1 : -1;
  const FW = 50; // foot graphic width

  // Pivot about the inner edge: left edge for right kicks, right edge for left kicks
  player.foot_upper.pivot.set(dir > 0 ? 0 : FW, 0);
  player.foot_upper.x = dir > 0 ? 0 : FW;
  player.foot_lower.pivot.set(dir > 0 ? 0 : FW, 0);
  player.foot_lower.x = dir > 0 ? 0 : FW;

  // Now swing and extend
  player.foot_upper.rotation = -0.2 * dir;
  player.foot_lower.rotation = 0.2 * dir;
  player.foot_lower.x += 10 * dir;
}

function resetPlayerFoot(player) {
  // Reset pivots and positions
  player.foot_upper.pivot.set(0, 0);
  player.foot_upper.x = 0;
  player.foot_lower.pivot.set(0, 0);
  player.foot_lower.x = 0;

  player.foot_upper.rotation = 0;
  player.foot_lower.rotation = 0;
}

function isPlayerKickable(player, ball, world) {
  const ballScreenPos = world.toGlobal(ball.position);
  // Player's origin is now its center-bottom point.
  const playerTopLeft = { x: player.x - player.width / 2, y: player.y - player.height };
  const topLeft = world.toGlobal(playerTopLeft);
  const bottomRight = world.toGlobal({
    x: playerTopLeft.x + player.width,
    y: playerTopLeft.y + player.height,
  });
  const rect = { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y };
  const closestX = Math.max(rect.left, Math.min(ballScreenPos.x, rect.right));
  const closestY = Math.max(rect.top, Math.min(ballScreenPos.y, rect.bottom));
  const dist = Math.hypot(ballScreenPos.x - closestX, ballScreenPos.y - closestY);
  return dist < config.kickableDistance * world.scale.x;
}

function collideCircleWithRectangle(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < circle.radius) {
    const overlap = circle.radius - distance;
    const normalX = distance === 0 ? 1 : dx / distance;
    const normalY = distance === 0 ? 0 : dy / distance;

    return {
      collided: true,
      overlap,
      normalX,
      normalY,
    };
  }

  return { collided: false };
}

export function updatePhysics(state, delta) {
  let { ball, ballVelocity } = state;

  const dt = delta / 1000;

  // Ball Physics
  ball.x += ballVelocity.x * dt;
  ball.y += ballVelocity.y * dt;

  ballVelocity.x *= Math.pow(config.friction, dt);
  ballVelocity.y += config.gravity * dt;

  // Collision Detection with ground
  if (ball.y + config.ballRadius > 0) {
    ball.y = 0 - config.ballRadius;
    ballVelocity.y *= config.ballBounce;
    if (Math.abs(ballVelocity.y) < 1) ballVelocity.y = 0;
  }

  // World Boundaries
  let leftBoundary = state.worldBounds.minX;
  let rightBoundary = state.worldBounds.maxX;

  if (state.walls) {
    leftBoundary += config.wallWidth;
    rightBoundary -= config.wallWidth;
  }

  if (state.player.x - state.player.width / 2 < leftBoundary) {
    state.player.x = leftBoundary + state.player.width / 2;
  }
  if (state.player.x + state.player.width / 2 > rightBoundary) {
    state.player.x = rightBoundary - state.player.width / 2;
  }

  if (ball.x - config.ballRadius < leftBoundary) {
    ball.x = leftBoundary + config.ballRadius;
    ballVelocity.x *= config.ballBounce;
  }
  if (ball.x + config.ballRadius > rightBoundary) {
    ball.x = rightBoundary - config.ballRadius;
    ballVelocity.x *= config.ballBounce;
  }

  // Goal collision
  if (state.goal) {
    const { colliders, x, y } = state.goal;
    const ballCircle = { x: ball.x, y: ball.y, radius: config.ballRadius };
    const collisions = [];

    for (const rect of colliders) {
      const absoluteRect = {
        x: rect.x + x,
        y: rect.y + y,
        width: rect.width,
        height: rect.height,
      };
      const collision = collideCircleWithRectangle(ballCircle, absoluteRect);
      if (collision.collided) {
        collisions.push(collision);
      }
    }

    if (collisions.length > 0) {
      if (collisions.length > 1) {
        // Corner collision
        let totalNormalX = 0;
        let totalNormalY = 0;
        let maxOverlap = 0;

        for (const c of collisions) {
          totalNormalX += c.normalX;
          totalNormalY += c.normalY;
          if (c.overlap > maxOverlap) {
            maxOverlap = c.overlap;
          }
        }

        const avgNormalX = totalNormalX / collisions.length;
        const avgNormalY = totalNormalY / collisions.length;
        const len = Math.sqrt(avgNormalX * avgNormalX + avgNormalY * avgNormalY);
        const finalNormalX = len > 0 ? avgNormalX / len : 1;
        const finalNormalY = len > 0 ? avgNormalY / len : 0;

        ball.x += finalNormalX * maxOverlap;
        ball.y += finalNormalY * maxOverlap;

        const dotProduct = ballVelocity.x * finalNormalX + ballVelocity.y * finalNormalY;
        ballVelocity.x -= 2 * dotProduct * finalNormalX;
        ballVelocity.y -= 2 * dotProduct * finalNormalY;

        ballVelocity.x *= -config.ballBounce;
        ballVelocity.y *= -config.ballBounce;
      } else {
        // Single collision
        const collision = collisions[0];
        ball.x += collision.normalX * collision.overlap;
        ball.y += collision.normalY * collision.overlap;

        const dotProduct = ballVelocity.x * collision.normalX + ballVelocity.y * collision.normalY;
        ballVelocity.x -= 2 * dotProduct * collision.normalX;
        ballVelocity.y -= 2 * dotProduct * collision.normalY;

        ballVelocity.x *= -config.ballBounce;
        ballVelocity.y *= -config.ballBounce;
      }
    }
  }

  // Obstacle collision
  if (state.obstacles) {
    const ballCircle = { x: ball.x, y: ball.y, radius: config.ballRadius };

    for (const obstacle of state.obstacles) {
      const { colliders, x, y } = obstacle;
      const rect = colliders[0]; // Assuming one collider per obstacle

      const absoluteRect = {
        x: rect.x + x,
        y: rect.y + y,
        width: rect.width,
        height: rect.height,
      };
      const collision = collideCircleWithRectangle(ballCircle, absoluteRect);

      if (collision.collided) {
        ball.x += collision.normalX * collision.overlap;
        ball.y += collision.normalY * collision.overlap;

        const dotProduct = ballVelocity.x * collision.normalX + ballVelocity.y * collision.normalY;
        ballVelocity.x -= 2 * dotProduct * collision.normalX;
        ballVelocity.y -= 2 * dotProduct * collision.normalY;

        ballVelocity.x *= -config.ballBounce;
        ballVelocity.y *= -config.ballBounce;
      }
    }
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

  const worldWidth = state.worldBounds.maxX - state.worldBounds.minX;
  // base “fit‐to‐width” scale, then allow additional zoom‐out by minZoomOut factor
  const minScale = (app.screen.width / worldWidth) * config.camera.minZoomOut;

  let desiredScale = Math.min(scaleX, scaleY);
  desiredScale = Math.min(config.camera.maxZoomIn, desiredScale);
  desiredScale = Math.max(minScale, desiredScale);

  const newScale = lerp(world.scale.x, desiredScale, config.camera.smoothing);
  world.scale.set(newScale);

  world.pivot.x = lerp(world.pivot.x, focusPointX, config.camera.smoothing);
  world.position.set(app.screen.width / 2, app.screen.height - config.groundHeight);
  return state; // Camera update does not change state
}

export function createGoal(world, x, y, width, height, direction) {
  const goal = new Container();
  goal.x = x;
  goal.y = y;
  world.addChild(goal);

  const postThickness = 10;
  const goalPostColor = 0xcccccc; // A light gray for the posts
  const goalNetColor = 0xffffff;
  const goalNetAlpha = 0.5;

  const colliders = [];
  const posts = new Graphics();
  posts.beginFill(goalPostColor);

  if (direction === 'left') {
    const topPost = { x: -width / 2, y: -height, width: width, height: postThickness };
    const backPost = {
      x: width / 2 - postThickness,
      y: -height,
      width: postThickness,
      height: height,
    };
    colliders.push(topPost, backPost);

    posts.drawRect(topPost.x, topPost.y, topPost.width, topPost.height);
    posts.drawRect(backPost.x, backPost.y, backPost.width, backPost.height);
  } else if (direction === 'right') {
    const topPost = { x: -width / 2, y: -height, width: width, height: postThickness };
    const backPost = { x: -width / 2, y: -height, width: postThickness, height: height };
    colliders.push(topPost, backPost);

    posts.drawRect(topPost.x, topPost.y, topPost.width, topPost.height);
    posts.drawRect(backPost.x, backPost.y, backPost.width, backPost.height);
  }
  posts.endFill();
  goal.addChild(posts);

  const net = new Graphics();
  net.beginFill(0, 0); // transparent fill
  net.lineStyle(2, goalNetColor, goalNetAlpha);

  // Draw net pattern
  for (let i = 1; i < 10; i++) {
    const X = -width / 2 + (i / 10) * width;
    net.moveTo(X, 0);
    net.lineTo(X, -height);
  }
  for (let i = 1; i < 10; i++) {
    const Y = (-i / 10) * height;
    net.moveTo(-width / 2, Y);
    net.lineTo(width / 2, Y);
  }
  net.endFill();
  goal.addChild(net);

  goal.colliders = colliders;
  goal.goalShape = { x, y, width, height, direction };

  return goal;
}

export function createObstacle(world, leftX, rightX, bottomY, topY) {
  const width = rightX - leftX;
  const height = topY - bottomY;

  const obstacle = new Container();
  obstacle.x = leftX;
  obstacle.y = -bottomY;
  world.addChild(obstacle);

  const graphics = new Graphics();
  graphics
    .rect(0, -height, width, height)
    .fill({ color: 0xffffff, alpha: 0.5 })
    .stroke({ color: 0x000000, width: 5, alignment: 0 });
  obstacle.addChild(graphics);

  obstacle.colliders = [{ x: 0, y: -height, width, height }];

  return obstacle;
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

// returns true if ball is fully inside the goal rectangle
export function checkGoal(ball, goal) {
  if (!ball || !goal) return false;
  const { x, y, width, height, direction } = goal.goalShape;
  const halfWidth = width / 2;
  if (direction === 'left') {
    return (
      ball.x - config.ballRadius > x - halfWidth &&
      ball.x + config.ballRadius < x + halfWidth &&
      ball.y - config.ballRadius > y - height
    );
  } else {
    // right‐facing goal
    return (
      ball.x + config.ballRadius < x + halfWidth &&
      ball.x - config.ballRadius > x - halfWidth &&
      ball.y - config.ballRadius > y - height
    );
  }
}

// --- Event System ---

export function initEventsState() {
  return {
    time: 0,
    queue: [], // { text, duration, startTime, characterName? }[]
    activeMessage: null, // { text, duration, startTime, characterName? }
    completedEvents: new Set(),
    lastMessageEndTime: 0,
    // A 1 second delay between messages
    messageDelay: 1000,
  };
}

export function getUIMessageFromEventState(eventState) {
  if (!eventState) {
    return null;
  }
  return eventState.activeMessage;
}

export function updateEvents(eventState, script, gameState, gameEvents, clock) {
  const newTime = clock.getTime();
  let newQueue = [...eventState.queue];
  let newCompletedEvents = new Set(eventState.completedEvents);
  let activeMessage = eventState.activeMessage;
  let lastMessageEndTime = eventState.lastMessageEndTime;

  // 1. Check for new triggers
  script.forEach((event) => {
    const { trigger, action, once, id } = event;
    if (newCompletedEvents.has(id)) {
      return; // Skip completed one-time events
    }

    let isTriggered = false;
    if (trigger.type === 'time' && newTime >= trigger.time && eventState.time < trigger.time) {
      isTriggered = true;
    } else if (trigger.type === 'event' && gameEvents.includes(trigger.name)) {
      isTriggered = true;
    }

    if (isTriggered) {
      if (action.type === 'showText') {
        newQueue.push(action);
      }
      if (once) {
        newCompletedEvents.add(id);
      }
    }
  });

  // 2. Process message queue
  if (activeMessage) {
    // Check if active message has finished
    if (newTime - activeMessage.startTime >= activeMessage.duration) {
      activeMessage = null;
      lastMessageEndTime = newTime;
    }
  } else {
    // If no active message, try to show the next one from the queue
    if (newQueue.length > 0 && newTime - lastMessageEndTime >= eventState.messageDelay) {
      activeMessage = { ...newQueue.shift(), startTime: newTime };
    }
  }

  return {
    ...eventState,
    time: newTime,
    queue: newQueue,
    completedEvents: newCompletedEvents,
    activeMessage,
    lastMessageEndTime,
  };
}

export function updateSpeakerEffects(state) {
  const { characters, uiMessage } = state;
  if (!characters) return;

  const speakerName = uiMessage ? uiMessage.characterName : null;

  characters.forEach((char) => {
    if (char.border) {
      if (char.characterName === speakerName) {
        char.border.visible = true;
        // Use a simple time-based glow effect
        char.border.alpha = 0.6 + Math.sin(performance.now() / 150) * 0.4;
      } else {
        char.border.visible = false;
      }
    }
  });
}

// called once per tick in each level—rotates only the sun’s halo
export function updateSun(state) {
  if (state.sun && state.sun.halo) {
    state.sun.halo.rotation += 0.003;
  }
}

function updateTherian(therian, worldBounds, dt) {
  therian.x += therian.speed * therian.direction * dt;

  const leftBoundary = worldBounds.minX + therian.width / 2 + 100;
  const rightBoundary = worldBounds.maxX - therian.width / 2 - 100;

  if (therian.x > rightBoundary) {
    therian.x = rightBoundary;
    therian.direction = -1;
    therian.scale.x = -1;
  } else if (therian.x < leftBoundary) {
    therian.x = leftBoundary;
    therian.direction = 1;
    therian.scale.x = 1;
  }

  // Cloak animation
  const time = Date.now() / 200;
  const cloak = therian.cloak;
  cloak.clear();
  cloak.beginFill(config.colors.therianCloak);
  cloak.moveTo(10, 10); // Start from the upper back
  cloak.lineTo(-80, 10 + Math.sin(time) * 20);
  cloak.lineTo(10, 10 + Math.sin(time / 2) * 20 + 10);
  cloak.closePath();
  cloak.endFill();
}

const npcUpdaters = {
  therian: updateTherian,
};

export function updateNPCs(state, delta) {
  if (!state.npcs) return state;

  const dt = delta / 1000;

  const newNpcs = state.npcs.map((npc) => {
    const updater = npcUpdaters[npc.type];
    if (updater) {
      updater(npc, state.worldBounds, dt);
    }
    return npc;
  });

  return { ...state, npcs: newNpcs };
}
