/**
 * @fileoverview Game Loop and Canvas Rendering System
 * Implements a fixed time step game loop with interpolation and canvas rendering.
 * @module GameLoop
 */

// Constants for game loop configuration
const FIXED_TIME_STEP = 1000 / 60; // 60 FPS
const MAX_FRAME_SKIP = 10;

/**
 * @typedef {Object} GameLoopConfig
 * @property {HTMLCanvasElement} canvas - The canvas element to render to
 * @property {number} [fps=60] - Target frames per second
 * @property {boolean} [debug=false] - Enable debug mode
 */

/**
 * Manages the game loop and rendering system
 * @class GameLoop
 */
export class GameLoop {
    /**
     * @param {GameLoopConfig} config - Configuration options
     * @throws {Error} If canvas is not provided
     */
    constructor(config) {
        if (!config.canvas || !(config.canvas instanceof HTMLCanvasElement)) {
            throw new Error('Valid canvas element is required');
        }

        // Core properties
        this.canvas = config.canvas;
        this.context = this.canvas.getContext('2d');
        this.fps = config.fps || 60;
        this.timeStep = 1000 / this.fps;
        this.debug = config.debug || false;

        // Game loop state
        this.isRunning = false;
        this.lastTimestamp = 0;
        this.accumulator = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.currentFps = 0;

        // Bound methods to maintain context
        this.loop = this.loop.bind(this);
        
        // Update and render callbacks
        this.updateCallback = null;
        this.renderCallback = null;

        // Performance monitoring
        this.metrics = {
            updateTime: 0,
            renderTime: 0,
            frameTime: 0
        };
    }

    /**
     * Sets the update callback function
     * @param {Function} callback - Update function to be called each tick
     * @returns {GameLoop} this instance for chaining
     */
    setUpdateCallback(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Update callback must be a function');
        }
        this.updateCallback = callback;
        return this;
    }

    /**
     * Sets the render callback function
     * @param {Function} callback - Render function to be called each frame
     * @returns {GameLoop} this instance for chaining
     */
    setRenderCallback(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Render callback must be a function');
        }
        this.renderCallback = callback;
        return this;
    }

    /**
     * Starts the game loop
     * @returns {void}
     * @throws {Error} If callbacks are not set
     */
    start() {
        if (!this.updateCallback || !this.renderCallback) {
            throw new Error('Update and render callbacks must be set before starting');
        }

        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        this.lastTimestamp = performance.now();
        requestAnimationFrame(this.loop);
    }

    /**
     * Stops the game loop
     * @returns {void}
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Main game loop function
     * @private
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     */
    loop(timestamp) {
        if (!this.isRunning) {
            return;
        }

        const frameStart = performance.now();
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        // Update accumulator
        this.accumulator += deltaTime;

        // Update game state with fixed time step
        let updateStart = performance.now();
        let updates = 0;
        while (this.accumulator >= this.timeStep && updates < MAX_FRAME_SKIP) {
            try {
                this.updateCallback(this.timeStep);
                this.accumulator -= this.timeStep;
                updates++;
            } catch (error) {
                console.error('Error in update callback:', error);
                this.stop();
                return;
            }
        }
        this.metrics.updateTime = performance.now() - updateStart;

        // Render frame
        const renderStart = performance.now();
        try {
            // Clear canvas
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Calculate interpolation factor
            const alpha = this.accumulator / this.timeStep;
            this.renderCallback(this.context, alpha);

            // Debug overlay
            if (this.debug) {
                this.drawDebugInfo();
            }
        } catch (error) {
            console.error('Error in render callback:', error);
            this.stop();
            return;
        }
        this.metrics.renderTime = performance.now() - renderStart;

        // Calculate FPS
        this.frameCount++;
        this.fpsTime += deltaTime;
        if (this.fpsTime >= 1000) {
            this.currentFps = this.frameCount;
            this.frameCount = 0;
            this.fpsTime -= 1000;
        }

        this.metrics.frameTime = performance.now() - frameStart;

        // Queue next frame
        requestAnimationFrame(this.loop);
    }

    /**
     * Draws debug information overlay
     * @private
     */
    drawDebugInfo() {
        const ctx = this.context;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 200, 100);
        
        ctx.fillStyle = 'white';
        ctx.font = '12px monospace';
        ctx.fillText(`FPS: ${this.currentFps}`, 20, 30);
        ctx.fillText(`Update: ${this.metrics.updateTime.toFixed(2)}ms`, 20, 50);
        ctx.fillText(`Render: ${this.metrics.renderTime.toFixed(2)}ms`, 20, 70);
        ctx.fillText(`Frame: ${this.metrics.frameTime.toFixed(2)}ms`, 20, 90);
        ctx.restore();
    }

    /**
     * Resizes the canvas to match its display size
     * @returns {void}
     */
    resizeCanvas() {
        const { width, height } = this.canvas.getBoundingClientRect();
        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;
        this.context.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
}

// Export a factory function for convenient instantiation
export const createGameLoop = (config) => new GameLoop(config);