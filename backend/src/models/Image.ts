/**
 * Image Model
 * Represents an image (generated or uploaded) in the database
 */

export enum ImageType {
  GENERATED = 'GENERATED',
  UPLOADED = 'UPLOADED',
}

export enum ImageStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ImageMetadata {
  width?: number
  height?: number
  format?: string
  size?: number
  [key: string]: any
}

export interface ImageRow {
  id: string
  user_id: string
  type: ImageType
  status: ImageStatus
  title: string
  description: string
  prompt?: string // For generated images
  storage_key: string
  storage_url: string
  thumbnail_key?: string
  thumbnail_url?: string
  metadata: string // JSON stringified
  coins_used: number
  created_at: string
  updated_at: string
}

export class Image {
  id: string
  userId: string
  type: ImageType
  status: ImageStatus
  title: string
  description: string
  prompt?: string
  storageKey: string
  storageUrl: string
  thumbnailKey?: string
  thumbnailUrl?: string
  metadata: ImageMetadata
  coinsUsed: number
  createdAt: Date
  updatedAt: Date

  constructor(data: ImageRow) {
    this.id = data.id
    this.userId = data.user_id
    this.type = data.type
    this.status = data.status
    this.title = data.title
    this.description = data.description
    this.prompt = data.prompt
    this.storageKey = data.storage_key
    this.storageUrl = data.storage_url
    this.thumbnailKey = data.thumbnail_key
    this.thumbnailUrl = data.thumbnail_url
    this.metadata = JSON.parse(data.metadata) as ImageMetadata
    this.coinsUsed = data.coins_used
    this.createdAt = new Date(data.created_at)
    this.updatedAt = new Date(data.updated_at)
  }

  /**
   * Check if image is ready to download
   */
  isReady(): boolean {
    return this.status === ImageStatus.COMPLETED
  }

  /**
   * Get image display URL (storage URL or thumbnail)
   */
  getDisplayUrl(): string {
    return this.thumbnailUrl || this.storageUrl
  }

  /**
   * Check if image is generated (not uploaded)
   */
  isGenerated(): boolean {
    return this.type === ImageType.GENERATED
  }

  /**
   * Check if image is uploaded
   */
  isUploaded(): boolean {
    return this.type === ImageType.UPLOADED
  }

  /**
   * Get image dimensions
   */
  getDimensions(): { width?: number; height?: number } {
    return {
      width: this.metadata.width,
      height: this.metadata.height,
    }
  }

  /**
   * Get image size in MB
   */
  getSizeInMB(): string {
    if (!this.metadata.size) return 'Unknown'
    const mb = this.metadata.size / (1024 * 1024)
    return mb.toFixed(2)
  }

  /**
   * Convert to JSON response
   */
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      status: this.status,
      title: this.title,
      description: this.description,
      prompt: this.prompt,
      storageUrl: this.storageUrl,
      thumbnailUrl: this.thumbnailUrl,
      displayUrl: this.getDisplayUrl(),
      metadata: this.metadata,
      coinsUsed: this.coinsUsed,
      isReady: this.isReady(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    }
  }

  /**
   * Convert to row for database insertion
   */
  toRow(): Omit<ImageRow, 'id' | 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string } {
    return {
      user_id: this.userId,
      type: this.type,
      status: this.status,
      title: this.title,
      description: this.description,
      prompt: this.prompt,
      storage_key: this.storageKey,
      storage_url: this.storageUrl,
      thumbnail_key: this.thumbnailKey,
      thumbnail_url: this.thumbnailUrl,
      metadata: JSON.stringify(this.metadata),
      coins_used: this.coinsUsed,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    }
  }
}
