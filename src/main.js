// Import the necessary classes from PixiJS
import { Application, Sprite, Texture, Graphics, Container } from 'pixi.js';

// Helper function for linear interpolation (smoothing)
function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

const config = {
  playerSpeed: 5,
  kickableDistance: 75,
  gravity: 0.5,
  friction: 0.995,
  ballRadius: 25,
  ballBounce: -0.6,
  worldBounds: {
    minX: -2000,
    maxX: 2000,
  },
  colors: {
    background: 0xadd8e6,
    sun: 0xffff00,
    ground: 0x00ff00,
    player: 0xff0000,
    ball: 0xffffff,
    ballBorder: 0x0000ff,
    kickIndicator: 0xffffff,
  },
  camera: {
    smoothing: 0.08,
    zoomPaddingX: 400,
    zoomPaddingY: 300,
  },
  groundHeight: 50,
};

window.addEventListener('DOMContentLoaded', () => {
  const app = new Application();

  app
    .init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
    })
    .then(() => {
      app.stage.sortableChildren = true;
      app.stage.interactive = true;

      document.body.appendChild(app.canvas);

      // --- Create Layers ---
      const staticLayer = new Container();
      staticLayer.zIndex = 0;
      app.stage.addChild(staticLayer);

      const world = new Container();
      world.zIndex = 1;
      app.stage.addChild(world);

      const uiLayer = new Container();
      uiLayer.zIndex = 2;
      app.stage.addChild(uiLayer);

      // --- Populate Static Layer ---
      const background = new Graphics();
      staticLayer.addChild(background);

      const sun = new Sprite(Texture.WHITE);
      sun.anchor.set(0.5);
      sun.tint = config.colors.sun;
      sun.width = 100;
      sun.height = 100;
      staticLayer.addChild(sun);

      const ground = new Graphics();
      staticLayer.addChild(ground);

      // --- World Coordinate System ---
      const groundLevelY = 0;

      // --- Camera Pivot Setup ---
      // Pin world pivot to (0,0) in world space, so scaling/positioning is always around origin
      world.pivot.set(0, 0);

      // --- Populate World Layer ---
      const player = new Graphics();
      player.rect(0, 0, 50, 100).fill(config.colors.player);
      player.x = 100;
      player.y = groundLevelY - 100;
      world.addChild(player);

      const ball = new Graphics();
      ball.circle(0, 0, config.ballRadius).fill(config.colors.ball);
      ball.x = 200;
      ball.y = groundLevelY - config.ballRadius;
      ball.interactive = true;
      ball.cursor = 'pointer';
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

      const onLeftDown = () => {
        controls.moveLeft = true;
        leftBtn.classList.add('pressed');
      };
      const onLeftUp = () => {
        controls.moveLeft = false;
        leftBtn.classList.remove('pressed');
      };
      const onRightDown = () => {
        controls.moveRight = true;
        rightBtn.classList.add('pressed');
      };
      const onRightUp = () => {
        controls.moveRight = false;
        rightBtn.classList.remove('pressed');
      };

      leftBtn.addEventListener('pointerdown', onLeftDown);
      leftBtn.addEventListener('pointerup', onLeftUp);
      leftBtn.addEventListener('pointerleave', onLeftUp);
      rightBtn.addEventListener('pointerdown', onRightDown);
      rightBtn.addEventListener('pointerup', onRightUp);
      rightBtn.addEventListener('pointerleave', onRightUp);

      // Prevent context menu on long press
      leftBtn.addEventListener('contextmenu', (e) => e.preventDefault());
      rightBtn.addEventListener('contextmenu', (e) => e.preventDefault());

      // --- Pointer Event Handlers ---
      function onKickStart(e) {
        const playerCenter = { x: player.x + player.width / 2, y: player.y + player.height / 2 };
        const playerScreenPos = world.toGlobal(playerCenter);
        const ballScreenPos = world.toGlobal(ball.position);
        const dist = Math.hypot(
          playerScreenPos.x - ballScreenPos.x,
          playerScreenPos.y - ballScreenPos.y
        );

        if (dist < config.kickableDistance * world.scale.x) {
          kickStart = { x: e.global.x, y: e.global.y };
          e.stopPropagation();
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
          const kickEnd = { x: e.global.x, y: e.global.y };
          const kickPower = 0.2 / world.scale.x;
          const kickVector = {
            x: (kickEnd.x - kickStart.x) * kickPower,
            y: (kickEnd.y - kickStart.y) * kickPower,
          };
          ballVelocity = kickVector;
          kickStart = null;
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

        // Lerp the pivot.x to follow the focus point (player/ball average)
        world.pivot.x = lerp(world.pivot.x, focusPointX, config.camera.smoothing);

        // Always pin world (0,0) to screen center X, and ground to screen bottom
        world.position.set(app.screen.width / 2, app.screen.height - config.groundHeight);
        // No need to lerp world.x or world.y

        // 5. Proximity Check
        const playerScreenPos = world.toGlobal({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
        });
        const ballScreenPos = world.toGlobal(ball.position);
        const dist = Math.hypot(
          playerScreenPos.x - ballScreenPos.x,
          playerScreenPos.y - ballScreenPos.y
        );
        if (dist < config.kickableDistance * world.scale.x && !kickStart) {
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

        // Always pin world (0,0) to screen center X, and ground to screen bottom
        world.position.set(app.screen.width / 2, app.screen.height - config.groundHeight);
      };

      window.addEventListener('resize', onResize);
      onResize();
    });
});
