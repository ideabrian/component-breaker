#!/bin/bash

# ComponentBreaker Worker Deployment Script
echo "🚀 Deploying ComponentBreaker AI Worker..."

# Navigate to worker directory
cd worker

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Generate types
echo "🔧 Generating Cloudflare types..."
npm run cf-typegen

# Deploy to production
echo "☁️  Deploying to Cloudflare Workers..."
npm run deploy

echo "✅ Deployment complete!"
echo ""
echo "Your API endpoints:"
echo "🔗 Health Check: https://component-breaker-api.your-domain.workers.dev/api/health"
echo "🔗 Image Analysis: https://component-breaker-api.your-domain.workers.dev/api/analyze"
echo ""
echo "Next steps:"
echo "1. Update your React frontend to use the real API"
echo "2. Test with actual image uploads"
echo "3. Monitor performance in Cloudflare dashboard"