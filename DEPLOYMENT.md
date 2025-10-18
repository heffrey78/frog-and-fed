# Automated Deployment

## Quick Start

**Prerequisites:** You must be authenticated with gcloud first:
```bash
gcloud auth login --enable-gdrive-access --brief
```

**Then run the deployment script:**

### For Bash users:
```bash
./deploy.sh
```

### For Fish users:
```fish
./deploy.fish
```

## What the script does:

1. ✅ **Checks gcloud installation and authentication**
2. ✅ **Creates GCP project** `frog-and-fed-2025` (if it doesn't exist)
3. ✅ **Sets up billing** (automatically links to available billing account)
4. ✅ **Enables required APIs** (Storage, Resource Manager)
5. ✅ **Creates storage bucket** with unique timestamp name
6. ✅ **Configures bucket for web hosting** (public access, CORS)
7. ✅ **Deploys all website files** with correct content types
8. ✅ **Verifies deployment** and provides live URL

## Output

The script will provide:
- 🌐 **Live website URL**: `https://storage.googleapis.com/BUCKET_NAME/index.html`
- 📋 **Deployment details**: Project ID, bucket name, region
- 🎯 **Status updates**: Real-time progress with colored output

## Re-running

The script is **idempotent** - you can run it multiple times safely:
- Existing project/bucket will be reused
- Files will be updated with latest versions
- No duplicate resources created

## Troubleshooting

**Authentication error?**
```bash
gcloud auth login --enable-gdrive-access --brief
```

**Billing issues?**
The script will automatically:
- Detect if billing is missing
- Link to your first available billing account
- Provide clear instructions if manual setup is needed

If billing setup fails:
1. Go to https://console.cloud.google.com/billing
2. Create or verify billing account
3. Re-run the script

**Permission errors?**
Make sure scripts are executable:
```bash
chmod +x deploy.sh deploy.fish
```

**Bucket creation fails?**
- Script verifies billing before creating bucket
- Uses timestamp-based names to avoid conflicts
- If error persists, wait a minute and try again

## Manual cleanup (if needed)

```bash
# Delete bucket
gsutil rm -r gs://BUCKET_NAME

# Delete project
gcloud projects delete frog-and-fed-2025
```

## Estimated costs
- **Storage**: ~$0.02/GB/month
- **Bandwidth**: ~$0.12/GB
- **Monthly cost**: <$5 for typical traffic