<template>
  <div style="border-top: 3px solid #757575; padding: 16px; background: #f5f5f5; border-radius: 8px;">
    <!-- Header -->
    <div v-if="response.header" style="font-weight: 700; font-size: 18px; margin-bottom: 12px;">
      {{ response.header }}
    </div>

    <!-- Cards -->
    <div v-if="response.cards && response.cards.length" style="margin-bottom: 12px;">
      <div v-for="(card, idx) in response.cards" :key="idx" style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
        <div v-if="card.title" style="font-weight: 600; margin-bottom: 6px;">{{ card.title }}</div>
        <div v-if="card.type" style="font-size: 11px; opacity: 0.6; margin-bottom: 6px;">类型: {{ card.type }}</div>
        <pre style="white-space: pre-wrap; margin: 0; font-size: 12px; line-height: 1.5; background: #fafafa; padding: 8px; border-radius: 4px;">{{ formatContent(card.content) }}</pre>
      </div>
    </div>

    <div v-else style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; color: #999;">
      暂无可展示内容
    </div>

    <!-- Actions -->
    <div v-if="response.actions && response.actions.length" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
      <button
        v-for="(action, idx) in response.actions"
        :key="idx"
        @click="() => onAction(action)"
        :disabled="loading"
        style="
          padding: 8px 16px;
          background: #757575;
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

    <!-- Raw JSON viewer -->
    <details style="margin-top: 12px;">
      <summary style="cursor: pointer; font-weight: 600; font-size: 12px;">Raw Response</summary>
      <pre style="white-space: pre-wrap; margin-top: 8px; font-size: 11px; background: #fafafa; padding: 8px; border-radius: 4px; overflow-x: auto;">{{ formatContent(response) }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import type { HCResponse, HCAction } from '../lib/rendererRouter'

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
