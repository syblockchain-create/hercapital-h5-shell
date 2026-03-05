<template>
  <div>
    <!-- Evidence Mode Watermark -->
    <div
      v-if="evidenceMode"
      style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        font-size: 11px;
        opacity: 0.6;
        background: rgba(0, 0, 0, 0.1);
        padding: 8px;
        border-radius: 4px;
        max-width: 150px;
        text-align: right;
        pointer-events: none;
        z-index: 999;
      "
    >
      <div>conv: {{ convId }}</div>
      <div>renderer: {{ renderer }}</div>
      <div>state: {{ stateStatus }}</div>
    </div>

    <!-- Debug Drawer (Collapse) -->
    <details style="margin-top: 16px; border: 1px solid #ddd; border-radius: 4px; padding: 12px;">
      <summary style="cursor: pointer; font-weight: 600; font-size: 12px;">
        🔧 Debug 面板
        <input
          type="checkbox"
          v-model="evidenceMode"
          @click.stop
          style="margin-left: 8px; cursor: pointer;"
          title="启用证据模式"
        />
      </summary>

      <div style="margin-top: 12px; font-size: 12px; font-family: monospace;">
        <!-- Metadata -->
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; margin-bottom: 4px;">元数据</div>
          <div style="opacity: 0.7;">
            <div>conversation_id: {{ convId }}</div>
            <div>version_id: {{ versionId }}</div>
            <div>git_commit: {{ gitCommit }}</div>
          </div>
        </div>

        <!-- State Write (from debug.state_write) -->
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; margin-bottom: 4px;">state_write</div>
          <pre style="white-space: pre-wrap; margin: 0; background: #fafafa; padding: 4px; border-radius: 2px; font-size: 11px; overflow-x: auto;">{{ formatJson(stateWrite) }}</pre>
        </div>

        <!-- Last Request -->
        <div style="margin-bottom: 12px;">
          <div style="font-weight: 600; margin-bottom: 4px;">last_request</div>
          <pre style="white-space: pre-wrap; margin: 0; background: #fafafa; padding: 4px; border-radius: 2px; font-size: 11px; overflow-x: auto;">{{ formatJson(lastRequest) }}</pre>
        </div>

        <!-- Renderer Detection Info -->
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">renderer</div>
          <div style="opacity: 0.7;">{{ renderer }}</div>
        </div>

        <details style="margin-top: 12px;">
          <summary style="cursor: pointer; font-weight: 600;">Raw Response JSON</summary>
          <div style="margin-top: 8px;">
            <button
              @click="copyRawResponse"
              style="
                padding: 6px 10px;
                background: #616161;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
                margin-bottom: 8px;
              "
            >
              {{ copied ? '已复制' : '复制 Raw JSON' }}
            </button>
            <pre style="white-space: pre-wrap; margin: 0; background: #fafafa; padding: 4px; border-radius: 2px; font-size: 11px; overflow-x: auto;">{{ rawResponseJson }}</pre>
          </div>
        </details>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { safeGet } from '../lib/rendererRouter'
import type { HCResponse } from '../lib/rendererRouter'

interface Props {
  response: HCResponse
  renderer: string
  lastRequest?: Record<string, any>
}

const props = defineProps<Props>()
const evidenceMode = ref(false)
const copied = ref(false)

const convId = computed(() => {
  return safeGet(props.response.meta, 'conversation_id', 'unknown')
})

const versionId = computed(() => {
  return safeGet(props.response.meta, 'version_id', 'N/A')
})

const gitCommit = computed(() => {
  return safeGet(props.response.meta, 'git_commit', 'N/A')
})

const stateWrite = computed(() => {
  return safeGet(props.response.debug, 'state_write', {})
})

const stateStatus = computed(() => {
  return safeGet(stateWrite.value, 'status', 'unknown')
})

const rawResponseJson = computed(() => {
  return formatJson(props.response)
})

async function copyRawResponse() {
  try {
    await navigator.clipboard.writeText(rawResponseJson.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch {
    copied.value = false
  }
}

function formatJson(obj: any): string {
  if (!obj) return '{}'
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}
</script>
