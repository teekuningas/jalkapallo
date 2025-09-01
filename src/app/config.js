export const config = {
  playerSpeed: 3,
  kickableDistance: 100,
  gravity: 0.3,
  friction: 0.995, // closer to 1 → much less “air” drag
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
