import { Application, Container } from 'pixi.js';
import { startGame } from './game.js';
import { createClock } from './clock.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  const clock = createClock();

  const inputState = {
    keys: {},
    pointer: { x: 0, y: 0, isDown: false, isDownThisFrame: false, isUpThisFrame: false },
  };

  app
    .init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
    })
    .then(() => {
      // Create Layers
      app.stage.sortableChildren = true;
      const staticLayer = new Container();
      staticLayer.zIndex = 0;
      app.stage.addChild(staticLayer);

      const world = new Container();
      world.zIndex = 1;
      app.stage.addChild(world);

      const uiLayer = new Container();
      uiLayer.zIndex = 2;
      app.stage.addChild(uiLayer);

      document.getElementById('game-container').appendChild(app.canvas);

      // Prevent default browser actions like long-press menu/vibration
      window.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
      window.addEventListener('contextmenu', (e) => e.preventDefault());

      const layers = { staticLayer, world, uiLayer };

      // Global Listeners
      window.addEventListener('keydown', (e) => {
        inputState.keys[e.key] = true;
      });
      window.addEventListener('keyup', (e) => {
        inputState.keys[e.key] = false;
      });

      app.stage.interactive = true;
      app.stage.on('pointerdown', (e) => {
        if (e.originalEvent) {
          const target = e.originalEvent.target || e.originalEvent.srcElement;
          if (target && (target.id === 'left-btn' || target.id === 'right-btn')) {
            return;
          }
        }
        inputState.pointer.x = e.global.x;
        inputState.pointer.y = e.global.y;
        inputState.pointer.isDown = true;
        inputState.pointer.isDownThisFrame = true;
      });
      app.stage.on('pointerup', (e) => {
        inputState.pointer.isDown = false;
        inputState.pointer.isUpThisFrame = true;
      });
      app.stage.on('pointermove', (e) => {
        if (e.originalEvent) {
          const target = e.originalEvent.target || e.originalEvent.srcElement;
          if (target && (target.id === 'left-btn' || target.id === 'right-btn')) {
            return;
          }
        }
        inputState.pointer.x = e.global.x;
        inputState.pointer.y = e.global.y;
      });

      const leftBtn = document.getElementById('left-btn');
      const rightBtn = document.getElementById('right-btn');

      leftBtn.addEventListener('pointerdown', (e) => {
        inputState.keys['a'] = true;
        leftBtn.classList.add('pressed');
        leftBtn.setPointerCapture(e.pointerId);
      });
      leftBtn.addEventListener('pointerup', (e) => {
        inputState.keys['a'] = false;
        leftBtn.classList.remove('pressed');
        leftBtn.releasePointerCapture(e.pointerId);
      });
      rightBtn.addEventListener('pointerdown', (e) => {
        inputState.keys['d'] = true;
        rightBtn.classList.add('pressed');
        rightBtn.setPointerCapture(e.pointerId);
      });
      rightBtn.addEventListener('pointerup', (e) => {
        inputState.keys['d'] = false;
        rightBtn.classList.remove('pressed');
        rightBtn.releasePointerCapture(e.pointerId);
      });

      // Start Game
      const gameControls = startGame(app, inputState, layers, clock);

      // Menu Controls
      const menuOverlay = document.getElementById('menu-overlay');
      const menuBtn = document.getElementById('menu-btn');
      const restartBtn = document.getElementById('restart-btn');

      function openMenu() {
        gameControls.pause();
        menuOverlay.classList.remove('hidden');
        menuBtn.classList.add('pressed');
      }

      function closeMenu() {
        gameControls.resume();
        menuOverlay.classList.add('hidden');
        menuBtn.classList.remove('pressed');
      }

      menuBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); // Prevent the event from bubbling up to the PIXI stage
        openMenu();
      });

      restartBtn.addEventListener('pointerdown', () => {
        closeMenu();
        gameControls.restart();
      });

      // Also close menu if clicking on the background
      menuOverlay.addEventListener('pointerdown', (e) => {
        if (e.target === menuOverlay) {
          closeMenu();
        }
      });

      // Add Escape key listener
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (!menuOverlay.classList.contains('hidden')) {
            closeMenu();
          } else {
            openMenu();
          }
        }
      });

      // Reset single-frame input flags at the end of each frame
      app.ticker.add((time) => {
        clock.update(time.deltaMS);
        inputState.pointer.isDownThisFrame = false;
        inputState.pointer.isUpThisFrame = false;
      });

      const handleOrientation = () => {
        if (window.innerHeight > window.innerWidth) {
          clock.pause();
        } else {
          clock.play();
        }
      };

      window.addEventListener('resize', handleOrientation);
      handleOrientation(); // Initial check
    });
});
