// Utility to safely get nested properties
export function safeGet<T = any>(obj: any, path: string, defaultValue: T): T {
  try {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? defaultValue
  } catch {
    return defaultValue
  }
}

// Renderer type (avoid enum for erasableSyntaxOnly compatibility)
export type RendererType = 'preview' | 'doing' | 'status' | 'review_day7' | 'fallback'

export const RENDERER_TYPE = {
  PREVIEW: 'preview' as const,
  DOING: 'doing' as const,
  STATUS: 'status' as const,
  REVIEW_DAY7: 'review_day7' as const,
  FALLBACK: 'fallback' as const
}

// Response structure
export interface HCResponse {
  header?: string
  cards?: HCCard[]
  actions?: HCAction[]
  meta?: Record<string, any>
  debug?: {
    state_write?: Record<string, any>
    [key: string]: any
  }
}

export interface HCCard {
  type?: string
  title?: string
  content?: any
  actions?: HCAction[]
}

export interface HCAction {
  value: string
  label: string
  prompt?: string
}

// Renderer Detection & Router
export function detectRendererType(resp: HCResponse): RendererType {
  if (!resp) return RENDERER_TYPE.FALLBACK

  const cards = resp.cards || []
  const meta = resp.meta || {}
  const header = resp.header || ''

  // Priority A: Check explicit card type
  for (const card of cards) {
    if (card.type === 'preview_card') {
      console.debug('[Router] Matched by card.type=preview_card')
      return RENDERER_TYPE.PREVIEW
    }
    if (card.type === 'doing_card') {
      console.debug('[Router] Matched by card.type=doing_card')
      return RENDERER_TYPE.DOING
    }
    if (card.type === 'status_card' || card.type === 'verify_done_card') {
      console.debug(`[Router] Matched by card.type=${card.type} → status`)
      return RENDERER_TYPE.STATUS
    }
    if (card.type === 'completion_summary_card' ||
        card.type === 'next_action_card' ||
        card.type === 'next_scene_card') {
      console.debug(`[Router] Matched by card.type=${card.type} → review_day7`)
      return RENDERER_TYPE.REVIEW_DAY7
    }
  }

  // Priority B: Check meta hints
  const route = safeGet(meta, 'route', '') as string
  const phase = safeGet(meta, 'phase', '') as string

  if (route === 'preview' || phase === 'preview') {
    console.debug('[Router] Matched by meta.route/phase=preview')
    return RENDERER_TYPE.PREVIEW
  }
  if (route === 'doing' || phase === 'doing' || phase === 'executing') {
    console.debug('[Router] Matched by meta.route/phase=doing')
    return RENDERER_TYPE.DOING
  }
  if (route === 'status' || phase === 'status') {
    console.debug('[Router] Matched by meta.route/phase=status')
    return RENDERER_TYPE.STATUS
  }
  if (phase === 'review' || route === 'review') {
    console.debug('[Router] Matched by meta.route/phase=review → review_day7')
    return RENDERER_TYPE.REVIEW_DAY7
  }

  // Priority C: Heuristic on header content
  const normalizedHeader = header.toLowerCase()
  if (normalizedHeader.includes('预览') || normalizedHeader.includes('方案')) {
    console.debug('[Router] Matched by header heuristic (preview)')
    return RENDERER_TYPE.PREVIEW
  }
  if (normalizedHeader.includes('执行中') || normalizedHeader.includes('进行中') || normalizedHeader.includes('开始执行')) {
    console.debug('[Router] Matched by header heuristic (doing)')
    return RENDERER_TYPE.DOING
  }
  if (normalizedHeader.includes('状态') || normalizedHeader.includes('完成')) {
    console.debug('[Router] Matched by header heuristic (status)')
    return RENDERER_TYPE.STATUS
  }

  // Final fallback
  console.debug('[Router] No match, using fallback')
  return RENDERER_TYPE.FALLBACK
}
