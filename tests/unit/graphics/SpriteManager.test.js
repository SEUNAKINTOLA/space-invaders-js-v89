/**
 * @jest-environment jsdom
 */

import { SpriteManager } from '../../../src/graphics/SpriteManager';
import { SpriteCacheError, SpriteLoadError } from '../../../src/graphics/errors';

/**
 * Mock implementation of Image for testing
 */
class MockImage {
  constructor() {
    this.src = '';
    this.onload = null;
    this.onerror = null;
  }

  // Helper to simulate successful image load
  simulateLoad() {
    if (this.onload) this.onload();
  }

  // Helper to simulate failed image load
  simulateError() {
    if (this.onerror) this.onerror(new Error('Image load failed'));
  }
}

describe('SpriteManager', () => {
  let spriteManager;
  let originalImage;

  beforeAll(() => {
    originalImage = global.Image;
    global.Image = MockImage;
  });

  afterAll(() => {
    global.Image = originalImage;
  });

  beforeEach(() => {
    spriteManager = new SpriteManager();
    jest.clearAllMocks();
  });

  describe('loadSprite', () => {
    it('should successfully load a sprite', async () => {
      const spriteId = 'player';
      const spritePath = 'assets/player.png';

      const loadPromise = spriteManager.loadSprite(spriteId, spritePath);
      
      // Simulate successful image load
      const mockImage = spriteManager.getLoadingSprite(spriteId);
      mockImage.simulateLoad();

      await expect(loadPromise).resolves.toBeTruthy();
      expect(spriteManager.hasSprite(spriteId)).toBe(true);
    });

    it('should throw SpriteLoadError when loading fails', async () => {
      const spriteId = 'enemy';
      const spritePath = 'assets/enemy.png';

      const loadPromise = spriteManager.loadSprite(spriteId, spritePath);
      
      // Simulate failed image load
      const mockImage = spriteManager.getLoadingSprite(spriteId);
      mockImage.simulateError();

      await expect(loadPromise).rejects.toThrow(SpriteLoadError);
    });

    it('should not allow duplicate sprite IDs', async () => {
      const spriteId = 'duplicate';
      const spritePath = 'assets/sprite.png';

      // Load first sprite
      const firstLoadPromise = spriteManager.loadSprite(spriteId, spritePath);
      spriteManager.getLoadingSprite(spriteId).simulateLoad();
      await firstLoadPromise;

      // Attempt to load second sprite with same ID
      await expect(
        spriteManager.loadSprite(spriteId, spritePath)
      ).rejects.toThrow('Sprite ID already exists');
    });
  });

  describe('getSprite', () => {
    it('should return cached sprite', async () => {
      const spriteId = 'item';
      const spritePath = 'assets/item.png';

      const loadPromise = spriteManager.loadSprite(spriteId, spritePath);
      spriteManager.getLoadingSprite(spriteId).simulateLoad();
      await loadPromise;

      const sprite = spriteManager.getSprite(spriteId);
      expect(sprite).toBeTruthy();
    });

    it('should throw SpriteCacheError for non-existent sprite', () => {
      expect(() => {
        spriteManager.getSprite('nonexistent');
      }).toThrow(SpriteCacheError);
    });
  });

  describe('unloadSprite', () => {
    it('should successfully unload a sprite', async () => {
      const spriteId = 'temporary';
      const spritePath = 'assets/temporary.png';

      const loadPromise = spriteManager.loadSprite(spriteId, spritePath);
      spriteManager.getLoadingSprite(spriteId).simulateLoad();
      await loadPromise;

      spriteManager.unloadSprite(spriteId);
      expect(spriteManager.hasSprite(spriteId)).toBe(false);
    });

    it('should handle unloading non-existent sprite gracefully', () => {
      expect(() => {
        spriteManager.unloadSprite('nonexistent');
      }).not.toThrow();
    });
  });

  describe('batch operations', () => {
    it('should load multiple sprites concurrently', async () => {
      const sprites = {
        player: 'assets/player.png',
        enemy: 'assets/enemy.png',
        item: 'assets/item.png'
      };

      const loadPromises = Object.entries(sprites).map(([id, path]) => {
        const promise = spriteManager.loadSprite(id, path);
        spriteManager.getLoadingSprite(id).simulateLoad();
        return promise;
      });

      await Promise.all(loadPromises);

      Object.keys(sprites).forEach(id => {
        expect(spriteManager.hasSprite(id)).toBe(true);
      });
    });

    it('should handle mixed success/failure in batch loading', async () => {
      const sprites = {
        success1: 'assets/success1.png',
        failure: 'assets/failure.png',
        success2: 'assets/success2.png'
      };

      const loadPromises = Object.entries(sprites).map(([id, path]) => {
        const promise = spriteManager.loadSprite(id, path);
        const mockImage = spriteManager.getLoadingSprite(id);
        
        if (id === 'failure') {
          mockImage.simulateError();
        } else {
          mockImage.simulateLoad();
        }
        
        return promise.catch(err => err);
      });

      const results = await Promise.all(loadPromises);

      expect(results[0]).toBeTruthy(); // success1
      expect(results[1]).toBeInstanceOf(SpriteLoadError); // failure
      expect(results[2]).toBeTruthy(); // success2
    });
  });

  describe('memory management', () => {
    it('should clear all sprites', async () => {
      const sprites = {
        sprite1: 'assets/sprite1.png',
        sprite2: 'assets/sprite2.png'
      };

      const loadPromises = Object.entries(sprites).map(([id, path]) => {
        const promise = spriteManager.loadSprite(id, path);
        spriteManager.getLoadingSprite(id).simulateLoad();
        return promise;
      });

      await Promise.all(loadPromises);
      spriteManager.clearAll();

      Object.keys(sprites).forEach(id => {
        expect(spriteManager.hasSprite(id)).toBe(false);
      });
    });
  });
});