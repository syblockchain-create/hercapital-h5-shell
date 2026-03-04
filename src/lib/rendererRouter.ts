// Utility to safely get nested properties
export function safeGet<T = any>(obj: any, path: string, defaultValue: T): T {
  try {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? defaultValue
  } catch {
    return defaultValue
  }
}

// Renderer type enumeration
export enum RendererType {
  PREVIEW = 'preview',
  DOING = 'doing',
  STATUS = 'status',
  FALLBACK = 'fallback'
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
  if (!resp) return RendererType.FALLBACK

  const cards = resp.cards || []
  const meta = resp.meta || {}
  const header = resp.header || ''

  // Priority A: Check explicit card type
  for (const card of cards) {
    if (card.type === 'preview_card') {
      console.debug('[Router] Matched by card.type=preview_card')
      return RendererType.PREVIEW
    }
    if (card.type === 'doing_card') {
      console.debug('[Router] Matched by card.type=doing_card')
      return RendererType.DOING
    }
    if (card.type === 'status_card') {
      console.debug('[Router] Matched by card.type=status_card')
      return RendererType.STATUS
    }
  }

  // Priority B: Check meta hints
  const route = safeGet(meta, 'route', '')
  const phase = safeGet(meta, 'phase', '')
  const sceneId = safeGet(meta, 'scene_id', '')

  if (route === 'preview' || phase === 'preview') {
    console.debug('[Router] Matched by meta.route/phase=preview')
    return RendererType.PREVIEW
  }
  if (route === 'doing' || phase === 'doing' || phase === 'executing') {
    console.debug('[Router] Matched by meta.route/phase=doing')
    return RendererType.DOING
  }
  if (route === 'status' || phase === 'status') {
    console.debug('[Router] Matched by meta.route/phase=status')
    return RendererType.STATUS
  }

  // Priority C: Heuristic on header content
  const normalizedHeader = header.toLowerCase()
  if (normalizedHeader.includes('预览') || normalizedHeader.includes('方案')) {
    console.debug('[Router] Matched by header heuristic (preview)')
    return RendererType.PREVIEW
  }
  if (normalizedHeader.includes('执行中') || normalizedHeader.includes('进行中') || normalizedHeader.includes('开始执行')) {
    console.debug('[Router] Matched by header heuristic (doing)')
    return RendererType.DOING
  }
  if (normalizedHeader.includes('状态') || normalizedHeader.includes('完成')) {
    console.debug('[Router] Matched by header heuristic (status)')
    return RendererType.STATUS
  }

  // Final fallback
  console.debug('[Router] No match, using fallback')
  return RendererType.FALLBACK
}
