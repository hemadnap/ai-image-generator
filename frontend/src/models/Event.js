/**
 * Event Model
 * Defines the structure and validation for event objects
 */

export class Event {
  constructor(data = {}) {
    this.id = data.id || null
    this.title = data.title || ''
    this.date = data.date || new Date().toISOString().split('T')[0]
    this.startTime = data.startTime || '09:00'
    this.endTime = data.endTime || '10:00'
    this.location = data.location || ''
    this.description = data.description || ''
    this.priority = data.priority || 'medium' // 'low', 'medium', 'high'
    this.category = data.category || 'general'
    this.tags = data.tags || []
    this.attendees = data.attendees || []
    this.isRecurring = data.isRecurring || false
    this.recurrencePattern = data.recurrencePattern || null // 'daily', 'weekly', 'monthly', 'yearly'
    this.reminderMinutes = data.reminderMinutes || 15
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  /**
   * Validate event data
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = []

    if (!this.title || this.title.trim() === '') {
      errors.push('Title is required')
    }

    if (!this.date) {
      errors.push('Date is required')
    }

    if (!this.startTime) {
      errors.push('Start time is required')
    }

    if (!this.endTime) {
      errors.push('End time is required')
    }

    if (this.startTime >= this.endTime) {
      errors.push('End time must be after start time')
    }

    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(this.priority)) {
      errors.push('Invalid priority level')
    }

    const validPatterns = ['daily', 'weekly', 'monthly', 'yearly', null]
    if (!validPatterns.includes(this.recurrencePattern)) {
      errors.push('Invalid recurrence pattern')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Convert to API payload
   * @returns {Object}
   */
  toAPI() {
    return {
      id: this.id,
      title: this.title,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      location: this.location,
      description: this.description,
      priority: this.priority,
      category: this.category,
      tags: this.tags,
      attendees: this.attendees,
      isRecurring: this.isRecurring,
      recurrencePattern: this.recurrencePattern,
      reminderMinutes: this.reminderMinutes,
    }
  }

  /**
   * Get event duration in minutes
   * @returns {number}
   */
  getDurationMinutes() {
    const [startH, startM] = this.startTime.split(':').map(Number)
    const [endH, endM] = this.endTime.split(':').map(Number)
    return endH * 60 + endM - (startH * 60 + startM)
  }

  /**
   * Check if event is happening today
   * @returns {boolean}
   */
  isToday() {
    const today = new Date().toISOString().split('T')[0]
    return this.date === today
  }

  /**
   * Check if event is in the past
   * @returns {boolean}
   */
  isPast() {
    const now = new Date()
    const eventDateTime = new Date(`${this.date}T${this.endTime}`)
    return eventDateTime < now
  }

  /**
   * Check if event is upcoming
   * @returns {boolean}
   */
  isUpcoming() {
    const now = new Date()
    const eventDateTime = new Date(`${this.date}T${this.startTime}`)
    return eventDateTime > now
  }

  /**
   * Get event time range as string
   * @returns {string}
   */
  getTimeRange() {
    return `${this.startTime} - ${this.endTime}`
  }

  /**
   * Clone the event
   * @returns {Event}
   */
  clone() {
    return new Event({ ...this })
  }
}

export default Event
