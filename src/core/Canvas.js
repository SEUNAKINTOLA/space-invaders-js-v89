/**
 * @fileoverview Canvas management system with game loop implementation
 * @module core/Canvas
 */

/**
 * Configuration constants for canvas rendering
 * @readonly
 * @enum {number}
 */
const CANVAS_DEFAULTS = {
    WIDTH: 800,
    HEIGHT: 600,
    FPS: 60,
    BACKGROUND_COLOR: '#000000'
};

/**
 * Manages canvas rendering and game loop functionality
 * @class Canvas
 */
export class Canvas {
    /**
     * @typedef {Object} CanvasOptions
     * @property {number} [width=800] - Canvas width in pixels
     * @property {number} [height=600] - Canvas height in pixels
     * @property {number} [fps=60] - Target frames per second
     * @property {string} [backgroundColor='#000000'] - Canvas background color
     */

    /**
     * @param {HTMLElement} container - DOM element to contain the canvas
     * @param {CanvasOptions} [options={}] - Canvas configuration options
     * @throws {Error} If container is not a valid DOM element
     */
    constructor(container, options = {}) {
        if (!(container instanceof HTMLElement)) {
            throw new Error('Canvas container must be a valid DOM element');
        }

        this.options = {
            width: options.width || CANVAS_DEFAULTS.WIDTH,
            height: options.height || CANVAS_DEFAULTS.HEIGHT,
            fps: options.fps || CANVAS_DEFAULTS.FPS,
            backgroundColor: options.backgroundColor || CANVAS_DEFAULTS.BACKGROUND_COLOR
        };

        this.initialize(container);
    }

    /**
     * Initializes canvas and context
     * @private
     * @param {HTMLElement} container
     */
    initialize(container) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        container.appendChild(this.canvas);

        this.context = this.canvas.getContext('2d');
        if (!this.context) {
            throw new Error('Failed to get 2D context from canvas');
        }

        this.isRunning = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;

        // Bind methods to preserve context
        this.gameLoop = this.gameLoop.bind(this);
        this.render = this.render.bind(this);
        this.update = this.update.bind(this);

        // Initialize render queue
        this.renderQueue = new Set();
    }

    /**
     * Starts the game loop
     * @public
     * @returns {void}
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Stops the game loop
     * @public
     * @returns {void}
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Main game loop
     * @private
     * @param {DOMHighResTimeStamp} currentTime
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastFrameTime;
        const frameInterval = 1000 / this.options.fps;

        if (deltaTime >= frameInterval) {
            this.fps = 1000 / deltaTime;
            this.update(deltaTime);
            this.render();
            this.lastFrameTime = currentTime - (deltaTime % frameInterval);
            this.frameCount++;
        }

        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Updates game state
     * @private
     * @param {number} deltaTime - Time since last frame in milliseconds
     */
    update(deltaTime) {
        // Update game objects here
        this.renderQueue.forEach(object => {
            if (typeof object.update === 'function') {
                object.update(deltaTime);
            }
        });
    }

    /**
     * Renders frame to canvas
     * @private
     */
    render() {
        try {
            // Clear canvas
            this.context.fillStyle = this.options.backgroundColor;
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Render all objects in queue
            this.renderQueue.forEach(object => {
                if (typeof object.render === 'function') {
                    object.render(this.context);
                }
            });
        } catch (error) {
            console.error('Render error:', error);
            this.stop();
        }
    }

    /**
     * Adds an object to the render queue
     * @public
     * @param {Object} object - Object with render method
     * @throws {Error} If object doesn't implement render method
     */
    addToRenderQueue(object) {
        if (typeof object.render !== 'function') {
            throw new Error('Object must implement render method');
        }
        this.renderQueue.add(object);
    }

    /**
     * Removes an object from the render queue
     * @public
     * @param {Object} object - Object to remove
     */
    removeFromRenderQueue(object) {
        this.renderQueue.delete(object);
    }

    /**
     * Resizes canvas to new dimensions
     * @public
     * @param {number} width - New width in pixels
     * @param {number} height - New height in pixels
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.options.width = width;
        this.options.height = height;
    }

    /**
     * Gets current FPS
     * @public
     * @returns {number} Current frames per second
     */
    getFPS() {
        return Math.round(this.fps);
    }

    /**
     * Cleans up resources
     * @public
     */
    destroy() {
        this.stop();
        this.renderQueue.clear();
        this.canvas.remove();
    }
}

export default Canvas;