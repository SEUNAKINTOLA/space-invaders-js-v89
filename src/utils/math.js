/**
 * @fileoverview Math utility functions for game development
 * Provides essential mathematical operations optimized for game calculations
 * @module utils/math
 */

/**
 * Clamps a value between a minimum and maximum range
 * @param {number} value - The value to clamp
 * @param {number} min - The minimum boundary
 * @param {number} max - The maximum boundary
 * @returns {number} The clamped value
 * @throws {TypeError} If arguments are not numbers
 */
export const clamp = (value, min, max) => {
    if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
        throw new TypeError('clamp: All arguments must be finite numbers');
    }
    return Math.min(Math.max(value, min), max);
};

/**
 * Linearly interpolates between two values
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} The interpolated value
 * @throws {TypeError} If arguments are not numbers or t is out of range
 */
export const lerp = (start, end, t) => {
    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(t)) {
        throw new TypeError('lerp: All arguments must be finite numbers');
    }
    if (t < 0 || t > 1) {
        throw new RangeError('lerp: Interpolation factor must be between 0 and 1');
    }
    return start + (end - start) * t;
};

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 * @throws {TypeError} If argument is not a number
 */
export const toRadians = (degrees) => {
    if (!Number.isFinite(degrees)) {
        throw new TypeError('toRadians: Argument must be a finite number');
    }
    return degrees * (Math.PI / 180);
};

/**
 * Converts radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 * @throws {TypeError} If argument is not a number
 */
export const toDegrees = (radians) => {
    if (!Number.isFinite(radians)) {
        throw new TypeError('toDegrees: Argument must be a finite number');
    }
    return radians * (180 / Math.PI);
};

/**
 * Calculates the distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} Distance between points
 * @throws {TypeError} If any argument is not a number
 */
export const distance = (x1, y1, x2, y2) => {
    const coords = [x1, y1, x2, y2];
    if (!coords.every(coord => Number.isFinite(coord))) {
        throw new TypeError('distance: All coordinates must be finite numbers');
    }
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Generates a random number within a range
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random number within range
 * @throws {TypeError} If arguments are not numbers
 * @throws {RangeError} If min is greater than max
 */
export const randomRange = (min, max) => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        throw new TypeError('randomRange: Arguments must be finite numbers');
    }
    if (min >= max) {
        throw new RangeError('randomRange: Min must be less than max');
    }
    return Math.random() * (max - min) + min;
};

/**
 * Normalizes a value within a range to 0-1
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum value of range
 * @param {number} max - Maximum value of range
 * @returns {number} Normalized value between 0 and 1
 * @throws {TypeError} If arguments are not numbers
 * @throws {RangeError} If min equals max
 */
export const normalize = (value, min, max) => {
    if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
        throw new TypeError('normalize: All arguments must be finite numbers');
    }
    if (min === max) {
        throw new RangeError('normalize: Min cannot equal max');
    }
    return (value - min) / (max - min);
};

/**
 * Rounds a number to a specified number of decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 * @throws {TypeError} If arguments are not numbers
 * @throws {RangeError} If decimals is negative
 */
export const roundTo = (value, decimals = 0) => {
    if (!Number.isFinite(value) || !Number.isFinite(decimals)) {
        throw new TypeError('roundTo: Arguments must be finite numbers');
    }
    if (decimals < 0) {
        throw new RangeError('roundTo: Decimals cannot be negative');
    }
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
};

// Freeze the exports to prevent modification
Object.freeze(exports);