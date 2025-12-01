#!/bin/bash

# Cloudflare Workers Deployment Script
# This script helps deploy the image_generator_api worker

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         🚀 Cloudflare Workers Deployment Script 🚀            ║"
echo "║                                                                ║"
echo "║                  image_generator_api Worker                   ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ wrangler CLI not found"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

echo "✅ wrangler CLI found"
echo ""

# Menu
echo "What would you like to do?"
echo ""
echo "1. Create Cloudflare resources (D1, R2, KV)"
echo "2. Deploy to development"
echo "3. Deploy to staging"
echo "4. Deploy to production"
echo "5. View logs"
echo "6. List resources"
echo "7. Exit"
echo ""
read -p "Select option (1-7): " choice

case $choice in
    1)
        echo ""
        echo "Creating Cloudflare resources..."
        echo ""
        
        echo "📦 Creating D1 Database 'image_generator'..."
        wrangler d1 create image_generator || echo "⚠️  Database may already exist"
        
        echo ""
        echo "🪣 Creating R2 Bucket 'image_generator'..."
        wrangler r2 bucket create image_generator || echo "⚠️  Bucket may already exist"
        
        echo ""
        echo "🔑 Creating KV Namespace 'USERS_KV'..."
        wrangler kv:namespace create USERS_KV || echo "⚠️  Namespace may already exist"
        
        echo ""
        echo "🔑 Creating KV Namespace 'SESSIONS_KV'..."
        wrangler kv:namespace create SESSIONS_KV || echo "⚠️  Namespace may already exist"
        
        echo ""
        echo "📋 Now you need to update wrangler.toml with the resource IDs"
        echo ""
        echo "Run this to list your resources:"
        echo "  wrangler d1 list"
        echo "  wrangler r2 bucket list"
        echo "  wrangler kv:namespace list"
        ;;
        
    2)
        echo ""
        echo "🚀 Deploying to development..."
        npm run deploy
        echo ""
        echo "✅ Deployment complete!"
        echo ""
        echo "Your worker is available at:"
        echo "  https://image-generator-api.<your-username>.workers.dev"
        echo ""
        echo "Test with:"
        echo "  curl https://image-generator-api.<your-username>.workers.dev/api/v1/health"
        ;;
        
    3)
        echo ""
        echo "🚀 Deploying to staging..."
        npm run deploy:staging
        echo ""
        echo "✅ Staging deployment complete!"
        ;;
        
    4)
        echo ""
        read -p "⚠️  Deploy to PRODUCTION? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🚀 Deploying to production..."
            npm run deploy:production
            echo ""
            echo "✅ Production deployment complete!"
        else
            echo "❌ Deployment cancelled"
        fi
        ;;
        
    5)
        echo ""
        echo "📊 Streaming logs (press Ctrl+C to stop)..."
        echo ""
        wrangler tail
        ;;
        
    6)
        echo ""
        echo "📋 D1 Databases:"
        wrangler d1 list
        
        echo ""
        echo "📋 R2 Buckets:"
        wrangler r2 bucket list
        
        echo ""
        echo "📋 KV Namespaces:"
        wrangler kv:namespace list
        
        echo ""
        echo "📋 Workers:"
        wrangler list
        ;;
        
    7)
        echo "Goodbye! 👋"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
