/**
 * @fileoverview Game Engine Constants Configuration
 * This module contains all core constants used throughout the game engine.
 * 
 * @module src/config/constants
 * @version 1.0.0
 */

/**
 * @constant {Object} CANVAS
 * Canvas-related constants
 * @frozen
 */
export const CANVAS = Object.freeze({
  /** @type {number} Default canvas width in pixels */
  DEFAULT_WIDTH: 800,
  /** @type {number} Default canvas height in pixels */
  DEFAULT_HEIGHT: 600,
  /** @type {string} Default canvas background color */
  DEFAULT_BACKGROUND: '#000000',
  /** @type {string} Default canvas context type */
  CONTEXT_TYPE: '2d',
});

/**
 * @constant {Object} GAME_LOOP
 * Game loop timing and performance constants
 * @frozen
 */
export const GAME_LOOP = Object.freeze({
  /** @type {number} Target frames per second */
  TARGET_FPS: 60,
  /** @type {number} Maximum frame delta time (ms) to prevent spiral of death */
  MAX_FRAME_TIME: 100,
  /** @type {number} Minimum frame delta time (ms) */
  MIN_FRAME_TIME: 0,
  /** @type {number} Frame time step in milliseconds (1000ms / 60fps) */
  FRAME_TIME: 1000 / 60,
});

/**
 * @constant {Object} RENDER
 * Rendering-related constants
 * @frozen
 */
export const RENDER = Object.freeze({
  /** @type {Object} Default rendering quality settings */
  QUALITY: {
    /** @type {boolean} Enable image smoothing */
    IMAGE_SMOOTHING: true,
    /** @type {string} Image smoothing quality */
    IMAGE_SMOOTHING_QUALITY: 'high',
  },
  /** @type {Object} Layer depth constants */
  LAYERS: {
    BACKGROUND: 0,
    GAME_WORLD: 10,
    ENTITIES: 20,
    UI: 30,
    OVERLAY: 40,
  },
});

/**
 * @constant {Object} DEBUG
 * Debug and development constants
 * @frozen
 */
export const DEBUG = Object.freeze({
  /** @type {boolean} Enable debug mode */
  ENABLED: process.env.NODE_ENV === 'development',
  /** @type {Object} Debug visualization settings */
  VISUALIZATION: {
    /** @type {string} Color for debug shapes */
    HITBOX_COLOR: 'rgba(255, 0, 0, 0.5)',
    /** @type {number} Width of debug lines */
    LINE_WIDTH: 2,
  },
});

/**
 * @constant {Object} ERRORS
 * Error message constants
 * @frozen
 */
export const ERRORS = Object.freeze({
  CANVAS: {
    CONTEXT_UNAVAILABLE: 'Canvas 2D context is not available',
    INVALID_DIMENSIONS: 'Invalid canvas dimensions provided',
  },
  GAME_LOOP: {
    INVALID_TIMESTAMP: 'Invalid game loop timestamp',
    FRAME_OVERFLOW: 'Frame processing time exceeded maximum allowed',
  },
});

/**
 * @constant {Object} PERFORMANCE
 * Performance optimization constants
 * @frozen
 */
export const PERFORMANCE = Object.freeze({
  /** @type {number} Maximum number of objects to process per frame */
  MAX_OBJECTS_PER_FRAME: 1000,
  /** @type {number} Object pool initial size */
  OBJECT_POOL_SIZE: 100,
  /** @type {number} Cache expiration time in milliseconds */
  CACHE_EXPIRATION: 5000,
});

/**
 * @constant {Object} INPUT
 * Input handling constants
 * @frozen
 */
export const INPUT = Object.freeze({
  /** @type {number} Input debounce time in milliseconds */
  DEBOUNCE_TIME: 16,
  /** @type {Object} Keyboard key mappings */
  KEYS: {
    UP: 'ArrowUp',
    DOWN: 'ArrowDown',
    LEFT: 'ArrowLeft',
    RIGHT: 'ArrowRight',
    SPACE: ' ',
    ESCAPE: 'Escape',
  },
});

/**
 * Validate critical constants at runtime
 * @throws {Error} If constants validation fails
 */
const validateConstants = () => {
  if (CANVAS.DEFAULT_WIDTH <= 0 || CANVAS.DEFAULT_HEIGHT <= 0) {
    throw new Error(ERRORS.CANVAS.INVALID_DIMENSIONS);
  }
  
  if (GAME_LOOP.TARGET_FPS <= 0) {
    throw new Error('Invalid TARGET_FPS value');
  }
  
  if (GAME_LOOP.MAX_FRAME_TIME <= GAME_LOOP.MIN_FRAME_TIME) {
    throw new Error('Invalid frame time constraints');
  }
};

// Run validation in development mode
if (DEBUG.ENABLED) {
  validateConstants();
}

// Prevent modifications to the exports
Object.freeze(exports);