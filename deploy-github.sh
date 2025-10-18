#!/bin/bash

# Deploy to GitHub Pages
# Simple script to commit changes and push to GitHub Pages

echo "🐸 Deploying Frog and Fed to GitHub Pages..."

# Check if there are any changes
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Found uncommitted changes, committing..."
    git add .
    git commit -m "Update website content 🤖 Generated with Claude Code"
else
    echo "✅ No uncommitted changes found"
fi

# Check if we're ahead of origin
if [[ $(git rev-list --count origin/main..HEAD) -gt 0 ]]; then
    echo "🚀 Pushing to GitHub..."
    git push origin main
    echo "✅ Deployed to: https://heffrey78.github.io/frog-and-fed/"
    echo "⏱️  GitHub Pages will rebuild in ~1-2 minutes"
else
    echo "✅ Already up to date with GitHub"
fi

echo "🎬 Deployment complete!"