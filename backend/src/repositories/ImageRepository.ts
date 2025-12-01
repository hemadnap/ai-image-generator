/**
 * Image Repository
 * Handles all image database operations
 */

import { Env } from '../index'
import { Image, ImageType, ImageStatus, ImageRow, ImageMetadata } from '../models/Image'

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export class ImageRepository {
  /**
   * Create a new image
   */
  static async create(env: Env, data: {
    userId: string
    type: ImageType
    title: string
    description: string
    prompt?: string
    storageKey: string
    storageUrl: string
    thumbnailKey?: string
    thumbnailUrl?: string
    metadata?: ImageMetadata
    coinsUsed?: number
  }): Promise<Image> {
    const id = generateUUID()
    const now = new Date().toISOString()
    const status = ImageStatus.COMPLETED

    const result = await env.DB.prepare(`
      INSERT INTO images (
        id, user_id, type, status, title, description,
        prompt, storage_key, storage_url, thumbnail_key,
        thumbnail_url, metadata, coins_used, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        id,
        data.userId,
        data.type,
        status,
        data.title,
        data.description,
        data.prompt || null,
        data.storageKey,
        data.storageUrl,
        data.thumbnailKey || null,
        data.thumbnailUrl || null,
        JSON.stringify(data.metadata || {}),
        data.coinsUsed || 0,
        now,
        now
      )
      .run()

    if (!result.success) {
      throw new Error('Failed to create image')
    }

    const image = await this.findById(env, id)
    if (!image) {
      throw new Error('Image created but not found')
    }

    return image
  }

  /**
   * Find image by ID
   */
  static async findById(env: Env, id: string): Promise<Image | null> {
    const result = await env.DB.prepare('SELECT * FROM images WHERE id = ?').bind(id).first<ImageRow>()
    return result ? new Image(result) : null
  }

  /**
   * Find all images for a user
   */
  static async findByUserId(
    env: Env,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ images: Image[]; total: number }> {
    const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM images WHERE user_id = ?')
      .bind(userId)
      .first<{ count: number }>()
    const total = countResult?.count || 0

    const results = await env.DB.prepare(
      `
      SELECT * FROM images 
      WHERE user_id = ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `
    )
      .bind(userId, limit, offset)
      .all<ImageRow>()

    const images = results.results?.map((row) => new Image(row)) || []

    return { images, total }
  }

  /**
   * Find all generated images for a user
   */
  static async findGeneratedByUserId(
    env: Env,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ images: Image[]; total: number }> {
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM images WHERE user_id = ? AND type = ?'
    )
      .bind(userId, ImageType.GENERATED)
      .first<{ count: number }>()
    const total = countResult?.count || 0

    const results = await env.DB.prepare(
      `
      SELECT * FROM images 
      WHERE user_id = ? AND type = ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `
    )
      .bind(userId, ImageType.GENERATED, limit, offset)
      .all<ImageRow>()

    const images = results.results?.map((row) => new Image(row)) || []

    return { images, total }
  }

  /**
   * Find all uploaded images for a user
   */
  static async findUploadedByUserId(
    env: Env,
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ images: Image[]; total: number }> {
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM images WHERE user_id = ? AND type = ?'
    )
      .bind(userId, ImageType.UPLOADED)
      .first<{ count: number }>()
    const total = countResult?.count || 0

    const results = await env.DB.prepare(
      `
      SELECT * FROM images 
      WHERE user_id = ? AND type = ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `
    )
      .bind(userId, ImageType.UPLOADED, limit, offset)
      .all<ImageRow>()

    const images = results.results?.map((row) => new Image(row)) || []

    return { images, total }
  }

  /**
   * Update image
   */
  static async update(env: Env, id: string, data: Partial<Omit<Image, 'createdAt' | 'updatedAt' | 'id'>>): Promise<Image> {
    const now = new Date().toISOString()
    const updates: string[] = []
    const bindings: any[] = []

    if (data.status !== undefined) {
      updates.push('status = ?')
      bindings.push(data.status)
    }
    if (data.title !== undefined) {
      updates.push('title = ?')
      bindings.push(data.title)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      bindings.push(data.description)
    }
    if (data.thumbnailUrl !== undefined) {
      updates.push('thumbnail_url = ?')
      bindings.push(data.thumbnailUrl)
    }
    if (data.metadata !== undefined) {
      updates.push('metadata = ?')
      bindings.push(JSON.stringify(data.metadata))
    }

    updates.push('updated_at = ?')
    bindings.push(now)
    bindings.push(id)

    const result = await env.DB.prepare(`
      UPDATE images 
      SET ${updates.join(', ')}
      WHERE id = ?
    `)
      .bind(...bindings)
      .run()

    if (!result.success) {
      throw new Error('Failed to update image')
    }

    const image = await this.findById(env, id)
    if (!image) {
      throw new Error('Image updated but not found')
    }

    return image
  }

  /**
   * Update image status
   */
  static async updateStatus(env: Env, id: string, status: ImageStatus): Promise<Image> {
    return this.update(env, id, { status })
  }

  /**
   * Delete image
   */
  static async delete(env: Env, id: string): Promise<void> {
    const result = await env.DB.prepare('DELETE FROM images WHERE id = ?').bind(id).run()
    if (!result.success) {
      throw new Error('Failed to delete image')
    }
  }

  /**
   * Get all images (paginated)
   */
  static async findAll(env: Env, limit: number = 50, offset: number = 0): Promise<{ images: Image[]; total: number }> {
    const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM images').first<{ count: number }>()
    const total = countResult?.count || 0

    const results = await env.DB.prepare(
      `
      SELECT * FROM images 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `
    )
      .bind(limit, offset)
      .all<ImageRow>()

    const images = results.results?.map((row) => new Image(row)) || []

    return { images, total }
  }

  /**
   * Get statistics for a user
   */
  static async getUserStats(env: Env, userId: string): Promise<{
    totalImages: number
    generatedImages: number
    uploadedImages: number
    totalCoinsUsed: number
  }> {
    const [totalCount, generatedCount, uploadedCount, coinsResult] = await Promise.all([
      env.DB.prepare('SELECT COUNT(*) as count FROM images WHERE user_id = ?')
        .bind(userId)
        .first<{ count: number }>(),
      env.DB.prepare('SELECT COUNT(*) as count FROM images WHERE user_id = ? AND type = ?')
        .bind(userId, ImageType.GENERATED)
        .first<{ count: number }>(),
      env.DB.prepare('SELECT COUNT(*) as count FROM images WHERE user_id = ? AND type = ?')
        .bind(userId, ImageType.UPLOADED)
        .first<{ count: number }>(),
      env.DB.prepare('SELECT COALESCE(SUM(coins_used), 0) as total FROM images WHERE user_id = ?')
        .bind(userId)
        .first<{ total: number }>(),
    ])

    return {
      totalImages: totalCount?.count || 0,
      generatedImages: generatedCount?.count || 0,
      uploadedImages: uploadedCount?.count || 0,
      totalCoinsUsed: coinsResult?.total || 0,
    }
  }
}
