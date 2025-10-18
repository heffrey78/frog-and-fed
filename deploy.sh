#!/bin/bash

# The Frog and The Fed - Automated GCP Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on any error

# Configuration
PROJECT_ID="frog-and-fed-2025"
PROJECT_NAME="The Frog and The Fed"
BUCKET_NAME="frog-and-fed-website-$(date +%Y%m%d)"
REGION="us-central1"
GCLOUD_PATH="./google-cloud-sdk/bin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is available
check_gcloud() {
    log_info "Checking gcloud installation..."

    if [ -f "$GCLOUD_PATH/gcloud" ]; then
        export PATH=$PATH:$(pwd)/$GCLOUD_PATH
        log_success "Using local gcloud installation"
    elif command -v gcloud &> /dev/null; then
        log_success "Using system gcloud installation"
    else
        log_error "gcloud CLI not found. Please install it first."
        exit 1
    fi

    gcloud version
}

# Check authentication
check_auth() {
    log_info "Checking authentication..."

    if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
        ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
        log_success "Already authenticated as: $ACCOUNT"
    else
        log_warning "Not authenticated. Please run: gcloud auth login --enable-gdrive-access --brief"
        exit 1
    fi
}

# Check and setup billing
setup_billing() {
    log_info "Checking billing configuration..."

    # Check if billing is enabled
    BILLING_ENABLED=$(gcloud billing projects describe $PROJECT_ID --format="value(billingEnabled)" 2>/dev/null)

    if [ "$BILLING_ENABLED" = "True" ]; then
        log_success "Billing is already enabled for project"
        return 0
    fi

    log_warning "Billing is not enabled for this project"

    # List available billing accounts
    BILLING_ACCOUNTS=$(gcloud billing accounts list --filter="open:true" --format="value(name)" 2>/dev/null)

    if [ -z "$BILLING_ACCOUNTS" ]; then
        log_error "No active billing accounts found. Please:"
        echo "  1. Go to https://console.cloud.google.com/billing"
        echo "  2. Create a billing account"
        echo "  3. Re-run this script"
        exit 1
    fi

    # Use the first available billing account
    BILLING_ACCOUNT=$(echo "$BILLING_ACCOUNTS" | head -n1)
    log_info "Linking project to billing account: $BILLING_ACCOUNT"

    if gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT; then
        log_success "Billing account linked successfully"
    else
        log_error "Failed to link billing account. Please:"
        echo "  1. Go to https://console.cloud.google.com/billing"
        echo "  2. Manually link project '$PROJECT_ID' to a billing account"
        echo "  3. Re-run this script"
        exit 1
    fi
}

# Create or set project
setup_project() {
    log_info "Setting up GCP project: $PROJECT_ID"

    # Check if project exists
    if gcloud projects describe $PROJECT_ID &>/dev/null; then
        log_warning "Project $PROJECT_ID already exists"
    else
        log_info "Creating new project: $PROJECT_ID"
        gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"
        log_success "Project created successfully"
    fi

    # Set as default project
    gcloud config set project $PROJECT_ID
    log_success "Project set as default: $PROJECT_ID"

    # Enable required APIs
    log_info "Enabling required APIs..."
    gcloud services enable storage.googleapis.com
    gcloud services enable cloudresourcemanager.googleapis.com
    log_success "APIs enabled successfully"
}

# Create storage bucket
create_bucket() {
    log_info "Creating storage bucket: $BUCKET_NAME"

    # Check if bucket exists
    if gsutil ls -b gs://$BUCKET_NAME &>/dev/null; then
        log_warning "Bucket $BUCKET_NAME already exists"
    else
        # Create bucket
        gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME
        log_success "Bucket created successfully"
    fi

    # Configure for web hosting
    log_info "Configuring bucket for web hosting..."
    gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

    # Make bucket publicly readable
    gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

    # Set CORS policy
    cat > cors.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET"],
    "responseHeader": ["*"],
    "maxAgeSeconds": 3600
  }
]
EOF
    gsutil cors set cors.json gs://$BUCKET_NAME
    rm cors.json

    log_success "Bucket configured for web hosting"
}

# Deploy website files
deploy_files() {
    log_info "Deploying website files..."

    # Upload all files
    gsutil -m cp -r * gs://$BUCKET_NAME/ 2>/dev/null || true

    # Set correct content types
    gsutil -m setmeta -h "Content-Type:text/html" gs://$BUCKET_NAME/*.html
    gsutil -m setmeta -h "Content-Type:text/markdown" gs://$BUCKET_NAME/*.md
    gsutil -m setmeta -h "Content-Type:text/plain" gs://$BUCKET_NAME/*.txt
    gsutil -m setmeta -h "Content-Type:image/png" gs://$BUCKET_NAME/assets/*.png

    log_success "Files deployed successfully"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."

    WEBSITE_URL="https://storage.googleapis.com/$BUCKET_NAME/index.html"

    # Test if website is accessible
    if curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" | grep -q "200"; then
        log_success "Website is live and accessible!"
        echo
        echo "🐸💕 Your website is now live at:"
        echo "   $WEBSITE_URL"
        echo
        echo "📋 Deployment Summary:"
        echo "   Project ID: $PROJECT_ID"
        echo "   Bucket: $BUCKET_NAME"
        echo "   Region: $REGION"
        echo
    else
        log_warning "Website may take a few minutes to be fully accessible"
        echo "URL: $WEBSITE_URL"
    fi
}

# Main deployment process
main() {
    echo "🐸 The Frog and The Fed - GCP Deployment Script"
    echo "=============================================="
    echo

    check_gcloud
    check_auth
    setup_project
    setup_billing
    create_bucket
    deploy_files
    verify_deployment

    log_success "Deployment completed successfully! 🎉"
}

# Run main function
main "$@"