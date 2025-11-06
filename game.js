import { gameState } from './state.js';
import { graphicsEngine } from './graphics.js';

export class SnakeGame {
    constructor() {
        // Import game state
        this.state = gameState;
        this.animationFrameId = null;
        this.lastFrameTime = 0;
        this.scores = JSON.parse(localStorage.getItem('snakeScores') || '[]');
        
        // Initialize sounds
        this.initSounds();
        
        // Initialize game state
        this.state.highScore = this.loadHighScore();
        this.state.reset();
        
        // Initialize graphics engine
        graphicsEngine.init('game-container');
        this.spawnFood();
        
        // Initialize UI
        this.gameOverlay = document.getElementById('game-overlay');
        this.finalScoreElement = document.getElementById('final-score');
        this.finalHighScoreElement = document.getElementById('final-high-score');
        this.restartButton = document.getElementById('restart-button');
        this.nameInput = document.getElementById('name-input');
        this.submitButton = document.getElementById('submit-score');
        this.scoreForm = document.getElementById('score-form');
        this.scoreSubmitted = document.getElementById('score-submitted');
        
        this.restartButton.addEventListener('click', () => this.resetGame());
        this.submitButton.addEventListener('click', () => this.submitScore());
        this.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitScore();
            }
        });
        
        // Display initial high score
        document.getElementById('high-score').textContent = `High Score: ${this.state.highScore}`;
        
        // Start game loop
        this.animate(0);
        
        // Event listeners
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    

    
    initSounds() {
        console.log('Initializing sounds...');
        
        // Initialize sound effects with error handling
        this.sounds = {
            eat: new Howl({
                src: ['sounds/eat.mp3'],
                volume: 0.7,
                onload: () => console.log('Eat sound loaded'),
                onloaderror: (id, err) => console.error('Error loading eat sound:', err),
                onplayerror: (id, err) => console.error('Error playing eat sound:', err)
            }),
            gameOver: new Howl({
                src: ['sounds/gameover.mp3'],
                volume: 0.7,
                onload: () => console.log('Game over sound loaded'),
                onloaderror: (id, err) => console.error('Error loading game over sound:', err)
            }),
            backgroundMusic: new Howl({
                src: ['sounds/background.mp3'],
                volume: 0.3,
                loop: true,
                onload: () => {
                    console.log('Background music loaded, attempting to play...');
                    // Try to play, but don't worry if it fails due to autoplay policy
                    this.playBackgroundMusic();
                },
                onloaderror: (id, err) => console.error('Error loading background music:', err),
                onplay: () => console.log('Background music started playing'),
                onplayerror: (id, err) => {
                    console.log('Autoplay prevented, will play after user interaction');
                    // Set up a one-time click handler to start music
                    const playOnInteraction = () => {
                        console.log('User interaction detected, trying to play music...');
                        this.playBackgroundMusic();
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('keydown', playOnInteraction);
                    };
                    document.addEventListener('click', playOnInteraction, { once: true });
                    document.addEventListener('keydown', playOnInteraction, { once: true });
                }
            })
        };
    }
    
    playBackgroundMusic() {
        if (!this.sounds || !this.sounds.backgroundMusic) {
            console.log('Background music not initialized yet');
            return;
        }
        
        try {
            // Use a more reliable way to check if sound is already playing
            const soundId = this.sounds.backgroundMusic.play();
            
            // If play() returns a number (sound ID), it means it's playing
            if (typeof soundId === 'number') {
                console.log('Background music started playing with ID:', soundId);
            } else if (soundId && typeof soundId.then === 'function') {
                // Handle promise if returned (for newer browsers)
                soundId.then(() => {
                    console.log('Background music started playing after promise resolution');
                }).catch(err => {
                    console.log('Background music play was prevented:', err);
                });
            }
        } catch (err) {
            // Don't log the error if it's just an autoplay prevention
            if (err && err.name === 'NotAllowedError') {
                console.log('Autoplay was prevented by the browser');
            } else {
                console.error('Error playing background music:', err);
            }
        }
    }
    
    spawnFood() {
        // Create new food at random position
        const x = Math.floor(Math.random() * this.state.gridSize - this.state.gridSize/2);
        const z = Math.floor(Math.random() * this.state.gridSize - this.state.gridSize/2);
        
        // Make sure food doesn't spawn on snake
        const foodPos = new THREE.Vector3(x, 0, z);
        const isOnSnake = this.state.snake.some(segment => 
            segment.x === foodPos.x && segment.z === foodPos.z
        );
        
        if (isOnSnake) {
            // If food would spawn on snake, try again
            return this.spawnFood();
        }
        
        // Update food position in state
        this.state.food = { position: foodPos };
        graphicsEngine.renderFood();
    }
    
    handleKeyDown(event) {
        // Prevent 180-degree turns
        switch(event.key) {
            // Arrow keys
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.state.direction.z !== 1) this.state.nextDirection.set(0, 0, -1);
                break;
                
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.state.direction.z !== -1) this.state.nextDirection.set(0, 0, 1);
                break;
                
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.state.direction.x !== 1) this.state.nextDirection.set(-1, 0, 0);
                break;
                
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.state.direction.x !== -1) this.state.nextDirection.set(1, 0, 0);
                break;
        }
    }
    
    updateSnake() {
        // Update direction
        this.state.direction.copy(this.state.nextDirection);
        
        // Calculate new head position
        const head = this.state.snake[0].clone();
        head.x += this.state.direction.x;
        head.z += this.state.direction.z;
        
        // Check for collisions with walls
        const halfGrid = this.state.gridSize / 2;
        if (Math.abs(head.x) > halfGrid || Math.abs(head.z) > halfGrid) {
            this.showGameOver();
            return;
        }
        
        // Check for collisions with self
        if (this.state.snake.some(segment => segment.x === head.x && segment.z === head.z)) {
            this.showGameOver();
            return;
        }
        
        // Add new head
        this.state.snake.unshift(head);
        
        // Check for food collision
        if (this.state.food && head.x === this.state.food.position.x && head.z === this.state.food.position.z) {
            // Play eat sound and update score
            this.sounds.eat.play();
            this.state.score++;
            document.getElementById('score').textContent = `Score: ${this.state.score}`;
            
            // Spawn new food
            this.spawnFood();
            
            // Increase speed slightly (up to a point)
            if (this.state.moveInterval > 100) {
                this.state.moveInterval -= 5;
            }
        } else {
            // Remove tail if no food was eaten
            this.state.snake.pop();
        }
        
        // Update the snake's visual representation
        graphicsEngine.renderSnake();
    }
    
    update(deltaTime) {
        if (this.state.gameOver) {
            return;
        }
        
        // Move snake at regular intervals
        if (Date.now() - this.state.lastMoveTime > this.state.moveInterval) {
            this.updateSnake();
            this.state.lastMoveTime = Date.now();
        }
    }
    
    loadHighScore() {
        return parseInt(localStorage.getItem('snakeHighScore')) || 0;
    }
    
    saveHighScore(score) {
        localStorage.setItem('snakeHighScore', score);
    }
    
    updateHighScore() {
        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            this.saveHighScore(this.state.highScore);
            document.getElementById('high-score').textContent = `High Score: ${this.state.highScore}`;
            return true;
        }
        return false;
    }
    
    saveScores() {
        localStorage.setItem('snakeScores', JSON.stringify(this.scores));
    }
    // comment
    async submitScore() {
        console.log('Submitting score...');
        const name = this.nameInput.value.trim();
        if (!name) {
            alert('Please enter your name');
            return;
        }
        
        // Disable the submit button to prevent multiple submissions
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Submitting...';
        
        try {
            // Prepare the score data
            const scoreData = {
                name: name,
                score: this.state.score,
                timestamp: new Date().toISOString()
            };
            
            // Send the score to the leaderboard API
            const response = await fetch('http://localhost:3000/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: scoreData.name,
                    score: scoreData.score
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Add to local scores if API call is successful
            this.scores.push(scoreData);
            // Keep only top 10 scores
            this.scores.sort((a, b) => b.score - a.score);
            this.scores = this.scores.slice(0, 10);
            
            // Save to local storage
            this.saveScores();
            
            // Update UI
            this.submitButton.textContent = 'Score Submitted!';
            this.scoreForm.style.display = 'none';
            this.scoreSubmitted.style.display = 'block';
            
        } catch (error) {
            console.error('Error submitting score:', error);
            alert('Failed to submit score. Please try again later.');
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Submit Score';
        }
    }
    
    showGameOver() {
        console.log('Game over triggered');
        this.state.gameOver = true;
        const isNewHighScore = this.updateHighScore();
        this.finalScoreElement.textContent = this.state.score;
        this.finalHighScoreElement.textContent = this.state.highScore;
        
        // Reset form state
        this.nameInput.value = '';
        this.scoreForm.style.display = 'block';
        this.scoreSubmitted.style.display = 'none';
        
        this.gameOverlay.classList.add('visible');
        
        // Play game over sound
        try {
            console.log('Attempting to play game over sound');
            this.sounds.gameOver.play();
        } catch (err) {
            console.error('Error playing game over sound:', err);
        }
        
        // Lower background music volume
        try {
            if (this.sounds.backgroundMusic) {
                console.log('Lowering background music volume');
                this.sounds.backgroundMusic.volume(0.1);
            }
        } catch (err) {
            console.error('Error adjusting background music volume:', err);
        }
    }
    
    resetGame() {
        // Reset game state using the state object's reset method
        this.state.reset();
        this.state.highScore = this.loadHighScore();
        document.getElementById('score').textContent = 'Score: 0';
        document.getElementById('high-score').textContent = `High Score: ${this.state.highScore}`;
        this.gameOverlay.classList.remove('visible');
        
        // Reset background music volume and try to play again
        if (this.sounds && this.sounds.backgroundMusic) {
            this.sounds.backgroundMusic.volume(0.3);
            this.playBackgroundMusic();
        }
        
        // Clear existing food and spawn new one
        if (this.state.food) {
            graphicsEngine.scene.remove(graphicsEngine.foodMesh);
            this.state.food = null;
        }
        this.spawnFood();
        
        // Reset camera position
        graphicsEngine.camera.position.set(0, 30, 30);
        graphicsEngine.controls.reset();
    }
    

    
    onWindowResize() {
        graphicsEngine.onWindowResize();
    }
    
    animate(time) {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
        
        const deltaTime = time - (this.lastFrameTime || 0);
        this.lastFrameTime = time;
        
        if (!this.state.gameOver) {
            this.update(deltaTime);
            graphicsEngine.update(deltaTime);
        }
        
        graphicsEngine.render();
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize the game once
    if (!window.snakeGameInstance) {
        window.snakeGameInstance = new SnakeGame();
    }
});