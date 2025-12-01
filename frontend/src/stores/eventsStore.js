/**
 * Events Store (Pinia)
 * Centralized state management for events
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Event from '@/models/Event'
import eventsCRUD from '@/services/eventsCRUD'

export const useEventsStore = defineStore('events', () => {
  // State
  const events = ref([])
  const selectedEvent = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const filters = ref({
    category: null,
    priority: null,
    searchQuery: '',
    dateRange: { start: null, end: null },
  })
  const sortBy = ref('date') // 'date', 'priority', 'title'
  const sortOrder = ref('asc') // 'asc', 'desc'

  // Computed
  const filteredEvents = computed(() => {
    let result = [...events.value]

    // Apply filters
    if (filters.value.category) {
      result = result.filter((e) => e.category === filters.value.category)
    }

    if (filters.value.priority) {
      result = result.filter((e) => e.priority === filters.value.priority)
    }

    if (filters.value.searchQuery) {
      const query = filters.value.searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query),
      )
    }

    if (filters.value.dateRange.start && filters.value.dateRange.end) {
      result = result.filter(
        (e) => e.date >= filters.value.dateRange.start && e.date <= filters.value.dateRange.end,
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal, bVal

      switch (sortBy.value) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aVal = priorityOrder[a.priority]
          bVal = priorityOrder[b.priority]
          break
        case 'title':
          aVal = a.title.toLowerCase()
          bVal = b.title.toLowerCase()
          break
        case 'date':
        default:
          aVal = new Date(`${a.date}T${a.startTime}`)
          bVal = new Date(`${b.date}T${b.startTime}`)
      }

      if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1
      return 0
    })

    return result
  })

  const eventCount = computed(() => events.value.length)
  const filteredEventCount = computed(() => filteredEvents.value.length)

  const upcomingEvents = computed(() =>
    events.value
      .filter((e) => e.isUpcoming())
      .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`)),
  )

  const todayEvents = computed(() =>
    events.value.filter((e) => e.isToday()).sort((a, b) => a.startTime.localeCompare(b.startTime)),
  )

  const highPriorityEvents = computed(() => events.value.filter((e) => e.priority === 'high'))

  const pastEvents = computed(() => events.value.filter((e) => e.isPast()))

  // Methods
  async function fetchAll() {
    isLoading.value = true
    error.value = null
    try {
      const data = await eventsCRUD.getAll()
      events.value = data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching events:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchById(id) {
    isLoading.value = true
    error.value = null
    try {
      return await eventsCRUD.getById(id)
    } catch (err) {
      error.value = err.message
      console.error(`Error fetching event ${id}:`, err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchByDateRange(startDate, endDate) {
    isLoading.value = true
    error.value = null
    try {
      const data = await eventsCRUD.getByDateRange(startDate, endDate)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching events by date range:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchByCategory(category) {
    isLoading.value = true
    error.value = null
    try {
      return await eventsCRUD.getByCategory(category)
    } catch (err) {
      error.value = err.message
      console.error(`Error fetching ${category} events:`, err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUpcoming(days = 7) {
    isLoading.value = true
    error.value = null
    try {
      return await eventsCRUD.getUpcoming(days)
    } catch (err) {
      error.value = err.message
      console.error('Error fetching upcoming events:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function searchEvents(query) {
    isLoading.value = true
    error.value = null
    try {
      return await eventsCRUD.search(query)
    } catch (err) {
      error.value = err.message
      console.error('Error searching events:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function addEvent(eventData) {
    isLoading.value = true
    error.value = null
    try {
      const created = await eventsCRUD.create(eventData)
      events.value.push(created)
      return created
    } catch (err) {
      error.value = err.message
      console.error('Error adding event:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function updateEvent(id, updates) {
    isLoading.value = true
    error.value = null
    try {
      const updated = await eventsCRUD.update(id, updates)
      const index = events.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        events.value[index] = updated
      }
      if (selectedEvent.value?.id === id) {
        selectedEvent.value = updated
      }
      return updated
    } catch (err) {
      error.value = err.message
      console.error(`Error updating event ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deleteEvent(id) {
    isLoading.value = true
    error.value = null
    try {
      await eventsCRUD.delete(id)
      events.value = events.value.filter((e) => e.id !== id)
      if (selectedEvent.value?.id === id) {
        selectedEvent.value = null
      }
    } catch (err) {
      error.value = err.message
      console.error(`Error deleting event ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function bulkCreateEvents(eventsList) {
    isLoading.value = true
    error.value = null
    try {
      const created = await eventsCRUD.bulkCreate(eventsList)
      events.value.push(...created)
      return created
    } catch (err) {
      error.value = err.message
      console.error('Error bulk creating events:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function bulkDeleteEvents(ids) {
    isLoading.value = true
    error.value = null
    try {
      await eventsCRUD.bulkDelete(ids)
      events.value = events.value.filter((e) => !ids.includes(e.id))
      if (selectedEvent.value && ids.includes(selectedEvent.value.id)) {
        selectedEvent.value = null
      }
    } catch (err) {
      error.value = err.message
      console.error('Error bulk deleting events:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function selectEvent(event) {
    selectedEvent.value = event
  }

  function deselectEvent() {
    selectedEvent.value = null
  }

  function setFilter(filterName, value) {
    if (filterName in filters.value) {
      filters.value[filterName] = value
    }
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {
      category: null,
      priority: null,
      searchQuery: '',
      dateRange: { start: null, end: null },
    }
  }

  function setSortBy(field) {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = 'asc'
    }
  }

  function clearCache() {
    eventsCRUD.clearCache()
  }

  function clearError() {
    error.value = null
  }

  // Return store
  return {
    // State
    events,
    selectedEvent,
    isLoading,
    error,
    filters,
    sortBy,
    sortOrder,

    // Computed
    filteredEvents,
    eventCount,
    filteredEventCount,
    upcomingEvents,
    todayEvents,
    highPriorityEvents,
    pastEvents,

    // Methods
    fetchAll,
    fetchById,
    fetchByDateRange,
    fetchByCategory,
    fetchUpcoming,
    searchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    bulkCreateEvents,
    bulkDeleteEvents,
    selectEvent,
    deselectEvent,
    setFilter,
    setFilters,
    clearFilters,
    setSortBy,
    clearCache,
    clearError,
  }
})

export default useEventsStore
