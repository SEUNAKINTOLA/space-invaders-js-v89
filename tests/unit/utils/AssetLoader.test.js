/**
 * @jest/vitest test suite for AssetLoader utility
 * Tests sprite management system functionality
 * 
 * @file AssetLoader.test.js
 */

import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import { AssetLoader } from '../../../src/utils/AssetLoader';

describe('AssetLoader', () => {
    let assetLoader;
    const mockImage = {
        src: '',
        onload: null,
        onerror: null,
    };

    // Mock global Image constructor
    global.Image = vi.fn(() => mockImage);

    beforeEach(() => {
        // Clear all mocks and create fresh instance
        vi.clearAllMocks();
        assetLoader = new AssetLoader();
    });

    afterEach(() => {
        // Clean up and reset cache
        assetLoader.clearCache();
    });

    describe('loadSprite', () => {
        test('should successfully load a sprite and cache it', async () => {
            const spriteUrl = 'path/to/sprite.png';
            const loadPromise = assetLoader.loadSprite(spriteUrl);

            // Simulate successful image load
            mockImage.onload();

            const sprite = await loadPromise;
            expect(sprite).toBeDefined();
            expect(assetLoader.isCached(spriteUrl)).toBe(true);
        });

        test('should handle sprite loading failure', async () => {
            const spriteUrl = 'invalid/path.png';
            const loadPromise = assetLoader.loadSprite(spriteUrl);

            // Simulate image load error
            mockImage.onerror(new Error('Failed to load image'));

            await expect(loadPromise).rejects.toThrow('Failed to load sprite');
        });

        test('should return cached sprite if already loaded', async () => {
            const spriteUrl = 'path/to/cached-sprite.png';
            
            // Load sprite first time
            const firstLoadPromise = assetLoader.loadSprite(spriteUrl);
            mockImage.onload();
            await firstLoadPromise;

            // Mock Image constructor to track if it's called again
            global.Image.mockClear();

            // Load same sprite second time
            const cachedSprite = await assetLoader.loadSprite(spriteUrl);
            
            expect(cachedSprite).toBeDefined();
            expect(global.Image).not.toHaveBeenCalled();
        });
    });

    describe('preloadSprites', () => {
        test('should preload multiple sprites successfully', async () => {
            const spriteUrls = [
                'path/to/sprite1.png',
                'path/to/sprite2.png',
                'path/to/sprite3.png'
            ];

            const preloadPromise = assetLoader.preloadSprites(spriteUrls);

            // Simulate successful loading of all sprites
            spriteUrls.forEach(() => {
                mockImage.onload();
            });

            await preloadPromise;

            spriteUrls.forEach(url => {
                expect(assetLoader.isCached(url)).toBe(true);
            });
        });

        test('should handle partial preload failures gracefully', async () => {
            const spriteUrls = [
                'path/to/sprite1.png',
                'invalid/sprite.png',
                'path/to/sprite3.png'
            ];

            const preloadPromise = assetLoader.preloadSprites(spriteUrls);

            // Simulate mixed success/failure scenario
            mockImage.onload(); // sprite1 succeeds
            mockImage.onerror(new Error('Failed to load')); // sprite2 fails
            mockImage.onload(); // sprite3 succeeds

            const results = await preloadPromise;

            expect(results.succeeded).toHaveLength(2);
            expect(results.failed).toHaveLength(1);
            expect(results.failed[0]).toBe('invalid/sprite.png');
        });
    });

    describe('cache management', () => {
        test('should clear cache successfully', async () => {
            const spriteUrl = 'path/to/sprite.png';
            
            const loadPromise = assetLoader.loadSprite(spriteUrl);
            mockImage.onload();
            await loadPromise;

            expect(assetLoader.isCached(spriteUrl)).toBe(true);
            
            assetLoader.clearCache();
            expect(assetLoader.isCached(spriteUrl)).toBe(false);
        });

        test('should remove individual sprite from cache', async () => {
            const spriteUrl = 'path/to/sprite.png';
            
            const loadPromise = assetLoader.loadSprite(spriteUrl);
            mockImage.onload();
            await loadPromise;

            assetLoader.removeFromCache(spriteUrl);
            expect(assetLoader.isCached(spriteUrl)).toBe(false);
        });

        test('should handle cache size limits', async () => {
            // Assuming cache limit is 100
            const maxCacheSize = 100;
            
            // Load more than the cache limit
            const promises = Array.from({ length: maxCacheSize + 10 }, (_, i) => 
                assetLoader.loadSprite(`sprite${i}.png`)
            );

            promises.forEach(() => mockImage.onload());
            await Promise.all(promises);

            expect(assetLoader.getCacheSize()).toBeLessThanOrEqual(maxCacheSize);
        });
    });

    describe('error handling', () => {
        test('should handle invalid sprite URLs', async () => {
            await expect(assetLoader.loadSprite('')).rejects.toThrow('Invalid sprite URL');
            await expect(assetLoader.loadSprite(null)).rejects.toThrow('Invalid sprite URL');
            await expect(assetLoader.loadSprite(undefined)).rejects.toThrow('Invalid sprite URL');
        });

        test('should handle network timeout', async () => {
            const spriteUrl = 'path/to/sprite.png';
            
            // Mock timeout scenario
            vi.useFakeTimers();
            const loadPromise = assetLoader.loadSprite(spriteUrl);
            
            vi.advanceTimersByTime(30000); // Advance past default timeout
            
            await expect(loadPromise).rejects.toThrow('Sprite loading timeout');
            vi.useRealTimers();
        });
    });

    describe('performance', () => {
        test('should handle concurrent loading efficiently', async () => {
            const spriteUrls = Array.from({ length: 50 }, (_, i) => `sprite${i}.png`);
            
            const startTime = performance.now();
            const loadPromises = spriteUrls.map(url => assetLoader.loadSprite(url));
            
            loadPromises.forEach(() => mockImage.onload());
            await Promise.all(loadPromises);
            
            const endTime = performance.now();
            const loadTime = endTime - startTime;
            
            expect(loadTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });
});