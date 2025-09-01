// Import the necessary classes from PixiJS
import { Application } from 'pixi.js';
import { startGame } from './game.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new Application();

  app
    .init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
    })
    .then(() => {
      startGame(app);
    });
});
