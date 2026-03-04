<template>
  <div style="border-top: 3px solid #388e3c; padding: 16px; background: #e8f5e9; border-radius: 8px;">
    <!-- Header -->
    <div style="font-weight: 700; font-size: 18px; margin-bottom: 12px;">
      {{ response.header || '状态面板' }}
    </div>

    <!-- Task Status List -->
    <div v-if="response.cards && response.cards.length" style="margin-bottom: 12px;">
      <div v-for="(card, idx) in response.cards" :key="idx" style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #388e3c;">
        <div v-if="card.title" style="font-weight: 600; margin-bottom: 6px;">{{ card.title }}</div>
        <pre style="white-space: pre-wrap; margin: 0; font-size: 13px; line-height: 1.5;">{{ formatContent(card.content) }}</pre>
      </div>
    </div>

    <div v-else style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #388e3c; margin-bottom: 12px;">
      暂无任务信息
    </div>

    <!-- Status Actions -->
    <div v-if="response.actions && response.actions.length" style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button
        v-for="(action, idx) in response.actions"
        :key="idx"
        @click="() => onAction(action)"
        :disabled="loading"
        style="
          padding: 8px 16px;
          background: #388e3c;
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
import type { HCResponse, HCAction, HCCard } from '../lib/rendererRouter'

interface Props {
  response: HCResponse
  loading: boolean
  onAction: (action: HCAction) => void
}

defineProps<Props>()

function formatContent(content: any): string {
  if (!content) return '无内容'
  if (typeof content === 'string') return content
  try {
    return JSON.stringify(content, null, 2)
  } catch {
    return String(content)
  }
}
</script>
