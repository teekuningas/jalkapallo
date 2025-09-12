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
        time += delta * (1000 / 60); // Convert delta to milliseconds (approx)
      }
    },
    getTime: () => time,
    isPaused: () => isPaused,
  };
}
