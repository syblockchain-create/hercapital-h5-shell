<template>
  <div style="border-top: 3px solid #1976d2; padding: 16px; background: #f5f5f5; border-radius: 8px;">
    <div style="font-weight: 700; font-size: 18px; margin-bottom: 12px;">
      {{ response.header || viewModel.title }}
    </div>

    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #1976d2;">
      <div style="font-weight: 600; margin-bottom: 6px;">一句判断</div>
      <div style="font-size: 13px; line-height: 1.6;">{{ viewModel.one_liner }}</div>
    </div>

    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #1976d2;">
      <div style="font-weight: 600; margin-bottom: 6px;">风险边界</div>
      <div style="font-size: 13px; line-height: 1.6;">{{ viewModel.boundary }}</div>
    </div>

    <div style="background: white; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #1976d2;">
      <div style="font-weight: 600; margin-bottom: 8px;">三步行动</div>
      <ol style="margin: 0; padding-left: 20px;">
        <li
          v-for="(step, index) in viewModel.steps"
          :key="index"
          style="margin-bottom: 8px; font-size: 13px; line-height: 1.5;"
        >
          <span style="font-weight: 600;">{{ step.title }}</span>
          <span>：{{ step.description }}</span>
        </li>
      </ol>
    </div>

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
import type { HCResponse, HCAction } from '../lib/rendererRouter'
import { extractPreviewViewModel } from '../lib/extractors'

interface Props {
  response: HCResponse
  loading: boolean
  onAction: (action: HCAction) => void
}

const props = defineProps<Props>()

const viewModel = computed(() => extractPreviewViewModel(props.response))
</script>

