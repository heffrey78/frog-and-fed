// Main Application - The Frog and The Fed

// Global state
window.frogSite = {
    systems: {},
    games: {},
    initialized: false
};

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
});

function initializeApplication() {
    console.log('🐸 Initializing The Frog and The Fed...');

    try {
        // Initialize core systems
        initializeTimeline();
        initializeParticles();
        initializeMemeGenerator();
        initializeEasterEggs();
        initializeQuoteCarousel();
        initializeInteractiveFrog();

        // Initialize games (lazy loaded)
        setupGameLaunchers();

        // Mark as initialized
        window.frogSite.initialized = true;

        console.log('✅ Application initialized successfully!');

    } catch (error) {
        console.error('❌ Error initializing application:', error);
    }
}

function initializeTimeline() {
    try {
        window.frogSite.systems.timeline = new InteractiveTimeline();
        console.log('✅ Timeline system initialized');
    } catch (error) {
        console.warn('⚠️ Timeline system failed to initialize:', error);
    }
}

function initializeParticles() {
    try {
        // Check for reduced motion preference
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.frogSite.systems.particles = new HeroParticleSystem();
            window.frogSite.systems.stats = new StatsAnimator();
            console.log('✅ Particle systems initialized');
        } else {
            // Still initialize stats animator for basic functionality
            window.frogSite.systems.stats = new StatsAnimator();
            console.log('✅ Stats animator initialized (reduced motion mode)');
        }
    } catch (error) {
        console.warn('⚠️ Particle systems failed to initialize:', error);
    }
}

function initializeMemeGenerator() {
    try {
        window.frogSite.systems.memeGenerator = new MemeGenerator();
        console.log('✅ Meme generator initialized');
    } catch (error) {
        console.warn('⚠️ Meme generator failed to initialize:', error);
    }
}

function initializeEasterEggs() {
    try {
        window.frogSite.systems.easterEggs = new EasterEggSystem();
        console.log('✅ Easter egg system initialized');
    } catch (error) {
        console.warn('⚠️ Easter egg system failed to initialize:', error);
    }
}

function initializeQuoteCarousel() {
    const quotes = [
        { text: "But love... love is inflatable", author: "The Notebook: Portland Edition" },
        { text: "I'll never let go, Jack... of this protest sign", author: "Titanic: ICE Facility" },
        { text: "Nobody puts Froggy in a corner", author: "Dirty Dancing: Federal Response" },
        { text: "You had me at 'constitutional rights'", author: "Jerry Maguire: Civil Liberties" },
        { text: "I'm not a smart man, but I know what justice is", author: "Forrest Gump: Portland" }
    ];

    let currentQuote = 0;
    const quoteElement = document.querySelector('.quote');
    const authorElement = document.querySelector('.quote-author');

    if (quoteElement && authorElement) {
        function showNextQuote() {
            quoteElement.style.opacity = '0';
            setTimeout(() => {
                quoteElement.textContent = quotes[currentQuote].text;
                authorElement.textContent = `— ${quotes[currentQuote].author}`;
                quoteElement.style.opacity = '1';
                currentQuote = (currentQuote + 1) % quotes.length;
            }, 500);
        }

        // Initial quote
        showNextQuote();

        // Rotate quotes every 4 seconds
        setInterval(showNextQuote, 4000);

        console.log('✅ Quote carousel initialized');
    }
}

function initializeInteractiveFrog() {
    const frog = document.querySelector('.interactive-frog');
    if (!frog) return;

    let clickCount = 0;
    const clickCountDisplay = document.getElementById('frog-clicks');

    frog.addEventListener('click', function() {
        clickCount++;
        if (clickCountDisplay) {
            clickCountDisplay.textContent = clickCount;
        }

        // Create splash effect
        createSplashEffect(frog);

        // Special events at certain click counts
        if (clickCount === 10) {
            showEasterEgg('🎉');
        } else if (clickCount === 50) {
            showEasterEgg('🏆');
        } else if (clickCount === 100) {
            showEasterEgg('👑');
        }

        // Track interaction
        if (window.frogSite.systems.timeline) {
            window.frogSite.systems.timeline.trackInteraction('frog_clicked', {
                totalClicks: clickCount
            });
        }
    });

    function createSplashEffect(element) {
        const splash = document.createElement('div');
        splash.textContent = '💧';
        splash.style.cssText = `
            position: fixed;
            left: ${element.offsetLeft + 25}px;
            top: ${element.offsetTop}px;
            font-size: 2rem;
            pointer-events: none;
            z-index: 1001;
            animation: splashEffect 1s ease-out forwards;
        `;

        document.body.appendChild(splash);
        setTimeout(() => splash.remove(), 1000);
    }

    console.log('✅ Interactive frog initialized');
}

function setupGameLaunchers() {
    // Set up game launch buttons
    const gameButtons = {
        'frogPong': launchFrogPong,
        'tetris': launchTetris,
        'romance': launchRomanceSimulator
    };

    Object.entries(gameButtons).forEach(([gameId, launchFunction]) => {
        const buttons = document.querySelectorAll(`[onclick*="${launchFunction.name}"]`);
        buttons.forEach(button => {
            // Remove inline onclick and add proper event listener
            button.removeAttribute('onclick');
            button.addEventListener('click', launchFunction);
        });
    });

    console.log('✅ Game launchers initialized');
}

function showEasterEgg(emoji) {
    const easterEgg = document.getElementById('easter-egg');
    if (easterEgg) {
        easterEgg.textContent = emoji;
        easterEgg.style.opacity = '1';
        easterEgg.style.animation = 'easterEggPop 2s ease-out';

        setTimeout(() => {
            easterEgg.style.opacity = '0';
        }, 2000);
    }
}

// Utility functions
function activateFrog() {
    const frog = document.querySelector('.interactive-frog');
    if (frog) {
        frog.click();
    }
}

// Smooth scrolling for navigation
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`🚀 Page loaded in ${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
        }, 0);
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('💥 Application error:', e.error);
});

// Add splash effect animation
const splashStyle = document.createElement('style');
splashStyle.textContent = `
    @keyframes splashEffect {
        0% {
            opacity: 1;
            transform: translateY(0px) scale(1);
        }
        50% {
            opacity: 0.8;
            transform: translateY(-20px) scale(1.2);
        }
        100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.8);
        }
    }
`;
document.head.appendChild(splashStyle);

console.log('🐸 Main application script loaded!');