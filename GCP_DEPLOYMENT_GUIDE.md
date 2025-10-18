# GCP Deployment Guide for The Frog and The Fed

## Prerequisites
- Google Cloud account with billing enabled
- Terminal access
- gcloud CLI installed (already done)

## Step 1: Fix gcloud Authentication

### Option A: Working Authentication Method ✅

**For Bash:**
```bash
# Set the gcloud path (adjust if needed)
export PATH=$PATH:/run/media/jwikstrom/Secondary/git/frog-site/google-cloud-sdk/bin

# Reset gcloud configuration
gcloud config configurations create frog-deployment
gcloud config set disable_prompts false

# Working authentication command
gcloud auth login --enable-gdrive-access --brief
```

**For Fish Shell:**
```fish
# Set PATH for Fish shell
set -x PATH $PATH /run/media/jwikstrom/Secondary/git/frog-site/google-cloud-sdk/bin

# Reset gcloud configuration
gcloud config configurations create frog-deployment
gcloud config set disable_prompts false

# Working authentication command
gcloud auth login --enable-gdrive-access --brief
```

### Option B: Use Application Default Credentials
```bash
# Alternative authentication method
gcloud auth application-default login --client-id-file=client_id.json
```

### Option C: Manual Service Account Setup
If auth still fails, follow these steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create New Project**
   ```
   Project Name: The Frog and The Fed
   Project ID: frog-and-fed-2025
   ```

3. **Enable APIs**
   - Go to APIs & Services > Library
   - Enable: Cloud Storage API
   - Enable: Cloud Resource Manager API

4. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Name: `frog-deployment-sa`
   - Role: `Storage Admin` and `Project Editor`
   - Download JSON key file to this directory

5. **Authenticate with Service Account**
   ```bash
   # Replace with your downloaded key file
   gcloud auth activate-service-account --key-file=path/to/your/key.json
   gcloud config set project frog-and-fed-2025
   ```

## Step 2: Create and Configure Project

**For Bash:**
```bash
# If authentication worked, create project
gcloud projects create frog-and-fed-2025 --name="The Frog and The Fed"

# Set as default project
gcloud config set project frog-and-fed-2025

# Enable required services
gcloud services enable storage.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com

# Verify project is set
gcloud config get-value project
```

**For Fish Shell:**
```fish
# If authentication worked, create project
gcloud projects create frog-and-fed-2025 --name="The Frog and The Fed"

# Set as default project
gcloud config set project frog-and-fed-2025

# Enable required services
gcloud services enable storage.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com

# Verify project is set
gcloud config get-value project
```

## Step 3: Create Storage Bucket

**For Bash:**
```bash
# Create bucket with globally unique name
BUCKET_NAME="frog-and-fed-website-$(date +%Y%m%d)"
echo "Creating bucket: $BUCKET_NAME"

# Create bucket
gsutil mb -p frog-and-fed-2025 -c STANDARD -l us-central1 gs://$BUCKET_NAME

# Configure for web hosting
gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Set bucket CORS policy for web access
echo '[{"origin":["*"],"method":["GET"],"responseHeader":["*"],"maxAgeSeconds":3600}]' > cors.json
gsutil cors set cors.json gs://$BUCKET_NAME
rm cors.json
```

**For Fish Shell:**
```fish
# Create bucket with globally unique name
set BUCKET_NAME "frog-and-fed-website-"(date +%Y%m%d)
echo "Creating bucket: $BUCKET_NAME"

# Create bucket
gsutil mb -p frog-and-fed-2025 -c STANDARD -l us-central1 gs://$BUCKET_NAME

# Configure for web hosting
gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Set bucket CORS policy for web access
echo '[{"origin":["*"],"method":["GET"],"responseHeader":["*"],"maxAgeSeconds":3600}]' > cors.json
gsutil cors set cors.json gs://$BUCKET_NAME
rm cors.json
```

## Step 4: Deploy Website Files

```bash
# Navigate to project directory
cd /run/media/jwikstrom/Secondary/git/frog-site

# Upload all files to bucket
gsutil -m cp -r * gs://$BUCKET_NAME/

# Verify upload
gsutil ls gs://$BUCKET_NAME/

# Set correct content types
gsutil -m setmeta -h "Content-Type:text/html" gs://$BUCKET_NAME/*.html
gsutil -m setmeta -h "Content-Type:text/css" gs://$BUCKET_NAME/**/*.css
gsutil -m setmeta -h "Content-Type:application/javascript" gs://$BUCKET_NAME/**/*.js
gsutil -m setmeta -h "Content-Type:image/png" gs://$BUCKET_NAME/assets/*.png
```

## Step 5: Test Deployment

```bash
# Get the public URL
echo "Website URL: https://storage.googleapis.com/$BUCKET_NAME/index.html"

# Test with curl
curl -I "https://storage.googleapis.com/$BUCKET_NAME/index.html"

# Alternative: Set up custom domain (optional)
# Follow: https://cloud.google.com/storage/docs/hosting-static-website
```

## Troubleshooting

### If gcloud auth fails:
```bash
# Check gcloud version
gcloud version

# Reset configuration
gcloud config configurations delete default
gcloud config configurations create default

# Try with no-browser flag
gcloud auth login --no-browser

# Or use service account (see Option C above)
```

### If bucket creation fails:
```bash
# Try different bucket name
BUCKET_NAME="frog-fed-site-$(openssl rand -hex 4)"
gsutil mb -p frog-and-fed-2025 gs://$BUCKET_NAME
```

### If upload fails:
```bash
# Check file permissions
ls -la

# Upload files individually
gsutil cp index.html gs://$BUCKET_NAME/
gsutil cp -r assets/ gs://$BUCKET_NAME/
```

## Alternative Deployment Methods

### Firebase Hosting (Easier Auth)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login --no-localhost

# Initialize project
firebase init hosting

# Deploy
firebase deploy
```

### Netlify (Zero Config)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy from git
netlify init

# Or drag & drop deploy
netlify deploy --prod --dir=.
```

## Expected Results

After successful deployment:
- **Website URL**: `https://storage.googleapis.com/BUCKET_NAME/index.html`
- **File structure preserved**: All assets accessible
- **Movie posters working**: Images load from `assets/` directory
- **Mobile responsive**: Works on all devices

## Costs
- **Storage**: ~$0.02/GB/month
- **Bandwidth**: ~$0.12/GB
- **Estimated monthly cost**: <$5 for typical traffic

## Next Steps
1. **Custom domain**: Point your domain to the bucket
2. **CDN**: Enable Cloud CDN for faster global loading
3. **HTTPS**: Configure SSL certificate
4. **Monitoring**: Set up Cloud Monitoring

## Support Commands

```bash
# View project info
gcloud info

# List all buckets
gsutil ls

# View bucket details
gsutil du -s gs://$BUCKET_NAME

# Delete bucket (if needed)
gsutil rm -r gs://$BUCKET_NAME
```

## Success Indicators
✅ `gcloud auth list` shows authenticated account
✅ `gcloud config get-value project` returns `frog-and-fed-2025`
✅ `gsutil ls gs://BUCKET_NAME` shows all files
✅ Website URL loads in browser
✅ Movie poster images display correctly

If you encounter any issues, copy the error message and I can help debug it!