#!/bin/bash

# WriFe Deployment Script
# This script ensures code is pushed to GitHub before triggering Vercel deployment
# It solves the issue of Replit's automatic sync delays causing stale deployments

set -e

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

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   These will NOT be included in the deployment"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled. Commit your changes first."
        exit 1
    fi
fi

# Get current commit info
CURRENT_COMMIT=$(git rev-parse --short HEAD)
COMMIT_MESSAGE=$(git log -1 --pretty=%B | head -1)
echo ""
echo "📦 Deploying commit: $CURRENT_COMMIT"
echo "   Message: $COMMIT_MESSAGE"
echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
if git push "$GIT_REMOTE_URL" HEAD:main --force 2>&1; then
    echo "✅ Successfully pushed to GitHub"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Wait a moment for GitHub to register the push
echo ""
echo "⏳ Waiting for GitHub to sync..."
sleep 2

# Trigger Vercel deployment
echo ""
echo "🔄 Triggering Vercel deployment..."
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
    echo "✅ Vercel deployment triggered!"
    echo ""
    echo "📊 Deployment Details:"
    echo "   ID: $DEPLOY_ID"
    echo "   Status: https://vercel.com/wrifeeducations-projects/wrife-website-pmy7/$DEPLOY_ID"
    echo ""
    echo "🌐 Your site will be live at https://wrife.co.uk once the build completes"
else
    echo "❌ Failed to trigger Vercel deployment"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "✨ Deployment process complete!"
