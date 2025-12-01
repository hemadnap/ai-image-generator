<template>
  <div class="calendar-container">
    <!-- Event Modal -->
    <EventModal
      :isOpen="showEventDetailsModal"
      :event="selectedEventForModal"
      @close="showEventDetailsModal = false"
      @edit="handleEditEvent"
      @delete="handleDeleteEvent"
      @duplicate="handleDuplicateEvent"
      @export="handleExportEvent"
    />

    <!-- Header with navigation and view switcher -->
    <div class="calendar-header">
      <div class="header-left">
        <button class="btn-nav" @click="goToPrevious" :title="`Previous ${viewType}`">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h2 class="current-date">{{ formatHeaderDate }}</h2>
        <button class="btn-nav" @click="goToNext" :title="`Next ${viewType}`">
          <i class="fas fa-chevron-right"></i>
        </button>
        <button class="btn-today" @click="goToToday">Today</button>
      </div>

      <div class="view-switcher">
        <button
          v-for="view in viewOptions"
          :key="view"
          :class="['view-btn', { active: viewType === view }]"
          @click="changeView(view)"
        >
          {{ view.charAt(0).toUpperCase() + view.slice(1) }}
        </button>
      </div>

      <div class="header-right">
        <input
          v-model="internalSearchQuery"
          @input="$emit('update:searchQuery', internalSearchQuery)"
          type="text"
          placeholder="Search events..."
          class="search-input"
        />
        <button class="btn-add-event" @click="showEventModal = true">
          <i class="fas fa-plus"></i> Event
        </button>
      </div>
    </div>

    <!-- Calendar content -->
    <div class="calendar-content">
      <!-- Day View -->
      <div v-if="viewType === 'day'" class="calendar-view day-view">
        <div class="day-view-container">
          <div class="day-header">
            <h3>{{ formatDate(currentDate, 'EEEE, MMMM d, yyyy') }}</h3>
          </div>
          <div class="day-timeline">
            <div v-for="hour in 24" :key="hour" class="hour-slot">
              <div class="time-label">{{ formatTime(hour) }}</div>
              <div class="events-container">
                <div
                  v-for="event in getEventsForHour(hour)"
                  :key="event.id"
                  :class="['event-item', `priority-${event.priority}`]"
                  @click="selectEvent(event)"
                >
                  <div class="event-time">{{ event.startTime }}</div>
                  <div class="event-title">{{ event.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Week View -->
      <div v-else-if="viewType === 'week'" class="calendar-view week-view">
        <div class="week-header">
          <div
            class="week-day"
            v-for="day in weekDays"
            :key="day.toISOString()"
            :class="{ today: isToday(day) }"
          >
            <div class="day-name">{{ formatDate(day, 'EEE') }}</div>
            <div class="day-number">{{ day.getDate() }}</div>
          </div>
        </div>
        <div class="week-grid">
          <div v-for="hour in 24" :key="hour" class="week-hour">
            <div class="hour-label">{{ formatTime(hour) }}</div>
            <div v-for="day in weekDays" :key="day.toISOString()" class="day-slot">
              <div
                v-for="event in getEventsForDayAndHour(day, hour)"
                :key="event.id"
                :class="['event-item', `priority-${event.priority}`]"
                @click="selectEvent(event)"
              >
                <div class="event-title">{{ event.title }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Month View -->
      <div v-else-if="viewType === 'month'" class="calendar-view month-view">
        <div class="month-header">
          <div
            v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="day"
            class="day-header-cell"
          >
            {{ day }}
          </div>
        </div>
        <div class="month-grid">
          <div
            v-for="day in monthDays"
            :key="day.toISOString()"
            :class="[
              'month-day',
              {
                'other-month': !isSameMonth(day, currentDate),
                today: isToday(day),
              },
            ]"
            @click="selectDate(day)"
          >
            <div class="day-number">{{ day.getDate() }}</div>
            <div class="day-events">
              <div
                v-for="event in getEventsForDay(day)"
                :key="event.id"
                :class="['event-dot', `priority-${event.priority}`]"
                :title="event.title"
                @click.stop="selectEvent(event)"
              >
                <span class="event-preview">{{ event.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Year View -->
      <div v-else-if="viewType === 'year'" class="calendar-view year-view">
        <div class="year-header">
          <h3>{{ currentDate.getFullYear() }}</h3>
        </div>
        <div class="year-grid">
          <div v-for="month in 12" :key="month" class="mini-month" @click="goToMonth(month)">
            <div class="mini-month-name">{{ getMonthName(month - 1) }}</div>
            <div class="mini-month-grid">
              <div v-for="dayNum in getDaysInMonth(month)" :key="dayNum" class="mini-day">
                {{ dayNum }}
              </div>
            </div>
            <div v-if="getEventsForMonth(month).length > 0" class="mini-month-events">
              {{ getEventsForMonth(month).length }} event(s)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event details sidebar -->
    <div v-if="selectedEvent" :class="['event-sidebar', { open: selectedEvent }]">
      <div class="sidebar-header">
        <h3>Event Details</h3>
        <button @click="selectedEvent = null" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="event-details">
        <div class="detail-item">
          <label>Title</label>
          <div class="detail-value">{{ selectedEvent.title }}</div>
        </div>
        <div class="detail-item">
          <label>Date</label>
          <div class="detail-value">
            {{ formatDate(new Date(selectedEvent.date), 'MMMM d, yyyy') }}
          </div>
        </div>
        <div class="detail-item">
          <label>Time</label>
          <div class="detail-value">
            {{ selectedEvent.startTime }} - {{ selectedEvent.endTime }}
          </div>
        </div>
        <div class="detail-item">
          <label>Location</label>
          <div class="detail-value">{{ selectedEvent.location || 'N/A' }}</div>
        </div>
        <div class="detail-item">
          <label>Description</label>
          <div class="detail-value">{{ selectedEvent.description || 'No description' }}</div>
        </div>
        <div class="detail-item">
          <label>Priority</label>
          <div :class="['detail-value', `priority-${selectedEvent.priority}`]">
            {{ selectedEvent.priority.toUpperCase() }}
          </div>
        </div>
        <div class="event-actions">
          <button class="btn-edit" @click="editEvent(selectedEvent)">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-delete" @click="deleteEvent(selectedEvent.id)">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Event Modal -->
    <div v-if="showEventModal" class="modal-overlay" @click.self="showEventModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingEvent ? 'Edit Event' : 'Add New Event' }}</h3>
          <button @click="showEventModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="saveEvent" class="event-form">
          <div class="form-group">
            <label>Title *</label>
            <input v-model="formData.title" type="text" required placeholder="Event title" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date *</label>
              <input v-model="formData.date" type="date" required />
            </div>
            <div class="form-group">
              <label>Start Time *</label>
              <input v-model="formData.startTime" type="time" required />
            </div>
            <div class="form-group">
              <label>End Time *</label>
              <input v-model="formData.endTime" type="time" required />
            </div>
          </div>
          <div class="form-group">
            <label>Location</label>
            <input v-model="formData.location" type="text" placeholder="Event location" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="formData.description"
              placeholder="Event description"
              rows="4"
            ></textarea>
          </div>
          <div class="form-group">
            <label>Priority</label>
            <select v-model="formData.priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" @click="showEventModal = false" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-submit">
              {{ editingEvent ? 'Update' : 'Create' }} Event
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import EventModal from './EventModal.vue'

// Props
const props = defineProps({
  events: {
    type: Array,
    default: () => [
      {
        id: 1,
        title: 'Team Meeting',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        location: 'Conference Room A',
        description: 'Weekly team sync',
        priority: 'high',
      },
      {
        id: 2,
        title: 'Lunch Break',
        date: new Date().toISOString().split('T')[0],
        startTime: '12:00',
        endTime: '13:00',
        location: 'Cafeteria',
        description: 'Lunch time',
        priority: 'low',
      },
      {
        id: 3,
        title: 'Project Review',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:30',
        location: 'Virtual',
        description: 'Review project progress',
        priority: 'medium',
      },
    ],
  },
  defaultView: {
    type: String,
    default: 'month',
    validator: (value) => ['day', 'week', 'month', 'year'].includes(value),
  },
  searchQuery: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits([
  'update:searchQuery',
  'eventSelected',
  'eventAdded',
  'eventUpdated',
  'eventDeleted',
])

const viewType = ref(props.defaultView)
const currentDate = ref(new Date())
const selectedEvent = ref(null)
const selectedEventForModal = ref(null)
const showEventModal = ref(false)
const showEventDetailsModal = ref(false)
const editingEvent = ref(null)
const internalSearchQuery = ref(props.searchQuery)

const viewOptions = ['day', 'week', 'month', 'year']

// Events data - reactive copy of props
const events = ref([...props.events])

// Form data
const formData = ref({
  title: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  description: '',
  priority: 'medium',
})

// Watch for prop changes
watch(
  () => props.events,
  (newEvents) => {
    events.value = [...newEvents]
  },
  { deep: true },
)

watch(
  () => props.defaultView,
  (newView) => {
    viewType.value = newView
  },
)

watch(
  () => props.searchQuery,
  (newQuery) => {
    internalSearchQuery.value = newQuery
  },
)

// Computed properties
const formatHeaderDate = computed(() => {
  if (viewType.value === 'day') {
    return formatDate(currentDate.value, 'EEEE, MMMM d')
  } else if (viewType.value === 'week') {
    const endDate = new Date(weekDays.value[6])
    return `${formatDate(weekDays.value[0], 'MMM d')} - ${formatDate(endDate, 'MMM d, yyyy')}`
  } else if (viewType.value === 'month') {
    return formatDate(currentDate.value, 'MMMM yyyy')
  } else {
    return currentDate.value.getFullYear().toString()
  }
})

const filteredEvents = computed(() => {
  if (!internalSearchQuery.value.trim()) {
    return events.value
  }

  const query = internalSearchQuery.value.toLowerCase()
  return events.value.filter(
    (event) =>
      event.title.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query),
  )
})

const weekDays = computed(() => {
  const startDate = new Date(currentDate.value)
  const day = startDate.getDay()
  const diff = startDate.getDate() - day
  startDate.setDate(diff)

  const days = []
  for (let i = 0; i < 7; i++) {
    days.push(new Date(startDate))
    startDate.setDate(startDate.getDate() + 1)
  }
  return days
})

const monthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevMonthLastDay = new Date(year, month, 0)

  const days = []

  // Previous month days
  const startDate = firstDay.getDay()
  for (let i = prevMonthLastDay.getDate() - startDate + 1; i <= prevMonthLastDay.getDate(); i++) {
    days.push(new Date(year, month - 1, i))
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i))
  }

  // Next month days
  const endDate = lastDay.getDay()
  for (let i = 1; i <= 42 - days.length; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
})

// Methods
function formatDate(date, format) {
  const pad = (n) => (n < 10 ? '0' + n : n)

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return format
    .replace('yyyy', date.getFullYear())
    .replace('MMMM', months[date.getMonth()])
    .replace('MMM', months[date.getMonth()].slice(0, 3))
    .replace('dd', pad(date.getDate()))
    .replace('d', date.getDate())
    .replace('EEEE', days[date.getDay()])
    .replace('EEE', shortDays[date.getDay()])
    .replace('HH', pad(date.getHours()))
    .replace('mm', pad(date.getMinutes()))
    .replace('ss', pad(date.getSeconds()))
}

function formatTime(hour) {
  return `${String(hour).padStart(2, '0')}:00`
}

function getMonthName(month) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return months[month]
}

function getDaysInMonth(month) {
  return new Date(currentDate.value.getFullYear(), month, 0).getDate()
}

function isToday(date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function isSameMonth(date1, date2) {
  return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()
}

function isSameDay(date1, date2) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

function getEventsForDay(day) {
  const dayStr = day.toISOString().split('T')[0]
  return filteredEvents.value.filter((event) => event.date === dayStr)
}

function getEventsForDayAndHour(day, hour) {
  return getEventsForDay(day).filter((event) => {
    const startHour = parseInt(event.startTime.split(':')[0])
    return startHour === hour
  })
}

function getEventsForHour(hour) {
  const dayStr = currentDate.value.toISOString().split('T')[0]
  return filteredEvents.value.filter((event) => {
    if (event.date !== dayStr) return false
    const startHour = parseInt(event.startTime.split(':')[0])
    return startHour === hour
  })
}

function getEventsForMonth(month) {
  const year = currentDate.value.getFullYear()
  return filteredEvents.value.filter((event) => {
    const eventDate = new Date(event.date)
    return eventDate.getFullYear() === year && eventDate.getMonth() === month - 1
  })
}

function changeView(view) {
  viewType.value = view
  selectedEvent.value = null
}

function goToPrevious() {
  if (viewType.value === 'day') {
    currentDate.value.setDate(currentDate.value.getDate() - 1)
  } else if (viewType.value === 'week') {
    currentDate.value.setDate(currentDate.value.getDate() - 7)
  } else if (viewType.value === 'month') {
    currentDate.value.setMonth(currentDate.value.getMonth() - 1)
  } else if (viewType.value === 'year') {
    currentDate.value.setFullYear(currentDate.value.getFullYear() - 1)
  }
  currentDate.value = new Date(currentDate.value)
}

function goToNext() {
  if (viewType.value === 'day') {
    currentDate.value.setDate(currentDate.value.getDate() + 1)
  } else if (viewType.value === 'week') {
    currentDate.value.setDate(currentDate.value.getDate() + 7)
  } else if (viewType.value === 'month') {
    currentDate.value.setMonth(currentDate.value.getMonth() + 1)
  } else if (viewType.value === 'year') {
    currentDate.value.setFullYear(currentDate.value.getFullYear() + 1)
  }
  currentDate.value = new Date(currentDate.value)
}

function goToToday() {
  currentDate.value = new Date()
}

function goToMonth(month) {
  currentDate.value.setMonth(month - 1)
  viewType.value = 'month'
  currentDate.value = new Date(currentDate.value)
}

function selectDate(day) {
  currentDate.value = new Date(day)
  viewType.value = 'day'
}

function selectEvent(event) {
  selectedEvent.value = event
  selectedEventForModal.value = event
  showEventDetailsModal.value = true
  emit('eventSelected', event)
}

function handleEditEvent(event) {
  editingEvent.value = event
  formData.value = {
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    description: event.description,
    priority: event.priority,
  }
  showEventModal.value = true
}

function handleDeleteEvent(id) {
  deleteEvent(id)
}

function handleDuplicateEvent(event) {
  // Create a new event based on the selected one
  const tomorrow = new Date(currentDate.value)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const newEvent = {
    title: `${event.title} (Copy)`,
    date: tomorrow.toISOString().split('T')[0],
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    description: event.description,
    priority: event.priority,
  }

  formData.value = newEvent
  showEventModal.value = true
}

function handleExportEvent(event) {
  // Export event as JSON
  const dataStr = JSON.stringify(event, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `event-${event.id}-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function editEvent(event) {
  editingEvent.value = event
  formData.value = {
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    description: event.description,
    priority: event.priority,
  }
  showEventModal.value = true
}

function saveEvent() {
  if (editingEvent.value) {
    Object.assign(editingEvent.value, formData.value)
    emit('eventUpdated', editingEvent.value)
    editingEvent.value = null
  } else {
    const newEvent = {
      id: Math.max(...events.value.map((e) => e.id), 0) + 1,
      ...formData.value,
    }
    events.value.push(newEvent)
    emit('eventAdded', newEvent)
  }

  showEventModal.value = false
  formData.value = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    description: '',
    priority: 'medium',
  }
  selectedEvent.value = null
}

function deleteEvent(id) {
  if (confirm('Are you sure you want to delete this event?')) {
    const deletedEvent = events.value.find((e) => e.id === id)
    events.value = events.value.filter((e) => e.id !== id)
    emit('eventDeleted', deletedEvent)
    selectedEvent.value = null
  }
}
</script>

<style scoped>
.calendar-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

/* Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 20px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.current-date {
  margin: 0;
  font-size: 24px;
  color: #333;
  min-width: 250px;
}

.btn-nav,
.btn-today,
.btn-add-event {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-nav {
  background: #f0f0f0;
  color: #333;
}

.btn-nav:hover {
  background: #e0e0e0;
}

.btn-today {
  background: #4caf50;
  color: white;
}

.btn-today:hover {
  background: #45a049;
}

.btn-add-event {
  background: #2196f3;
  color: white;
}

.btn-add-event:hover {
  background: #0b7dda;
}

.view-switcher {
  display: flex;
  gap: 8px;
  background: #f5f5f5;
  padding: 4px;
  border-radius: 6px;
}

.view-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: white;
  color: #2196f3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;
}

/* Calendar Content */
.calendar-content {
  flex: 1;
  overflow: auto;
  display: flex;
  position: relative;
}

.calendar-view {
  flex: 1;
  overflow: auto;
}

/* Day View */
.day-view {
  background: white;
}

.day-view-container {
  display: flex;
  flex-direction: column;
}

.day-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.day-timeline {
  display: flex;
  flex-direction: column;
}

.hour-slot {
  display: flex;
  border-bottom: 1px solid #eee;
  min-height: 80px;
}

.time-label {
  width: 80px;
  padding: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background: #f9f9f9;
  border-right: 1px solid #eee;
}

.events-container {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

/* Week View */
.week-view {
  background: white;
  display: flex;
  flex-direction: column;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  background: white;
  border-bottom: 2px solid #ddd;
}

.week-day {
  padding: 15px;
  text-align: center;
  border-right: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.week-day.today {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.day-name {
  font-weight: 600;
  font-size: 13px;
}

.day-number {
  font-size: 20px;
  font-weight: bold;
  margin-top: 5px;
}

.week-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.week-hour {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 0;
  border-bottom: 1px solid #eee;
  min-height: 60px;
}

.hour-label {
  padding: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background: #f9f9f9;
  border-right: 1px solid #eee;
}

.day-slot {
  padding: 5px;
  border-right: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-content: flex-start;
}

/* Month View */
.month-view {
  background: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.month-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  margin-bottom: 10px;
}

.day-header-cell {
  text-align: center;
  font-weight: 600;
  color: #666;
  padding: 10px;
  border-bottom: 2px solid #ddd;
}

.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #ddd;
  flex: 1;
}

.month-day {
  background: white;
  padding: 10px;
  min-height: 100px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.month-day:hover {
  background: #f5f5f5;
  transform: scale(1.02);
}

.month-day.other-month {
  background: #fafafa;
  color: #ccc;
}

.month-day.today {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.month-day.today .day-number {
  color: white;
  font-weight: bold;
}

.day-number {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.event-dot {
  display: inline-flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.event-dot:hover .event-preview {
  opacity: 1;
}

.event-preview {
  display: none;
  position: absolute;
  bottom: 100%;
  left: 0;
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.event-dot:hover .event-preview {
  display: block;
  opacity: 1;
}

/* Year View */
.year-view {
  background: white;
  padding: 20px;
  overflow: auto;
}

.year-header {
  text-align: center;
  margin-bottom: 30px;
}

.year-header h3 {
  font-size: 32px;
  color: #333;
  margin: 0;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.mini-month {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.mini-month:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.mini-month-name {
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
}

.mini-month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 10px;
}

.mini-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  font-size: 10px;
}

.mini-month-events {
  text-align: center;
  font-size: 11px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

/* Event Items */
.event-item {
  background: #e3f2fd;
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 3px solid #2196f3;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-item:hover {
  background: #bbdefb;
  transform: scale(1.05);
}

.event-item.priority-high {
  background: #ffebee;
  border-left-color: #f44336;
}

.event-item.priority-medium {
  background: #fff3e0;
  border-left-color: #ff9800;
}

.event-item.priority-low {
  background: #e8f5e9;
  border-left-color: #4caf50;
}

.event-time {
  font-weight: 600;
  font-size: 11px;
  margin-bottom: 2px;
}

.event-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Sidebar */
.event-sidebar {
  position: fixed;
  right: -350px;
  top: 0;
  width: 350px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  transition: right 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.event-sidebar.open {
  right: 0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.sidebar-header h3 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.event-details {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.detail-item {
  margin-bottom: 20px;
}

.detail-item label {
  font-weight: 600;
  color: #666;
  font-size: 13px;
  display: block;
  margin-bottom: 5px;
}

.detail-value {
  color: #333;
  font-size: 14px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.detail-value.priority-high {
  color: #f44336;
  font-weight: 600;
}

.detail-value.priority-medium {
  color: #ff9800;
  font-weight: 600;
}

.detail-value.priority-low {
  color: #4caf50;
  font-weight: 600;
}

.event-actions {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-edit {
  background: #2196f3;
  color: white;
}

.btn-edit:hover {
  background: #0b7dda;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-delete:hover {
  background: #da190b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.event-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
}

.form-row .form-group {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-submit {
  background: #4caf50;
  color: white;
}

.btn-submit:hover {
  background: #45a049;
}

/* Responsive */
@media (max-width: 1024px) {
  .calendar-header {
    flex-wrap: wrap;
  }

  .year-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .event-sidebar {
    width: 100%;
    right: -100%;
  }
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 10px;
  }

  .current-date {
    min-width: auto;
  }

  .view-switcher {
    width: 100%;
    justify-content: center;
  }

  .view-btn {
    flex: 1;
  }

  .year-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .month-day {
    min-height: 80px;
  }

  .week-grid {
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  .calendar-header {
    padding: 10px;
  }

  .search-input {
    width: 100%;
  }

  .view-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .year-grid {
    grid-template-columns: 1fr;
  }

  .month-day {
    min-height: 60px;
  }
}
</style>
