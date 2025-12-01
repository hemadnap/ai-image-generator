<template>
  <transition name="modal">
    <div v-if="isOpen" class="event-modal-overlay" @click.self="closeModal">
      <div class="event-modal-content">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-left">
            <div :class="['priority-badge', `priority-${event.priority}`]">
              {{ event.priority.toUpperCase() }}
            </div>
            <div class="header-title">
              <h2>{{ event.title }}</h2>
              <p v-if="event.category" class="category-tag">{{ event.category }}</p>
            </div>
          </div>
          <button class="btn-close" @click="closeModal" :title="'Close modal'">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Date & Time Section -->
          <section class="section">
            <h3 class="section-title"><i class="fas fa-calendar"></i> Date & Time</h3>
            <div class="section-content">
              <div class="detail-row">
                <label>Date</label>
                <div class="detail-value">
                  {{ formatDate(new Date(event.date), 'EEEE, MMMM d, yyyy') }}
                </div>
              </div>
              <div class="detail-row">
                <label>Time</label>
                <div class="detail-value">{{ event.startTime }} - {{ event.endTime }}</div>
              </div>
              <div class="detail-row">
                <label>Duration</label>
                <div class="detail-value">{{ formatDuration(event.getDurationMinutes()) }}</div>
              </div>
            </div>
          </section>

          <!-- Location Section -->
          <section v-if="event.location" class="section">
            <h3 class="section-title"><i class="fas fa-map-marker-alt"></i> Location</h3>
            <div class="section-content">
              <p class="location-text">{{ event.location }}</p>
            </div>
          </section>

          <!-- Description Section -->
          <section v-if="event.description" class="section">
            <h3 class="section-title"><i class="fas fa-align-left"></i> Description</h3>
            <div class="section-content">
              <p class="description-text">{{ event.description }}</p>
            </div>
          </section>

          <!-- Tags Section -->
          <section v-if="event.tags && event.tags.length > 0" class="section">
            <h3 class="section-title"><i class="fas fa-tags"></i> Tags</h3>
            <div class="section-content">
              <div class="tags-container">
                <span v-for="tag in event.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </section>

          <!-- Attendees Section -->
          <section v-if="event.attendees && event.attendees.length > 0" class="section">
            <h3 class="section-title"><i class="fas fa-users"></i> Attendees</h3>
            <div class="section-content">
              <div class="attendees-list">
                <div
                  v-for="attendee in event.attendees"
                  :key="attendee.id || attendee.email"
                  class="attendee-item"
                >
                  <div v-if="attendee.avatar" class="attendee-avatar">
                    <img :src="attendee.avatar" :alt="attendee.name || attendee.email" />
                  </div>
                  <div v-else class="attendee-avatar-placeholder">
                    {{ getInitials(attendee.name || attendee.email) }}
                  </div>
                  <div class="attendee-info">
                    <p class="attendee-name">{{ attendee.name || attendee.email }}</p>
                    <p
                      v-if="attendee.status"
                      class="attendee-status"
                      :class="`status-${attendee.status}`"
                    >
                      {{ attendee.status }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Recurrence Section -->
          <section v-if="event.isRecurring && event.recurrencePattern" class="section">
            <h3 class="section-title"><i class="fas fa-redo"></i> Recurrence</h3>
            <div class="section-content">
              <div class="detail-row">
                <label>Pattern</label>
                <div class="detail-value">{{ capitalizeFirst(event.recurrencePattern) }}</div>
              </div>
            </div>
          </section>

          <!-- Reminder Section -->
          <section v-if="event.reminderMinutes" class="section">
            <h3 class="section-title"><i class="fas fa-bell"></i> Reminder</h3>
            <div class="section-content">
              <div class="detail-row">
                <label>Notification</label>
                <div class="detail-value">{{ event.reminderMinutes }} minutes before</div>
              </div>
            </div>
          </section>

          <!-- Meta Information -->
          <section v-if="event.createdAt || event.updatedAt" class="section meta-section">
            <h3 class="section-title"><i class="fas fa-info-circle"></i> Information</h3>
            <div class="section-content">
              <div v-if="event.createdAt" class="detail-row">
                <label>Created</label>
                <div class="detail-value">{{ formatDateTime(event.createdAt) }}</div>
              </div>
              <div v-if="event.updatedAt" class="detail-row">
                <label>Updated</label>
                <div class="detail-value">{{ formatDateTime(event.updatedAt) }}</div>
              </div>
            </div>
          </section>

          <!-- Status Indicators -->
          <section class="section status-section">
            <div class="status-indicators">
              <div v-if="event.isToday()" class="status-badge today">
                <i class="fas fa-star"></i> Today
              </div>
              <div v-if="event.isPast()" class="status-badge past">
                <i class="fas fa-check-circle"></i> Past
              </div>
              <div v-if="event.isUpcoming()" class="status-badge upcoming">
                <i class="fas fa-arrow-right"></i> Upcoming
              </div>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button v-if="!event.isPast()" class="btn btn-secondary" @click="handleDuplicate">
            <i class="fas fa-copy"></i> Duplicate
          </button>
          <button class="btn btn-secondary" @click="handleExport">
            <i class="fas fa-download"></i> Export
          </button>
          <button class="btn btn-primary" @click="handleEdit">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger" @click="handleDelete">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'edit', 'delete', 'duplicate', 'export'])

// Methods
function closeModal() {
  emit('close')
}

function handleEdit() {
  emit('edit', props.event)
  closeModal()
}

function handleDelete() {
  if (confirm(`Are you sure you want to delete "${props.event.title}"?`)) {
    emit('delete', props.event.id)
    closeModal()
  }
}

function handleDuplicate() {
  emit('duplicate', props.event)
  closeModal()
}

function handleExport() {
  emit('export', props.event)
}

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

  return format
    .replace('yyyy', date.getFullYear())
    .replace('MMMM', months[date.getMonth()])
    .replace('MMM', months[date.getMonth()].slice(0, 3))
    .replace('dd', pad(date.getDate()))
    .replace('d', date.getDate())
    .replace('EEEE', days[date.getDay()])
    .replace('EEE', days[date.getDay()].slice(0, 3))
}

function formatDateTime(datetime) {
  const date = new Date(datetime)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}
</script>

<style scoped>
/* Modal Overlay */
.event-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* Modal Content */
.event-modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.priority-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.2);
}

.priority-badge.priority-high {
  background: #ff6b6b;
  color: white;
}

.priority-badge.priority-medium {
  background: #ffa940;
  color: white;
}

.priority-badge.priority-low {
  background: #52c41a;
  color: white;
}

.header-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.category-tag {
  margin: 8px 0 0 0;
  font-size: 12px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: transform 0.2s ease;
}

.btn-close:hover {
  transform: scale(1.2);
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title i {
  color: #667eea;
}

.section-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

/* Detail Rows */
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row label {
  font-weight: 600;
  color: #666;
  font-size: 13px;
}

.detail-value {
  color: #333;
  font-size: 14px;
  text-align: right;
  flex: 1;
  margin-left: 16px;
}

/* Location */
.location-text {
  margin: 0;
  color: #333;
  font-size: 14px;
  line-height: 1.6;
}

/* Description */
.description-text {
  margin: 0;
  color: #555;
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Tags */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #e7f5ff;
  color: #1971c2;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #bde4ff;
}

/* Attendees */
.attendees-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attendee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.attendee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.attendee-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attendee-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.attendee-info {
  flex: 1;
  min-width: 0;
}

.attendee-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.attendee-status {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
  text-transform: capitalize;
}

.attendee-status.status-accepted {
  color: #52c41a;
}

.attendee-status.status-declined {
  color: #ff7875;
}

.attendee-status.status-pending {
  color: #ffa940;
}

/* Status Section */
.status-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.status-indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.today {
  background: #fff7e6;
  color: #ad6800;
}

.status-badge.past {
  background: #f6ffed;
  color: #274240;
}

.status-badge.upcoming {
  background: #e6f7ff;
  color: #003c99;
}

/* Meta Section */
.meta-section {
  opacity: 0.8;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #999;
}

.btn-danger {
  background: #ff4d4f;
  color: white;
}

.btn-danger:hover {
  background: #ff7875;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .event-modal-content,
.modal-leave-to .event-modal-content {
  transform: scale(0.9) translateY(20px);
}

/* Scrollbar Styling */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .event-modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px;
  }

  .header-left {
    flex-direction: column;
    gap: 12px;
  }

  .header-title h2 {
    font-size: 20px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    flex: 1;
    justify-content: center;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-value {
    text-align: left;
    margin-left: 0;
    margin-top: 6px;
  }

  .status-indicators {
    gap: 4px;
  }

  .status-badge {
    padding: 6px 10px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .event-modal-content {
    width: 100%;
    max-height: 100vh;
    border-radius: 12px 12px 0 0;
  }

  .modal-header {
    padding: 12px;
  }

  .header-title h2 {
    font-size: 18px;
  }

  .section-title {
    font-size: 12px;
  }

  .detail-value,
  .location-text,
  .description-text {
    font-size: 13px;
  }
}
</style>
