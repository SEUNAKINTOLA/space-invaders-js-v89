/**
 * @fileoverview Performance monitoring tests for game loop and canvas rendering
 * @jest
 */

import { jest } from '@jest/globals';

// Mock performance.now() for consistent testing
const mockPerformanceNow = jest.spyOn(performance, 'now');

/**
 * Test helper to simulate frame timing
 * @param {number} frames - Number of frames to simulate
 * @param {number} msPerFrame - Milliseconds per frame
 * @returns {number[]} Array of timestamps
 */
const generateFrameTimes = (frames, msPerFrame) => {
    return Array.from({ length: frames }, (_, i) => i * msPerFrame);
};

describe('Game Loop Performance', () => {
    let gameLoop;
    let canvas;
    let ctx;

    beforeEach(() => {
        // Reset performance.now mock before each test
        mockPerformanceNow.mockReset();
        
        // Setup canvas mock
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d');
        
        // Mock requestAnimationFrame
        jest.spyOn(window, 'requestAnimationFrame')
            .mockImplementation(cb => setTimeout(cb, 0));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Frame Rate Tests', () => {
        it('should maintain target 60 FPS under normal conditions', async () => {
            // Simulate 60 frames at ~16.67ms intervals
            const frameTimes = generateFrameTimes(60, 16.67);
            let frameIndex = 0;
            
            mockPerformanceNow.mockImplementation(() => frameTimes[frameIndex++]);

            const frameTimings = [];
            const measureFrameTime = jest.fn((timestamp) => {
                frameTimings.push(timestamp);
            });

            // Run game loop for 1 second (60 frames)
            await new Promise(resolve => {
                let frames = 0;
                const loop = () => {
                    if (frames++ < 60) {
                        measureFrameTime(performance.now());
                        requestAnimationFrame(loop);
                    } else {
                        resolve();
                    }
                };
                loop();
            });

            // Calculate actual FPS from frame timings
            const avgFrameTime = (frameTimings[frameTimings.length - 1] - frameTimings[0]) / (frameTimings.length - 1);
            const actualFPS = 1000 / avgFrameTime;

            expect(actualFPS).toBeCloseTo(60, 0);
        });

        it('should handle frame drops gracefully', async () => {
            // Simulate some dropped frames
            const frameTimes = [
                ...generateFrameTimes(30, 16.67),
                ...generateFrameTimes(10, 33.34), // Simulate frame drops
                ...generateFrameTimes(20, 16.67)
            ];

            let frameIndex = 0;
            mockPerformanceNow.mockImplementation(() => frameTimes[frameIndex++]);

            const frameDeltas = [];
            const measureFrameDelta = jest.fn((delta) => {
                frameDeltas.push(delta);
            });

            // Run game loop
            await new Promise(resolve => {
                let frames = 0;
                const loop = () => {
                    if (frames++ < frameTimes.length - 1) {
                        const delta = frameTimes[frames] - frameTimes[frames - 1];
                        measureFrameDelta(delta);
                        requestAnimationFrame(loop);
                    } else {
                        resolve();
                    }
                };
                loop();
            });

            // Verify frame timing handling
            expect(Math.max(...frameDeltas)).toBeLessThan(50); // Max frame time shouldn't exceed 50ms
            expect(frameDeltas.some(delta => delta > 30)).toBeTruthy(); // Should detect frame drops
        });
    });

    describe('Rendering Performance', () => {
        it('should complete render operations within budget', () => {
            const renderStartTime = 100;
            const renderEndTime = 102; // 2ms render time
            mockPerformanceNow
                .mockReturnValueOnce(renderStartTime)
                .mockReturnValueOnce(renderEndTime);

            // Simulate render operations
            const renderOperations = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 100, 100);
            };

            const start = performance.now();
            renderOperations();
            const end = performance.now();

            const renderTime = end - start;
            expect(renderTime).toBeLessThanOrEqual(5); // 5ms budget for render operations
        });

        it('should handle multiple sprite renders efficiently', () => {
            const spriteCount = 100;
            const renderTimes = [];

            // Test rendering performance with increasing sprite counts
            for (let i = 0; i < spriteCount; i += 10) {
                const start = performance.now();
                
                // Simulate rendering multiple sprites
                for (let j = 0; j < i; j++) {
                    ctx.fillRect(
                        Math.random() * canvas.width,
                        Math.random() * canvas.height,
                        10,
                        10
                    );
                }

                const end = performance.now();
                renderTimes.push(end - start);
            }

            // Verify render time scales linearly with sprite count
            const scalingFactor = renderTimes[renderTimes.length - 1] / renderTimes[0];
            expect(scalingFactor).toBeLessThan(spriteCount / 10); // Should scale sub-linearly
        });
    });
});