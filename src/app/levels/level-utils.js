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
  player.y = 0; // groundLevelY is 0
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
  foot_upper
    .rect(0, 0, 50, 20)
    .fill(config.colors.playerSkin);

  // hip joint at the very left edge
  foot_upper.pivot.set(0, 0);

  foot.addChild(foot_upper);

  const foot_lower = new Graphics();
  foot_lower
    .rect(0, 0, 50, 20)
    .fill(config.colors.playerSkin);

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
    style: { fontFamily: 'Arial', fontSize: 36, fill: 0xffffff, align: 'center' },
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
  const brickHeight = 50; // 1-length
  const mortarHeight = 10; // 0.2-length

  const createWall = (xPos) => {
    const wall = new Graphics();
    wall.x = xPos;
    wall.y = 0;

    for (let y = 0; y < wallHeight; y += brickHeight + mortarHeight) {
      // Yellow brick
      wall.beginFill(0xffd700); // "bricky yellow"
      wall.drawRect(0, -y - brickHeight, wallWidth, brickHeight);
      wall.endFill();

      // Gray mortar
      wall.beginFill(0x888888); // gray
      wall.drawRect(0, -y - brickHeight - mortarHeight, wallWidth, mortarHeight);
      wall.endFill();
    }
    world.addChild(wall);
    return wall;
  };

  const leftWall = createWall(worldBounds.minX);
  const rightWall = createWall(worldBounds.maxX - wallWidth);

  return [leftWall, rightWall];
}

export function createKickIndicator(uiLayer) {
  const kickIndicator = new Graphics();
  uiLayer.addChild(kickIndicator);
  return kickIndicator;
}

export function updateProximityIndicator(ball, player, world, kickStart) {
  const isKickable = isPlayerKickable(player, ball, world);
  if (isKickable || kickStart) {
    ball.ballBorder
      .clear()
      .circle(0, 0, config.ballRadius + 1)
      .stroke({ color: config.colors.ballBorder, width: 3 });
  } else {
    ball.ballBorder.clear();
  }
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

    // compute screen‐space direction: +1 = right kick, -1 = left kick
    const dx = inputState.pointer.x - ballScreenPos.x;
    const dir = dx >= 0 ? 1 : -1;

    const FW = 50; // your foot graphic width
    // pivot about the inner edge: left edge for right kicks, right edge for left kicks
    player.foot_upper.pivot.set(dir > 0 ? 0 : FW, 0);
    player.foot_upper.x     = dir > 0 ? 0 : FW;
    player.foot_lower.pivot.set(dir > 0 ? 0 : FW, 0);
    player.foot_lower.x     = dir > 0 ? 0 : FW;

    // now swing and extend
    player.foot_upper.rotation = -0.2 * dir;
    player.foot_lower.rotation =  0.2 * dir;
    player.foot_lower.x       += 10 * dir;
  }

  if (kickStart && inputState.pointer.isDown) {
    kickIndicator
      .clear()
      .moveTo(ballScreenPos.x, ballScreenPos.y)
      .lineTo(inputState.pointer.x, inputState.pointer.y)
      .stroke({ color: config.colors.kickIndicator, width: 3, alpha: 0.5 });

    // Update foot direction dynamically while dragging
    const dxDrag = inputState.pointer.x - ballScreenPos.x;
    const dirDrag = dxDrag >= 0 ? 1 : -1;
    const FW = 50; // your foot graphic width
    player.foot_upper.pivot.set(dirDrag > 0 ? 0 : FW, 0);
    player.foot_upper.x     = dirDrag > 0 ? 0 : FW;
    player.foot_lower.pivot.set(dirDrag > 0 ? 0 : FW, 0);
    player.foot_lower.x     = dirDrag > 0 ? 0 : FW;

    player.foot_upper.rotation = -0.2 * dirDrag;
    player.foot_lower.rotation =  0.2 * dirDrag;
    player.foot_lower.x       += 10 * dirDrag;
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
    // reset pivots and positions
    player.foot_upper.pivot.set(0, 0);
    player.foot_upper.x       = 0;
    player.foot_lower.pivot.set(0, 0);
    player.foot_lower.x       = 0;

    player.foot_upper.rotation = 0;
    player.foot_lower.rotation = 0;
  }

  // Proximity Indicator
  updateProximityIndicator(ball, player, world, kickStart);

  return { ...state, player, kickStart, ballVelocity };
}

function isPlayerKickable(player, ball, world) {
  const ballScreenPos = world.toGlobal(ball.position);
  // Player's origin is now its center-bottom point.
  const playerTopLeft = { x: player.x - player.width / 2, y: player.y - player.height };
  const topLeft = world.toGlobal(playerTopLeft);
  const bottomRight = world.toGlobal({ x: playerTopLeft.x + player.width, y: playerTopLeft.y + player.height });
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
  const minScale = app.screen.width / worldWidth;

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
    const topPost = { x: 0, y: -height, width: width, height: postThickness };
    const backPost = { x: width - postThickness, y: -height, width: postThickness, height: height };
    colliders.push(topPost, backPost);

    posts.drawRect(topPost.x, topPost.y, topPost.width, topPost.height);
    posts.drawRect(backPost.x, backPost.y, backPost.width, backPost.height);

  } else if (direction === 'right') {
    const topPost = { x: 0, y: -height, width: width, height: postThickness };
    const backPost = { x: 0, y: -height, width: postThickness, height: height };
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
    const X = (i / 10) * width;
    net.moveTo(X, 0);
    net.lineTo(X, -height);
  }
  for (let i = 1; i < 10; i++) {
    const Y = (-i / 10) * height;
    net.moveTo(0, Y);
    net.lineTo(width, Y);
  }
  net.endFill();
  goal.addChild(net);

  goal.colliders = colliders;
  goal.goalShape = { x, y, width, height, direction };

  return goal;
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
