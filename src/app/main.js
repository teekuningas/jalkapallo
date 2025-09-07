import { Application, Container } from 'pixi.js';
import { startGame } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new Application();

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

      document.body.appendChild(app.canvas);

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
        if (e.originalEvent && e.originalEvent.target) {
          const target = e.originalEvent.target;
          if (target.id === 'left-btn' || target.id === 'right-btn') {
            return;
          }
        }
        inputState.pointer.isDown = true;
        inputState.pointer.isDownThisFrame = true;
      });
      app.stage.on('pointerup', (e) => {
        inputState.pointer.isDown = false;
        inputState.pointer.isUpThisFrame = true;
      });
      app.stage.on('pointermove', (e) => {
        inputState.pointer.x = e.global.x;
        inputState.pointer.y = e.global.y;
      });

      const leftBtn = document.getElementById('left-btn');
      const rightBtn = document.getElementById('right-btn');

      [leftBtn, rightBtn].forEach((btn) => {
        btn.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        btn.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
        btn.addEventListener('touchcancel', (e) => e.preventDefault(), { passive: false });
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

      leftBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        inputState.keys['a'] = true;
        leftBtn.classList.add('pressed');
        leftBtn.setPointerCapture(e.pointerId);
      });
      leftBtn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        inputState.keys['a'] = false;
        leftBtn.classList.remove('pressed');
        leftBtn.releasePointerCapture(e.pointerId);
      });

      rightBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        inputState.keys['d'] = true;
        rightBtn.classList.add('pressed');
        rightBtn.setPointerCapture(e.pointerId);
      });
      rightBtn.addEventListener('pointerup', (e) => {
        e.preventDefault();
        inputState.keys['d'] = false;
        rightBtn.classList.remove('pressed');
        rightBtn.releasePointerCapture(e.pointerId);
      });

      // Start Game
      startGame(app, inputState, layers);

      // Reset single-frame input flags at the end of each frame
      app.ticker.add(() => {
        inputState.pointer.isDownThisFrame = false;
        inputState.pointer.isUpThisFrame = false;
      });
    });
});
