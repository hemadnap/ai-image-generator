/**
 * Prompt Repository
 * Handles all prompt database operations
 */

import { Env } from '../index'

export interface Prompt {
  id: string
  userId: string
  imageId: string | null
  prompt: string
  taskType: 'TEXT_TO_IMAGE' | 'IMAGE_TO_IMAGE'
  imageSize: string
  watermark?: string
  responseData: Record<string, any>
  cost: number
  durationMs?: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface PromptRow {
  id: string
  user_id: string
  image_id: string | null
  prompt: string
  task_type: 'TEXT_TO_IMAGE' | 'IMAGE_TO_IMAGE'
  image_size: string
  watermark?: string
  response_data: string
  cost: number
  duration_ms?: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  error_message?: string
  created_at: string
  updated_at: string
}

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

/**
 * Convert database row to Prompt object
 */
function rowToPrompt(row: PromptRow): Prompt {
  return {
    id: row.id,
    userId: row.user_id,
    imageId: row.image_id,
    prompt: row.prompt,
    taskType: row.task_type,
    imageSize: row.image_size,
    watermark: row.watermark,
    responseData: row.response_data ? JSON.parse(row.response_data) : {},
    cost: row.cost,
    durationMs: row.duration_ms,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export class PromptRepository {
  /**
   * Create a new prompt
   */
  static async create(
    env: Env,
    data: {
      userId: string
      prompt: string
      taskType: 'TEXT_TO_IMAGE' | 'IMAGE_TO_IMAGE'
      imageSize: string
      watermark?: string
    }
  ): Promise<Prompt> {
    const id = generateUUID()
    const now = new Date().toISOString()

    const result = await env.DB.prepare(`
      INSERT INTO prompts (
        id, user_id, prompt, task_type, image_size,
        watermark, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.userId,
      data.prompt,
      data.taskType,
      data.imageSize,
      data.watermark || null,
      'PENDING',
      now,
      now
    )

    console.log('[DB] Prompt created:', id)

    return this.getById(env, id) as Promise<Prompt>
  }

  /**
   * Get prompt by ID
   */
  static async getById(env: Env, id: string): Promise<Prompt | null> {
    const result = await env.DB.prepare(
      'SELECT * FROM prompts WHERE id = ?'
    ).bind(id).first<PromptRow>()

    if (!result) return null
    return rowToPrompt(result)
  }

  /**
   * Get all prompts for a user
   */
  static async getByUserId(
    env: Env,
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<Prompt[]> {
    let query = 'SELECT * FROM prompts WHERE user_id = ? ORDER BY created_at DESC'
    const bindings: any[] = [userId]

    if (options?.limit) {
      query += ' LIMIT ?'
      bindings.push(options.limit)
    }

    if (options?.offset) {
      query += ' OFFSET ?'
      bindings.push(options.offset)
    }

    const results = await env.DB.prepare(query).bind(...bindings).all<PromptRow>()
    return (results.results || []).map(rowToPrompt)
  }

  /**
   * Update prompt status
   */
  static async updateStatus(
    env: Env,
    id: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    data?: {
      imageId?: string
      cost?: number
      durationMs?: number
      responseData?: Record<string, any>
      errorMessage?: string
    }
  ): Promise<Prompt> {
    const now = new Date().toISOString()
    let query = 'UPDATE prompts SET status = ?, updated_at = ?'
    const bindings: any[] = [status, now]

    if (data?.imageId) {
      query += ', image_id = ?'
      bindings.push(data.imageId)
    }

    if (data?.cost !== undefined) {
      query += ', cost = ?'
      bindings.push(data.cost)
    }

    if (data?.durationMs) {
      query += ', duration_ms = ?'
      bindings.push(data.durationMs)
    }

    if (data?.responseData) {
      query += ', response_data = ?'
      bindings.push(JSON.stringify(data.responseData))
    }

    if (data?.errorMessage) {
      query += ', error_message = ?'
      bindings.push(data.errorMessage)
    }

    query += ' WHERE id = ?'
    bindings.push(id)

    await env.DB.prepare(query).bind(...bindings).run()

    return this.getById(env, id) as Promise<Prompt>
  }

  /**
   * Get prompts by status
   */
  static async getByStatus(
    env: Env,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    options?: { limit?: number }
  ): Promise<Prompt[]> {
    let query = 'SELECT * FROM prompts WHERE status = ? ORDER BY created_at DESC'
    const bindings: any[] = [status]

    if (options?.limit) {
      query += ' LIMIT ?'
      bindings.push(options.limit)
    }

    const results = await env.DB.prepare(query).bind(...bindings).all<PromptRow>()
    return (results.results || []).map(rowToPrompt)
  }

  /**
   * Get user's image generation cost summary
   */
  static async getUserCostSummary(env: Env, userId: string): Promise<{
    totalCost: number
    totalGenerated: number
  }> {
    const result = await env.DB.prepare(
      `SELECT 
        COALESCE(SUM(cost), 0) as total_cost,
        COUNT(*) as total_generated
       FROM prompts 
       WHERE user_id = ? AND status = 'COMPLETED'`
    ).bind(userId).first<any>()

    return {
      totalCost: result?.total_cost || 0,
      totalGenerated: result?.total_generated || 0,
    }
  }
}
