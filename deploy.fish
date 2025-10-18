#!/usr/bin/env fish

# The Frog and The Fed - Automated GCP Deployment Script (Fish Shell)
# Usage: ./deploy.fish

# Configuration
set PROJECT_ID "frog-and-fed-2025"
set PROJECT_NAME "The Frog and The Fed"
set BUCKET_NAME "frog-and-fed-website-"(date +%Y%m%d)
set REGION "us-central1"
set GCLOUD_PATH "./google-cloud-sdk/bin"

# Colors for output
set RED '\033[0;31m'
set GREEN '\033[0;32m'
set YELLOW '\033[1;33m'
set BLUE '\033[0;34m'
set NC '\033[0m' # No Color

# Helper functions
function log_info
    echo -e $BLUE"[INFO]"$NC" $argv"
end

function log_success
    echo -e $GREEN"[SUCCESS]"$NC" $argv"
end

function log_warning
    echo -e $YELLOW"[WARNING]"$NC" $argv"
end

function log_error
    echo -e $RED"[ERROR]"$NC" $argv"
end

# Check if gcloud is available
function check_gcloud
    log_info "Checking gcloud installation..."

    if test -f "$GCLOUD_PATH/gcloud"
        set -x PATH $PATH (pwd)/$GCLOUD_PATH
        log_success "Using local gcloud installation"
    else if command -v gcloud >/dev/null
        log_success "Using system gcloud installation"
    else
        log_error "gcloud CLI not found. Please install it first."
        exit 1
    end

    gcloud version
end

# Check authentication
function check_auth
    log_info "Checking authentication..."

    set ACCOUNT (gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null)

    if test -n "$ACCOUNT"
        log_success "Already authenticated as: $ACCOUNT"
    else
        log_warning "Not authenticated. Please run: gcloud auth login --enable-gdrive-access --brief"
        exit 1
    end
end

# Check and setup billing
function setup_billing
    log_info "Checking billing configuration..."

    # Check if billing is enabled
    set BILLING_ENABLED (gcloud billing projects describe $PROJECT_ID --format="value(billingEnabled)" 2>/dev/null)

    if test "$BILLING_ENABLED" = "True"
        log_success "Billing is already enabled for project"
        return 0
    end

    log_warning "Billing is not enabled for this project"

    # List available billing accounts
    set BILLING_ACCOUNTS (gcloud billing accounts list --filter="open:true" --format="value(name)" 2>/dev/null)

    if test -z "$BILLING_ACCOUNTS"
        log_error "No active billing accounts found. Please:"
        echo "  1. Go to https://console.cloud.google.com/billing"
        echo "  2. Create a billing account"
        echo "  3. Re-run this script"
        exit 1
    end

    # Use the first available billing account
    set BILLING_ACCOUNT (echo $BILLING_ACCOUNTS | head -n1)
    log_info "Linking project to billing account: $BILLING_ACCOUNT"

    if gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
        log_success "Billing account linked successfully"
    else
        log_error "Failed to link billing account. Please:"
        echo "  1. Go to https://console.cloud.google.com/billing"
        echo "  2. Manually link project '$PROJECT_ID' to a billing account"
        echo "  3. Re-run this script"
        exit 1
    end
end

# Create or set project
function setup_project
    log_info "Setting up GCP project: $PROJECT_ID"

    # Check if project exists
    if gcloud projects describe $PROJECT_ID >/dev/null 2>&1
        log_warning "Project $PROJECT_ID already exists"
    else
        log_info "Creating new project: $PROJECT_ID"
        gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"
        log_success "Project created successfully"
    end

    # Set as default project
    gcloud config set project $PROJECT_ID
    log_success "Project set as default: $PROJECT_ID"

    # Enable required APIs
    log_info "Enabling required APIs..."
    gcloud services enable storage.googleapis.com
    gcloud services enable cloudresourcemanager.googleapis.com
    log_success "APIs enabled successfully"
end

# Create storage bucket
function create_bucket
    log_info "Creating storage bucket: $BUCKET_NAME"

    # Check if bucket exists
    if gsutil ls -b gs://$BUCKET_NAME >/dev/null 2>&1
        log_warning "Bucket $BUCKET_NAME already exists"
    else
        # Create bucket with error handling
        log_info "Creating bucket: gs://$BUCKET_NAME"
        if gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME
            log_success "Bucket created successfully"
        else
            log_error "Failed to create bucket. This usually means:"
            echo "  1. Billing is not properly set up"
            echo "  2. Storage API is not enabled"
            echo "  3. Bucket name conflict"
            echo ""
            echo "Please check billing at: https://console.cloud.google.com/billing"
            exit 1
        end
    end

    # Verify bucket exists before continuing
    if not gsutil ls -b gs://$BUCKET_NAME >/dev/null 2>&1
        log_error "Bucket verification failed - bucket does not exist"
        exit 1
    end

    # Configure for web hosting
    log_info "Configuring bucket for web hosting..."
    if gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME
        log_success "Web hosting configuration set"
    else
        log_error "Failed to configure web hosting"
        exit 1
    end

    # Make bucket publicly readable
    log_info "Setting public access permissions..."
    if gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
        log_success "Public access permissions set"
    else
        log_error "Failed to set public access permissions"
        exit 1
    end

    # Set CORS policy
    log_info "Setting CORS policy..."
    echo '[
  {
    "origin": ["*"],
    "method": ["GET"],
    "responseHeader": ["*"],
    "maxAgeSeconds": 3600
  }
]' > cors.json

    if gsutil cors set cors.json gs://$BUCKET_NAME
        log_success "CORS policy configured"
    else
        log_warning "Failed to set CORS policy (non-critical)"
    end

    rm cors.json
    log_success "Bucket configured for web hosting"
end

# Deploy website files
function deploy_files
    log_info "Deploying website files..."

    # Verify bucket exists before uploading
    if not gsutil ls -b gs://$BUCKET_NAME >/dev/null 2>&1
        log_error "Cannot deploy - bucket does not exist"
        exit 1
    end

    # Upload files with proper error handling
    set UPLOAD_ERRORS 0

    # Upload HTML files
    for file in *.html
        if test -f "$file"
            log_info "Uploading $file..."
            if not gsutil cp "$file" gs://$BUCKET_NAME/
                set UPLOAD_ERRORS (math $UPLOAD_ERRORS + 1)
            end
        end
    end

    # Upload markdown files
    for file in *.md
        if test -f "$file"
            log_info "Uploading $file..."
            if not gsutil cp "$file" gs://$BUCKET_NAME/
                set UPLOAD_ERRORS (math $UPLOAD_ERRORS + 1)
            end
        end
    end

    # Upload text files
    for file in *.txt
        if test -f "$file"
            log_info "Uploading $file..."
            if not gsutil cp "$file" gs://$BUCKET_NAME/
                set UPLOAD_ERRORS (math $UPLOAD_ERRORS + 1)
            end
        end
    end

    # Upload assets directory
    if test -d "assets"
        log_info "Uploading assets directory..."
        if not gsutil -m cp -r assets gs://$BUCKET_NAME/
            set UPLOAD_ERRORS (math $UPLOAD_ERRORS + 1)
        end
    end

    # Set content types for uploaded files
    log_info "Setting content types..."

    # Get list of files in bucket and set content types
    set HTML_FILES (gsutil ls gs://$BUCKET_NAME/ | grep '\.html$' | tr '\n' ' ')
    if test -n "$HTML_FILES"
        for file in $HTML_FILES
            gsutil setmeta -h "Content-Type:text/html" "$file" >/dev/null 2>&1; or true
        end
    end

    set MD_FILES (gsutil ls gs://$BUCKET_NAME/ | grep '\.md$' | tr '\n' ' ')
    if test -n "$MD_FILES"
        for file in $MD_FILES
            gsutil setmeta -h "Content-Type:text/markdown" "$file" >/dev/null 2>&1; or true
        end
    end

    set PNG_FILES (gsutil ls gs://$BUCKET_NAME/assets/ | grep '\.png$' | tr '\n' ' ')
    if test -n "$PNG_FILES"
        for file in $PNG_FILES
            gsutil setmeta -h "Content-Type:image/png" "$file" >/dev/null 2>&1; or true
        end
    end

    if test $UPLOAD_ERRORS -gt 0
        log_warning "Some files failed to upload ($UPLOAD_ERRORS errors)"
    else
        log_success "All files deployed successfully"
    end
end

# Verify deployment
function verify_deployment
    log_info "Verifying deployment..."

    set WEBSITE_URL "https://storage.googleapis.com/$BUCKET_NAME/index.html"

    # Test if website is accessible
    set HTTP_CODE (curl -s -o /dev/null -w "%{http_code}" "$WEBSITE_URL" 2>/dev/null)

    if test "$HTTP_CODE" = "200"
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
    end
end

# Main deployment process
function main
    echo "🐸 The Frog and The Fed - GCP Deployment Script (Fish)"
    echo "===================================================="
    echo

    check_gcloud
    check_auth
    setup_project
    setup_billing
    create_bucket
    deploy_files
    verify_deployment

    log_success "Deployment completed successfully! 🎉"
end

# Run main function
main