/**
 * @fileoverview Unit tests for Sprite management system
 * @jest-environment jsdom
 */

import { Sprite } from '../../../src/graphics/Sprite';
import { TextureLoader } from '../../../src/graphics/TextureLoader';
import { SpriteError } from '../../../src/errors/SpriteError';

// Mock canvas and context for testing
const mockCanvas = document.createElement('canvas');
const mockContext = mockCanvas.getContext('2d');

// Mock TextureLoader
jest.mock('../../../src/graphics/TextureLoader');

describe('Sprite', () => {
    let sprite;
    const mockImageUrl = 'assets/test-sprite.png';
    
    // Mock image data
    const mockImageData = {
        width: 64,
        height: 64,
        src: mockImageUrl
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        // Reset canvas
        mockCanvas.width = 800;
        mockCanvas.height = 600;
        
        // Setup TextureLoader mock
        TextureLoader.load.mockResolvedValue(mockImageData);
    });

    describe('Constructor', () => {
        test('should create a sprite with valid parameters', () => {
            sprite = new Sprite(mockImageUrl, { x: 0, y: 0, width: 32, height: 32 });
            
            expect(sprite).toBeDefined();
            expect(sprite.url).toBe(mockImageUrl);
            expect(sprite.position).toEqual({ x: 0, y: 0 });
            expect(sprite.dimensions).toEqual({ width: 32, height: 32 });
        });

        test('should throw error with invalid URL', () => {
            expect(() => {
                new Sprite('', { x: 0, y: 0, width: 32, height: 32 });
            }).toThrow(SpriteError);
        });

        test('should throw error with invalid dimensions', () => {
            expect(() => {
                new Sprite(mockImageUrl, { x: 0, y: 0, width: -1, height: 32 });
            }).toThrow(SpriteError);
        });
    });

    describe('Loading', () => {
        test('should load sprite texture successfully', async () => {
            sprite = new Sprite(mockImageUrl, { x: 0, y: 0, width: 32, height: 32 });
            
            await expect(sprite.load()).resolves.toBe(true);
            expect(TextureLoader.load).toHaveBeenCalledWith(mockImageUrl);
        });

        test('should handle loading errors gracefully', async () => {
            TextureLoader.load.mockRejectedValue(new Error('Network error'));
            sprite = new Sprite(mockImageUrl, { x: 0, y: 0, width: 32, height: 32 });
            
            await expect(sprite.load()).rejects.toThrow(SpriteError);
        });

        test('should cache loaded textures', async () => {
            sprite = new Sprite(mockImageUrl, { x: 0, y: 0, width: 32, height: 32 });
            
            await sprite.load();
            await sprite.load(); // Second load should use cache
            
            expect(TextureLoader.load).toHaveBeenCalledTimes(1);
        });
    });

    describe('Rendering', () => {
        beforeEach(async () => {
            sprite = new Sprite(mockImageUrl, { x: 0, y: 0, width: 32, height: 32 });
            await sprite.load();
        });

        test('should render sprite correctly', () => {
            const renderSpy = jest.spyOn(mockContext, 'drawImage');
            
            sprite.render(mockContext);
            
            expect(renderSpy).toHaveBeenCalledWith(
                expect.any(Object),
                0, 0, 32, 32,
                0, 0, 32, 32
            );
        });

        test('should handle rendering with scale', () => {
            const renderSpy = jest.spyOn(mockContext, 'drawImage');
            sprite.setScale(2);
            
            sprite.render(mockContext);
            
            expect(renderSpy).toHaveBeenCalledWith(
                expect.any(Object),
                0, 0, 32, 32,
                0, 0, 64, 64
            );
        });

        test('should handle rendering with rotation', () => {
            const contextSaveSpy = jest.spyOn(mockContext, 'save');
            const contextRestoreSpy = jest.spyOn(mockContext, 'restore');
            const contextTranslateSpy = jest.spyOn(mockContext, 'translate');
            const contextRotateSpy = jest.spyOn(mockContext, 'rotate');
            
            sprite.setRotation(Math.PI / 2);
            sprite.render(mockContext);
            
            expect(contextSaveSpy).toHaveBeenCalled();
            expect(contextTranslateSpy).toHaveBeenCalled();
            expect(contextRotateSpy).toHaveBeenCalledWith(Math.PI / 2);
            expect(contextRestoreSpy).toHaveBeenCalled();
        });
    });

    describe('Animation', () => {
        test('should update animation frame correctly', () => {
            sprite = new Sprite(mockImageUrl, { x: 0, y: 0, width: 32, height: 32 });
            sprite.setAnimationFrames(4);
            
            sprite.updateAnimation(16); // 16ms delta time
            
            expect(sprite.currentFrame).toBe(0);
            sprite.updateAnimation(1000); // 1s delta time
            expect(sprite.currentFrame).toBe(1);
        });

        test('should loop animation correctly', () => {
            sprite = new Sprite(mockImageUrl, { x: 0, y: 0, width: 32, height: 32 });
            sprite.setAnimationFrames(2);
            sprite.setAnimationSpeed(100); // 100ms per frame
            
            // Simulate multiple frame updates
            for (let i = 0; i < 5; i++) {
                sprite.updateAnimation(100);
            }
            
            expect(sprite.currentFrame).toBe(1);
        });
    });

    describe('Memory Management', () => {
        test('should properly dispose resources', () => {
            sprite = new Sprite(mockImageUrl, { x: 0, y: 0, width: 32, height: 32 });
            const disposeSpy = jest.spyOn(sprite, 'dispose');
            
            sprite.dispose();
            
            expect(disposeSpy).toHaveBeenCalled();
            expect(sprite.texture).toBeNull();
        });
    });
});