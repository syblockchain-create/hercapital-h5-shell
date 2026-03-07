<template>
  <div style="border-top: 3px solid #7b1fa2; padding: 16px; background: #f3e5f5; border-radius: 8px;">
    <!-- Header -->
    <div style="font-weight: 700; font-size: 18px; margin-bottom: 12px;">
      {{ response.header || 'Day7 复盘' }}
    </div>

    <!-- Meta verification bar -->
    <div style="background: #ede7f6; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 12px; font-family: monospace;">
      <span>next_scene_id: <strong>{{ metaNextSceneId || '(无)' }}</strong></span>
      <span style="margin-left: 16px;">day7_reviewed_at: <strong>{{ metaDay7ReviewedAt || '(无)' }}</strong></span>
      <span v-if="metaSkipReason" style="margin-left: 16px; color: #c62828;">skip: {{ metaSkipReason }}</span>
    </div>

    <!-- Cards -->
    <div v-for="(card, idx) in typedCards" :key="idx" style="margin-bottom: 12px;">
      <!-- completion_summary_card -->
      <div
        v-if="card.type === 'completion_summary_card'"
        style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #7b1fa2;"
      >
        <div style="font-weight: 600; margin-bottom: 6px; color: #7b1fa2;">
          ✅ {{ card.title || '完成总结' }}
        </div>
        <div style="font-size: 13px; line-height: 1.6; white-space: pre-wrap;">{{ renderContent(card.content) }}</div>
      </div>

      <!-- next_action_card -->
      <div
        v-else-if="card.type === 'next_action_card'"
        style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #f57c00;"
      >
        <div style="font-weight: 600; margin-bottom: 6px; color: #f57c00;">
          🎯 {{ card.title || '下一步行动' }}
        </div>
        <div style="font-size: 13px; line-height: 1.6; white-space: pre-wrap;">{{ renderContent(card.content) }}</div>
      </div>

      <!-- next_scene_card -->
      <div
        v-else-if="card.type === 'next_scene_card'"
        style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #1976d2;"
      >
        <div style="font-weight: 600; margin-bottom: 6px; color: #1976d2;">
          🔮 {{ card.title || '下一场景' }}
        </div>
        <div style="font-size: 13px; line-height: 1.6; white-space: pre-wrap;">{{ renderContent(card.content) }}</div>
      </div>

      <!-- Any other card in this response -->
      <div
        v-else
        style="background: white; padding: 12px; border-radius: 8px; border-left: 4px solid #9e9e9e;"
      >
        <div v-if="card.title" style="font-weight: 600; margin-bottom: 6px;">{{ card.title }}</div>
        <div style="font-size: 13px; line-height: 1.6; white-space: pre-wrap;">{{ renderContent(card.content) }}</div>
      </div>
    </div>

    <!-- No cards warning -->
    <div v-if="!typedCards.length" style="background: #ffebee; padding: 12px; border-radius: 8px; margin-bottom: 12px; color: #c62828;">
      ⚠️ 未收到 Day7 卡片（cards 为空）
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
          background: #7b1fa2;
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

const typedCards = computed(() => props.response.cards || [])

const metaNextSceneId = computed(() =>
  safeGet(props.response.meta, 'next_scene_id', '')
)
const metaDay7ReviewedAt = computed(() =>
  safeGet(props.response.meta, 'day7_reviewed_at', '')
)
const metaSkipReason = computed(() =>
  safeGet(props.response.meta, 'skip_reason', '')
)

function renderContent(content: any): string {
  if (!content) return '(无内容)'
  if (typeof content === 'string') return content
  try {
    return JSON.stringify(content, null, 2)
  } catch {
    return String(content)
  }
}
</script>
