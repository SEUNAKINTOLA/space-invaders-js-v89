/**
 * @fileoverview Unit tests for the GameLoop class
 * @jest
 */

import { jest } from '@jest/globals';

// Mock requestAnimationFrame and cancelAnimationFrame globally
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

describe('GameLoop', () => {
    let GameLoop;
    let gameLoop;
    
    // Mock time-related functions
    const mockTime = {
        current: 0,
        advance(ms) {
            this.current += ms;
            return this.current;
        }
    };

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Mock performance.now()
        global.performance = {
            now: jest.fn(() => mockTime.current)
        };

        // Dynamic import to ensure clean module state for each test
        return import('../../../src/core/GameLoop.js').then(module => {
            GameLoop = module.default;
            gameLoop = new GameLoop();
        });
    });

    afterEach(() => {
        // Cleanup after each test
        if (gameLoop) {
            gameLoop.stop();
        }
        mockTime.current = 0;
    });

    describe('Constructor', () => {
        test('should initialize with default values', () => {
            expect(gameLoop.isRunning).toBe(false);
            expect(gameLoop.fps).toBe(60);
            expect(gameLoop.frameTime).toBe(1000 / 60);
        });

        test('should accept custom FPS', () => {
            const customGameLoop = new GameLoop(30);
            expect(customGameLoop.fps).toBe(30);
            expect(customGameLoop.frameTime).toBe(1000 / 30);
        });

        test('should throw error for invalid FPS', () => {
            expect(() => new GameLoop(0)).toThrow('FPS must be greater than 0');
            expect(() => new GameLoop(-1)).toThrow('FPS must be greater than 0');
        });
    });

    describe('Start/Stop', () => {
        test('should start the game loop', () => {
            const startSpy = jest.spyOn(gameLoop, 'start');
            gameLoop.start();
            
            expect(startSpy).toHaveBeenCalled();
            expect(gameLoop.isRunning).toBe(true);
            expect(global.requestAnimationFrame).toHaveBeenCalled();
        });

        test('should stop the game loop', () => {
            gameLoop.start();
            gameLoop.stop();
            
            expect(gameLoop.isRunning).toBe(false);
            expect(global.cancelAnimationFrame).toHaveBeenCalled();
        });

        test('should not start multiple loops', () => {
            gameLoop.start();
            const rafCallCount = global.requestAnimationFrame.mock.calls.length;
            gameLoop.start();
            
            expect(global.requestAnimationFrame.mock.calls.length).toBe(rafCallCount);
        });
    });

    describe('Update and Render', () => {
        let updateMock;
        let renderMock;

        beforeEach(() => {
            updateMock = jest.fn();
            renderMock = jest.fn();
            gameLoop.setUpdateFunction(updateMock);
            gameLoop.setRenderFunction(renderMock);
        });

        test('should call update and render with correct delta time', async () => {
            gameLoop.start();
            
            // Simulate frame time passing
            mockTime.advance(16.67); // Approximately 60 FPS
            
            // Wait for next frame
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(updateMock).toHaveBeenCalledWith(expect.any(Number));
            expect(renderMock).toHaveBeenCalled();
        });

        test('should maintain consistent update rate', async () => {
            gameLoop.start();
            
            // Simulate multiple frames
            for (let i = 0; i < 3; i++) {
                mockTime.advance(16.67);
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            
            expect(updateMock).toHaveBeenCalledTimes(3);
            expect(renderMock).toHaveBeenCalledTimes(3);
        });

        test('should handle large time gaps gracefully', async () => {
            gameLoop.start();
            
            // Simulate a large time gap (100ms)
            mockTime.advance(100);
            await new Promise(resolve => setTimeout(resolve, 0));
            
            // Should not update more than maxUpdates times
            expect(updateMock.mock.calls.length).toBeLessThanOrEqual(gameLoop.maxUpdates);
        });
    });

    describe('Error Handling', () => {
        test('should handle update function errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const errorMock = jest.fn(() => { throw new Error('Update error'); });
            
            gameLoop.setUpdateFunction(errorMock);
            gameLoop.start();
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            consoleSpy.mockRestore();
        });

        test('should handle render function errors', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const errorMock = jest.fn(() => { throw new Error('Render error'); });
            
            gameLoop.setRenderFunction(errorMock);
            gameLoop.start();
            
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('Performance', () => {
        test('should track FPS', async () => {
            gameLoop.start();
            
            // Simulate 60 frames passing
            for (let i = 0; i < 60; i++) {
                mockTime.advance(16.67);
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            
            expect(gameLoop.getCurrentFPS()).toBeCloseTo(60, 0);
        });

        test('should limit updates when frame time is too high', async () => {
            const updateMock = jest.fn();
            gameLoop.setUpdateFunction(updateMock);
            gameLoop.start();
            
            // Simulate a very long frame
            mockTime.advance(1000);
            await new Promise(resolve => setTimeout(resolve, 0));
            
            expect(updateMock.mock.calls.length).toBeLessThanOrEqual(gameLoop.maxUpdates);
        });
    });
});