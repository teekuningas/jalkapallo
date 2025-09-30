export const config = {
  playerSpeed: 300,
  kickableDistance: 100,
  gravity: 1080,
  friction: 0.8, // closer to 1 → much less “air” drag
  ballRadius: 25,
  ballBounce: -0.6,

  colors: {
    background: 0xadd8e6,
    sun: 0xffff00,
    ground: 0x00ff00,
    player: 0xff0000,
    playerSkin: 0xffdbac,
    // new character colours
    playerShirt: 0xffff00, // yellow
    playerPants: 0x00bf00, // medium green
    playerSocks: 0xffff00, // yellow
    electricShirt: 0x0000ff, // blue
    electricPants: 0x000000, // black
    thomasShirt: 0xffff00, // yellow
    thomasPants: 0x00bf00, // medium green
    ball: 0xffffff,
    ballBorder: 0x0000ff,
    kickIndicator: 0xffffff,
    therianHead: 0xffa500, // Orange
    therianEars: 0xffffff, // White
    therianStomach: 0xffffff, // White
    therianBack: 0xffa500, // Orange
    therianTail: 0xffa500, // Orange
    therianLegs: 0xffffff, // White
    therianCloak: 0x4169e1, // RoyalBlue
  },
  camera: {
    smoothing: 0.08,
    zoomPaddingX: 400,
    zoomPaddingY: 300,
    maxZoomIn: 1.25, // allow up to 125% zoom when player & ball are very close
    maxViewWidth: 3000, // The maximum width of the world the camera can show
  },
  groundHeight: 50,
  wallWidth: 100,
};

export const characters = {
  jake: {
    name: 'Jake',
    color: '#90EE90',
    speechBubbleDirection: 'down',
    glowColor: 0x90ee90,
  },

  sun: {
    name: 'Sun',
    color: '#FFFF00',
    speechBubbleDirection: 'right',
    glowColor: 0xffff00,
  },

  therian: {
    name: 'Therian',
    color: '#FFA500',
    speechBubbleDirection: 'up',
    glowColor: 0xffa500,
  },

  electric: {
    name: 'Electric',
    color: '#0000FF',
    speechBubbleDirection: 'down',
    glowColor: 0x0000ff,
  },

  thomas: {
    name: 'Thomas',
    color: '#4169E1',
    speechBubbleDirection: 'right',
    glowColor: 0x4169e1,
  },
};
