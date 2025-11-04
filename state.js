// Game state management

// Mock THREE.js for testing if not available
if (typeof window === 'undefined' || !window.THREE) {
    global.THREE = {
        Vector3: function(x, y, z) {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
            this.copy = function(v) {
                this.x = v.x;
                this.y = v.y;
                this.z = v.z;
                return this;
            };
            this.set = function(x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
                return this;
            };
        }
    };
}

export const gameState = {
    // Snake state
    direction: null,
    nextDirection: null,
    snake: null,
    
    // Game state
    score: 0,
    highScore: 0, // Will be loaded from localStorage
    gameOver: false,
    
    // Food state
    food: null,
    
    // Game settings
    gridSize: 20,
    cellSize: 1,
    moveInterval: 200, // ms
    lastMoveTime: 0,
    
    // Initialize function to set up Three.js objects
    init: function() {
        this.direction = new window.THREE.Vector3(1, 0, 0);
        this.nextDirection = new window.THREE.Vector3(1, 0, 0);
        this.snake = [new window.THREE.Vector3(0, 0, 0)];
    },
    
    // Reset function to initialize the state
    reset: function() {
        this.direction = new window.THREE.Vector3(1, 0, 0);
        this.nextDirection = new window.THREE.Vector3(1, 0, 0);
        this.snake = [new window.THREE.Vector3(0, 0, 0)];
        this.score = 0;
        this.gameOver = false;
        this.food = null;
        this.lastMoveTime = 0;
    }
};

// Initialize the game state
gameState.init();

// Load high score from localStorage
gameState.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;