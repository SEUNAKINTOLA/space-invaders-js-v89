/**
 * @fileoverview Asset Loader utility for managing sprite loading, caching, and rendering
 * @module AssetLoader
 */

// Constants for configuration
const CONFIG = {
  MAX_CACHE_SIZE: 100,  // Maximum number of sprites to cache
  DEFAULT_TIMEOUT: 30000, // Default timeout for loading assets (30s)
  SUPPORTED_FORMATS: ['png', 'jpg', 'jpeg', 'webp', 'svg']
};

/**
 * Error class for asset loading related errors
 * @extends Error
 */
class AssetLoadError extends Error {
  constructor(message, assetUrl) {
    super(message);
    this.name = 'AssetLoadError';
    this.assetUrl = assetUrl;
  }
}

/**
 * Manages sprite assets loading, caching, and rendering
 * @class AssetLoader
 */
class AssetLoader {
  constructor(options = {}) {
    this.cache = new Map();
    this.loading = new Map();
    this.options = {
      maxCacheSize: options.maxCacheSize || CONFIG.MAX_CACHE_SIZE,
      timeout: options.timeout || CONFIG.DEFAULT_TIMEOUT,
      supportedFormats: options.supportedFormats || CONFIG.SUPPORTED_FORMATS
    };

    // Bind methods
    this.loadSprite = this.loadSprite.bind(this);
    this.getSprite = this.getSprite.bind(this);
    this.clearCache = this.clearCache.bind(this);
  }

  /**
   * Validates the asset URL format
   * @private
   * @param {string} url - The URL of the asset to validate
   * @throws {AssetLoadError} If the URL format is invalid
   */
  _validateAssetUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new AssetLoadError('Invalid asset URL', url);
    }

    const extension = url.split('.').pop().toLowerCase();
    if (!this.options.supportedFormats.includes(extension)) {
      throw new AssetLoadError(
        `Unsupported file format: ${extension}. Supported formats: ${this.options.supportedFormats.join(', ')}`,
        url
      );
    }
  }

  /**
   * Creates a timeout promise
   * @private
   * @param {number} ms - Timeout in milliseconds
   * @returns {Promise} Promise that rejects after timeout
   */
  _createTimeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new AssetLoadError('Asset loading timeout', null));
      }, ms);
    });
  }

  /**
   * Manages cache size by removing least recently used items
   * @private
   */
  _manageCacheSize() {
    if (this.cache.size > this.options.maxCacheSize) {
      const [firstKey] = this.cache.keys();
      this.cache.delete(firstKey);
    }
  }

  /**
   * Loads a sprite from the given URL
   * @async
   * @param {string} url - The URL of the sprite to load
   * @returns {Promise<HTMLImageElement>} Promise resolving to the loaded image
   * @throws {AssetLoadError} If loading fails
   */
  async loadSprite(url) {
    try {
      this._validateAssetUrl(url);

      // Return cached sprite if available
      if (this.cache.has(url)) {
        return this.cache.get(url);
      }

      // Return existing loading promise if the sprite is already being loaded
      if (this.loading.has(url)) {
        return this.loading.get(url);
      }

      const loadPromise = new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          this.cache.set(url, img);
          this.loading.delete(url);
          this._manageCacheSize();
          resolve(img);
        };

        img.onerror = () => {
          this.loading.delete(url);
          reject(new AssetLoadError('Failed to load sprite', url));
        };

        img.src = url;
      });

      // Race between loading and timeout
      const timeoutPromise = this._createTimeout(this.options.timeout);
      this.loading.set(url, loadPromise);

      return await Promise.race([loadPromise, timeoutPromise]);

    } catch (error) {
      if (error instanceof AssetLoadError) {
        throw error;
      }
      throw new AssetLoadError(`Failed to load sprite: ${error.message}`, url);
    }
  }

  /**
   * Gets a sprite from cache or loads it if not cached
   * @param {string} url - The URL of the sprite
   * @returns {Promise<HTMLImageElement>} Promise resolving to the sprite
   */
  async getSprite(url) {
    return this.loadSprite(url);
  }

  /**
   * Preloads multiple sprites
   * @param {string[]} urls - Array of sprite URLs to preload
   * @returns {Promise<HTMLImageElement[]>} Promise resolving to array of loaded sprites
   */
  async preloadSprites(urls) {
    try {
      return await Promise.all(urls.map(url => this.loadSprite(url)));
    } catch (error) {
      throw new AssetLoadError('Failed to preload sprites', urls);
    }
  }

  /**
   * Clears the sprite cache
   */
  clearCache() {
    this.cache.clear();
    this.loading.clear();
  }

  /**
   * Gets the current cache size
   * @returns {number} Current number of cached sprites
   */
  get cacheSize() {
    return this.cache.size;
  }

  /**
   * Checks if a sprite is cached
   * @param {string} url - The URL of the sprite
   * @returns {boolean} True if sprite is cached
   */
  isCached(url) {
    return this.cache.has(url);
  }
}

export default AssetLoader;