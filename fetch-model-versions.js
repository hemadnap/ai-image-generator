#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Fetch latest model versions from Replicate using REST API
 * Usage: node fetch-model-versions.js <api-token>
 */

const apiToken = process.argv[2]

if (!apiToken) {
  console.error('❌ Error: Please provide your Replicate API token')
  console.error('Usage: node fetch-model-versions.js <your-api-token>')
  process.exit(1)
}

// List of models to fetch
const models = [
  'black-forest-labs/flux-kontext-pro',
  'black-forest-labs/flux-schnell',
  'stability-ai/stable-diffusion-xl-base-1.0',
]

async function fetchModelVersions() {
  console.log('🔍 Fetching latest model versions from Replicate...\n')

  for (const model of models) {
    try {
      const response = await fetch(
        `https://api.replicate.com/v1/models/${model}/versions?limit=1`,
        {
          headers: {
            Authorization: `Token ${apiToken}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const latestVersion = data.results?.[0]

      if (latestVersion) {
        const fullVersionId = `${model}:${latestVersion.id}`
        console.log(`✅ ${model}`)
        console.log(`   Version ID: ${latestVersion.id}`)
        console.log(`   Created: ${latestVersion.created_at}`)
        console.log(`   Full ID for config: ${fullVersionId}\n`)
      } else {
        console.log(`⚠️  ${model} - No versions found\n`)
      }
    } catch (error) {
      console.error(`❌ ${model}`)
      console.error(`   Error: ${error.message}\n`)
    }
  }

  console.log('📝 Step-by-Step Instructions:')
  console.log('1. Copy the "Full ID for config" values above')
  console.log('2. Open src/services/replicate-config.js')
  console.log('3. Replace the version hashes in the MODEL_VERSIONS object')
  console.log('4. Save the file and restart your servers\n')
}

fetchModelVersions()
