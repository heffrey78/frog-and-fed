// Interactive Timeline System - The Frog and The Fed

class InteractiveTimeline {
    constructor() {
        this.currentView = 'detailed';
        this.analytics = this.loadAnalytics();

        this.storyData = this.initializeStoryData();
        this.characterData = this.initializeCharacterData();

        this.init();
    }

    init() {
        this.setupViewToggle();
        this.setupTimelineInteractions();
        this.updateAnalytics();
    }

    initializeStoryData() {
        return {
            beginning: {
                title: "The First Frog Appears",
                content: "Seth Todd arrives at the ICE facility protest in his inflatable frog costume. What starts as individual creative resistance becomes a movement when others see the power of absurdist protest.",
                behindScenes: "Seth bought his frog costume from Amazon for $23.99. 'Best investment in democracy I ever made,' he later joked.",
                alternateEnding: "What if Seth had chosen a chicken costume instead? The world may never know the glory of Operation Inflation.",
                emoji: "🐸",
                mood: "hopeful"
            },
            escalation: {
                title: "Federal Response Escalates",
                content: "DHS Secretary Kristi Noem stages rooftop photo ops while protesters dance below in inflatable costumes. The contrast becomes impossible to ignore.",
                behindScenes: "Someone played 'Yakety Sax' during Noem's dramatic rooftop moment. The internet noticed.",
                alternateEnding: "In an alternate timeline, Noem joins the Banana Bloc marching band and discovers her true calling.",
                emoji: "🌶️",
                mood: "tense"
            },
            climax: {
                title: "Love In The Time of Tear Gas",
                content: "Officer Martinez and Seth share a moment of understanding amidst the chaos. Romance blooms between species.",
                behindScenes: "This scene was inspired by actual footage of protesters and officers having genuine conversations.",
                alternateEnding: "They could have just stayed enemies, but where's the fun in that?",
                emoji: "💕",
                mood: "romantic"
            }
        };
    }

    initializeCharacterData() {
        return {
            seth: {
                name: "Seth Todd",
                age: 24,
                occupation: "Professional Silly Person",
                backstory: "Former IT worker turned full-time activist after realizing that making people laugh was more effective than angry shouting.",
                motivation: "Believes that absurdity can defeat authoritarianism better than violence ever could.",
                favoriteCostume: "🐸 Frog (obviously)",
                secretTalent: "Can inflate a costume in under 30 seconds"
            },
            martinez: {
                name: "Officer Martinez",
                age: 29,
                occupation: "Federal Agent (Conflicted)",
                backstory: "Joined law enforcement to help communities, increasingly questioning if they're on the right side.",
                motivation: "Torn between duty and conscience, finding unexpected wisdom in googly eyes.",
                favoriteCoffee: "☕ Black coffee, like their mood before meeting Seth",
                secretFear: "That the protesters might actually be right about everything"
            }
        };
    }

    setupViewToggle() {
        const toggleContainer = document.querySelector('.timeline-controls');
        if (!toggleContainer) return;

        const detailedBtn = document.getElementById('detailed-view');
        const summaryBtn = document.getElementById('summary-view');

        if (detailedBtn && summaryBtn) {
            detailedBtn.addEventListener('click', () => this.switchView('detailed'));
            summaryBtn.addEventListener('click', () => this.switchView('summary'));
        }
    }

    switchView(view) {
        this.currentView = view;

        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}-view`).classList.add('active');

        // Update timeline display
        this.updateTimelineDisplay();

        // Track interaction
        this.trackInteraction('view_switch', { view });
    }

    updateTimelineDisplay() {
        const timeline = document.querySelector('.timeline-container');
        if (!timeline) return;

        timeline.className = `timeline-container ${this.currentView}-view`;

        // Add visual feedback
        const items = timeline.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    item.style.transform = 'scale(1)';
                }, 150);
            }, index * 50);
        });
    }

    setupTimelineInteractions() {
        // Add hover effects and click handlers
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('mouseenter', () => this.handleTimelineHover(item));
            item.addEventListener('mouseleave', () => this.handleTimelineLeave(item));
            item.addEventListener('click', () => this.handleTimelineClick(item));
        });
    }

    handleTimelineHover(item) {
        const emoji = item.dataset.emoji;
        const scene = item.dataset.scene;

        if (emoji && scene) {
            this.showTimelinePreview(item, scene);
        }

        // Track hover
        this.trackInteraction('timeline_hover', {
            item: item.dataset.character || 'unknown'
        });
    }

    handleTimelineLeave(item) {
        this.hideTimelinePreview(item);
    }

    handleTimelineClick(item) {
        const storyId = item.dataset.storyId;
        const character = item.dataset.character;

        if (storyId && character) {
            this.openTimelineStory(item);
        }

        // Track click
        this.trackInteraction('timeline_click', {
            storyId,
            character
        });
    }

    showTimelinePreview(item, scene) {
        // Create preview overlay
        const preview = document.createElement('div');
        preview.className = 'timeline-preview';
        preview.innerHTML = `
            <div class="preview-scene">${scene}</div>
            <div class="preview-hint">Click to explore</div>
        `;

        preview.style.cssText = `
            position: absolute;
            top: -60px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 1.2rem;
            text-align: center;
            z-index: 100;
            animation: previewFadeIn 0.3s ease-out;
            pointer-events: none;
        `;

        item.style.position = 'relative';
        item.appendChild(preview);
    }

    hideTimelinePreview(item) {
        const preview = item.querySelector('.timeline-preview');
        if (preview) {
            preview.style.animation = 'previewFadeOut 0.2s ease-in forwards';
            setTimeout(() => preview.remove(), 200);
        }
    }

    openTimelineStory(element) {
        const storyId = element.dataset.storyId;
        const character = element.dataset.character;

        // Track the interaction
        this.trackInteraction('story_opened', { storyId, character });

        // Create and show story modal
        this.showStoryModal(storyId, character);
    }

    showStoryModal(storyId, character) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('story-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'story-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content story-modal-content">
                    <span class="close" onclick="closeStoryModal()">&times;</span>
                    <div class="story-content">
                        <div class="story-header">
                            <div class="story-emoji"></div>
                            <h3 class="story-title"></h3>
                        </div>
                        <div class="story-body">
                            <div class="story-narrative"></div>
                            <div class="story-choices">
                                <button class="story-choice-btn" onclick="exploreCharacter('${character}')">
                                    👥 Learn about ${character === 'seth' ? 'Seth' : 'the Fed'}
                                </button>
                                <button class="story-choice-btn" onclick="showBehindScenes('${storyId}')">
                                    🎬 Behind the Scenes
                                </button>
                                <button class="story-choice-btn" onclick="viewAlternateEnding('${storyId}')">
                                    🎭 What If...?
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add click-outside-to-close functionality
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeStoryModal();
                }
            });

            // Add escape key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    this.closeStoryModal();
                }
            });

            document.body.appendChild(modal);
        }

        // Populate modal content
        const storyData = this.storyData[storyId];
        if (storyData) {
            modal.querySelector('.story-emoji').textContent = storyData.emoji;
            modal.querySelector('.story-title').textContent = storyData.title;
            modal.querySelector('.story-narrative').textContent = storyData.content;
        }

        modal.style.display = 'block';
        this.updateAnalytics();
    }

    closeStoryModal() {
        const modal = document.getElementById('story-modal');
        if (modal) modal.style.display = 'none';
    }

    trackInteraction(type, data = {}) {
        const timestamp = Date.now();

        if (!this.analytics.interactions) {
            this.analytics.interactions = [];
        }

        this.analytics.interactions.push({
            type,
            data,
            timestamp
        });

        // Update counts
        this.analytics.totalInteractions = (this.analytics.totalInteractions || 0) + 1;

        // Update time tracking
        this.analytics.timeSpent = this.analytics.timeSpent || {};
        this.analytics.timeSpent[type] = (this.analytics.timeSpent[type] || 0) + 1;

        this.saveAnalytics();
    }

    loadAnalytics() {
        try {
            return JSON.parse(localStorage.getItem('timelineAnalytics') || '{}');
        } catch {
            return {};
        }
    }

    saveAnalytics() {
        localStorage.setItem('timelineAnalytics', JSON.stringify(this.analytics));
    }

    updateAnalytics() {
        // Update page time
        if (!this.analytics.sessionStart) {
            this.analytics.sessionStart = Date.now();
        }
        this.analytics.sessionTime = Date.now() - this.analytics.sessionStart;
        this.saveAnalytics();
    }

    showEngagementDashboard() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content engagement-modal">
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                <h2>📊 Your Engagement Stats</h2>
                <div id="engagement-dashboard">
                    ${this.generateDashboardHTML()}
                </div>
                <div class="engagement-actions">
                    <button onclick="window.timelineSystem.exportAnalytics()" class="engagement-btn">
                        📁 Export Data
                    </button>
                    <button onclick="window.timelineSystem.resetAnalytics()" class="engagement-btn reset">
                        🗑️ Reset Stats
                    </button>
                </div>
            </div>
        `;

        // Add click-outside-to-close functionality
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    generateDashboardHTML() {
        const totalTimeSpent = Object.values(this.analytics.timeSpent || {}).reduce((a, b) => a + b, 0);
        const sessionMinutes = Math.round((this.analytics.sessionTime || 0) / 60000);

        return `
            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <h3>⏱️ Session Time</h3>
                    <div class="dashboard-value">${sessionMinutes} minutes</div>
                </div>
                <div class="dashboard-card">
                    <h3>🖱️ Total Interactions</h3>
                    <div class="dashboard-value">${this.analytics.totalInteractions || 0}</div>
                </div>
                <div class="dashboard-card">
                    <h3>📖 Stories Opened</h3>
                    <div class="dashboard-value">${(this.analytics.timeSpent?.story_opened || 0)}</div>
                </div>
                <div class="dashboard-card">
                    <h3>👀 Timeline Hovers</h3>
                    <div class="dashboard-value">${(this.analytics.timeSpent?.timeline_hover || 0)}</div>
                </div>
            </div>
        `;
    }

    exportAnalytics() {
        const data = {
            ...this.analytics,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `frog-and-fed-analytics-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }

    resetAnalytics() {
        if (confirm('Reset all analytics data? This cannot be undone.')) {
            this.analytics = {};
            this.saveAnalytics();
            if (document.querySelector('.engagement-modal')) {
                document.querySelector('#engagement-dashboard').innerHTML = this.generateDashboardHTML();
            }
        }
    }
}

// Global story functions
function openTimelineStory(element) {
    const storyId = element.dataset.storyId;
    const character = element.dataset.character;

    // Track the interaction
    if (window.timelineSystem) {
        window.timelineSystem.trackInteraction('story_opened', { storyId, character });
    }

    // Create and show story modal
    showStoryModal(storyId, character);
}

function showStoryModal(storyId, character) {
    if (window.timelineSystem) {
        window.timelineSystem.showStoryModal(storyId, character);
    }
}

function closeStoryModal() {
    if (window.timelineSystem) {
        window.timelineSystem.closeStoryModal();
    }
}

function exploreCharacter(character) {
    if (!window.timelineSystem) return;

    const characterData = window.timelineSystem.characterData[character];
    if (!characterData) return;

    const modal = document.getElementById('story-modal');
    if (modal) {
        const content = modal.querySelector('.story-narrative');
        content.innerHTML = `
            <h4>Meet ${characterData.name}</h4>
            <p><strong>Age:</strong> ${characterData.age}</p>
            <p><strong>Occupation:</strong> ${characterData.occupation}</p>
            <p><strong>Background:</strong> ${characterData.backstory}</p>
            <p><strong>Motivation:</strong> ${characterData.motivation}</p>
            <p><strong>Fun Fact:</strong> ${characterData.favoriteCostume || characterData.favoriteCoffee || characterData.secretTalent}</p>
        `;
    }

    window.timelineSystem.trackInteraction('character_explored', { character });
}

function showBehindScenes(storyId) {
    if (!window.timelineSystem) return;

    const storyData = window.timelineSystem.storyData[storyId];
    if (!storyData) return;

    const modal = document.getElementById('story-modal');
    if (modal) {
        const content = modal.querySelector('.story-narrative');
        content.innerHTML = `
            <h4>🎬 Behind the Scenes</h4>
            <p>${storyData.behindScenes}</p>
            <p><em>This content is based on documented events from the 2025 Portland protests.</em></p>
        `;
    }

    window.timelineSystem.trackInteraction('behind_scenes_viewed', { storyId });
}

function viewAlternateEnding(storyId) {
    if (!window.timelineSystem) return;

    const storyData = window.timelineSystem.storyData[storyId];
    if (!storyData) return;

    const modal = document.getElementById('story-modal');
    if (modal) {
        const content = modal.querySelector('.story-narrative');
        content.innerHTML = `
            <h4>🎭 What If...</h4>
            <p>${storyData.alternateEnding}</p>
            <p><em>Sometimes the best stories are the ones that almost happened.</em></p>
        `;
    }

    window.timelineSystem.trackInteraction('alternate_ending_viewed', { storyId });
}

// Add preview animation styles
const previewStyle = document.createElement('style');
previewStyle.textContent = `
    @keyframes previewFadeIn {
        0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
        100% { opacity: 1; transform: translateX(-50%) translateY(0); }
    }

    @keyframes previewFadeOut {
        0% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    }

    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin: 20px 0;
    }

    .dashboard-card {
        background: rgba(255,255,255,0.1);
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }

    .dashboard-card h3 {
        margin: 0 0 10px 0;
        color: var(--primary);
        font-size: 1rem;
    }

    .dashboard-value {
        font-size: 2rem;
        font-weight: bold;
        color: white;
    }
`;
document.head.appendChild(previewStyle);