/**
 * Events CRUD Service
 * High-level CRUD operations with caching and state management
 */

import Event from '@/models/Event'
import eventsAPI from '@/services/eventsAPI'

export class EventsCRUDService {
  constructor() {
    this.cache = new Map()
    this.cacheDuration = 5 * 60 * 1000 // 5 minutes
    this.cacheTimestamps = new Map()
  }

  /**
   * Check if cache is valid
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  isCacheValid(key) {
    const timestamp = this.cacheTimestamps.get(key)
    if (!timestamp) return false
    return Date.now() - timestamp < this.cacheDuration
  }

  /**
   * Get from cache or fetch
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data
   * @returns {Promise<any>}
   */
  async getWithCache(key, fetchFn) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)
    }

    const data = await fetchFn()
    this.cache.set(key, data)
    this.cacheTimestamps.set(key, Date.now())
    return data
  }

  /**
   * Invalidate cache
   * @param {string} pattern - Cache key pattern (optional)
   */
  invalidateCache(pattern = null) {
    if (!pattern) {
      this.cache.clear()
      this.cacheTimestamps.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
        this.cacheTimestamps.delete(key)
      }
    }
  }

  /**
   * Get all events
   * @returns {Promise<Event[]>}
   */
  async getAll() {
    return this.getWithCache('events:all', async () => {
      const data = await eventsAPI.getAll()
      return Array.isArray(data) ? data.map((e) => new Event(e)) : []
    })
  }

  /**
   * Get event by ID
   * @param {string|number} id - Event ID
   * @returns {Promise<Event>}
   */
  async getById(id) {
    return this.getWithCache(`events:${id}`, async () => {
      const data = await eventsAPI.getById(id)
      return new Event(data)
    })
  }

  /**
   * Get events by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Event[]>}
   */
  async getByDateRange(startDate, endDate) {
    const key = `events:range:${startDate}:${endDate}`
    return this.getWithCache(key, async () => {
      const data = await eventsAPI.getByDateRange(startDate, endDate)
      return Array.isArray(data) ? data.map((e) => new Event(e)) : []
    })
  }

  /**
   * Get events by category
   * @param {string} category - Category name
   * @returns {Promise<Event[]>}
   */
  async getByCategory(category) {
    return this.getWithCache(`events:category:${category}`, async () => {
      const data = await eventsAPI.getByCategory(category)
      return Array.isArray(data) ? data.map((e) => new Event(e)) : []
    })
  }

  /**
   * Search events
   * @param {string} query - Search query
   * @returns {Promise<Event[]>}
   */
  async search(query) {
    const data = await eventsAPI.search(query)
    return Array.isArray(data) ? data.map((e) => new Event(e)) : []
  }

  /**
   * Get upcoming events
   * @param {number} days - Number of days ahead
   * @returns {Promise<Event[]>}
   */
  async getUpcoming(days = 7) {
    return this.getWithCache(`events:upcoming:${days}`, async () => {
      const data = await eventsAPI.getUpcoming(days)
      return Array.isArray(data) ? data.map((e) => new Event(e)) : []
    })
  }

  /**
   * Get events by priority
   * @param {string} priority - Priority level
   * @returns {Promise<Event[]>}
   */
  async getByPriority(priority) {
    return this.getWithCache(`events:priority:${priority}`, async () => {
      const data = await eventsAPI.getByPriority(priority)
      return Array.isArray(data) ? data.map((e) => new Event(e)) : []
    })
  }

  /**
   * Create event
   * @param {Event|Object} eventData - Event data
   * @returns {Promise<Event>}
   */
  async create(eventData) {
    const event = eventData instanceof Event ? eventData : new Event(eventData)

    const validation = event.validate()
    if (!validation.isValid) {
      throw new Error(`Event validation failed: ${validation.errors.join(', ')}`)
    }

    const created = await eventsAPI.create(event.toAPI())
    const result = new Event(created)

    // Invalidate relevant caches
    this.invalidateCache('events:')

    return result
  }

  /**
   * Update event
   * @param {string|number} id - Event ID
   * @param {Object} updates - Updated fields
   * @returns {Promise<Event>}
   */
  async update(id, updates) {
    const event = new Event(updates)
    event.id = id
    event.updatedAt = new Date().toISOString()

    const validation = event.validate()
    if (!validation.isValid) {
      throw new Error(`Event validation failed: ${validation.errors.join(', ')}`)
    }

    const updated = await eventsAPI.update(id, event.toAPI())
    const result = new Event(updated)

    // Invalidate relevant caches
    this.cache.delete(`events:${id}`)
    this.invalidateCache('events:')

    return result
  }

  /**
   * Delete event
   * @param {string|number} id - Event ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const result = await eventsAPI.delete(id)

    // Invalidate relevant caches
    this.cache.delete(`events:${id}`)
    this.invalidateCache('events:')

    return result
  }

  /**
   * Bulk create events
   * @param {Array<Event|Object>} events - Array of event data
   * @returns {Promise<Event[]>}
   */
  async bulkCreate(events) {
    const eventObjects = events.map((e) => (e instanceof Event ? e : new Event(e)))

    // Validate all events
    for (const event of eventObjects) {
      const validation = event.validate()
      if (!validation.isValid) {
        throw new Error(`Event validation failed: ${validation.errors.join(', ')}`)
      }
    }

    const created = await eventsAPI.bulkCreate(eventObjects.map((e) => e.toAPI()))
    const results = Array.isArray(created) ? created.map((e) => new Event(e)) : []

    // Invalidate relevant caches
    this.invalidateCache('events:')

    return results
  }

  /**
   * Bulk update events
   * @param {Array<Object>} events - Array of event data with IDs
   * @returns {Promise<Event[]>}
   */
  async bulkUpdate(events) {
    const updated = await eventsAPI.bulkUpdate(events)
    const results = Array.isArray(updated) ? updated.map((e) => new Event(e)) : []

    // Invalidate relevant caches
    this.invalidateCache('events:')

    return results
  }

  /**
   * Bulk delete events
   * @param {Array<string|number>} ids - Array of event IDs
   * @returns {Promise<Object>}
   */
  async bulkDelete(ids) {
    const result = await eventsAPI.bulkDelete(ids)

    // Invalidate relevant caches
    ids.forEach((id) => this.cache.delete(`events:${id}`))
    this.invalidateCache('events:')

    return result
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.invalidateCache()
  }
}

export const eventsCRUD = new EventsCRUDService()
export default eventsCRUD
