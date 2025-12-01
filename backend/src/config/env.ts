/**
 * Environment Configuration Helper
 * Loads environment variables with fallbacks
 */

export function getEnvVar(env: any, key: string, defaultValue?: string): string {
  // Try to get from env object first (Wrangler bindings)
  if (env[key]) {
    return env[key]
  }
  
  // If not found and default provided, use default
  if (defaultValue !== undefined) {
    return defaultValue
  }
  
  // Otherwise throw error
  console.warn(`[CONFIG] Environment variable ${key} not found`)
  return ''
}
