<template>
  <div style="border-top: 3px solid #f57c00; padding: 16px; background: #fff3e0; border-radius: 8px;">
    <!-- Header with phase indicator -->
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <div style="width: 12px; height: 12px; background: #f57c00; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
      <div style="font-weight: 700; font-size: 18px;">
        {{ response.header || '执行中' }}
      </div>
    </div>

    <!-- Progress indicator (if available) -->
    <div v-if="phase" style="font-size: 12px; opacity: 0.7; margin-bottom: 12px;">
      阶段: {{ phase }}
    </div>

    <!-- Main Content -->
    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #f57c00;">
      <pre style="white-space: pre-wrap; margin: 0; font-size: 13px; line-height: 1.5;">{{ contentText }}</pre>
    </div>

    <!-- Checkin/Status Actions -->
    <div v-if="response.actions && response.actions.length" style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button
        v-for="(action, idx) in response.actions"
        :key="idx"
        @click="() => onAction(action)"
        :disabled="loading"
        style="
          padding: 8px 16px;
          background: #f57c00;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        "
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { safeGet } from '../lib/rendererRouter'
import type { HCResponse, HCAction } from '../lib/rendererRouter'

interface Props {
  response: HCResponse
  loading: boolean
  onAction: (action: HCAction) => void
}

const props = defineProps<Props>()

const phase = computed(() => {
  return safeGet(props.response.meta, 'phase', '')
})

const contentText = computed(() => {
  const card = props.response.cards?.[0]
  if (!card) return '暂无可展示内容'
  
  if (typeof card.content === 'string') return card.content
  try {
    return JSON.stringify(card.content, null, 2)
  } catch {
    return String(card.content)
  }
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
