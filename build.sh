#!/bin/bash
set -e

echo "🏗️  Building Ta3limi..."

# Clean dist
rm -rf dist
mkdir -p dist

# Copy public assets
cp -r public/* dist/ 2>/dev/null || mkdir -p dist

# Build frontend with Vite (client bundle)
echo "📦 Building frontend..."
npx vite build --mode production --outDir dist

# Build backend worker
echo "⚙️  Building backend worker..."
npx vite build --ssr server/index.ts --outDir dist

echo "✅ Build complete!"
ls -la dist/
