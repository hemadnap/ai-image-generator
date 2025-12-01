/**
 * Storage Service
 * Handles image storage operations in Cloudflare R2
 */

import { Env } from '../index'

export interface UploadedFile {
  key: string
  url: string
  size: number
  contentType: string
}

export class StorageService {
  private static readonly BUCKET_PREFIX = 'images'

  /**
   * Generate storage key for an image
   */
  static generateKey(userId: string, filename: string): string {
    const timestamp = Date.now()
    const sanitized = filename.replace(/[^a-z0-9._-]/gi, '-').toLowerCase()
    return `${this.BUCKET_PREFIX}/${userId}/${timestamp}-${sanitized}`
  }

  /**
   * Upload file to R2
   */
  static async upload(env: Env, file: File, userId: string): Promise<UploadedFile> {
    try {
      const buffer = await file.arrayBuffer()
      const key = this.generateKey(userId, file.name)

      // Upload to R2
      const result = await env.IMAGE_GENERATOR.put(key, buffer, {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream',
        },
        customMetadata: {
          uploadedBy: userId,
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      })

      const url = `${env.IMAGE_GENERATOR_URL}/${key}`

      return {
        key,
        url,
        size: buffer.byteLength,
        contentType: file.type || 'application/octet-stream',
      }
    } catch (error) {
      console.error('[Storage] Upload failed:', error)
      throw new Error('Failed to upload file')
    }
  }

  /**
   * Upload buffer to R2
   */
  static async uploadBuffer(
    env: Env,
    buffer: ArrayBuffer,
    fileName: string,
    userId: string,
    contentType: string = 'image/png'
  ): Promise<UploadedFile> {
    try {
      const key = this.generateKey(userId, fileName)

      // Upload to R2
      const result = await env.IMAGE_GENERATOR.put(key, buffer, {
        httpMetadata: {
          contentType,
        },
        customMetadata: {
          uploadedBy: userId,
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      })

      const url = `${env.IMAGE_GENERATOR_URL}/${key}`

      return {
        key,
        url,
        size: buffer.byteLength,
        contentType,
      }
    } catch (error) {
      console.error('[Storage] Upload buffer failed:', error)
      throw new Error('Failed to upload buffer')
    }
  }

  /**
   * Delete file from R2
   */
  static async delete(env: Env, key: string): Promise<void> {
    try {
      await env.IMAGE_GENERATOR.delete(key)
    } catch (error) {
      console.error('[Storage] Delete failed:', error)
      throw new Error('Failed to delete file')
    }
  }

  /**
   * Get file from R2
   */
  static async get(env: Env, key: string): Promise<ArrayBuffer | null> {
    try {
      const object = await env.IMAGE_GENERATOR.get(key)
      if (!object) return null
      return object.arrayBuffer()
    } catch (error) {
      console.error('[Storage] Get failed:', error)
      return null
    }
  }

  /**
   * List files in a user's directory
   */
  static async list(env: Env, userId: string, prefix?: string): Promise<Array<{ key: string; size: number; uploaded: Date }>> {
    try {
      const userPrefix = `${this.BUCKET_PREFIX}/${userId}/${prefix || ''}`
      const result = await env.IMAGE_GENERATOR.list({ prefix: userPrefix })

      return (result.objects || []).map((obj) => ({
        key: obj.key,
        size: obj.size,
        uploaded: new Date(obj.uploaded),
      }))
    } catch (error) {
      console.error('[Storage] List failed:', error)
      return []
    }
  }

  /**
   * Generate a public URL for a key
   */
  static getPublicUrl(env: Env, key: string): string {
    return `${env.IMAGE_GENERATOR_URL}/${key}`
  }

  /**
   * Create a temporary signed URL (for private access)
   */
  static async createSignedUrl(env: Env, key: string, expirationSeconds: number = 3600): Promise<string> {
    try {
      // Note: Cloudflare R2 requires additional configuration for signed URLs
      // For now, return the public URL
      return this.getPublicUrl(env, key)
    } catch (error) {
      console.error('[Storage] Create signed URL failed:', error)
      throw new Error('Failed to create signed URL')
    }
  }
}
