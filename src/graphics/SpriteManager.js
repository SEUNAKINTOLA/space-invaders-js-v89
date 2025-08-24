/**
 * @fileoverview Sprite Management System
 * Handles loading, caching, and rendering of sprites with efficient memory management
 * and error handling.
 * @module graphics/SpriteManager
 */

// Constants for configuration
const CONFIG = {
    MAX_CACHE_SIZE: 100, // Maximum number of sprites to cache
    DEFAULT_TIMEOUT: 5000, // Default timeout for sprite loading (ms)
    SUPPORTED_FORMATS: ['png', 'jpg', 'jpeg', 'webp']
};

/**
 * @typedef {Object} SpriteOptions
 * @property {number} [timeout] - Loading timeout in milliseconds
 * @property {boolean} [cache=true] - Whether to cache the sprite
 * @property {number} [priority=1] - Loading priority (1-5)
 */

/**
 * @typedef {Object} Sprite
 * @property {HTMLImageElement} image - The loaded image element
 * @property {string} id - Unique identifier for the sprite
 * @property {number} lastUsed - Timestamp of last usage
 */

/**
 * Manages sprite resources with efficient loading, caching, and memory management
 */
class SpriteManager {
    #spriteCache = new Map();
    #loadingPromises = new Map();
    #errorHandlers = new Set();

    /**
     * Creates a new SpriteManager instance
     * @param {Object} [options={}] - Configuration options
     * @param {number} [options.maxCacheSize] - Maximum cache size
     */
    constructor(options = {}) {
        this.maxCacheSize = options.maxCacheSize || CONFIG.MAX_CACHE_SIZE;
        this.#setupErrorHandling();
    }

    /**
     * Loads a sprite from the given URL
     * @param {string} url - The URL of the sprite to load
     * @param {SpriteOptions} [options={}] - Loading options
     * @returns {Promise<Sprite>} - Promise resolving to the loaded sprite
     * @throws {Error} If the sprite loading fails
     */
    async loadSprite(url, options = {}) {
        try {
            this.#validateUrl(url);

            // Check cache first
            if (options.cache !== false && this.#spriteCache.has(url)) {
                const sprite = this.#spriteCache.get(url);
                sprite.lastUsed = Date.now();
                return sprite;
            }

            // Check if already loading
            if (this.#loadingPromises.has(url)) {
                return this.#loadingPromises.get(url);
            }

            const loadPromise = this.#loadSpriteInternal(url, options);
            this.#loadingPromises.set(url, loadPromise);

            const sprite = await loadPromise;
            this.#loadingPromises.delete(url);

            if (options.cache !== false) {
                this.#addToCache(url, sprite);
            }

            return sprite;
        } catch (error) {
            this.#handleError(error);
            throw error;
        }
    }

    /**
     * Internal method to load a sprite
     * @private
     */
    #loadSpriteInternal(url, options) {
        return new Promise((resolve, reject) => {
            const timeout = options.timeout || CONFIG.DEFAULT_TIMEOUT;
            const timeoutId = setTimeout(() => {
                reject(new Error(`Sprite loading timeout: ${url}`));
            }, timeout);

            const image = new Image();
            
            image.onload = () => {
                clearTimeout(timeoutId);
                resolve({
                    image,
                    id: url,
                    lastUsed: Date.now()
                });
            };

            image.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load sprite: ${url}`));
            };

            image.src = url;
        });
    }

    /**
     * Adds an error handler
     * @param {Function} handler - Error handler callback
     */
    onError(handler) {
        if (typeof handler === 'function') {
            this.#errorHandlers.add(handler);
        }
    }

    /**
     * Removes a sprite from cache
     * @param {string} url - The URL of the sprite to remove
     */
    removeFromCache(url) {
        this.#spriteCache.delete(url);
    }

    /**
     * Clears the entire sprite cache
     */
    clearCache() {
        this.#spriteCache.clear();
        this.#loadingPromises.clear();
    }

    /**
     * Gets cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this.#spriteCache.size,
            maxSize: this.maxCacheSize,
            urls: Array.from(this.#spriteCache.keys())
        };
    }

    /**
     * Validates sprite URL
     * @private
     */
    #validateUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('Invalid sprite URL');
        }

        const extension = url.split('.').pop().toLowerCase();
        if (!CONFIG.SUPPORTED_FORMATS.includes(extension)) {
            throw new Error(`Unsupported sprite format: ${extension}`);
        }
    }

    /**
     * Adds sprite to cache with LRU management
     * @private
     */
    #addToCache(url, sprite) {
        if (this.#spriteCache.size >= this.maxCacheSize) {
            // Remove least recently used sprite
            let oldestUrl;
            let oldestTime = Infinity;

            for (const [key, value] of this.#spriteCache) {
                if (value.lastUsed < oldestTime) {
                    oldestTime = value.lastUsed;
                    oldestUrl = key;
                }
            }

            if (oldestUrl) {
                this.#spriteCache.delete(oldestUrl);
            }
        }

        this.#spriteCache.set(url, sprite);
    }

    /**
     * Sets up error handling
     * @private
     */
    #setupErrorHandling() {
        this.#errorHandlers.add((error) => {
            console.error('[SpriteManager]', error);
        });
    }

    /**
     * Handles errors by notifying all error handlers
     * @private
     */
    #handleError(error) {
        for (const handler of this.#errorHandlers) {
            try {
                handler(error);
            } catch (handlerError) {
                console.error('Error in sprite error handler:', handlerError);
            }
        }
    }
}

export default SpriteManager;