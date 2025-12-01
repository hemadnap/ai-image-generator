/**
 * Database Initialization
 * Creates tables if they don't exist
 */

import { Env } from '../index'

export class DatabaseInit {
  /**
   * Initialize all database tables
   */
  static async initialize(env: Env): Promise<void> {
    try {
      console.log('[DB] Initializing tables...')
      
      // Create users table
      await this.createUsersTable(env)
      
      // Create images table
      await this.createImagesTable(env)

      // Create prompts table
      await this.createPromptsTable(env)
      
      console.log('[DB] All tables initialized successfully')
    } catch (error) {
      console.error('[DB] Initialization error:', error)
      throw error
    }
  }

  /**
   * Create users table
   */
  private static async createUsersTable(env: Env): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        google_id TEXT NOT NULL UNIQUE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        roles TEXT NOT NULL DEFAULT '[\"USER\"]',
        language TEXT NOT NULL DEFAULT 'en',
        coins INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `

    const createIndexEmail = 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);'
    const createIndexGoogleId = 'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);'

    try {
      await env.DB.prepare(createTableSQL).run()
      await env.DB.prepare(createIndexEmail).run()
      await env.DB.prepare(createIndexGoogleId).run()
      console.log('[DB] Users table initialized')
    } catch (error: any) {
      if (!error.message?.includes('already exists')) {
        throw error
      }
    }
  }

  /**
   * Create images table
   */
  private static async createImagesTable(env: Env): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('GENERATED', 'UPLOADED')),
        status TEXT NOT NULL CHECK(status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
        title TEXT NOT NULL,
        description TEXT,
        prompt TEXT,
        storage_key TEXT NOT NULL,
        storage_url TEXT NOT NULL,
        thumbnail_key TEXT,
        thumbnail_url TEXT,
        metadata TEXT NOT NULL DEFAULT '{}',
        coins_used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `

    const createIndexUserId = 'CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);'
    const createIndexStatus = 'CREATE INDEX IF NOT EXISTS idx_images_status ON images(status);'
    const createIndexType = 'CREATE INDEX IF NOT EXISTS idx_images_type ON images(type);'
    const createIndexCreatedAt = 'CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);'

    try {
      await env.DB.prepare(createTableSQL).run()
      await env.DB.prepare(createIndexUserId).run()
      await env.DB.prepare(createIndexStatus).run()
      await env.DB.prepare(createIndexType).run()
      await env.DB.prepare(createIndexCreatedAt).run()
      console.log('[DB] Images table initialized')
    } catch (error: any) {
      if (!error.message?.includes('already exists')) {
        throw error
      }
    }
  }

  /**
   * Create prompts table
   */
  private static async createPromptsTable(env: Env): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS prompts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        image_id TEXT,
        prompt TEXT NOT NULL,
        task_type TEXT NOT NULL CHECK(task_type IN ('TEXT_TO_IMAGE', 'IMAGE_TO_IMAGE')),
        image_size TEXT NOT NULL DEFAULT '1024x1024',
        watermark TEXT,
        response_data TEXT NOT NULL DEFAULT '{}',
        cost REAL NOT NULL DEFAULT 0,
        duration_ms INTEGER,
        status TEXT NOT NULL CHECK(status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')) DEFAULT 'PENDING',
        error_message TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE SET NULL
      );
    `

    const createIndexUserId = 'CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);'
    const createIndexImageId = 'CREATE INDEX IF NOT EXISTS idx_prompts_image_id ON prompts(image_id);'
    const createIndexStatus = 'CREATE INDEX IF NOT EXISTS idx_prompts_status ON prompts(status);'
    const createIndexCreatedAt = 'CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);'

    try {
      await env.DB.prepare(createTableSQL).run()
      await env.DB.prepare(createIndexUserId).run()
      await env.DB.prepare(createIndexImageId).run()
      await env.DB.prepare(createIndexStatus).run()
      await env.DB.prepare(createIndexCreatedAt).run()
      console.log('[DB] Prompts table initialized')
    } catch (error: any) {
      if (!error.message?.includes('already exists')) {
        throw error
      }
    }
  }

  /**
   * Drop all tables (for testing/reset)
   */
  static async reset(env: Env): Promise<void> {
    try {
      await env.DB.prepare('DROP TABLE IF EXISTS prompts;').run()
      await env.DB.prepare('DROP TABLE IF EXISTS images;').run()
      await env.DB.prepare('DROP TABLE IF EXISTS users;').run()
      console.log('[DB] Tables dropped')
    } catch (error) {
      console.error('[DB] Reset error:', error)
      throw error
    }
  }
}
