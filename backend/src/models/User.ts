/**
 * User Model
 * Represents a user in the image generator application
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface UserRow {
  id: string
  email: string
  google_id: string
  first_name: string
  last_name: string
  roles: string // JSON stringified array
  language: string
  coins: number
  created_at: string
  updated_at: string
}

export class User {
  id: string
  email: string
  googleId: string
  firstName: string
  lastName: string
  roles: UserRole[]
  language: string
  coins: number
  createdAt: Date
  updatedAt: Date

  constructor(data: UserRow) {
    this.id = data.id
    this.email = data.email
    this.googleId = data.google_id
    this.firstName = data.first_name
    this.lastName = data.last_name
    this.roles = JSON.parse(data.roles) as UserRole[]
    this.language = data.language
    this.coins = data.coins
    this.createdAt = new Date(data.created_at)
    this.updatedAt = new Date(data.updated_at)
  }

  /**
   * Get full name
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this.roles.includes(role)
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN)
  }

  /**
   * Check if user can afford feature (has enough coins)
   */
  canAffordFeature(coinsRequired: number): boolean {
    return this.coins >= coinsRequired
  }

  /**
   * Deduct coins from user
   */
  deductCoins(amount: number): void {
    if (this.coins >= amount) {
      this.coins -= amount
    } else {
      throw new Error(`Insufficient coins. Required: ${amount}, Available: ${this.coins}`)
    }
  }

  /**
   * Add coins to user
   */
  addCoins(amount: number): void {
    this.coins += amount
  }

  /**
   * Convert to JSON response (exclude sensitive data)
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      roles: this.roles,
      language: this.language,
      coins: this.coins,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    }
  }

  /**
   * Convert to row for database insertion
   */
  toRow(): Omit<UserRow, 'id' | 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string } {
    return {
      email: this.email,
      google_id: this.googleId,
      first_name: this.firstName,
      last_name: this.lastName,
      roles: JSON.stringify(this.roles),
      language: this.language,
      coins: this.coins,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    }
  }
}
