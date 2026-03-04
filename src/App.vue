<script setup lang="ts">
import { ref } from 'vue'
import PreviewView from './components/PreviewView.vue'
import DoingView from './components/DoingView.vue'
import StatusView from './components/StatusView.vue'
import FallbackView from './components/FallbackView.vue'
import DebugDrawer from './components/DebugDrawer.vue'
import {
  detectRendererType,
  RendererType,
  type HCResponse,
  type HCAction,
  type HCPackResponse
} from './lib/rendererRouter'

const userId = ref('web_user')
const region = ref('CN')
const conversationId = ref(`web_${crypto.randomUUID()}`)
const input = ref('我想管理我的债务')

const resp = ref<HCResponse | null>(null)
const loading = ref(false)
const err = ref<string | null>(null)
const lastRequest = ref<Record<string, any> | null>(null)

function newSession() {
  conversationId.value = `web_${crypto.randomUUID()}`
  resp.value = null
  err.value = null
}

async function send(text: string) {
  loading.value = true
  err.value = null
  try {
    const body = {
      user_id: userId.value,
      user_text: text,
      conversation_id: conversationId.value,
      region: region.value,
      debug: { caller_source: 'h5_shell_upgrade' }
    }
    lastRequest.value = body

    const res = await fetch('/api/run_pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`)
    resp.value = data as HCResponse
  } catch (e: any) {
    err.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

function clickAction(a: HCAction) {
  send(a.value)
}

const currentRenderer = () => {
  if (!resp.value) return RendererType.FALLBACK
  return detectRendererType(resp.value)
}

const rendererName = () => {
  const type = currentRenderer()
  return type.toUpperCase()
}

function pretty(obj: any) {
  try { return JSON.stringify(obj, null, 2) } catch { return String(obj) }
}
</script>

<template>
  <div style="max-width: 800px; margin: 0 auto; padding: 16px; font-family: system-ui;">
    <!-- Header -->
    <div style="display:flex; justify-content: space-between; align-items:center; gap:12px; margin-bottom: 16px;">
      <div>
        <div style="font-weight:800; font-size:20px;">🎯 HerCapital H5 Shell</div>
        <div style="font-size:12px; opacity:.7; margin-top: 4px;">
          conv_id: {{ conversationId }}<br />
          renderer: {{ rendererName() }}
        </div>
      </div>
      <button @click="newSession" style="padding: 8px 16px; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
        New Session
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="err" style="margin-bottom: 12px; padding: 12px; background: #ffebee; border-left: 4px solid #f44336; color: #c62828; border-radius: 4px; white-space: pre-wrap; font-size: 13px;">
      ❌ {{ err }}
    </div>

    <!-- Response Display (with Router) -->
    <div v-if="resp" style="margin-bottom: 16px;">
      <PreviewView
        v-if="currentRenderer() === 'preview'"
        :response="resp"
        :loading="loading"
        :onAction="clickAction"
      />
      <DoingView
        v-else-if="currentRenderer() === 'doing'"
        :response="resp"
        :loading="loading"
        :onAction="clickAction"
      />
      <StatusView
        v-else-if="currentRenderer() === 'status'"
        :response="resp"
        :loading="loading"
        :onAction="clickAction"
      />
      <FallbackView
        v-else
        :response="resp"
        :loading="loading"
        :onAction="clickAction"
      />
    </div>

    <!-- Input Area -->
    <div style="display:flex; gap:8px; margin-bottom: 16px;">
      <textarea v-model="input" rows="3" style="flex:1; padding:10px; border: 1px solid #ddd; border-radius: 4px; font-family: system-ui;"></textarea>
      <button @click="send(input)" :disabled="loading" style="min-width: 80px; padding: 10px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
        {{ loading ? '⏳' : '发送' }}
      </button>
    </div>

    <!-- Quick Actions -->
    <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom: 16px;">
      <button @click="send('我想管理我的债务')" :disabled="loading" style="padding: 6px 12px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">债务</button>
      <button @click="send('朋友找我借钱我很纠结')" :disabled="loading" style="padding: 6px 12px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">借钱</button>
      <button @click="send('我买了个包很开心但担心超预算')" :disabled="loading" style="padding: 6px 12px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">超预算</button>
      <button @click="send('status:show')" :disabled="loading" style="padding: 6px 12px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">status:show</button>
    </div>

    <!-- Debug Drawer & Evidence Mode -->
    <DebugDrawer
      v-if="resp"
      :response="resp"
      :renderer="rendererName()"
      :lastRequest="lastRequest"
    />
  </div>
</template>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
