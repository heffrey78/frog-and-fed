# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"The Frog and The Fed" is a satirical website showcasing romantic movie poster parodies based on the real 2025 Portland protests where inflatable frog costumes were used to counter federal law enforcement. The project documents this absurdist resistance movement through humor and creative storytelling.

## Repository Structure

```
├── index.html                           # Main website (simple poster gallery)
├── frog-and-fed-complete.html          # Full interactive website with animations
├── frog-protest.md                     # In-depth journalistic article
├── frog-and-fed-romance-posters.txt    # Creative movie poster concepts
├── assets/                             # Movie poster images
│   ├── frog-and-fed-notebook.png       # Main "Notebook" style poster
│   ├── when-riot-met-sally.png         # "When Harry Met Sally" parody
│   ├── titanic-portland.png            # "Titanic" parody
│   ├── star-is-inflated.png            # "A Star Is Born" parody
│   ├── fault-in-our-teargas.png        # "The Fault In Our Stars" parody
│   ├── pride-and-pepper-spray.png      # "Pride and Prejudice" parody
│   ├── eternal-sunshine-protest.png    # "Eternal Sunshine" parody
│   ├── lady-and-tactical-response.png  # "Lady and the Tramp" parody
│   └── ghost-portland-cut.png          # "Ghost" parody
└── CLAUDE.md                           # This file
```

## Development Commands

This is a **static website project** with no build system or dependencies:

- **Local development**: Open `index.html` or `frog-and-fed-complete.html` directly in a web browser
- **No build commands needed** - all files are self-contained
- **No package manager** - pure HTML/CSS/JavaScript

## Deployment to Google Cloud Platform

### Prerequisites
1. Install gcloud CLI: `curl https://sdk.cloud.google.com | bash`
2. Authenticate: `gcloud auth login`
3. Set project: `gcloud config set project frog-and-fed-2025`

### GCP Project Setup
```bash
# Create new project
gcloud projects create frog-and-fed-2025 --name="The Frog and The Fed"
gcloud config set project frog-and-fed-2025

# Enable required APIs
gcloud services enable storage.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Deployment Options

#### Option 1: Google Cloud Storage (Static Hosting)
```bash
# Create storage bucket
gsutil mb gs://frog-and-fed-website

# Configure bucket for web hosting
gsutil web set -m index.html -e 404.html gs://frog-and-fed-website

# Upload files
gsutil -m cp -r * gs://frog-and-fed-website

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://frog-and-fed-website
```

#### Option 2: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

#### Option 3: App Engine
```bash
# Create app.yaml
echo "runtime: python39" > app.yaml
echo "handlers:" >> app.yaml
echo "- url: /" >> app.yaml
echo "  static_files: index.html" >> app.yaml
echo "  upload: index.html" >> app.yaml
echo "- url: /(.*)" >> app.yaml
echo "  static_files: \1" >> app.yaml
echo "  upload: (.*)" >> app.yaml

# Deploy
gcloud app deploy
```

## GitHub Repository

- **Repository**: https://github.com/heffrey78/frog-and-fed
- **Main branch**: `main`

### Git Workflow
```bash
# Add and commit changes
git add .
git commit -m "Update website content"
git push origin main
```

## Architecture & Content

### Content Themes
- **Satirical documentation** of real protest movements
- **Absurdist humor** through romantic movie parody
- **Political commentary** via creative storytelling
- **Historical preservation** of 2025 Portland protests

### Technical Architecture
- **Static files only** - no server-side processing
- **Self-contained HTML** with embedded CSS/JavaScript
- **Responsive design** using CSS Grid and Flexbox
- **Progressive enhancement** - works without JavaScript

### Asset Management
- All movie poster images are in `assets/` directory
- Images are optimized PNGs (1.4-1.7MB each)
- Filenames correspond to movie poster concepts
- Images are referenced relatively from HTML files

## Content Guidelines

When updating content:
1. **Maintain satirical tone** while respecting the real events
2. **Keep factual basis** - all content grounded in documented protests
3. **Preserve accessibility** - include alt text for images
4. **Mobile-first design** - test responsive layouts
5. **Performance conscious** - optimize images and minimize JavaScript

## Development Notes

- The `frog-and-fed-complete.html` file includes advanced animations and interactivity
- The `index.html` file is a simpler version suitable for faster loading
- Both files are self-contained and can be deployed independently
- The markdown and text files provide context and additional content ideas

## Common Tasks

### Adding a new poster
1. Add image to `assets/` directory with descriptive filename
2. Update `index.html` poster grid with new card
3. Update `frog-and-fed-complete.html` if using interactive version
4. Test responsive layout on mobile devices

### Updating content
1. Edit HTML files directly - no build step required
2. Test locally by opening in browser
3. Commit and push to GitHub
4. Redeploy to GCP using chosen method above

### Performance optimization
- Compress images using `imageoptim` or similar tools
- Minify CSS/JS if needed (currently inline for simplicity)
- Consider using WebP format for images with fallbacks