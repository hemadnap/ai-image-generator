/**
 * Events API Service
 * Handles all API calls for event operations
 */

import axiosInstance from '@/api/axiosInstance'
import { API_CONFIG } from '@/constants/config'

const API_BASE = `${API_CONFIG.BASE_URL}/events`

export const eventsAPI = {
  /**
   * Get all events
   * @param {Object} options - Query options (filter, sort, etc.)
   * @returns {Promise<Array>}
   */
  async getAll(options = {}) {
    try {
      const response = await axiosInstance.get(`${API_BASE}`, { params: options })
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching events:', error)
      throw error
    }
  },

  /**
   * Get events by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async getByDateRange(startDate, endDate) {
    try {
      const response = await axiosInstance.get(`${API_BASE}/range`, {
        params: { startDate, endDate },
      })
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching events by date range:', error)
      throw error
    }
  },

  /**
   * Get events by category
   * @param {string} category - Category name
   * @returns {Promise<Array>}
   */
  async getByCategory(category) {
    try {
      const response = await axiosInstance.get(`${API_BASE}/category/${category}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching events by category:', error)
      throw error
    }
  },

  /**
   * Search events
   * @param {string} query - Search query
   * @returns {Promise<Array>}
   */
  async search(query) {
    try {
      const response = await axiosInstance.get(`${API_BASE}/search`, {
        params: { q: query },
      })
      return response.data.data || response.data
    } catch (error) {
      console.error('Error searching events:', error)
      throw error
    }
  },

  /**
   * Get single event by ID
   * @param {string|number} id - Event ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await axiosInstance.get(`${API_BASE}/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error)
      throw error
    }
  },

  /**
   * Create new event
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>}
   */
  async create(eventData) {
    try {
      const response = await axiosInstance.post(`${API_BASE}`, eventData)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  },

  /**
   * Update event
   * @param {string|number} id - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise<Object>}
   */
  async update(id, eventData) {
    try {
      const response = await axiosInstance.put(`${API_BASE}/${id}`, eventData)
      return response.data.data || response.data
    } catch (error) {
      console.error(`Error updating event ${id}:`, error)
      throw error
    }
  },

  /**
   * Delete event
   * @param {string|number} id - Event ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    try {
      const response = await axiosInstance.delete(`${API_BASE}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error)
      throw error
    }
  },

  /**
   * Bulk create events
   * @param {Array} events - Array of event data
   * @returns {Promise<Array>}
   */
  async bulkCreate(events) {
    try {
      const response = await axiosInstance.post(`${API_BASE}/bulk`, { events })
      return response.data.data || response.data
    } catch (error) {
      console.error('Error bulk creating events:', error)
      throw error
    }
  },

  /**
   * Bulk update events
   * @param {Array} events - Array of event data with IDs
   * @returns {Promise<Array>}
   */
  async bulkUpdate(events) {
    try {
      const response = await axiosInstance.put(`${API_BASE}/bulk`, { events })
      return response.data.data || response.data
    } catch (error) {
      console.error('Error bulk updating events:', error)
      throw error
    }
  },

  /**
   * Bulk delete events
   * @param {Array} ids - Array of event IDs
   * @returns {Promise<Object>}
   */
  async bulkDelete(ids) {
    try {
      const response = await axiosInstance.delete(`${API_BASE}/bulk`, {
        data: { ids },
      })
      return response.data
    } catch (error) {
      console.error('Error bulk deleting events:', error)
      throw error
    }
  },

  /**
   * Get upcoming events
   * @param {number} days - Number of days ahead to look
   * @returns {Promise<Array>}
   */
  async getUpcoming(days = 7) {
    try {
      const response = await axiosInstance.get(`${API_BASE}/upcoming`, {
        params: { days },
      })
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      throw error
    }
  },

  /**
   * Get events by priority
   * @param {string} priority - Priority level (low, medium, high)
   * @returns {Promise<Array>}
   */
  async getByPriority(priority) {
    try {
      const response = await axiosInstance.get(`${API_BASE}/priority/${priority}`)
      return response.data.data || response.data
    } catch (error) {
      console.error(`Error fetching ${priority} priority events:`, error)
      throw error
    }
  },
}

export default eventsAPI
