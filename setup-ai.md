# ComponentBreaker AI Setup Guide

This guide walks you through setting up real AI image analysis for ComponentBreaker using Cloudflare Workers AI.

## Quick Start

### 1. Deploy the Worker

```bash
# From the project root
chmod +x deploy-worker.sh
./deploy-worker.sh
```

### 2. Update Frontend Configuration

After deploying the worker, update your `.env` file:

```bash
# Replace with your actual worker domain
VITE_API_BASE_URL=https://component-breaker-api.your-username.workers.dev
VITE_ENVIRONMENT=production
```

### 3. Test the Integration

```bash
# Build and preview the frontend
npm run build
npm run preview
```

## Manual Setup (if needed)

### 1. Set up Cloudflare Worker

```bash
cd worker
npm install
```

### 2. Configure Wrangler

Make sure you're logged into Cloudflare:

```bash
npx wrangler login
```

### 3. Deploy Worker

```bash
npx wrangler deploy
```

### 4. Update wrangler.toml

Update the routes section in `worker/wrangler.toml` with your actual domain:

```toml
[[routes]]
pattern = "*/api/*"
zone_name = "your-actual-domain.pages.dev"
```

## API Endpoints

Once deployed, you'll have these endpoints:

- **Health Check**: `GET /api/health`
- **Image Analysis**: `POST /api/analyze`

## Testing the API

### Health Check
```bash
curl https://your-worker-domain.workers.dev/api/health
```

### Image Analysis
```bash
curl -X POST \
  -F "image=@your-image.png" \
  https://your-worker-domain.workers.dev/api/analyze
```

## Cost Optimization

- **AI Model**: Uses `@cf/llava-hf/llava-1.5-7b-hf` - efficient vision model
- **Worker Requests**: First 100k requests/month are free
- **AI Inference**: First 10k inferences/month are free
- **Expected Cost**: Under $5/month for typical usage

## Performance Features

- **Edge Processing**: Images analyzed at Cloudflare edge locations
- **Sub-100ms Latency**: For most global locations
- **Automatic Scaling**: Handles traffic spikes automatically
- **CORS Support**: Configured for your frontend domain

## Troubleshooting

### Worker Not Responding
1. Check Cloudflare dashboard for deployment status
2. Verify AI binding is enabled
3. Check worker logs in dashboard

### CORS Issues
1. Update `ALLOWED_ORIGINS` in wrangler.toml
2. Redeploy the worker
3. Check browser network tab for errors

### Analysis Failing
1. Verify image format (PNG, JPG, GIF supported)
2. Check image size (max 10MB)
3. Monitor worker logs for AI model errors

## Development Workflow

### Local Development
```bash
# Terminal 1: Start worker dev server
cd worker
npm run dev

# Terminal 2: Start frontend dev server
cd ..
npm run dev
```

### Production Deployment
```bash
# Deploy worker
./deploy-worker.sh

# Build and deploy frontend
npm run build
# Upload dist/ to Cloudflare Pages
```

## Security Features

- File type validation (images only)
- File size limits (10MB max)
- CORS protection
- Input sanitization
- Error handling

## Next Steps

1. **Monitor Usage**: Check Cloudflare dashboard for AI usage
2. **Optimize Prompts**: Refine AI prompts for better accuracy
3. **Add Features**: Implement batch processing, component libraries
4. **Scale**: Consider D1 database for storing analysis history

Your ComponentBreaker is now powered by real AI! 🚀