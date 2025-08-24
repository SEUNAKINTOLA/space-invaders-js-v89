/**
 * @fileoverview Sprite management system for handling game/application sprites
 * including loading, caching, and rendering capabilities.
 * @module graphics/Sprite
 */

// Constants for sprite management
const SPRITE_DEFAULTS = {
    width: 32,
    height: 32,
    scale: 1,
    rotation: 0
};

/**
 * Custom error class for sprite-related errors
 */
class SpriteError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SpriteError';
    }
}

/**
 * Manages sprite resources with caching and rendering capabilities
 */
export class Sprite {
    /** @type {Map<string, HTMLImageElement>} */
    static #imageCache = new Map();
    
    /** @type {Map<string, Promise<HTMLImageElement>>} */
    static #loadingSprites = new Map();

    /**
     * @param {Object} config - Sprite configuration
     * @param {string} config.src - Image source URL
     * @param {number} [config.width] - Sprite width
     * @param {number} [config.height] - Sprite height
     * @param {number} [config.scale=1] - Sprite scale factor
     * @param {number} [config.rotation=0] - Sprite rotation in radians
     * @throws {SpriteError} If invalid configuration is provided
     */
    constructor(config) {
        this.#validateConfig(config);
        
        this.src = config.src;
        this.width = config.width ?? SPRITE_DEFAULTS.width;
        this.height = config.height ?? SPRITE_DEFAULTS.height;
        this.scale = config.scale ?? SPRITE_DEFAULTS.scale;
        this.rotation = config.rotation ?? SPRITE_DEFAULTS.rotation;
        
        /** @type {HTMLImageElement|null} */
        this.image = null;
        
        /** @type {boolean} */
        this.isLoaded = false;
    }

    /**
     * Validates sprite configuration
     * @param {Object} config - Configuration to validate
     * @private
     */
    #validateConfig(config) {
        if (!config?.src) {
            throw new SpriteError('Sprite source URL is required');
        }
        
        if (config.width && (typeof config.width !== 'number' || config.width <= 0)) {
            throw new SpriteError('Invalid sprite width');
        }
        
        if (config.height && (typeof config.height !== 'number' || config.height <= 0)) {
            throw new SpriteError('Invalid sprite height');
        }
    }

    /**
     * Loads the sprite image with caching
     * @returns {Promise<void>}
     * @throws {SpriteError} If loading fails
     */
    async load() {
        try {
            // Check cache first
            if (Sprite.#imageCache.has(this.src)) {
                this.image = Sprite.#imageCache.get(this.src);
                this.isLoaded = true;
                return;
            }

            // Check if already loading
            if (Sprite.#loadingSprites.has(this.src)) {
                this.image = await Sprite.#loadingSprites.get(this.src);
                this.isLoaded = true;
                return;
            }

            // Start new load
            const loadPromise = new Promise((resolve, reject) => {
                const img = new Image();
                
                img.onload = () => {
                    Sprite.#imageCache.set(this.src, img);
                    Sprite.#loadingSprites.delete(this.src);
                    resolve(img);
                };
                
                img.onerror = () => {
                    Sprite.#loadingSprites.delete(this.src);
                    reject(new SpriteError(`Failed to load sprite: ${this.src}`));
                };

                img.src = this.src;
            });

            Sprite.#loadingSprites.set(this.src, loadPromise);
            this.image = await loadPromise;
            this.isLoaded = true;

        } catch (error) {
            throw new SpriteError(`Sprite loading error: ${error.message}`);
        }
    }

    /**
     * Renders the sprite to a canvas context
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @throws {SpriteError} If sprite is not loaded or rendering fails
     */
    render(ctx, x, y) {
        if (!this.isLoaded || !this.image) {
            throw new SpriteError('Cannot render unloaded sprite');
        }

        try {
            ctx.save();
            
            // Apply transformations
            ctx.translate(x, y);
            ctx.rotate(this.rotation);
            ctx.scale(this.scale, this.scale);

            // Draw the sprite
            ctx.drawImage(
                this.image,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );

            ctx.restore();
        } catch (error) {
            throw new SpriteError(`Sprite rendering error: ${error.message}`);
        }
    }

    /**
     * Clears sprite from cache
     * @param {string} [src] - Optional specific sprite source to clear
     */
    static clearCache(src) {
        if (src) {
            Sprite.#imageCache.delete(src);
        } else {
            Sprite.#imageCache.clear();
        }
    }

    /**
     * Gets the current cache size
     * @returns {number} Number of cached sprites
     */
    static get cacheSize() {
        return Sprite.#imageCache.size;
    }

    /**
     * Releases sprite resources
     */
    dispose() {
        this.image = null;
        this.isLoaded = false;
    }
}

export default Sprite;