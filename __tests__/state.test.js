const { expect, test, describe, beforeEach, afterEach, jest } = require('@jest/globals');
const { gameState } = require('../state.js');

// Mock THREE.js
global.THREE = {
    Vector3: function(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.copy = jest.fn(function(v) {
            this.x = v.x;
            this.y = v.y;
            this.z = v.z;
            return this;
        });
        this.set = jest.fn(function(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        });
        this.clone = jest.fn(function() {
            return { ...this };
        });
    }
};

describe('Game State Management', () => {
    // Mock localStorage
    const localStorageMock = (() => {
        let store = {};
        return {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, value) => {
                store[key] = value.toString();
            }),
            clear: jest.fn(() => {
                store = {};
            })
        };
    })();

    beforeAll(() => {
        // Mock THREE.js
        global.THREE = {
            Vector3: jest.fn((x, y, z) => ({ x, y, z }))
        };
        
        // Mock localStorage
        global.localStorage = localStorageMock;
    });

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        gameState.reset();
    });

    test('should initialize with default values', () => {
        expect(gameState.direction).toEqual({ x: 1, y: 0, z: 0 });
        expect(gameState.nextDirection).toEqual({ x: 1, y: 0, z: 0 });
        expect(gameState.snake).toHaveLength(1);
        expect(gameState.snake[0]).toEqual({ x: 0, y: 0, z: 0 });
        expect(gameState.score).toBe(0);
        expect(gameState.gameOver).toBe(false);
        expect(gameState.food).toBeNull();
    });

    test('should reset game state correctly', () => {
        // Change some values
        gameState.score = 10;
        gameState.gameOver = true;
        gameState.snake.push({ x: 1, y: 0, z: 0 });
        
        gameState.reset();
        
        expect(gameState.score).toBe(0);
        expect(gameState.gameOver).toBe(false);
        expect(gameState.snake).toHaveLength(1);
        expect(gameState.snake[0]).toEqual({ x: 0, y: 0, z: 0 });
    });

    test('should load high score from localStorage', () => {
        // Mock localStorage getItem
        localStorage.getItem.mockReturnValueOnce('100');
        
        // Re-import to trigger the high score loading
        jest.resetModules();
        const { gameState: newGameState } = require('../state.js');
        
        expect(newGameState.highScore).toBe(100);
        expect(localStorage.getItem).toHaveBeenCalledWith('snakeHighScore');
    });

    test('should handle missing high score in localStorage', () => {
        // Mock localStorage getItem to return null
        localStorage.getItem.mockReturnValueOnce(null);
        
        // Re-import to trigger the high score loading
        jest.resetModules();
        const { gameState: newGameState } = require('../state.js');
        
        expect(newGameState.highScore).toBe(0);
    });
});
