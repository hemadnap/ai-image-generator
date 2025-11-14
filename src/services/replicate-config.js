/**
 * Replicate Model Configuration
 *
 * IMPORTANT: You need to update these version hashes!
 *
 * To find correct version IDs:
 * 1. Visit https://replicate.com/explore
 * 2. Find your model and click on it
 * 3. Look for the "API" section with the version hash
 * 4. Copy the full hash and update below
 *
 * Format: 'owner/model-name:version-hash'
 *
 * If a model supports running without specifying a version,
 * you can use just 'owner/model-name'
 *
 * See MODEL_VERSION_FIX.md for detailed instructions
 */

export const MODEL_VERSIONS = {
  // FLUX 1.1 Pro - Latest high-quality image generation model
  // Official: https://replicate.com/black-forest-labs/flux-1.1-pro
  'black-forest-labs/flux-1.1-pro': 'black-forest-labs/flux-1.1-pro',

  // FLUX Pro - Fast, high-quality image generation
  // Official: https://replicate.com/black-forest-labs/flux-pro
  'black-forest-labs/flux-pro': 'black-forest-labs/flux-pro',

  // FLUX Schnell - Fastest model, good quality
  // Official: https://replicate.com/black-forest-labs/flux-schnell
  'black-forest-labs/flux-schnell': 'black-forest-labs/flux-schnell',

  // Stable Diffusion XL - General-purpose image generation
  // Official: https://replicate.com/stability-ai/stable-diffusion-3-medium
  'stability-ai/stable-diffusion-3-medium':
    'stability-ai/stable-diffusion-3-medium',
}

/**
 * Get the full model version ID for a given model identifier
 * @param {string} modelName - The model identifier (e.g., 'black-forest-labs/flux-kontext-pro')
 * @returns {string} The full model version ID in format 'owner/model:version-hash'
 * @throws {Error} If the model version is not configured
 */
export function getModelVersion(modelName) {
  const version = MODEL_VERSIONS[modelName]

  if (!version) {
    throw new Error(
      `Model version not configured for: ${modelName}. ` +
        `Please add the version ID to MODEL_VERSIONS in replicate-config.js. ` +
        `Visit https://replicate.com/explore to find the correct version ID.`
    )
  }

  return version
}

/**
 * Check if a model version is configured
 * @param {string} modelName - The model identifier
 * @returns {boolean} True if the model version is configured
 */
export function isModelVersionConfigured(modelName) {
  return Boolean(MODEL_VERSIONS[modelName])
}

/**
 * Get all configured model versions
 * @returns {Object} Object with model names as keys and version IDs as values
 */
export function getAllModelVersions() {
  return { ...MODEL_VERSIONS }
}

/**
 * Add a new model version at runtime
 * @param {string} modelName - The model identifier
 * @param {string} versionId - The full version ID including the hash
 */
export function addModelVersion(modelName, versionId) {
  MODEL_VERSIONS[modelName] = versionId
}

/**
 * Update an existing model version
 * @param {string} modelName - The model identifier
 * @param {string} versionId - The new full version ID
 * @throws {Error} If the model is not already configured
 */
export function updateModelVersion(modelName, versionId) {
  if (!isModelVersionConfigured(modelName)) {
    throw new Error(
      `Model "${modelName}" is not configured. Use addModelVersion to add a new model.`
    )
  }
  MODEL_VERSIONS[modelName] = versionId
}
