<template>
  <div class="alert" :class="type">
    <div class="alert-content">
      <font-awesome-icon :icon="iconMap[type]" class="alert-icon" />
      <div class="alert-message">
        <h4 v-if="title" class="alert-title">{{ title }}</h4>
        <p class="alert-text">{{ message }}</p>
      </div>
    </div>
    <button v-if="closeable" @click="$emit('close')" class="alert-close">
      <font-awesome-icon :icon="['fas', 'times']" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value),
  },
  title: String,
  message: {
    type: String,
    required: true,
  },
  closeable: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['close'])

const iconMap = {
  info: ['fas', 'info-circle'],
  success: ['fas', 'check-circle'],
  warning: ['fas', 'exclamation-triangle'],
  error: ['fas', 'times-circle'],
}
</script>

<style scoped>
.alert {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.alert-content {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.alert-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.alert-message {
  flex: 1;
}

.alert-title {
  margin: 0 0 0.25rem 0;
  font-weight: bold;
}

.alert-text {
  margin: 0;
}

.alert-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  margin-left: 1rem;
  flex-shrink: 0;
}

.alert.info {
  background-color: #e3f2fd;
  color: #01579b;
  border-left: 4px solid #2196f3;
}

.alert.success {
  background-color: #e8f5e9;
  color: #1b5e20;
  border-left: 4px solid #4caf50;
}

.alert.warning {
  background-color: #fff3e0;
  color: #e65100;
  border-left: 4px solid #ff9800;
}

.alert.error {
  background-color: #ffebee;
  color: #b71c1c;
  border-left: 4px solid #f44336;
}

.alert.info .alert-close {
  color: #01579b;
}

.alert.success .alert-close {
  color: #1b5e20;
}

.alert.warning .alert-close {
  color: #e65100;
}

.alert.error .alert-close {
  color: #b71c1c;
}
</style>
