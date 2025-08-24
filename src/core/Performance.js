/**
 * @fileoverview Performance monitoring utilities for game engine
 * @module core/Performance
 * @version 1.0.0
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} fps - Frames per second
 * @property {number} frameTime - Time taken to process frame in ms
 * @property {number} gameTime - Total game running time in ms
 * @property {number} idleTime - Time spent idle between frames in ms
 */

/**
 * Performance monitoring and metrics collection system
 * @class Performance
 */
class Performance {
    /**
     * Creates a new Performance monitor instance
     * @constructor
     * @throws {Error} If performance API is not available
     */
    constructor() {
        if (!window.performance) {
            throw new Error('Performance API is not supported in this environment');
        }

        // Initialize performance metrics
        this._metrics = {
            fps: 0,
            frameTime: 0,
            gameTime: 0,
            idleTime: 0
        };

        // Performance tracking state
        this._frameCount = 0;
        this._lastFrameTime = 0;
        this._fpsUpdateInterval = 1000; // Update FPS every second
        this._lastFpsUpdate = 0;
        
        // Bind methods to maintain context
        this.startFrame = this.startFrame.bind(this);
        this.endFrame = this.endFrame.bind(this);
    }

    /**
     * Start measuring a new frame
     * @returns {void}
     */
    startFrame() {
        try {
            this._frameStartTime = performance.now();
            this._frameCount++;

            if (this._lastFrameTime) {
                this._metrics.idleTime = this._frameStartTime - this._lastFrameTime;
            }
        } catch (error) {
            console.error('Error in startFrame:', error);
            // Continue execution with default values
            this._frameStartTime = Date.now();
        }
    }

    /**
     * End frame measurement and update metrics
     * @returns {void}
     */
    endFrame() {
        try {
            const currentTime = performance.now();
            this._metrics.frameTime = currentTime - this._frameStartTime;
            this._metrics.gameTime = currentTime;
            this._lastFrameTime = currentTime;

            // Update FPS counter every second
            if (currentTime - this._lastFpsUpdate >= this._fpsUpdateInterval) {
                this._metrics.fps = Math.round(
                    (this._frameCount * 1000) / (currentTime - this._lastFpsUpdate)
                );
                this._frameCount = 0;
                this._lastFpsUpdate = currentTime;
            }
        } catch (error) {
            console.error('Error in endFrame:', error);
        }
    }

    /**
     * Get current performance metrics
     * @returns {PerformanceMetrics} Current performance metrics
     */
    getMetrics() {
        return { ...this._metrics };
    }

    /**
     * Reset all performance metrics
     * @returns {void}
     */
    reset() {
        this._metrics = {
            fps: 0,
            frameTime: 0,
            gameTime: 0,
            idleTime: 0
        };
        this._frameCount = 0;
        this._lastFrameTime = 0;
        this._lastFpsUpdate = performance.now();
    }

    /**
     * Start measuring a specific operation
     * @param {string} label - Label for the operation
     * @returns {function} Function to call when operation is complete
     */
    measureOperation(label) {
        if (!label) {
            throw new Error('Operation label is required');
        }

        const startTime = performance.now();
        
        return () => {
            const duration = performance.now() - startTime;
            return {
                label,
                duration,
                timestamp: Date.now()
            };
        };
    }
}

/**
 * Singleton instance of Performance monitor
 * @type {Performance}
 */
const performanceMonitor = new Performance();

// Freeze the instance to prevent modifications
Object.freeze(performanceMonitor);

export default performanceMonitor;