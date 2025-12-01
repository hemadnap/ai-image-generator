# Events Management System Documentation

## Overview

This documentation covers the complete events management system including the Event Model, API service, CRUD service, and Pinia store.

## Architecture

```
┌─────────────────────────────────────┐
│         Vue Components              │
│      (Calendar, EventList, etc)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       useEventsStore (Pinia)        │
│    (State & Computed Properties)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    EventsCRUDService (Service)      │
│  (Business Logic & Cache Management)│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      eventsAPI (API Client)         │
│   (HTTP Requests to Backend)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       Backend API Endpoints         │
│      (/api/v1/events/*)             │
└─────────────────────────────────────┘
```

## Event Model

### Location

`/frontend/src/models/Event.js`

### Class: Event

#### Constructor

```javascript
new Event((data = {}))
```

#### Properties

- `id` - Event ID (auto-generated on backend)
- `title` - Event title (required)
- `date` - Event date in YYYY-MM-DD format (required)
- `startTime` - Event start time in HH:mm format (required)
- `endTime` - Event end time in HH:mm format (required)
- `location` - Event location (optional)
- `description` - Event description (optional)
- `priority` - Priority level: 'low', 'medium', 'high' (default: 'medium')
- `category` - Event category (default: 'general')
- `tags` - Array of tags (default: [])
- `attendees` - Array of attendee objects (default: [])
- `isRecurring` - Boolean for recurring events (default: false)
- `recurrencePattern` - Pattern: 'daily', 'weekly', 'monthly', 'yearly' (default: null)
- `reminderMinutes` - Minutes before event for reminder (default: 15)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

#### Methods

**validate()**

```javascript
event.validate()
// Returns: { isValid: boolean, errors: string[] }
```

**toAPI()**

```javascript
event.toAPI()
// Returns: Object suitable for API requests
```

**getDurationMinutes()**

```javascript
event.getDurationMinutes()
// Returns: Duration in minutes
```

**isToday()**

```javascript
event.isToday()
// Returns: true if event is today
```

**isPast()**

```javascript
event.isPast()
// Returns: true if event has ended
```

**isUpcoming()**

```javascript
event.isUpcoming()
// Returns: true if event hasn't started
```

**getTimeRange()**

```javascript
event.getTimeRange()
// Returns: "09:00 - 10:00"
```

**clone()**

```javascript
event.clone()
// Returns: New Event instance with same data
```

### Example Usage

```javascript
import Event from '@/models/Event'

const event = new Event({
  title: 'Team Meeting',
  date: '2025-11-25',
  startTime: '10:00',
  endTime: '11:00',
  location: 'Conference Room A',
  priority: 'high',
})

const validation = event.validate()
if (validation.isValid) {
  console.log('Event is valid')
}
```

## API Service

### Location

`/frontend/src/services/eventsAPI.js`

### Methods

**getAll(options = {})**

```javascript
await eventsAPI.getAll({ category: 'work', sort: 'date' })
// Returns: Array<Event>
```

**getById(id)**

```javascript
await eventsAPI.getById('123')
// Returns: Object (Event data)
```

**getByDateRange(startDate, endDate)**

```javascript
await eventsAPI.getByDateRange('2025-11-20', '2025-11-30')
// Returns: Array<Event>
```

**getByCategory(category)**

```javascript
await eventsAPI.getByCategory('work')
// Returns: Array<Event>
```

**search(query)**

```javascript
await eventsAPI.search('meeting')
// Returns: Array<Event>
```

**create(eventData)**

```javascript
const created = await eventsAPI.create({
  title: 'New Event',
  date: '2025-11-25',
  startTime: '10:00',
  endTime: '11:00',
})
// Returns: Object (Created event)
```

**update(id, eventData)**

```javascript
const updated = await eventsAPI.update('123', { title: 'Updated Title' })
// Returns: Object (Updated event)
```

**delete(id)**

```javascript
await eventsAPI.delete('123')
// Returns: { success: true }
```

**bulkCreate(events)**

```javascript
const created = await eventsAPI.bulkCreate([
  { title: 'Event 1', ... },
  { title: 'Event 2', ... }
])
// Returns: Array<Event>
```

**bulkUpdate(events)**

```javascript
const updated = await eventsAPI.bulkUpdate([
  { id: '1', title: 'Updated 1' },
  { id: '2', title: 'Updated 2' },
])
// Returns: Array<Event>
```

**bulkDelete(ids)**

```javascript
await eventsAPI.bulkDelete(['1', '2', '3'])
// Returns: { success: true }
```

**getUpcoming(days = 7)**

```javascript
await eventsAPI.getUpcoming(7)
// Returns: Array<Event> (Next 7 days)
```

**getByPriority(priority)**

```javascript
await eventsAPI.getByPriority('high')
// Returns: Array<Event>
```

## CRUD Service

### Location

`/frontend/src/services/eventsCRUD.js`

### Features

- **Automatic Caching**: 5-minute cache for read operations
- **Validation**: Built-in validation using Event model
- **Cache Invalidation**: Smart cache clearing on write operations
- **Type Safety**: Returns Event instances

### Methods

All methods return `Event` or `Event[]` instances (not raw objects):

```javascript
import eventsCRUD from '@/services/eventsCRUD'

// Read operations
const allEvents = await eventsCRUD.getAll()
const event = await eventsCRUD.getById('123')
const rangeEvents = await eventsCRUD.getByDateRange('2025-11-20', '2025-11-30')
const categoryEvents = await eventsCRUD.getByCategory('work')
const upcomingEvents = await eventsCRUD.getUpcoming(7)
const priorityEvents = await eventsCRUD.getByPriority('high')
const searchResults = await eventsCRUD.search('meeting')

// Write operations
const created = await eventsCRUD.create(eventData)
const updated = await eventsCRUD.update('123', updates)
await eventsCRUD.delete('123')
const bulkCreated = await eventsCRUD.bulkCreate(eventsList)
const bulkUpdated = await eventsCRUD.bulkUpdate(updatesList)
await eventsCRUD.bulkDelete(['1', '2', '3'])

// Cache management
eventsCRUD.clearCache()
```

### Error Handling

```javascript
try {
  const event = await eventsCRUD.create({ title: '' })
} catch (error) {
  console.error('Validation error:', error.message)
  // Output: "Event validation failed: Title is required"
}
```

## Pinia Store

### Location

`/frontend/src/stores/eventsStore.js`

### Setup

Add to your component:

```javascript
import { useEventsStore } from '@/stores/eventsStore'

export default {
  setup() {
    const eventsStore = useEventsStore()
    return { eventsStore }
  },
}
```

### State Properties

```javascript
const store = useEventsStore()

store.events // All events array
store.selectedEvent // Currently selected event
store.isLoading // Loading state
store.error // Error message (if any)
store.filters // { category, priority, searchQuery, dateRange }
store.sortBy // Current sort field
store.sortOrder // 'asc' or 'desc'
```

### Computed Properties

```javascript
store.filteredEvents // Events after applying all filters and sorting
store.eventCount // Total events count
store.filteredEventCount // Filtered events count
store.upcomingEvents // Events that haven't started yet
store.todayEvents // Events happening today
store.highPriorityEvents // High priority events only
store.pastEvents // Completed events
```

### Methods

**Data Fetching**

```javascript
await store.fetchAll()
await store.fetchById('123')
await store.fetchByDateRange('2025-11-20', '2025-11-30')
await store.fetchByCategory('work')
await store.fetchUpcoming(7)
await store.searchEvents('meeting')
```

**Event Management**

```javascript
const created = await store.addEvent(eventData)
const updated = await store.updateEvent('123', updates)
await store.deleteEvent('123')
await store.bulkCreateEvents(eventsList)
await store.bulkDeleteEvents(['1', '2', '3'])
```

**Selection Management**

```javascript
store.selectEvent(event)
store.deselectEvent()
```

**Filtering & Sorting**

```javascript
store.setFilter('priority', 'high')
store.setFilters({
  category: 'work',
  priority: 'high',
  searchQuery: 'meeting',
})
store.clearFilters()

store.setSortBy('date') // Toggle sort order on same field
store.setSortBy('priority')
store.setSortBy('title')
```

**Cache & Error Management**

```javascript
store.clearCache()
store.clearError()
```

### Example Usage in Component

```vue
<template>
  <div>
    <!-- Loading state -->
    <div v-if="store.isLoading">Loading events...</div>

    <!-- Error state -->
    <div v-else-if="store.error" class="error">
      {{ store.error }}
    </div>

    <!-- Events list -->
    <div v-else>
      <!-- Filter section -->
      <input
        v-model="searchQuery"
        @input="store.setFilter('searchQuery', $event.target.value)"
        placeholder="Search events..."
      />

      <!-- Events display -->
      <div v-for="event in store.filteredEvents" :key="event.id">
        <h3>{{ event.title }}</h3>
        <p>{{ event.date }} {{ event.getTimeRange() }}</p>
        <p :class="`priority-${event.priority}`">{{ event.priority }}</p>

        <button @click="store.selectEvent(event)">Select</button>
        <button @click="store.deleteEvent(event.id)">Delete</button>
      </div>

      <!-- Selected event details -->
      <div v-if="store.selectedEvent">
        <h2>{{ store.selectedEvent.title }}</h2>
        <p>{{ store.selectedEvent.description }}</p>
        <button @click="store.deselectEvent()">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useEventsStore } from '@/stores/eventsStore'

const store = useEventsStore()
const searchQuery = ref('')

// Fetch all events on mount
store.fetchAll()
</script>
```

## Integration with Calendar Component

```vue
<template>
  <Calendar
    :events="store.filteredEvents"
    :defaultView="currentView"
    :searchQuery="store.filters.searchQuery"
    @update:searchQuery="store.setFilter('searchQuery', $event)"
    @eventSelected="store.selectEvent"
    @eventAdded="store.addEvent"
    @eventUpdated="store.updateEvent"
    @eventDeleted="store.deleteEvent"
  />
</template>

<script setup>
import { ref } from 'vue'
import Calendar from '@/components/calendar/Calendar.vue'
import { useEventsStore } from '@/stores/eventsStore'

const store = useEventsStore()
const currentView = ref('month')

store.fetchAll()
</script>
```

## Backend API Endpoints Required

The system expects the following endpoints:

```
GET    /api/v1/events              - Get all events
GET    /api/v1/events/:id          - Get event by ID
GET    /api/v1/events/range        - Get events by date range
GET    /api/v1/events/category/:id - Get events by category
GET    /api/v1/events/search       - Search events
GET    /api/v1/events/upcoming     - Get upcoming events
GET    /api/v1/events/priority/:id - Get events by priority

POST   /api/v1/events              - Create event
POST   /api/v1/events/bulk         - Bulk create events

PUT    /api/v1/events/:id          - Update event
PUT    /api/v1/events/bulk         - Bulk update events

DELETE /api/v1/events/:id          - Delete event
DELETE /api/v1/events/bulk         - Bulk delete events
```

## Error Handling

```javascript
try {
  await store.addEvent(eventData)
} catch (error) {
  console.error(store.error)
}

// Or check store error state
store.clearError()
```

## Best Practices

1. **Always validate events** before creating/updating
2. **Use computed properties** for filtered data
3. **Leverage the store** for global state
4. **Cache management** is automatic but can be manually cleared
5. **Type safety** - events are always Event instances
6. **Error handling** - always wrap operations in try-catch
7. **Performance** - use `filteredEvents` computed property instead of filtering manually

## Migration Guide

If you have existing event data:

```javascript
import Event from '@/models/Event'

// Convert legacy data
const legacyEvents = [
  /* your old events */
]
const migratedEvents = legacyEvents.map((e) => new Event(e))

// Bulk create in store
const store = useEventsStore()
await store.bulkCreateEvents(migratedEvents)
```
