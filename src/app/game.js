import { Sprite, Texture, Graphics, Container, Circle } from 'pixi.js';
import { config } from './config.js';

// Helper function for linear interpolation (smoothing)
function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

export function startGame(app) {
  app.stage.sortableChildren = true;
  app.stage.interactive = true;

  document.body.appendChild(app.canvas);

  // --- Create Layers ---
  const staticLayer = new Container();
  staticLayer.zIndex = 0;
  staticLayer.sortableChildren = true;
  app.stage.addChild(staticLayer);

  const world = new Container();
  world.zIndex = 1;
  app.stage.addChild(world);

  const uiLayer = new Container();
  uiLayer.zIndex = 2;
  app.stage.addChild(uiLayer);

  // --- Populate Static Layer ---
  const background = new Graphics();
  background.zIndex = -1;
  staticLayer.addChild(background);

  const sun = new Graphics();
  sun.zIndex = 0; // draw sun in front of background
  // halo
  sun.circle(0, 0, 70).fill({ color: config.colors.sun, alpha: 0.2 });
  // sun body
  sun.circle(0, 0, 50).fill(config.colors.sun);
  staticLayer.addChild(sun);

  const ground = new Graphics();
  staticLayer.addChild(ground);

  // --- World Coordinate System ---
  const groundLevelY = 0;

  // --- Camera Setup ---
  // The world's pivot point is the "focus point" or "camera anchor" in world coordinates.
  // We start it at (0,0).
  world.pivot.set(0, 0);

  // --- Ground Markers (stripes every 200 world units) ---
  const groundMarkers = new Graphics();
  const stripeSpacing = 200; // distance between stripes in world coords
  const stripeWidth = 5; // stripe thickness
  const stripeHeight = 30; // how tall the stripe is above ground
  // start at the first multiple of stripeSpacing ≥ minX
  const startX = Math.ceil(config.worldBounds.minX / stripeSpacing) * stripeSpacing;
  for (let x = startX; x <= config.worldBounds.maxX; x += stripeSpacing) {
    groundMarkers
      .beginFill(0x888888) // a stone‐gray color
      .drawRect(
        x - stripeWidth / 2,
        groundLevelY - stripeHeight, // position in world coords
        stripeWidth,
        stripeHeight
      )
      .endFill();
  }
  world.addChild(groundMarkers);

  // --- Populate World Layer ---
  const player = new Container();
  player.x = 100;
  player.y = groundLevelY - 100;
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

  const ball = new Graphics();
  ball.circle(0, 0, config.ballRadius).fill(config.colors.ball);
  ball.x = 200;
  ball.y = groundLevelY - config.ballRadius;
  ball.interactive = true;
  ball.cursor = 'pointer';
  // enlarge hit area for easier clicking
  ball.hitArea = new Circle(0, 0, config.ballRadius + 40);
  world.addChild(ball);

  const ballBorder = new Graphics();
  ball.addChild(ballBorder);

  // --- Populate UI Layer ---
  const kickIndicator = new Graphics();
  uiLayer.addChild(kickIndicator);

  // --- Game State and Physics ---
  let ballVelocity = { x: 0, y: 0 };

  // --- Control State ---
  const controls = { moveLeft: false, moveRight: false };
  let kickStart = null;

  // --- Keyboard Listeners ---
  window.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'ArrowLeft') controls.moveLeft = true;
    if (e.key === 'd' || e.key === 'ArrowRight') controls.moveRight = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'a' || e.key === 'ArrowLeft') controls.moveLeft = false;
    if (e.key === 'd' || e.key === 'ArrowRight') controls.moveRight = false;
  });

  // --- Mobile Control Listeners ---
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');

  // =========================
  // SUPPRESS AND PREVENT OS LONG-PRESS HAPTIC & CLICK
  // =========================
  [leftBtn, rightBtn].forEach((btn) => {
    // MUST be passive: false so preventDefault() actually cancels the native touch-hold
    btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    btn.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
    btn.addEventListener('touchcancel', (e) => e.preventDefault(), { passive: false });

    // Also kill the synthesized click (which on Android will trigger haptic)
    btn.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
      },
      { capture: true }
    );

    btn.style.touchAction = 'none';
  });

  // LEFT BUTTON
  leftBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    controls.moveLeft = true;
    leftBtn.classList.add('pressed');
    leftBtn.setPointerCapture(e.pointerId);
  });
  leftBtn.addEventListener('pointerup', (e) => {
    e.preventDefault();
    controls.moveLeft = false;
    leftBtn.classList.remove('pressed');
    leftBtn.releasePointerCapture(e.pointerId);
  });
  leftBtn.addEventListener('pointercancel', (e) => {
    e.preventDefault();
    controls.moveLeft = false;
    leftBtn.classList.remove('pressed');
    leftBtn.releasePointerCapture(e.pointerId);
  });

  // RIGHT BUTTON
  rightBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    controls.moveRight = true;
    rightBtn.classList.add('pressed');
    rightBtn.setPointerCapture(e.pointerId);
  });
  rightBtn.addEventListener('pointerup', (e) => {
    e.preventDefault();
    controls.moveRight = false;
    rightBtn.classList.remove('pressed');
    rightBtn.releasePointerCapture(e.pointerId);
  });
  rightBtn.addEventListener('pointercancel', (e) => {
    e.preventDefault();
    controls.moveRight = false;
    rightBtn.classList.remove('pressed');
    rightBtn.releasePointerCapture(e.pointerId);
  });

  // Prevent context menu on long press
  leftBtn.addEventListener('contextmenu', (e) => e.preventDefault());
  rightBtn.addEventListener('contextmenu', (e) => e.preventDefault());

  // --- Pointer Event Handlers ---
  function onKickStart(e) {
    // compute screen positions for more accurate rectangle-based distance
    const ballScreenPos = world.toGlobal(ball.position);
    const topLeft = world.toGlobal({ x: player.x, y: player.y });
    const bottomRight = world.toGlobal({ x: player.x + player.width, y: player.y + player.height });
    const rect = { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y };
    const closestX = Math.max(rect.left, Math.min(ballScreenPos.x, rect.right));
    const closestY = Math.max(rect.top, Math.min(ballScreenPos.y, rect.bottom));
    const dist = Math.hypot(ballScreenPos.x - closestX, ballScreenPos.y - closestY);

    if (dist < config.kickableDistance * world.scale.x) {
      // just a flag that we’ve begun dragging
      kickStart = true;
      e.stopPropagation();

      // Animate the foot
      foot_upper.rotation = -0.2;
      foot_lower.rotation = 0.2;
      foot_lower.x = 10;
    }
  }

  function onKickMove(e) {
    if (kickStart) {
      const ballScreenPos = world.toGlobal(ball.position);
      kickIndicator
        .clear()
        .moveTo(ballScreenPos.x, ballScreenPos.y)
        .lineTo(e.global.x, e.global.y)
        .stroke({ color: config.colors.kickIndicator, width: 3, alpha: 0.5 });
    }
  }

  function onKickEnd(e) {
    if (kickStart) {
      kickIndicator.clear();
      // re-compute proximity at release—must still be within kickableDistance
      const ballScreenPos = world.toGlobal(ball.position);
      const topLeft = world.toGlobal({ x: player.x, y: player.y });
      const bottomRight = world.toGlobal({
        x: player.x + player.width,
        y: player.y + player.height,
      });
      const rect = {
        left: topLeft.x,
        right: bottomRight.x,
        top: topLeft.y,
        bottom: bottomRight.y,
      };
      const closestX = Math.max(rect.left, Math.min(ballScreenPos.x, rect.right));
      const closestY = Math.max(rect.top, Math.min(ballScreenPos.y, rect.bottom));
      const distEnd = Math.hypot(ballScreenPos.x - closestX, ballScreenPos.y - closestY);
      if (distEnd <= config.kickableDistance * world.scale.x) {
        const kickEnd = { x: e.global.x, y: e.global.y };
        const kickPower = 0.1 / world.scale.x;
        const dx = kickEnd.x - ballScreenPos.x;
        const dy = kickEnd.y - ballScreenPos.y;
        ballVelocity = { x: dx * kickPower, y: dy * kickPower };
      }
      kickStart = null;

      // Reset foot animation
      foot_upper.rotation = 0;
      foot_lower.rotation = 0;
      foot_lower.x = 0;
    }
  }

  ball.on('pointerdown', onKickStart);
  app.stage.on('pointermove', onKickMove);
  app.stage.on('pointerup', onKickEnd);
  app.stage.on('pointerupoutside', onKickEnd);

  // --- Game Loop ---
  app.ticker.add((time) => {
    const delta = time.deltaTime;

    // 1. Player Movement (in world space)
    if (controls.moveLeft) player.x -= config.playerSpeed;
    if (controls.moveRight) player.x += config.playerSpeed;

    // 2. Ball Physics (in world space)
    ball.x += ballVelocity.x * delta;
    ball.y += ballVelocity.y * delta;

    ballVelocity.x *= config.friction;
    ballVelocity.y += config.gravity * delta;

    // 3. Collision Detection with ground
    if (ball.y + config.ballRadius > groundLevelY) {
      ball.y = groundLevelY - config.ballRadius;
      ballVelocity.y *= config.ballBounce;
      if (Math.abs(ballVelocity.y) < 1) ballVelocity.y = 0;
    }

    // 4. Camera Logic
    const focusPointX = (player.x + ball.x) / 2;

    const xDist = Math.abs(player.x - ball.x);
    const yDist = Math.abs(Math.min(player.y, ball.y));

    const requiredWidth = xDist + config.camera.zoomPaddingX;
    const requiredHeight = yDist + config.camera.zoomPaddingY;

    const scaleX = app.screen.width / requiredWidth;
    const scaleY = app.screen.height / requiredHeight;

    let desiredScale = Math.min(scaleX, scaleY);
    desiredScale = Math.min(1.0, desiredScale);

    const newScale = lerp(world.scale.x, desiredScale, config.camera.smoothing);
    world.scale.set(newScale);

    // Smoothly move the world's pivot (the camera's focus point) to follow the action.
    world.pivot.x = lerp(world.pivot.x, focusPointX, config.camera.smoothing);

    // Pin the world's pivot point to the center of the screen.
    // This creates the illusion of a camera by moving the world container itself.
    world.position.set(app.screen.width / 2, app.screen.height - config.groundHeight);

    // 5. Proximity Check
    const ballScreenPos = world.toGlobal(ball.position);
    const topLeft = world.toGlobal({ x: player.x, y: player.y });
    const bottomRight = world.toGlobal({ x: player.x + player.width, y: player.y + player.height });
    const rect = { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y };
    const closestX = Math.max(rect.left, Math.min(ballScreenPos.x, rect.right));
    const closestY = Math.max(rect.top, Math.min(ballScreenPos.y, rect.bottom));
    const dist = Math.hypot(ballScreenPos.x - closestX, ballScreenPos.y - closestY);
    if (dist < config.kickableDistance * world.scale.x || kickStart) {
      ballBorder.clear();
      ballBorder
        .circle(0, 0, config.ballRadius + 1)
        .stroke({ color: config.colors.ballBorder, width: 3 });
    } else {
      ballBorder.clear();
    }

    // 6. World Boundaries
    // Constrain player
    if (player.x < config.worldBounds.minX) {
      player.x = config.worldBounds.minX;
    }
    if (player.x + player.width > config.worldBounds.maxX) {
      player.x = config.worldBounds.maxX - player.width;
    }

    // Constrain ball
    if (ball.x - config.ballRadius < config.worldBounds.minX) {
      ball.x = config.worldBounds.minX + config.ballRadius;
      ballVelocity.x *= config.ballBounce; // bounce off the walls
    }
    if (ball.x + config.ballRadius > config.worldBounds.maxX) {
      ball.x = config.worldBounds.maxX - config.ballRadius;
      ballVelocity.x *= config.ballBounce; // bounce off the walls
    }
  });

  // --- Resize Handler ---
  const onResize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);

    background.clear();
    background.rect(0, 0, app.screen.width, app.screen.height).fill(config.colors.background);

    sun.x = app.screen.width - 80;
    sun.y = 80;

    ground.clear();
    ground
      .rect(0, app.screen.height - config.groundHeight, app.screen.width, config.groundHeight)
      .fill(config.colors.ground);

    // Keep the world's pivot point pinned to the center of the screen.
    world.position.set(app.screen.width / 2, app.screen.height - config.groundHeight);
  };

  window.addEventListener('resize', onResize);
  onResize();
}
