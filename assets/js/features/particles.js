// Particle System - The Frog and The Fed

class HeroParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.isTouch = window.matchMedia('(pointer: coarse)').matches;

        this.init();
        this.bindEvents();
        this.animate();

        // Weather effects
        this.initWeatherEffects();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    createParticles() {
        const particleCount = this.isTouch ? 8 : 15;
        const emojis = ['🐸', '💧', '👮‍♂️', '💕', '🌫️', '✨'];

        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 2,
                scale: 0.8 + Math.random() * 0.4,
                opacity: 0.3 + Math.random() * 0.4,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        if (!this.isTouch) {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Floating motion
            particle.x += particle.vx + Math.sin(Date.now() * 0.001 + particle.phase) * 0.1;
            particle.y += particle.vy + Math.cos(Date.now() * 0.0008 + particle.phase) * 0.1;
            particle.rotation += particle.rotationSpeed;

            // Mouse interaction (desktop only)
            if (!this.isTouch) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.x -= dx * force * 0.01;
                    particle.y -= dy * force * 0.01;
                }
            }

            // Boundary wrapping
            if (particle.x < -50) particle.x = this.canvas.width + 50;
            if (particle.x > this.canvas.width + 50) particle.x = -50;
            if (particle.y < -50) particle.y = this.canvas.height + 50;
            if (particle.y > this.canvas.height + 50) particle.y = -50;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation * Math.PI / 180);
            this.ctx.scale(particle.scale, particle.scale);

            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(particle.emoji, 0, 0);

            this.ctx.restore();
        });
    }

    initWeatherEffects() {
        // Create floating emojis periodically
        this.createFloatingEmoji();
        setInterval(() => this.createFloatingEmoji(), 3000);
    }

    createFloatingEmoji() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const emoji = document.createElement('div');
        emoji.className = 'floating-emoji';
        emoji.textContent = ['💧', '🌫️', '✨'][Math.floor(Math.random() * 3)];

        emoji.style.left = Math.random() * 100 + '%';
        emoji.style.top = Math.random() * 100 + '%';
        emoji.style.animationDelay = Math.random() * 2 + 's';

        hero.appendChild(emoji);

        setTimeout(() => {
            if (emoji.parentNode) {
                emoji.parentNode.removeChild(emoji);
            }
        }, 6000);
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Stats Animation System
class StatsAnimator {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        if (!('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStatsSection(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });

        // Observe stats section when it exists
        const statsSection = document.getElementById('stats');
        if (statsSection) {
            this.observer.observe(statsSection);
        }
    }

    animateStatsSection(section) {
        const statCards = section.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            // Delay each card animation slightly for a staggered effect
            setTimeout(() => {
                this.animateStatCard(card);
            }, index * 100);
        });
    }

    animateStatCard(card) {
        const numberElement = card.querySelector('.stat-number');
        const targetValue = parseInt(numberElement.dataset.target) || parseInt(numberElement.textContent.replace(/[^\d]/g, ''));
        const suffix = numberElement.dataset.suffix || '';
        const emoji = numberElement.dataset.emoji || '';

        if (isNaN(targetValue)) return;

        let currentValue = 0;
        const increment = targetValue / 50; // 50 steps
        const duration = 1500; // 1.5 seconds
        const stepTime = duration / 50;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);

                // Add celebration emoji
                if (emoji) {
                    this.showCelebrationEmoji(card, emoji);
                }
            }

            // Format number based on size
            let displayValue;
            if (targetValue >= 1000000) {
                displayValue = (currentValue / 1000000).toFixed(1) + 'M';
            } else if (targetValue >= 1000) {
                displayValue = (currentValue / 1000).toFixed(1) + 'K';
            } else {
                displayValue = Math.floor(currentValue).toString();
            }

            numberElement.textContent = displayValue + suffix;
        }, stepTime);
    }

    showCelebrationEmoji(card, emoji) {
        const celebration = document.createElement('div');
        celebration.textContent = emoji;
        celebration.style.cssText = `
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 2rem;
            animation: celebrationPop 1s ease-out;
            pointer-events: none;
        `;

        card.style.position = 'relative';
        card.appendChild(celebration);

        setTimeout(() => celebration.remove(), 1000);
    }
}

// Add celebration animation
const celebrationStyle = document.createElement('style');
celebrationStyle.textContent = `
    @keyframes celebrationPop {
        0% { opacity: 0; transform: translateX(-50%) scale(0) rotate(0deg); }
        50% { opacity: 1; transform: translateX(-50%) scale(1.2) rotate(180deg); }
        100% { opacity: 0; transform: translateX(-50%) scale(0.8) rotate(360deg); }
    }
`;
document.head.appendChild(celebrationStyle);