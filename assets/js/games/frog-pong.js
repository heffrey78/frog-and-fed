// Frog Pong Game - The Frog and The Fed

class FrogPongGame {
    constructor() {
        this.canvas = document.getElementById('frogPongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'stopped'; // stopped, playing, paused
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.highScore = 0;

        // Game objects
        this.paddle = {
            x: 0,
            y: 0,
            width: 100,
            height: 15,
            speed: 8
        };

        this.ball = {
            x: 0,
            y: 0,
            radius: 10,
            dx: 4,
            dy: 4,
            emoji: '🐸'
        };

        this.powerUps = [];
        this.particles = [];

        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0 };

        this.init();
        this.loadHighScore();
    }

    init() {
        this.canvas.width = 800;
        this.canvas.height = 400;

        this.paddle.x = this.canvas.width / 2 - this.paddle.width / 2;
        this.paddle.y = this.canvas.height - 30;

        this.resetBall();
        this.bindEvents();
    }

    bindEvents() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState !== 'playing') return;
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.paddle.x = this.mouse.x - this.paddle.width / 2;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
        });

        // Touch controls
        this.canvas.addEventListener('touchmove', (e) => {
            if (this.gameState !== 'playing') return;
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouse.x = touch.clientX - rect.left;
            this.paddle.x = this.mouse.x - this.paddle.width / 2;
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));
        });
    }

    start() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.powerUps = [];
        this.particles = [];
        this.resetBall();
        this.gameLoop();

        // Track game start
        if (window.timelineSystem) {
            window.timelineSystem.trackInteraction('game_started', {
                game: 'frogPong'
            });
        }
    }

    pause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.gameLoop();
        }
    }

    reset() {
        this.gameState = 'stopped';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.powerUps = [];
        this.particles = [];
        this.resetBall();
        this.draw();
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = (Math.random() > 0.5 ? 1 : -1) * (3 + this.level * 0.5);
        this.ball.dy = 4 + this.level * 0.3;
    }

    gameLoop() {
        if (this.gameState !== 'playing') return;

        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Handle keyboard input
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.paddle.x += this.paddle.speed;
        }

        // Keep paddle in bounds
        this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));

        // Update ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball collision with walls
        if (this.ball.x <= this.ball.radius || this.ball.x >= this.canvas.width - this.ball.radius) {
            this.ball.dx = -this.ball.dx;
            this.createParticles(this.ball.x, this.ball.y, '💥');
        }

        if (this.ball.y <= this.ball.radius) {
            this.ball.dy = -this.ball.dy;
            this.createParticles(this.ball.x, this.ball.y, '✨');
        }

        // Ball collision with paddle
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width &&
            this.ball.dy > 0) {

            // Calculate hit position for angle
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degree angle

            const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
            this.ball.dx = Math.sin(angle) * speed;
            this.ball.dy = -Math.cos(angle) * speed;

            this.score += 10;
            this.createParticles(this.ball.x, this.ball.y, '🎉');

            // Spawn power-up occasionally
            if (Math.random() < 0.1) {
                this.spawnPowerUp();
            }
        }

        // Ball missed paddle
        if (this.ball.y > this.canvas.height) {
            this.lives--;
            this.createParticles(this.ball.x, this.canvas.height, '💔');

            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.resetBall();
            }
        }

        // Update power-ups
        this.updatePowerUps();

        // Update particles
        this.updateParticles();

        // Level progression
        if (this.score > 0 && this.score % 500 === 0 && this.score / 500 === this.level) {
            this.level++;
            this.createParticles(this.canvas.width / 2, this.canvas.height / 2, '⭐');
        }
    }

    createParticles(x, y, emoji) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 6,
                dy: (Math.random() - 0.5) * 6,
                emoji: emoji,
                life: 60,
                maxLife: 60
            });
        }
    }

    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.dy += 0.1; // Gravity
            particle.life--;

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    spawnPowerUp() {
        const powerUpTypes = [
            { emoji: '⚡', type: 'speed', effect: 'Faster ball!' },
            { emoji: '🛡️', type: 'shield', effect: 'Extra life!' },
            { emoji: '🎯', type: 'magnet', effect: 'Magnetic paddle!' },
            { emoji: '❄️', type: 'slow', effect: 'Slower ball!' }
        ];

        const powerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        this.powerUps.push({
            x: Math.random() * (this.canvas.width - 30),
            y: 50,
            width: 30,
            height: 30,
            dy: 2,
            ...powerUp
        });
    }

    updatePowerUps() {
        this.powerUps.forEach((powerUp, index) => {
            powerUp.y += powerUp.dy;

            // Check collision with paddle
            if (powerUp.y + powerUp.height >= this.paddle.y &&
                powerUp.x < this.paddle.x + this.paddle.width &&
                powerUp.x + powerUp.width > this.paddle.x) {

                this.activatePowerUp(powerUp);
                this.powerUps.splice(index, 1);
            }

            // Remove if off screen
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(index, 1);
            }
        });
    }

    activatePowerUp(powerUp) {
        this.createParticles(powerUp.x + 15, powerUp.y + 15, powerUp.emoji);

        switch (powerUp.type) {
            case 'speed':
                this.ball.dx *= 1.3;
                this.ball.dy *= 1.3;
                this.score += 50;
                break;
            case 'shield':
                this.lives++;
                this.score += 100;
                break;
            case 'magnet':
                // Magnetic effect for 5 seconds
                setTimeout(() => {
                    if (this.gameState === 'playing') {
                        const dx = this.paddle.x + this.paddle.width / 2 - this.ball.x;
                        this.ball.dx += dx * 0.05;
                    }
                }, 100);
                this.score += 75;
                break;
            case 'slow':
                this.ball.dx *= 0.7;
                this.ball.dy *= 0.7;
                this.score += 25;
                break;
        }

        // Show power-up message
        this.showPowerUpMessage(powerUp.effect);
    }

    showPowerUpMessage(message) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ffd700;
            font-size: 24px;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
            animation: powerUpMessage 2s ease-out forwards;
        `;

        this.canvas.parentElement.appendChild(messageEl);
        setTimeout(() => messageEl.remove(), 2000);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars background
        this.drawStars();

        // Draw paddle
        this.ctx.fillStyle = '#4ade80';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillRect(this.paddle.x + 5, this.paddle.y + 3, this.paddle.width - 10, this.paddle.height - 6);

        // Draw ball
        this.ctx.font = `${this.ball.radius * 2}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.ball.emoji, this.ball.x, this.ball.y);

        // Draw power-ups
        this.powerUps.forEach(powerUp => {
            this.ctx.font = '24px Arial';
            this.ctx.fillText(powerUp.emoji, powerUp.x + 15, powerUp.y + 15);
        });

        // Draw particles
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.font = '16px Arial';
            this.ctx.fillText(particle.emoji, particle.x, particle.y);
        });
        this.ctx.globalAlpha = 1;

        // Draw UI
        this.drawUI();
    }

    drawStars() {
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 47) % this.canvas.height;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawUI() {
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        this.ctx.fillText(`Lives: ${'💚'.repeat(this.lives)}`, 20, 60);
        this.ctx.fillText(`Level: ${this.level}`, 20, 90);

        if (this.gameState === 'paused') {
            this.ctx.font = '48px Arial';
            this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    gameOver() {
        this.gameState = 'stopped';

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('frogPongHighScore', this.score);
            document.getElementById('frogPongHighScore').textContent = this.score;
        }

        // Track game completion
        if (window.timelineSystem) {
            window.timelineSystem.trackInteraction('game_completed', {
                game: 'frogPong',
                score: this.score,
                isHighScore: this.score === this.highScore
            });
        }

        // Show game over message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);

        if (this.score === this.highScore) {
            this.ctx.fillStyle = '#ffd700';
            this.ctx.fillText('NEW HIGH SCORE! 🏆', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }

    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('frogPongHighScore') || '0');
        document.getElementById('frogPongHighScore').textContent = this.highScore;
    }
}

// Global game functions
function launchFrogPong() {
    const modal = document.getElementById('frogPongModal');
    modal.style.display = 'block';
    if (!window.frogPongGame) {
        window.frogPongGame = new FrogPongGame();
    }
    window.frogPongGame.draw();

    // Add click-outside-to-close functionality
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeFrogPong();
        }
    });
}

function closeFrogPong() {
    document.getElementById('frogPongModal').style.display = 'none';
    if (window.frogPongGame) {
        window.frogPongGame.gameState = 'stopped';
    }
}

function startFrogPong() {
    if (window.frogPongGame) {
        window.frogPongGame.start();
        document.getElementById('startGameBtn').style.display = 'none';
        document.getElementById('pauseGameBtn').style.display = 'inline-block';
    }
}

function pauseFrogPong() {
    if (window.frogPongGame) {
        window.frogPongGame.pause();
        const pauseBtn = document.getElementById('pauseGameBtn');
        pauseBtn.textContent = window.frogPongGame.gameState === 'paused' ? '▶️ Resume' : '⏸️ Pause';
    }
}

function resetFrogPong() {
    if (window.frogPongGame) {
        window.frogPongGame.reset();
        document.getElementById('startGameBtn').style.display = 'inline-block';
        document.getElementById('pauseGameBtn').style.display = 'none';
        document.getElementById('pauseGameBtn').textContent = '⏸️ Pause';
    }
}

// Add power-up message animation
const powerUpStyle = document.createElement('style');
powerUpStyle.textContent = `
    @keyframes powerUpMessage {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(powerUpStyle);