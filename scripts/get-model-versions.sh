#!/bin/bash

# Script to find the latest version IDs for Replicate models
# Usage: bash get-model-versions.sh

MODELS=(
  "black-forest-labs/flux-kontext-pro"
  "stability-ai/stable-diffusion-xl-base-1.0"
  "black-forest-labs/flux-schnell"
)

API_TOKEN=${REPLICATE_API_TOKEN}

if [ -z "$API_TOKEN" ]; then
  echo "Error: REPLICATE_API_TOKEN environment variable not set"
  echo "Please set your token:"
  echo "  export REPLICATE_API_TOKEN=your_token_here"
  exit 1
fi

echo "Fetching latest model versions..."
echo "=================================="

for model in "${MODELS[@]}"; do
  echo ""
  echo "Model: $model"
  
  # Extract owner and name
  IFS='/' read -r owner name <<< "$model"
  
  # Fetch latest version
  response=$(curl -s -H "Authorization: Bearer $API_TOKEN" \
    "https://api.replicate.com/v1/models/$owner/$name/versions?limit=1")
  
  # Extract the version ID (simplified parsing)
  version_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  
  if [ -n "$version_id" ]; then
    echo "  Latest Version ID: $version_id"
    echo "  Full ID: $model:$version_id"
  else
    echo "  Failed to fetch version (check your API token and model name)"
    echo "  Response: $response"
  fi
done

echo ""
echo "=================================="
echo "Update src/services/replicate-config.js with these version IDs"
