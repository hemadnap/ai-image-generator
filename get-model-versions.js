#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Helper script to fetch the latest model version IDs from Replicate
 *
 * Usage: node get-model-versions.js <api-token>
 * Example: node get-model-versions.js YOUR_REPLICATE_API_TOKEN
 *
 * Get your token from: https://replicate.com/account/api-tokens
 */

import Replicate from 'replicate'

const apiToken = process.argv[2]

if (!apiToken) {
  console.error('❌ Error: Please provide your Replicate API token')
  console.error('Usage: node get-model-versions.js <your-api-token>')
  process.exit(1)
}

const replicate = new Replicate({ auth: apiToken })

// List of models to fetch versions for
const modelsToFetch = [
  'black-forest-labs/flux-kontext-pro',
  'black-forest-labs/flux-schnell',
  'stability-ai/stable-diffusion-xl-base-1.0',
]

async function getModelVersions() {
  console.log('🔍 Fetching latest model versions from Replicate...\n')

  for (const model of modelsToFetch) {
    try {
      const [owner, name] = model.split('/')

      // Get the model to access versions
      const versions = await replicate.paginate(`${owner}/${name}/versions`, {
        limit: 1,
      })

      // Get the first (most recent) version
      const latestVersion = versions[0]

      if (latestVersion) {
        const fullVersionId = `${model}:${latestVersion.id}`
        console.log(`✅ ${model}`)
        console.log(`   Version ID: ${latestVersion.id}`)
        console.log(`   Created: ${latestVersion.created_at}`)
        console.log(`   Full ID: ${fullVersionId}\n`)
      } else {
        console.log(`⚠️  ${model} - No versions found\n`)
      }
    } catch (error) {
      console.error(`❌ ${model}`)
      console.error(`   Error: ${error.message}\n`)
    }
  }

  console.log('📝 Update your replicate-config.js with these version IDs:')
  console.log('   Replace the version hashes in MODEL_VERSIONS object')
}

getModelVersions().catch((error) => {
  console.error('Fatal error:', error.message)
  process.exit(1)
})
