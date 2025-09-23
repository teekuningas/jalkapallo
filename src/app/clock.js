export function createClock() {
  let time = 0;
  let isPaused = false;

  return {
    pause: () => {
      isPaused = true;
    },
    play: () => {
      isPaused = false;
    },
    update: (delta) => {
      if (!isPaused) {
        time += delta;
      }
    },
    getTime: () => time,
    isPaused: () => isPaused,
    reset: () => {
      time = 0;
    },
  };
}
