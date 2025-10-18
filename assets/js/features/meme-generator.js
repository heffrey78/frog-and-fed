// Meme Generator - The Frog and The Fed

class MemeGenerator {
    constructor() {
        this.canvas = document.getElementById('memeCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.currentTemplate = null;
        this.templates = this.initializeTemplates();

        if (this.canvas) {
            this.init();
        }
    }

    init() {
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.setupTemplateSelection();
        this.setupTextControls();
    }

    initializeTemplates() {
        return {
            notebook: {
                name: "The Notebook",
                background: "#f0f8ff",
                layout: "top-bottom",
                defaultTop: "What if I told you...",
                defaultBottom: "Love is inflatable?"
            },
            whenRiot: {
                name: "When Riot Met Sally",
                background: "#ffe4e1",
                layout: "dialogue",
                defaultTop: "🐸: I protest therefore I am",
                defaultBottom: "👮‍♂️: That's not how it works"
            },
            titanic: {
                name: "Titanic Portland",
                background: "#b0e0e6",
                layout: "impact",
                defaultTop: "I'm the king of",
                defaultBottom: "THE PROTEST!"
            },
            star: {
                name: "A Star Is Inflated",
                background: "#ffd700",
                layout: "spotlight",
                defaultTop: "Maybe it's time to",
                defaultBottom: "INFLATE YOUR DREAMS"
            },
            fault: {
                name: "Fault In Our Tear Gas",
                background: "#e6e6fa",
                layout: "emotional",
                defaultTop: "Some infinities",
                defaultBottom: "are bigger than others"
            }
        };
    }

    setupTemplateSelection() {
        const container = document.querySelector('.meme-templates');
        if (!container) return;

        Object.entries(this.templates).forEach(([key, template]) => {
            const templateBtn = document.createElement('div');
            templateBtn.className = 'meme-template';
            templateBtn.innerHTML = `
                <h4>${template.name}</h4>
                <div class="template-preview" style="background: ${template.background}"></div>
            `;

            templateBtn.addEventListener('click', () => this.selectTemplate(key));
            container.appendChild(templateBtn);
        });
    }

    setupTextControls() {
        const topTextInput = document.getElementById('topText');
        const bottomTextInput = document.getElementById('bottomText');
        const generateBtn = document.getElementById('generateMeme');
        const downloadBtn = document.getElementById('downloadMeme');

        if (topTextInput) {
            topTextInput.addEventListener('input', () => this.updateMeme());
        }
        if (bottomTextInput) {
            bottomTextInput.addEventListener('input', () => this.updateMeme());
        }
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateMeme());
        }
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadMeme());
        }
    }

    selectTemplate(templateKey) {
        this.currentTemplate = templateKey;
        const template = this.templates[templateKey];

        // Update input placeholders
        const topTextInput = document.getElementById('topText');
        const bottomTextInput = document.getElementById('bottomText');

        if (topTextInput) {
            topTextInput.placeholder = template.defaultTop;
            topTextInput.value = '';
        }
        if (bottomTextInput) {
            bottomTextInput.placeholder = template.defaultBottom;
            bottomTextInput.value = '';
        }

        // Update active template styling
        document.querySelectorAll('.meme-template').forEach(el => {
            el.classList.remove('active');
        });
        document.querySelector(`[data-template="${templateKey}"]`)?.classList.add('active');

        this.updateMeme();

        // Track template selection
        if (window.timelineSystem) {
            window.timelineSystem.trackInteraction('meme_template_selected', {
                template: templateKey
            });
        }
    }

    updateMeme() {
        if (!this.currentTemplate || !this.ctx) return;

        const template = this.templates[this.currentTemplate];
        const topText = document.getElementById('topText')?.value || template.defaultTop;
        const bottomText = document.getElementById('bottomText')?.value || template.defaultBottom;

        this.renderMeme(template, topText, bottomText);
    }

    renderMeme(template, topText, bottomText) {
        // Clear canvas
        this.ctx.fillStyle = template.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add gradient overlay
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw character emojis based on template
        this.drawCharacters(template);

        // Draw text based on layout
        this.drawText(template, topText, bottomText);

        // Add border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawCharacters(template) {
        this.ctx.font = '80px Arial';
        this.ctx.textAlign = 'center';

        switch (template.layout) {
            case 'top-bottom':
                this.ctx.fillText('🐸', this.canvas.width * 0.3, this.canvas.height * 0.5);
                this.ctx.fillText('👮‍♂️', this.canvas.width * 0.7, this.canvas.height * 0.5);
                break;
            case 'dialogue':
                this.ctx.fillText('🐸', this.canvas.width * 0.2, this.canvas.height * 0.3);
                this.ctx.fillText('👮‍♂️', this.canvas.width * 0.8, this.canvas.height * 0.7);
                break;
            case 'impact':
                this.ctx.fillText('🐸', this.canvas.width * 0.5, this.canvas.height * 0.4);
                break;
            case 'spotlight':
                this.ctx.fillText('🐸', this.canvas.width * 0.5, this.canvas.height * 0.6);
                this.ctx.font = '40px Arial';
                this.ctx.fillText('✨', this.canvas.width * 0.3, this.canvas.height * 0.3);
                this.ctx.fillText('✨', this.canvas.width * 0.7, this.canvas.height * 0.3);
                break;
            case 'emotional':
                this.ctx.fillText('🐸', this.canvas.width * 0.3, this.canvas.height * 0.6);
                this.ctx.fillText('💕', this.canvas.width * 0.5, this.canvas.height * 0.4);
                this.ctx.fillText('👮‍♂️', this.canvas.width * 0.7, this.canvas.height * 0.6);
                break;
        }
    }

    drawText(template, topText, bottomText) {
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Dynamic font sizing
        const maxWidth = this.canvas.width - 40;
        let fontSize = 36;

        // Top text
        this.ctx.font = `bold ${fontSize}px Arial`;
        let textWidth = this.ctx.measureText(topText).width;
        while (textWidth > maxWidth && fontSize > 16) {
            fontSize -= 2;
            this.ctx.font = `bold ${fontSize}px Arial`;
            textWidth = this.ctx.measureText(topText).width;
        }

        const topY = template.layout === 'dialogue' ? this.canvas.height * 0.15 : 50;
        this.strokeText(topText, this.canvas.width / 2, topY);
        this.ctx.fillText(topText, this.canvas.width / 2, topY);

        // Bottom text
        fontSize = 36;
        this.ctx.font = `bold ${fontSize}px Arial`;
        textWidth = this.ctx.measureText(bottomText).width;
        while (textWidth > maxWidth && fontSize > 16) {
            fontSize -= 2;
            this.ctx.font = `bold ${fontSize}px Arial`;
            textWidth = this.ctx.measureText(bottomText).width;
        }

        const bottomY = template.layout === 'dialogue' ? this.canvas.height * 0.85 : this.canvas.height - 50;
        this.strokeText(bottomText, this.canvas.width / 2, bottomY);
        this.ctx.fillText(bottomText, this.canvas.width / 2, bottomY);
    }

    strokeText(text, x, y) {
        // Draw text outline for better readability
        this.ctx.strokeText(text, x, y);
    }

    generateMeme() {
        if (!this.currentTemplate) {
            alert('Please select a template first!');
            return;
        }

        // Show generation effect
        const canvas = this.canvas;
        canvas.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            canvas.style.filter = 'none';
        }, 200);

        // Track meme generation
        if (window.timelineSystem) {
            window.timelineSystem.trackInteraction('meme_generated', {
                template: this.currentTemplate,
                topText: document.getElementById('topText')?.value || '',
                bottomText: document.getElementById('bottomText')?.value || ''
            });
        }

        // Show success message
        this.showMessage('Meme generated! 🎉');
    }

    downloadMeme() {
        if (!this.canvas) return;

        const link = document.createElement('a');
        link.download = `frog-and-fed-meme-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();

        // Track download
        if (window.timelineSystem) {
            window.timelineSystem.trackInteraction('meme_downloaded', {
                template: this.currentTemplate
            });
        }

        this.showMessage('Meme downloaded! 📁');
    }

    showMessage(text) {
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            animation: messagePopIn 2s ease-out;
        `;

        document.body.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    }
}

// Initialize meme generator when needed
function initMemeGenerator() {
    if (!window.memeGenerator && document.getElementById('memeCanvas')) {
        window.memeGenerator = new MemeGenerator();
    }
}

// Add message animation
const memeStyle = document.createElement('style');
memeStyle.textContent = `
    @keyframes messagePopIn {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    }

    .meme-template {
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        border-radius: 10px;
        padding: 15px;
    }

    .meme-template:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .meme-template.active {
        border-color: var(--primary);
        background: rgba(102, 126, 234, 0.1);
    }

    .template-preview {
        height: 60px;
        border-radius: 5px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
    }
`;
document.head.appendChild(memeStyle);