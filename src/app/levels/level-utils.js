import { Container, Graphics, Circle, Text } from 'pixi.js';
import { config } from '../config.js';

export function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

export function createBackground(app, staticLayer) {
  const background = new Graphics();
  background.zIndex = -1;
  staticLayer.addChild(background);
  return background;
}

export function createSun(app, staticLayer, characterConfig) {
  const sun = new Container();
  sun.zIndex = 0;
  staticLayer.addChild(sun);

  const body = new Graphics();
  body.circle(0, 0, 37.5).fill(config.colors.sun);
  sun.addChild(body);

  const halo = new Graphics();
  const beamCount = 10;
  const innerRadius = 52.5;
  const beamLength = 15;
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

  const speechIndicator = new Container();
  sun.addChild(speechIndicator);
  sun.speechIndicator = speechIndicator;

  // Add a speech-related glowing circle
  const border = new Graphics();
  border.circle(0, 0, 45).stroke({ color: characterConfig.glowColor, width: 5 });
  speechIndicator.addChild(border);
  speechIndicator.visible = false;

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

  const body = new Container();
  player.addChild(body);
  player.body = body;

  const head = new Graphics();
  head.rect(0, 0, 50, 40).fill(config.colors.playerSkin);
  body.addChild(head);

  // torso (shirt)
  const torso = new Graphics();
  torso.rect(0, 40, 50, 40).fill(config.colors.playerShirt);
  body.addChild(torso);

  const foot = new Container();
  foot.y = 80;
  body.addChild(foot);

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

  const bounds = body.getLocalBounds();
  player.bodyWidth = bounds.width;
  player.bodyHeight = bounds.height;

  // Set the pivot point to the bottom-center of the player's graphics.
  // This means player.x and player.y will now refer to this point.
  player.pivot.x = player.bodyWidth / 2;
  player.pivot.y = player.bodyHeight;

  player.foot_upper = foot_upper;
  player.foot_lower = foot_lower;

  const speechIndicator = new Container();
  player.addChild(speechIndicator);
  player.speechIndicator = speechIndicator;

  const border = new Graphics();
  // The player's graphics are drawn from (0,0) to (width, height).
  // The border needs to surround this area, relative to the player's (0,0) origin.
  const padding = 10;
  border
    .roundRect(-padding, -padding, player.width + padding * 2, player.height + padding * 2, 15)
    .stroke({ color: characterConfig.glowColor, width: 5 });
  speechIndicator.addChild(border);
  speechIndicator.visible = false;
  player.characterName = characterConfig.name.toLowerCase();

  return player;
}

export function createTherian(world, characterConfig, initialPosition) {
  const therian = new Container();
  therian.x = initialPosition.x || 0;
  therian.y = initialPosition.y || -1000; // Flying height
  world.addChild(therian);

  const body = new Container();
  therian.addChild(body);

  const cloak = new Graphics();
  body.addChild(cloak);
  therian.cloak = cloak; // so we can access it in update

  // Tail
  const tail = new Graphics();
  tail.beginFill(config.colors.therianTail);
  tail.drawRect(-60, 10, 60, 20);
  tail.endFill();
  body.addChild(tail);

  // Legs
  const backLeg = new Graphics();
  backLeg.beginFill(config.colors.therianLegs);
  backLeg.drawRect(10, 40, 20, 30);
  backLeg.endFill();
  body.addChild(backLeg);

  const frontLeg = new Graphics();
  frontLeg.beginFill(config.colors.therianLegs);
  frontLeg.drawRect(40, 40, 20, 30);
  frontLeg.endFill();
  body.addChild(frontLeg);

  therian.frontLeg = frontLeg;
  therian.backLeg = backLeg;

  // Torso
  const torso = new Container();
  body.addChild(torso);

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
  body.addChild(head);

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

  const bounds = body.getLocalBounds();
  therian.bodyWidth = bounds.width;
  therian.bodyHeight = bounds.height;

  therian.pivot.x = bounds.x + bounds.width / 2;
  therian.pivot.y = bounds.y + bounds.height / 2;

  const speechIndicator = new Container();
  therian.addChild(speechIndicator);
  therian.speechIndicator = speechIndicator;

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
  speechIndicator.addChild(border);
  speechIndicator.visible = false;

  therian.characterName = characterConfig.name.toLowerCase();
  therian.type = 'therian';
  therian.direction = 1; // 1 for right, -1 for left
  therian.speed = 200;

  therian.kickAnimation = {
    active: false,
    duration: 200, // ms
    timer: 0,
  };

  const colliderRect = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
  therian.colliderRect = colliderRect;

  return therian;
}

export function createElectric(world, characterConfig, initialPosition) {
  const electric = new Container();
  electric.x = initialPosition.x || 0;
  electric.y = initialPosition.y || 0;
  world.addChild(electric);

  const body = new Container();
  electric.addChild(body);
  electric.body = body;

  const head = new Graphics();
  head.rect(0, 0, 40, 30).fill(config.colors.playerSkin);
  body.addChild(head);

  const torso = new Graphics();
  torso.rect(0, 30, 40, 30).fill(config.colors.electricShirt);
  body.addChild(torso);

  const foot = new Container();
  foot.y = 60;
  body.addChild(foot);

  const foot_upper = new Graphics();
  foot_upper.rect(0, 0, 40, 15).fill(config.colors.electricPants);
  foot_upper.pivot.set(0, 0);
  foot.addChild(foot_upper);

  const foot_lower = new Graphics();
  foot_lower.rect(0, 0, 40, 15).fill(config.colors.electricPants);
  foot_lower.y = 15;
  foot_lower.pivot.set(0, 0);
  foot.addChild(foot_lower);

  const bounds = body.getLocalBounds();
  electric.bodyWidth = bounds.width;
  electric.bodyHeight = bounds.height;

  electric.pivot.x = electric.bodyWidth / 2;
  electric.pivot.y = electric.bodyHeight;

  electric.foot_upper = foot_upper;
  electric.foot_lower = foot_lower;

  const speechIndicator = new Container();
  electric.addChild(speechIndicator);
  electric.speechIndicator = speechIndicator;

  const border = new Graphics();
  const padding = 10;
  border
    .roundRect(-padding, -padding, electric.width + padding * 2, electric.height + padding * 2, 15)
    .stroke({ color: characterConfig.glowColor, width: 5 });
  speechIndicator.addChild(border);
  speechIndicator.visible = false;
  electric.characterName = characterConfig.name.toLowerCase();
  electric.type = 'electric';
  electric.speed = config.playerSpeed * 0.8;
  electric.kickAnimation = {
    active: false,
    duration: 150, // ms
    timer: 0,
    direction: 1,
  };
  electric.kickCooldown = 0;

  const colliderRect = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };
  electric.colliderRect = colliderRect;

  return electric;
}

export function createThomas(world, characterConfig, initialPosition) {
  const thomas = new Container();
  thomas.x = initialPosition.x || 0;
  thomas.y = initialPosition.y || 0;
  world.addChild(thomas);

  const body = new Container();
  thomas.addChild(body);
  thomas.body = body;

  // Thomas is 85% of the main player's size
  const scale = 0.85;
  const head = new Graphics();
  head.rect(0, 0, 50 * scale, 40 * scale).fill(config.colors.playerSkin);
  body.addChild(head);

  const torso = new Graphics();
  torso.rect(0, 40 * scale, 50 * scale, 40 * scale).fill(config.colors.thomasShirt);
  body.addChild(torso);

  const foot = new Container();
  foot.y = 80 * scale;
  body.addChild(foot);

  const foot_upper = new Graphics();
  foot_upper.rect(0, 0, 50 * scale, 20 * scale).fill(config.colors.thomasPants);
  foot_upper.pivot.set(0, 0);
  foot.addChild(foot_upper);

  const foot_lower = new Graphics();
  foot_lower.rect(0, 0, 50 * scale, 20 * scale).fill(config.colors.thomasPants);
  foot_lower.y = 20 * scale;
  foot_lower.pivot.set(0, 0);
  foot.addChild(foot_lower);

  const bounds = body.getLocalBounds();
  thomas.bodyWidth = bounds.width;
  thomas.bodyHeight = bounds.height;

  thomas.pivot.x = thomas.bodyWidth / 2;
  thomas.pivot.y = thomas.bodyHeight;

  thomas.foot_upper = foot_upper;
  thomas.foot_lower = foot_lower;

  const speechIndicator = new Container();
  thomas.addChild(speechIndicator);
  thomas.speechIndicator = speechIndicator;

  const border = new Graphics();
  const padding = 10;
  border
    .roundRect(-padding, -padding, thomas.width + padding * 2, thomas.height + padding * 2, 15)
    .stroke({ color: characterConfig.glowColor, width: 5 });
  speechIndicator.addChild(border);
  speechIndicator.visible = false;
  thomas.characterName = characterConfig.name.toLowerCase();
  thomas.type = 'thomas';

  // Add the magic ring
  const ringRadius = 90;
  const magicRing = new Graphics();
  magicRing.x = thomas.bodyWidth / 2;
  magicRing.y = thomas.bodyHeight / 2;

  // Create a multi-layered glow effect
  const glowColor = characterConfig.glowColor;
  // 1. Outer, faint glow
  magicRing.circle(0, 0, ringRadius + 10).stroke({ color: glowColor, width: 12, alpha: 0.15 });
  // 2. Mid, main glow
  magicRing.circle(0, 0, ringRadius + 2).stroke({ color: glowColor, width: 6, alpha: 0.4 });
  // 3. Inner, sharp ring
  magicRing.circle(0, 0, ringRadius).stroke({ color: 0xffffff, width: 3, alpha: 0.8 });

  magicRing.visible = false;
  thomas.addChild(magicRing);
  thomas.magicRing = magicRing;
  thomas.ringRadius = ringRadius;
  thomas.magicRing.animation = { active: false, timer: 0, duration: 500 };

  return thomas;
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

  // If player is not controllable, disable movement and kicking.
  if (state.playerIsControllable === false) {
    kickIndicator.clear(); // Ensure no visual artifacts remain
    return { newState: { ...state, kickStart: null } };
  }

  const dt = delta / 1000;

  // Player Movement
  if (inputState.keys['a'] || inputState.keys['ArrowLeft']) player.x -= config.playerSpeed * dt;
  if (inputState.keys['d'] || inputState.keys['ArrowRight']) player.x += config.playerSpeed * dt;

  // Kicking Logic
  const isKickable = isPlayerKickable(player, ball);
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
      const baseKickPower = 0.1 * 60;
      const maxKickPower = 20; // Set a reasonable maximum limit
      const kickPower = Math.min(baseKickPower / world.scale.x, maxKickPower);
      const dx = inputState.pointer.x - world.toGlobal(ball.position).x;
      const dy = inputState.pointer.y - world.toGlobal(ball.position).y;
      ballVelocity = { x: dx * kickPower, y: dy * kickPower };
    }
    kickStart = null;
    resetFoot(player);
  }

  const newState = { ...state, player, kickStart, ballVelocity };
  return { newState };
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

function resetFoot(player) {
  // Reset pivots and positions
  player.foot_upper.pivot.set(0, 0);
  player.foot_upper.x = 0;
  player.foot_lower.pivot.set(0, 0);
  player.foot_lower.x = 0;

  player.foot_upper.rotation = 0;
  player.foot_lower.rotation = 0;
}

function updateNpcKickAnimation(npc, kickDirection) {
  const footWidth = 40; // NPC's foot is thinner

  if (kickDirection === 1) {
    // KICK RIGHT
    // Pivot on the left hip (x=0)
    npc.foot_upper.pivot.set(0, 0);
    npc.foot_upper.x = 0;
    npc.foot_lower.pivot.set(0, 0);
    npc.foot_lower.x = 0;

    // Swing right
    npc.foot_upper.rotation = -0.2;
    npc.foot_lower.rotation = 0.2;
    npc.foot_lower.x += 10;
  } else {
    // KICK LEFT
    // Pivot on the right hip (x=footWidth)
    npc.foot_upper.pivot.set(footWidth, 0);
    npc.foot_upper.x = footWidth;
    npc.foot_lower.pivot.set(footWidth, 0);
    npc.foot_lower.x = footWidth;

    // Swing left
    npc.foot_upper.rotation = 0.2;
    npc.foot_lower.rotation = -0.2;
    npc.foot_lower.x -= 10;
  }
}

function updateNpcFoot(npc, kickDirection) {
  const footWidth = 40; // NPC's foot is thinner
  const dir = kickDirection;

  // Pivot about the inner edge
  const pivotOnRightSide = dir === -1;
  const pivotX = pivotOnRightSide ? footWidth : 0;
  npc.foot_upper.pivot.set(pivotX, 0);
  npc.foot_upper.x = pivotX;
  npc.foot_lower.pivot.set(pivotX, 0);
  npc.foot_lower.x = pivotX;

  // Now swing and extend
  npc.foot_upper.rotation = -0.2 * dir;
  npc.foot_lower.rotation = 0.2 * dir;
  npc.foot_lower.x += 10 * dir;
}

function isPlayerKickable(player, ball) {
  const playerRect = {
    x: player.x - player.bodyWidth / 2,
    y: player.y - player.bodyHeight,
    width: player.bodyWidth,
    height: player.bodyHeight,
  };

  const closestX = Math.max(playerRect.x, Math.min(ball.x, playerRect.x + playerRect.width));
  const closestY = Math.max(playerRect.y, Math.min(ball.y, playerRect.y + playerRect.height));
  const dist = Math.hypot(ball.x - closestX, ball.y - closestY);
  return dist < config.kickableDistance;
}

export function collideCircleWithRectangle(circle, rect) {
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

  if (state.player.x - state.player.bodyWidth / 2 < leftBoundary) {
    state.player.x = leftBoundary + state.player.bodyWidth / 2;
  }
  if (state.player.x + state.player.bodyWidth / 2 > rightBoundary) {
    state.player.x = rightBoundary - state.player.bodyWidth / 2;
  }

  // Player collision with solid obstacles
  if (state.obstacles) {
    const playerRect = {
      x: state.player.x - state.player.bodyWidth / 2,
      y: state.player.y - state.player.bodyHeight,
      width: state.player.bodyWidth,
      height: state.player.bodyHeight,
    };

    for (const obstacle of state.obstacles) {
      if (obstacle.isSolid) {
        const coll = obstacle.colliders[0];
        const obstacleRect = {
          x: obstacle.x + coll.x,
          y: obstacle.y + coll.y,
          width: coll.width,
          height: coll.height,
        };

        // AABB collision check
        if (
          playerRect.x < obstacleRect.x + obstacleRect.width &&
          playerRect.x + playerRect.width > obstacleRect.x &&
          playerRect.y < obstacleRect.y + obstacleRect.height &&
          playerRect.y + playerRect.height > obstacleRect.y
        ) {
          // Collision detected. Find overlap and resolve.
          const fromLeft = playerRect.x + playerRect.width - obstacleRect.x;
          const fromRight = obstacleRect.x + obstacleRect.width - playerRect.x;

          if (fromLeft < fromRight) {
            // Player is mostly on the left of the obstacle, so push left
            state.player.x = obstacleRect.x - state.player.bodyWidth / 2;
          } else {
            // Player is mostly on the right, so push right
            state.player.x = obstacleRect.x + obstacleRect.width + state.player.bodyWidth / 2;
          }
        }
      }
    }
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
        // Positional correction to prevent sinking
        ball.x += collision.normalX * collision.overlap;
        ball.y += collision.normalY * collision.overlap;

        const velocityAlongNormal =
          ballVelocity.x * collision.normalX + ballVelocity.y * collision.normalY;

        // Only bounce if moving towards the obstacle
        if (velocityAlongNormal < 0) {
          ballVelocity.x -= 2 * velocityAlongNormal * collision.normalX;
          ballVelocity.y -= 2 * velocityAlongNormal * collision.normalY;

          ballVelocity.x *= -config.ballBounce;
          ballVelocity.y *= -config.ballBounce;
        }
      }
    }
  }

  // NPC collision
  if (state.npcs) {
    const ballCircle = { x: ball.x, y: ball.y, radius: config.ballRadius };

    for (const npc of state.npcs) {
      if (npc.type === 'therian' && npc.colliderRect) {
        const rect = npc.colliderRect;

        // Calculate the world-space corners of the collider rect based on npc's transform
        const corner1X = npc.x + (rect.x - npc.pivot.x) * npc.scale.x;
        const corner1Y = npc.y + (rect.y - npc.pivot.y) * npc.scale.y;
        const corner2X = npc.x + (rect.x + rect.width - npc.pivot.x) * npc.scale.x;
        const corner2Y = npc.y + (rect.y + rect.height - npc.pivot.y) * npc.scale.y;

        const absoluteRect = {
          x: Math.min(corner1X, corner2X),
          y: Math.min(corner1Y, corner2Y),
          width: rect.width * Math.abs(npc.scale.x),
          height: rect.height * Math.abs(npc.scale.y),
        };

        const collision = collideCircleWithRectangle(ballCircle, absoluteRect);

        if (collision.collided) {
          // Resolve overlap
          ball.x += collision.normalX * collision.overlap;
          ball.y += collision.normalY * collision.overlap;

          // Calculate relative velocity
          const npcVelocity = { x: npc.speed * npc.direction, y: 0 };
          const relativeVelocity = {
            x: ballVelocity.x - npcVelocity.x,
            y: ballVelocity.y - npcVelocity.y,
          };

          // Check if objects are moving towards each other
          const velocityAlongNormal =
            relativeVelocity.x * collision.normalX + relativeVelocity.y * collision.normalY;

          // Only bounce if they are moving towards each other
          if (velocityAlongNormal < 0) {
            const dotProduct =
              ballVelocity.x * collision.normalX + ballVelocity.y * collision.normalY;
            ballVelocity.x -= 2 * dotProduct * collision.normalX;
            ballVelocity.y -= 2 * dotProduct * collision.normalY;

            ballVelocity.x *= -config.ballBounce;
            ballVelocity.y *= -config.ballBounce;

            // Trigger kick animation
            if (!npc.kickAnimation.active) {
              npc.kickAnimation.active = true;
              npc.kickAnimation.timer = npc.kickAnimation.duration;
            }
          }
        }
      }
    }
  }

  // Thomas's magic ring collision
  if (state.npcs) {
    for (const npc of state.npcs) {
      if (npc.type === 'thomas' && npc.collisionsEnabled) {
        const ringCenterX = npc.x;
        const ringCenterY = npc.y - npc.bodyHeight / 2;
        const dx = ball.x - ringCenterX;
        const dy = ball.y - ringCenterY;
        const distance = Math.hypot(dx, dy);

        if (distance < npc.ringRadius + config.ballRadius) {
          // Collision detected
          npc.magicRing.visible = true;
          npc.magicRing.animation.active = true;
          npc.magicRing.animation.timer = npc.magicRing.animation.duration;

          const overlap = npc.ringRadius + config.ballRadius - distance;
          const normalX = distance === 0 ? 1 : dx / distance;
          const normalY = distance === 0 ? 0 : dy / distance;

          // Calculate velocity along normal
          const velocityAlongNormal = ballVelocity.x * normalX + ballVelocity.y * normalY;

          // Only bounce if moving towards the obstacle
          if (velocityAlongNormal < 0) {
            // Positional correction to prevent sinking
            ball.x += normalX * overlap;
            ball.y += normalY * overlap;

            // Reflect ball's velocity
            ballVelocity.x -= 2 * velocityAlongNormal * normalX;
            ballVelocity.y -= 2 * velocityAlongNormal * normalY;

            ballVelocity.x *= -config.ballBounce;
            ballVelocity.y *= -config.ballBounce;
          }
        }
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

  const absoluteMinScale = app.screen.width / config.camera.maxViewWidth;

  let desiredScale = Math.min(scaleX, scaleY);
  desiredScale = Math.min(config.camera.maxZoomIn, desiredScale);
  desiredScale = Math.max(absoluteMinScale, desiredScale);

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

export function createObstacle(world, leftX, rightX, bottomY, topY, isSolid = false) {
  const strokeWidth = 5;

  const width = rightX - leftX - strokeWidth;
  const height = topY - bottomY - strokeWidth;

  const obstacle = new Container();
  obstacle.x = leftX + strokeWidth / 2;
  obstacle.y = -bottomY - strokeWidth / 2;
  world.addChild(obstacle);

  const fillColor = isSolid ? 0x964b00 : 0xffffff;
  const fillAlpha = isSolid ? 0.8 : 0.5;
  const strokeColor = 0x000000;

  const graphics = new Graphics();
  graphics
    .rect(0, -height, width, height)
    .fill({ color: fillColor, alpha: fillAlpha })
    .stroke({ color: strokeColor, width: strokeWidth, alignment: 0 });
  obstacle.addChild(graphics);

  obstacle.colliders = [
    {
      x: -strokeWidth / 2,
      y: -height - strokeWidth / 2,
      width: width + strokeWidth,
      height: height + strokeWidth,
    },
  ];
  obstacle.isSolid = isSolid;

  return obstacle;
}

export function createSofa(world, position) {
  const sofa = new Container();
  sofa.x = position.x;
  sofa.y = position.y;
  world.addChild(sofa);

  const backHeight = 120;
  const backWidth = 40;
  const seatHeight = 50;
  const seatWidth = 150;

  const graphics = new Graphics();
  // Draw the backrest, with its right edge at x=0
  graphics.rect(-backWidth, -backHeight, backWidth, backHeight).fill(0x5d4037);
  // Draw the seat, extending left from the backrest
  graphics.rect(-backWidth - seatWidth, -seatHeight, seatWidth, seatHeight).fill(0x8d6e63);

  sofa.addChild(graphics);
  // Pivot at the bottom-right corner of the backrest
  sofa.pivot.set(0, 0);

  return sofa;
}

export function createTV(world, position) {
  const tv = new Container();
  tv.x = position.x;
  tv.y = position.y;
  world.addChild(tv);

  const screenWidth = 15; // Thin side view
  const screenHeight = 140;
  const standHeight = 100;
  const standWidth = 5;

  // Stand (thin pole from the wall)
  const stand = new Graphics();
  stand.rect(0, -standHeight, standWidth, standHeight).fill(0x555555);
  tv.addChild(stand);

  // Screen
  const screen = new Graphics();
  screen
    .rect(standWidth, -screenHeight - (standHeight - screenHeight) / 2, screenWidth, screenHeight)
    .fill(0x111111); // Off-black
  tv.addChild(screen);
  tv.screen = screen; // Expose screen for later manipulation

  tv.pivot.set(0, 0); // Pivot at the wall connection point

  return tv;
}

export function createButton(world, position) {
  const button = new Container();
  button.x = position.x;
  button.y = position.y;
  world.addChild(button);

  const radius = 30;

  const buttonOff = new Graphics();
  buttonOff.circle(0, 0, radius).fill(0x660000); // Dark Red for off
  buttonOff.circle(0, 0, radius - 5).fill(0x440000);
  button.addChild(buttonOff);

  const buttonOn = new Graphics();
  buttonOn.circle(0, 0, radius).fill(0x00ff00); // Green for on
  buttonOn.circle(0, 0, radius - 5).fill(0x00aa00);
  buttonOn.visible = false;
  button.addChild(buttonOn);

  button.buttonOn = buttonOn;
  button.buttonOff = buttonOff;
  button.isOn = false;

  // Add a non-solid collider for the ball
  button.colliders = [
    {
      x: -radius,
      y: -radius,
      width: radius * 2,
      height: radius * 2,
    },
  ];
  button.isSolid = false; // Player can pass through, but ball will collide

  return button;
}

export function handleResize(app, layers, state) {
  app.renderer.resize(window.innerWidth, window.innerHeight);

  const { staticLayer, world } = layers;
  const { background, sun, ground } = state;

  background.clear().rect(0, 0, app.screen.width, app.screen.height).fill(config.colors.background);
  sun.x = app.screen.width - 60;
  sun.y = 60;
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
    activeMessage: null,
  };
}

export function getUIMessageFromEventState(eventState) {
  if (!eventState) {
    return null;
  }
  return eventState.activeMessage;
}

export function updateEvents(eventState, script, gameState, clock) {
  const newTime = clock.getTime();
  let activeMessage = eventState.activeMessage;
  let currentScriptItem = null;

  // Prioritize condition-based triggers
  const conditionScriptItem = script.find(
    (item) => item.trigger.type === 'condition' && item.trigger.check(gameState)
  );

  if (conditionScriptItem) {
    currentScriptItem = conditionScriptItem;
  } else {
    // Fallback to time-based triggers if no condition is met
    currentScriptItem = script.find(
      (item) =>
        item.trigger.type === 'time' &&
        newTime >= item.trigger.time &&
        newTime < item.trigger.time + item.action.duration
    );
  }

  if (currentScriptItem) {
    // If there is no active message, or the active message is different from the current script item
    if (!activeMessage || activeMessage.id !== currentScriptItem.id) {
      activeMessage = {
        ...currentScriptItem.action,
        id: currentScriptItem.id,
        startTime: newTime,
      };
    }
  } else {
    activeMessage = null;
  }

  return {
    ...eventState,
    time: newTime,
    activeMessage,
  };
}

export function updateSpeakerEffects(state) {
  const { characters, uiMessage } = state;
  if (!characters) return;

  const speakerName = uiMessage ? uiMessage.characterName : null;

  characters.forEach((char) => {
    if (char.speechIndicator) {
      if (char.characterName === speakerName) {
        char.speechIndicator.visible = true;
        // Use a simple time-based glow effect
        char.speechIndicator.alpha = 0.6 + Math.sin(performance.now() / 150) * 0.4;
      } else {
        char.speechIndicator.visible = false;
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

function updateTherian(therian, state, dt, layers) {
  const { worldBounds } = state;
  therian.x += therian.speed * therian.direction * dt;

  const leftBoundary = worldBounds.minX + therian.bodyWidth / 2 + 100;
  const rightBoundary = worldBounds.maxX - therian.bodyWidth / 2 - 100;

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

  if (therian.kickAnimation.active) {
    therian.kickAnimation.timer -= dt * 1000;
    const kickProgress = Math.max(0, therian.kickAnimation.timer / therian.kickAnimation.duration);
    // A simple back-and-forth rotation, directionally adjusted
    therian.frontLeg.rotation = Math.sin((1 - kickProgress) * Math.PI) * -0.5 * therian.scale.x;

    if (therian.kickAnimation.timer <= 0) {
      therian.kickAnimation.active = false;
      therian.frontLeg.rotation = 0;
    }
  }
}

function updateElectric(electric, state, dt, layers) {
  // Update timers
  if (electric.kickCooldown > 0) {
    electric.kickCooldown -= dt * 1000;
  }
  if (electric.kickAnimation.active) {
    electric.kickAnimation.timer -= dt * 1000;
  }

  const dx = state.ball.x - electric.x;
  const dy = state.ball.y - electric.y;
  const distance = Math.hypot(dx, dy);
  const moveDirection = dx > 0 ? 1 : -1;

  // Decide to kick or move
  if (distance < config.kickableDistance / 2 && electric.kickCooldown <= 0) {
    // Calculate the kick velocity first
    const kickAngle = -(Math.PI / 6) - Math.random() * ((2 * Math.PI) / 3); // Wider arc
    const kickSpeed = 1000 + Math.random() * 1000; // This is now in world units/second
    const newBallVelocityX = Math.cos(kickAngle) * kickSpeed * moveDirection;
    const newBallVelocityY = Math.sin(kickAngle) * kickSpeed;

    // Determine the actual kick direction from the final velocity
    const actualKickDirection = newBallVelocityX >= 0 ? 1 : -1;
    // Start a new kick with the correct animation direction
    electric.kickAnimation.active = true;
    electric.kickAnimation.timer = electric.kickAnimation.duration;
    electric.kickAnimation.direction = actualKickDirection;
    electric.kickCooldown = 500; // 500ms cooldown

    // Apply the calculated velocity to the ball
    state.ballVelocity.x = newBallVelocityX;
    state.ballVelocity.y = newBallVelocityY;
  } else if (!electric.kickAnimation.active) {
    if (Math.abs(dx) > 5) {
      // Add a small dead zone to prevent jittering
      electric.x += Math.sign(dx) * electric.speed * dt;
    }
  }

  // Handle animation visuals
  if (electric.kickAnimation.active) {
    updateNpcKickAnimation(electric, electric.kickAnimation.direction);

    if (electric.kickAnimation.timer <= 0) {
      electric.kickAnimation.active = false;
      resetFoot(electric);
    }
  } else {
    resetFoot(electric);
  }
}

function updateThomas(thomas, state, dt) {
  if (thomas.magicRing.animation.active) {
    thomas.magicRing.animation.timer -= dt * 1000;
    const progress = thomas.magicRing.animation.timer / thomas.magicRing.animation.duration;
    thomas.magicRing.alpha = Math.max(0, progress);

    if (thomas.magicRing.animation.timer <= 0) {
      thomas.magicRing.animation.active = false;
      thomas.magicRing.visible = false;
    }
  }
}

const npcUpdaters = {
  therian: updateTherian,
  electric: updateElectric,
  thomas: updateThomas,
};

export function updateNPCs(state, delta, layers) {
  if (!state.npcs) return state;

  const dt = delta / 1000;

  const newNpcs = state.npcs.map((npc) => {
    const updater = npcUpdaters[npc.type];
    if (updater) {
      updater(npc, state, dt, layers);
    }
    return npc;
  });

  return { ...state, npcs: newNpcs };
}
