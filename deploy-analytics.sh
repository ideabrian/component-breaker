#!/bin/bash

# 🚀 DEPLOY SHIPPING ANALYTICS PLATFORM
# Deploys the complete analytics stack to Cloudflare

set -e

echo "🚀 Deploying Shipping Analytics Platform"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
log_step() {
    echo -e "${BLUE}📍 $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
log_step "Checking prerequisites..."

if ! command -v wrangler &> /dev/null; then
    log_error "Wrangler CLI not found. Install with: npm install -g wrangler"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm not found. Please install Node.js"
    exit 1
fi

log_success "Prerequisites check passed"

# Deploy Analytics Worker
log_step "Deploying Analytics Worker..."

cd analytics-worker

# Install dependencies
npm install

# Create D1 database if it doesn't exist
log_step "Setting up D1 database..."
DB_ID=$(wrangler d1 list | grep "shipping-analytics-db" | awk '{print $2}' || echo "")

if [ -z "$DB_ID" ]; then
    log_step "Creating new D1 database..."
    wrangler d1 create shipping-analytics-db
    log_warning "Please update wrangler.toml with the new database ID"
    log_warning "Then run this script again"
    exit 1
else
    log_success "D1 database exists: $DB_ID"
fi

# Initialize database schema
log_step "Initializing database schema..."
wrangler d1 execute shipping-analytics-db --file=./schema.sql

# Deploy worker
log_step "Deploying worker to Cloudflare..."
wrangler deploy

log_success "Analytics Worker deployed"

cd ..

# Deploy Analytics Dashboard
log_step "Deploying Analytics Dashboard..."

cd analytics-dashboard

# Install dependencies
npm install

# Build dashboard
npm run build

# Deploy to Cloudflare Pages
log_step "Deploying to Cloudflare Pages..."

# Check if pages project exists
PAGES_PROJECT="shipping-analytics-dashboard"

if ! wrangler pages project list | grep -q "$PAGES_PROJECT"; then
    log_step "Creating Cloudflare Pages project..."
    wrangler pages project create "$PAGES_PROJECT"
fi

# Deploy to pages
wrangler pages deploy dist --project-name="$PAGES_PROJECT"

log_success "Analytics Dashboard deployed"

cd ..

# Summary
echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "📊 Analytics API: https://shipping-analytics-api.workers.dev"
echo "📈 Analytics Dashboard: https://shipping-analytics-dashboard.pages.dev"
echo ""
echo "🔧 Next Steps:"
echo "1. Update mario-ship.js API URL if needed"
echo "2. Test analytics capture with: npm run ship \"Test analytics deployment\""
echo "3. View real-time analytics in the dashboard"
echo ""
echo "🍄 Mario says: 'Mamma mia! Analytics platform deployed!'"