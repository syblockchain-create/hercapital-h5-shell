<template>
  <div style="border-top: 3px solid #1976d2; padding: 16px; background: #f5f5f5; border-radius: 8px;">
    <!-- Header -->
    <div style="font-weight: 700; font-size: 18px; margin-bottom: 12px;">
      {{ response.header || '预览' }}
    </div>

    <!-- Main Content (half card) -->
    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #1976d2;">
      <pre style="white-space: pre-wrap; margin: 0; font-size: 13px; line-height: 1.5;">{{
        content
      }}</pre>
    </div>

    <!-- Actions -->
    <div v-if="response.actions && response.actions.length" style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button
        v-for="(action, idx) in response.actions"
        :key="idx"
        @click="() => onAction(action)"
        :disabled="loading"
        style="
          padding: 8px 16px;
          background: #1976d2;
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

const content = computed(() => {
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
