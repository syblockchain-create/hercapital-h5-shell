<template>
  <div style="border-top: 3px solid #f57c00; padding: 16px; background: #fff3e0; border-radius: 8px;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
      <div style="width: 12px; height: 12px; background: #f57c00; border-radius: 50%; animation: pulse 1.5s infinite;"></div>
      <div style="font-weight: 700; font-size: 18px;">
        {{ response.header || viewModel.title }}
      </div>
    </div>

    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #f57c00;">
      <div style="display: grid; gap: 8px; font-size: 13px; line-height: 1.6;">
        <div><span style="font-weight: 600;">当前阶段：</span>{{ viewModel.stage_display }}</div>
        <div><span style="font-weight: 600;">今天只做一件事：</span>{{ viewModel.today_focus }}</div>
        <div><span style="font-weight: 600;">进度提示：</span>{{ viewModel.progress_hint }}</div>
      </div>
    </div>

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
import type { HCResponse, HCAction } from '../lib/rendererRouter'
import { extractDoingViewModel } from '../lib/extractors'

interface Props {
  response: HCResponse
  loading: boolean
  onAction: (action: HCAction) => void
}

const props = defineProps<Props>()

const viewModel = computed(() => extractDoingViewModel(props.response))
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
