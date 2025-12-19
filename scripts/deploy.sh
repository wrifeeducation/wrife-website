#!/bin/bash

# WriFe Deployment Script
# This script ensures code is pushed to GitHub before triggering Vercel deployment

echo "🚀 WriFe Deployment Script"
echo "=========================="

# Check for required environment variable
if [ -z "$GIT_REMOTE_URL" ]; then
    echo "❌ Error: GIT_REMOTE_URL secret is not set"
    echo ""
    echo "To fix this:"
    echo "1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)"
    echo "2. Generate a new token with 'repo' scope"
    echo "3. In Replit, add a secret called GIT_REMOTE_URL with value:"
    echo "   https://YOUR_USERNAME:YOUR_TOKEN@github.com/wrifeeducation/wrife-website.git"
    exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN secret is not set"
    exit 1
fi

# Get current commit info
CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
COMMIT_MESSAGE=$(git log -1 --pretty=%B 2>/dev/null | head -1 || echo "unknown")
echo ""
echo "📦 Current commit: $CURRENT_COMMIT"
echo "   Message: $COMMIT_MESSAGE"
echo ""

# Check what's on GitHub
echo "🔍 Checking GitHub status..."
GITHUB_SHA=$(curl -s -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/wrifeeducation/wrife-website/commits/main" 2>/dev/null | \
    grep -o '"sha": "[^"]*"' | head -1 | cut -d'"' -f4 | cut -c1-7)

if [ "$GITHUB_SHA" = "$CURRENT_COMMIT" ]; then
    echo "✅ GitHub is up to date with commit $CURRENT_COMMIT"
else
    echo "⚠️  GitHub has commit: ${GITHUB_SHA:-unknown}"
    echo "   Local commit: $CURRENT_COMMIT"
    echo ""
    echo "📤 To sync to GitHub, run this command in the Shell:"
    echo ""
    echo "   git push \$GIT_REMOTE_URL HEAD:main --force"
    echo ""
    echo "   Then run 'npm run deploy' again."
    echo ""
    echo "Continuing with deployment of what's currently on GitHub..."
fi

echo ""
echo "🔄 Triggering Vercel deployment..."

# Trigger Vercel deployment
RESPONSE=$(curl -s -X POST 'https://api.vercel.com/v13/deployments' \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{
        "name":"wrife-website-pmy7",
        "project":"prj_ngxX8cz1XOmVt1YX4yAbUKm62PAL",
        "target":"production",
        "gitSource":{
            "type":"github",
            "org":"wrifeeducation",
            "repo":"wrife-website",
            "ref":"main"
        }
    }')

# Check if deployment was triggered successfully
if echo "$RESPONSE" | grep -q '"id":"dpl_'; then
    DEPLOY_ID=$(echo "$RESPONSE" | grep -o '"id":"dpl_[^"]*"' | cut -d'"' -f4)
    DEPLOY_SHA=$(echo "$RESPONSE" | grep -o '"sha":"[^"]*"' | head -1 | cut -d'"' -f4 | cut -c1-7)
    echo "✅ Vercel deployment triggered!"
    echo ""
    echo "📊 Deployment Details:"
    echo "   ID: $DEPLOY_ID"
    echo "   Commit: $DEPLOY_SHA"
    echo "   Status: https://vercel.com/wrifeeducations-projects/wrife-website-pmy7/$DEPLOY_ID"
    echo ""
    echo "🌐 Your site will be live at https://wrife.co.uk once the build completes"
else
    echo "❌ Failed to trigger Vercel deployment"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "✨ Done!"
