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
    maxZoomIn: 1.5, // allow up to 150% zoom when player & ball are very close
    minZoomOut: 0.5, // allow up to 2× more zoom‐out than the natural world‐width clamp
  },
  groundHeight: 50,
  wallWidth: 100,
};

export const characters = {
  jake: {
    name: 'Jake',
    // unified light‐green for both bubble border and character glow
    color: '#90EE90',
    speechBubbleDirection: 'down',
    glowColor: 0x90ee90,
  },

  sun: {
    name: 'Sun',
    // unified yellow–orange for both bubble border and character glow
    color: '#FFFF00',
    speechBubbleDirection: 'right',
    glowColor: 0xffff00,
  },

  therian: {
    name: 'Therian',
    color: '#FFA500',
    speechBubbleDirection: 'down',
    glowColor: 0xffa500,
  },
};
