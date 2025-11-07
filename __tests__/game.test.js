// const { expect, test, describe, beforeEach, afterEach, jest } = require('@jest/globals');
const { SnakeGame } = require('../game.js');
const { gameState } = require('../state.js');

// // Mock THREE.js
// global.THREE = {
//     Vector3: function(x, y, z) {
//         this.x = x || 0;
//         this.y = y || 0;
//         this.z = z || 0;
//         this.copy = jest.fn(function(v) {
//             this.x = v.x;
//             this.y = v.y;
//             this.z = v.z;
//             return this;
//         });
//         this.set = jest.fn(function(x, y, z) {
//             this.x = x;
//             this.y = y;
//             this.z = z;
//             return this;
//         });
//         this.clone = jest.fn(function() {
//             return { ...this };
//         });
//     },
//     Scene: jest.fn(() => ({
//         add: jest.fn(),
//         remove: jest.fn()
//     })),
//     WebGLRenderer: jest.fn(() => ({
//         setSize: jest.fn(),
//         setPixelRatio: jest.fn(),
//         domElement: document.createElement('canvas'),
//         render: jest.fn()
//     })),
//     PerspectiveCamera: jest.fn(() => ({
//         position: { set: jest.fn() },
//         lookAt: jest.fn(),
//         updateProjectionMatrix: jest.fn()
//     })),
//     DirectionalLight: jest.fn(() => ({
//         position: { set: jest.fn() }
//     })),
//     AmbientLight: jest.fn(),
//     BoxGeometry: jest.fn(),
//     MeshStandardMaterial: jest.fn(),
//     Mesh: jest.fn(() => ({
//         position: { set: jest.fn() }
//     })),
//     OrbitControls: jest.fn()
// };

// Mock graphicsEngine
const mockGraphicsEngine = {
    init: jest.fn(),
    renderSnake: jest.fn(),
    renderFood: jest.fn(),
    update: jest.fn(),
    render: jest.fn(),
    onWindowResize: jest.fn(),
    scene: { add: jest.fn(), remove: jest.fn() },
    camera: { position: { set: jest.fn() } },
    controls: { reset: jest.fn() }
};

// Mock Howl
class MockHowl {
    constructor(config) {
        this.config = config;
        this.play = jest.fn();
        this.volume = jest.fn();
    }
}
global.Howl = MockHowl;

describe('Snake Game Mechanics', () => {
    let game;
    
    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="game-container"></div>
            <div id="game-overlay"></div>
            <div id="final-score"></div>
            <div id="final-high-score"></div>
            <button id="restart-button"></button>
            <input id="name-input" />
            <button id="submit-score"></button>
            <div id="score-form"></div>
            <div id="score-submitted"></div>
            <div id="high-score"></div>
            <div id="score"></div>
        `;
        
        // Mock localStorage
        global.localStorage = {
            getItem: jest.fn(),
            setItem: jest.fn()
        };
        
        // Mock fetch
        global.fetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            })
        );
        
        // Mock requestAnimationFrame
        global.requestAnimationFrame = (cb) => {
            setTimeout(() => cb(0), 0);
            return 1;
        };
        
        // Reset game state
        gameState.reset = jest.fn(() => {
            gameState.direction = new THREE.Vector3(1, 0, 0);
            gameState.nextDirection = new THREE.Vector3(1, 0, 0);
            gameState.snake = [new THREE.Vector3(0, 0, 0)];
            gameState.score = 0;
            gameState.gameOver = false;
            gameState.food = null;
            gameState.lastMoveTime = 0;
        });
        
        // Mock graphicsEngine module
        jest.mock('../graphics.js', () => ({
            graphicsEngine: mockGraphicsEngine
        }));
        
        // Create game instance
        game = new SnakeGame();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('Snake Movement', () => {
        test('should move snake in the current direction', () => {
            // Initial position is (0, 0, 0), moving right (1, 0, 0)
            game.updateSnake();
            expect(game.state.snake[0]).toEqual({ x: 1, y: 0, z: 0 });
            
            // Change direction to down (0, 0, 1)
            game.state.nextDirection.set(0, 0, 1);
            game.updateSnake();
            expect(game.state.snake[0]).toEqual({ x: 1, y: 0, z: 1 });
        });
        
        test('should prevent 180-degree turns', () => {
            // Moving right (1, 0, 0)
            game.updateSnake();
            
            // Try to turn left (which would be a 180-degree turn)
            game.state.nextDirection.set(-1, 0, 0);
            game.updateSnake();
            
            // Should still be moving right
            expect(game.state.snake[0]).toEqual({ x: 2, y: 0, z: 0 });
        });
    });
    
    describe('Collision Detection', () => {
        test('should detect wall collision', () => {
            // Move snake to the right edge
            const halfGrid = game.state.gridSize / 2;
            game.state.snake[0].x = halfGrid;
            game.state.direction.set(1, 0, 0);
            
            game.updateSnake();
            
            // Should call showGameOver due to wall collision
            expect(game.state.gameOver).toBe(true);
        });
        
        test('should detect self collision', () => {
            // Create a snake with 3 segments
            game.state.snake = [
                { x: 1, y: 0, z: 0 },
                { x: 0, y: 0, z: 0 },
                { x: 0, y: 0, z: 1 },
                { x: 1, y: 0, z: 1 },
                { x: 1, y: 0, z: 0 }  // This will collide with the head
            ];
            
            // Set direction to left to cause collision
            game.state.direction.set(-1, 0, 0);
            game.updateSnake();
            
            // Should call showGameOver due to self collision
            expect(game.state.gameOver).toBe(true);
        });
    });
    
    describe('Food Mechanics', () => {
        test('should spawn food at valid position', () => {
            // Mock Math.random to return a fixed position
            const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);
            
            // Test with empty snake
            game.state.snake = [new THREE.Vector3(0, 0, 0)];
            game.spawnFood();
            
            // Should set food position
            expect(game.state.food).toBeDefined();
            expect(game.state.food.position).toBeDefined();
            
            // Clean up
            mockRandom.mockRestore();
        });
        
        test('should eat food and grow when colliding with food', () => {
            // Place food at (1, 0, 0)
            game.state.food = { position: { x: 1, y: 0, z: 0 } };
            
            // Initial snake length
            const initialLength = game.state.snake.length;
            
            // Move right to eat food
            game.state.direction.set(1, 0, 0);
            game.updateSnake();
            
            // Snake should grow by 1 segment
            expect(game.state.snake.length).toBe(initialLength + 1);
            
            // Score should increase by 1
            expect(game.state.score).toBe(1);
            
            // New food should be spawned
            expect(mockGraphicsEngine.renderFood).toHaveBeenCalled();
        });
    });
    
    describe('Score Submission', () => {
        test('should submit score with player name', async () => {
            // Mock fetch response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });
            
            // Set up test data
            game.state.score = 42;
            game.nameInput.value = 'Test Player';
            
            // Trigger score submission
            await game.submitScore();
            
            // Check if fetch was called with correct data
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Test Player',
                    score: 42
                })
            });
            
            // Check if UI was updated
            expect(game.submitButton.textContent).toBe('Score Submitted!');
            expect(game.submitButton.disabled).toBe(true);
        });
    });
});
