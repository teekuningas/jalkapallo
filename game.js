// Import the necessary classes from PixiJS. Thanks to Vite, we can use the bare module specifier 'pixi.js'
import { Application, Sprite, Texture } from 'pixi.js';

// This is the main entry point for the game.
// It's wrapped in a DOMContentLoaded event listener to ensure the HTML is fully loaded before the game starts.
window.addEventListener('DOMContentLoaded', async () => {
    // Create a new PixiJS application
    const app = new Application();

    // Initialize the application.
    // This is an async operation in PixiJS v8.
    await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0x0000ff, // blue
        resizeTo: window // Automatically resize the canvas to the window size
    });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // --- Create the Sun ---
    // Create a sprite from a built-in white texture.
    // Using a sprite is a very common and efficient way to display images or simple shapes.
    const sun = new Sprite(Texture.WHITE);

    // Set the anchor point to the center of the sprite.
    // This makes positioning and rotation relative to the center, which is often more convenient.
    sun.anchor.set(0.5);

    // Tint the white sprite to yellow.
    sun.tint = 0xFFFF00;

    // Set the size of the sun.
    sun.width = 200;
    sun.height = 200;

    // Position the sun in the center of the screen.
    sun.x = app.screen.width / 2;
    sun.y = app.screen.height / 2;

    // Add the sun to the stage. The stage is the root container for all visible objects.
    app.stage.addChild(sun);


    // --- Game Loop ---
    // The ticker is the main game loop. It calls the provided function on every frame.
    app.ticker.add((time) => {
        // The 'time' object contains timing information.
        // 'time.deltaTime' gives us the time elapsed since the last frame,
        // which is crucial for creating smooth, frame-rate independent animations.

        // Rotate the sun on each frame.
        sun.rotation += 0.01 * time.deltaTime;
    });
});
