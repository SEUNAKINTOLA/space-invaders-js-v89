/**
 * @jest/vitest test suite for Animation system
 * @file Animation.test.js
 * @description Unit tests for sprite animation management and rendering
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { Animation } from '../../../src/graphics/Animation';
import { Sprite } from '../../../src/graphics/Sprite';
import { AnimationError } from '../../../src/errors/AnimationError';

describe('Animation System', () => {
    let animation;
    let mockSprite;
    let mockCanvas;
    let mockContext;

    beforeEach(() => {
        // Mock canvas and context
        mockCanvas = document.createElement('canvas');
        mockContext = mockCanvas.getContext('2d');
        
        // Mock sprite
        mockSprite = new Sprite({
            width: 32,
            height: 32,
            frameCount: 4,
            frameDuration: 100
        });

        // Initialize animation instance
        animation = new Animation({
            sprite: mockSprite,
            context: mockContext
        });

        // Spy on context methods
        vi.spyOn(mockContext, 'drawImage');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should create animation instance with valid parameters', () => {
            expect(animation).toBeInstanceOf(Animation);
            expect(animation.isPlaying).toBe(false);
            expect(animation.currentFrame).toBe(0);
        });

        test('should throw error when initialized without required parameters', () => {
            expect(() => new Animation()).toThrow(AnimationError);
            expect(() => new Animation({ sprite: null })).toThrow(AnimationError);
        });
    });

    describe('Animation Control', () => {
        test('should start animation when play is called', () => {
            animation.play();
            expect(animation.isPlaying).toBe(true);
        });

        test('should stop animation when stop is called', () => {
            animation.play();
            animation.stop();
            expect(animation.isPlaying).toBe(false);
        });

        test('should pause animation when pause is called', () => {
            animation.play();
            animation.pause();
            expect(animation.isPlaying).toBe(false);
            expect(animation.isPaused).toBe(true);
        });

        test('should reset to initial frame when reset is called', () => {
            animation.currentFrame = 2;
            animation.reset();
            expect(animation.currentFrame).toBe(0);
        });
    });

    describe('Frame Management', () => {
        test('should advance to next frame correctly', () => {
            const initialFrame = animation.currentFrame;
            animation.nextFrame();
            expect(animation.currentFrame).toBe(initialFrame + 1);
        });

        test('should loop back to first frame after last frame', () => {
            animation.currentFrame = mockSprite.frameCount - 1;
            animation.nextFrame();
            expect(animation.currentFrame).toBe(0);
        });

        test('should set frame within valid range', () => {
            expect(() => animation.setFrame(-1)).toThrow(AnimationError);
            expect(() => animation.setFrame(mockSprite.frameCount)).toThrow(AnimationError);
            
            animation.setFrame(2);
            expect(animation.currentFrame).toBe(2);
        });
    });

    describe('Rendering', () => {
        test('should call context.drawImage with correct parameters', () => {
            animation.render();
            expect(mockContext.drawImage).toHaveBeenCalledTimes(1);
            expect(mockContext.drawImage).toHaveBeenCalledWith(
                mockSprite.image,
                animation.currentFrame * mockSprite.width,
                0,
                mockSprite.width,
                mockSprite.height,
                0,
                0,
                mockSprite.width,
                mockSprite.height
            );
        });

        test('should handle rendering errors gracefully', () => {
            mockContext.drawImage.mockImplementationOnce(() => {
                throw new Error('Canvas error');
            });

            expect(() => animation.render()).not.toThrow();
            // Should log error but not crash
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Performance', () => {
        test('should maintain consistent frame timing', async () => {
            const frameDuration = mockSprite.frameDuration;
            const startTime = performance.now();
            
            animation.play();
            await new Promise(resolve => setTimeout(resolve, frameDuration * 2));
            
            const elapsedFrames = Math.floor((performance.now() - startTime) / frameDuration);
            expect(animation.currentFrame).toBe(elapsedFrames % mockSprite.frameCount);
        });
    });

    describe('Resource Management', () => {
        test('should clean up resources when destroyed', () => {
            const cleanupSpy = vi.spyOn(animation, 'cleanup');
            animation.destroy();
            
            expect(cleanupSpy).toHaveBeenCalled();
            expect(animation.isPlaying).toBe(false);
            expect(animation.sprite).toBeNull();
        });
    });
});