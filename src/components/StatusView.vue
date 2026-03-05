<template>
  <div style="border-top: 3px solid #388e3c; padding: 16px; background: #e8f5e9; border-radius: 8px;">
    <div style="font-weight: 700; font-size: 18px; margin-bottom: 12px;">
      {{ response.header || viewModel.title }}
    </div>

    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #388e3c;">
      <div style="font-size: 13px; line-height: 1.6;">
        <div><span style="font-weight: 600;">当前任务：</span>{{ viewModel.task_name }}</div>
        <div><span style="font-weight: 600;">阶段：</span>{{ viewModel.stage_display }}</div>
      </div>
    </div>

    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #388e3c;">
      <div style="font-weight: 600; margin-bottom: 6px;">日摘要</div>
      <div style="font-size: 13px; line-height: 1.6;">{{ viewModel.day_summary }}</div>
    </div>

    <div
      v-if="viewModel.entitlement_display"
      style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #388e3c;"
    >
      <div style="font-weight: 600; margin-bottom: 6px;">权益</div>
      <div style="font-size: 13px; line-height: 1.6;">{{ viewModel.entitlement_display }}</div>
    </div>

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
import { computed } from 'vue'
import type { HCResponse, HCAction } from '../lib/rendererRouter'
import { extractStatusViewModel } from '../lib/extractors'

interface Props {
  response: HCResponse
  loading: boolean
  onAction: (action: HCAction) => void
}

const props = defineProps<Props>()
const viewModel = computed(() => extractStatusViewModel(props.response))
</script>

