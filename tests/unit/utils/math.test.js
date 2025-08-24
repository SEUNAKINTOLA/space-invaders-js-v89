/**
 * @fileoverview Unit tests for math utility functions used in game engine
 * @jest-environment node
 */

describe('Math Utilities', () => {
  // Vector operations tests
  describe('Vector2D', () => {
    test('should correctly add two vectors', () => {
      const vec1 = { x: 1, y: 2 };
      const vec2 = { x: 3, y: 4 };
      const result = Vector2D.add(vec1, vec2);
      expect(result).toEqual({ x: 4, y: 6 });
    });

    test('should correctly subtract two vectors', () => {
      const vec1 = { x: 5, y: 3 };
      const vec2 = { x: 2, y: 1 };
      const result = Vector2D.subtract(vec1, vec2);
      expect(result).toEqual({ x: 3, y: 2 });
    });

    test('should calculate vector magnitude correctly', () => {
      const vec = { x: 3, y: 4 };
      const magnitude = Vector2D.magnitude(vec);
      expect(magnitude).toBe(5); // 3-4-5 triangle
    });

    test('should normalize vector correctly', () => {
      const vec = { x: 3, y: 4 };
      const normalized = Vector2D.normalize(vec);
      expect(normalized.x).toBeCloseTo(0.6);
      expect(normalized.y).toBeCloseTo(0.8);
    });
  });

  // Angle and rotation tests
  describe('Angle Operations', () => {
    test('should convert degrees to radians correctly', () => {
      expect(Angle.toRadians(180)).toBeCloseTo(Math.PI);
      expect(Angle.toRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(Angle.toRadians(360)).toBeCloseTo(2 * Math.PI);
    });

    test('should convert radians to degrees correctly', () => {
      expect(Angle.toDegrees(Math.PI)).toBeCloseTo(180);
      expect(Angle.toDegrees(Math.PI / 2)).toBeCloseTo(90);
      expect(Angle.toDegrees(2 * Math.PI)).toBeCloseTo(360);
    });

    test('should normalize angle to 0-360 range', () => {
      expect(Angle.normalize(400)).toBeCloseTo(40);
      expect(Angle.normalize(-45)).toBeCloseTo(315);
    });
  });

  // Collision detection tests
  describe('Collision Detection', () => {
    test('should detect point in rectangle collision', () => {
      const point = { x: 5, y: 5 };
      const rect = { x: 0, y: 0, width: 10, height: 10 };
      expect(Collision.pointInRect(point, rect)).toBe(true);
      
      const outsidePoint = { x: 15, y: 15 };
      expect(Collision.pointInRect(outsidePoint, rect)).toBe(false);
    });

    test('should detect rectangle overlap', () => {
      const rect1 = { x: 0, y: 0, width: 10, height: 10 };
      const rect2 = { x: 5, y: 5, width: 10, height: 10 };
      expect(Collision.rectOverlap(rect1, rect2)).toBe(true);

      const rect3 = { x: 20, y: 20, width: 10, height: 10 };
      expect(Collision.rectOverlap(rect1, rect3)).toBe(false);
    });
  });

  // Interpolation tests
  describe('Interpolation', () => {
    test('should perform linear interpolation correctly', () => {
      expect(Interpolation.lerp(0, 100, 0.5)).toBe(50);
      expect(Interpolation.lerp(0, 100, 0)).toBe(0);
      expect(Interpolation.lerp(0, 100, 1)).toBe(100);
    });

    test('should clamp values within range', () => {
      expect(Interpolation.clamp(150, 0, 100)).toBe(100);
      expect(Interpolation.clamp(-50, 0, 100)).toBe(0);
      expect(Interpolation.clamp(75, 0, 100)).toBe(75);
    });
  });

  // Random number generation tests
  describe('Random Number Generation', () => {
    test('should generate random integer within range', () => {
      const min = 1;
      const max = 10;
      for (let i = 0; i < 100; i++) {
        const result = Random.integerInRange(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    test('should generate random float within range', () => {
      const min = 0;
      const max = 1;
      for (let i = 0; i < 100; i++) {
        const result = Random.floatInRange(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
      }
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    test('should throw error for invalid vector operations', () => {
      expect(() => Vector2D.add(null, { x: 1, y: 1 }))
        .toThrow('Invalid vector parameters');
      expect(() => Vector2D.magnitude(null))
        .toThrow('Invalid vector parameter');
    });

    test('should throw error for invalid angle conversions', () => {
      expect(() => Angle.toRadians('invalid'))
        .toThrow('Invalid angle parameter');
      expect(() => Angle.toDegrees(null))
        .toThrow('Invalid angle parameter');
    });
  });
});