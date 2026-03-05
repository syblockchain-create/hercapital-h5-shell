import type { HCResponse } from './rendererRouter'

export interface PreviewStepItem {
  title: string
  description: string
}

export interface PreviewViewModel {
  title: string
  one_liner: string
  boundary: string
  steps: PreviewStepItem[]
}

export interface DoingViewModel {
  title: string
  stage_display: string
  today_focus: string
  progress_hint: string
}

export interface StatusViewModel {
  title: string
  task_name: string
  stage_display: string
  day_summary: string
  entitlement_display: string
}

type UnknownRecord = Record<string, any>

const DEBUG_HINT = '字段不完整，可展开 Debug 面板查看 Raw Response。'

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {}
}

function asText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

function firstText(candidates: unknown[]): string {
  for (const candidate of candidates) {
    const text = asText(candidate)
    if (text) return text
  }
  return ''
}

function splitReadableSentences(text: string): string[] {
  return text
    .split(/\r?\n|[；;。!?！？]/g)
    .map((line) => line.replace(/^[-•\d.)\s]+/, '').trim())
    .filter(Boolean)
}

function parseLineValue(lines: string[], keyTokens: string[]): string {
  for (const line of lines) {
    const normalized = line.toLowerCase()
    for (const token of keyTokens) {
      if (normalized.includes(token.toLowerCase())) {
        const pieces = line.split(/[:：]/)
        if (pieces.length > 1) {
          const value = pieces.slice(1).join(':').trim()
          if (value) return value
        }
      }
    }
  }
  return ''
}

function fallbackReadableLines(content: unknown): string[] {
  if (typeof content === 'string') {
    return splitReadableSentences(content)
  }
  const record = asRecord(content)
  const values = Object.values(record)
    .map((value) => asText(value))
    .filter(Boolean)
  return splitReadableSentences(values.join('\n'))
}

function normalizeStep(step: unknown, index: number): PreviewStepItem {
  const record = asRecord(step)
  const title = firstText([
    record.title,
    record.name,
    record.step,
    `第${index + 1}步`
  ])
  const description = firstText([
    record.description,
    record.desc,
    record.body,
    record.content,
    record.text,
    DEBUG_HINT
  ])
  return { title, description }
}

function extractSteps(content: unknown): PreviewStepItem[] {
  const record = asRecord(content)
  const structured =
    (Array.isArray(record.steps_mosaic) && record.steps_mosaic) ||
    (Array.isArray(record.steps) && record.steps) ||
    (Array.isArray(record.action_steps) && record.action_steps) ||
    []

  if (structured.length > 0) {
    return structured.slice(0, 3).map((step, index) => normalizeStep(step, index))
  }

  const lines = fallbackReadableLines(content).slice(0, 3)
  if (lines.length > 0) {
    return lines.map((line, index) => {
      const chunks = line.split(/[:：]/)
      if (chunks.length > 1) {
        const head = chunks[0] ?? ''
        return {
          title: head.trim() || `第${index + 1}步`,
          description: chunks.slice(1).join(':').trim() || DEBUG_HINT
        }
      }
      return {
        title: `第${index + 1}步`,
        description: line
      }
    })
  }

  return [
    { title: '第1步', description: DEBUG_HINT },
    { title: '第2步', description: DEBUG_HINT },
    { title: '第3步', description: DEBUG_HINT }
  ]
}

export function extractPreviewViewModel(resp: HCResponse): PreviewViewModel {
  const card = resp.cards?.[0]
  const content = card?.content
  const contentRecord = asRecord(content)
  const lines = fallbackReadableLines(content)

  const oneLiner = firstText([
    contentRecord.judgement_one_liner,
    contentRecord.one_liner,
    parseLineValue(lines, ['一句判断', '判断', '结论', 'judgement'])
  ])

  const boundary = firstText([
    contentRecord.risk_boundary,
    contentRecord.boundary,
    parseLineValue(lines, ['风险边界', '边界', '风险', 'boundary'])
  ])

  return {
    title: firstText([resp.header, card?.title, '方案预览']),
    one_liner: oneLiner || `暂未生成一句判断。${DEBUG_HINT}`,
    boundary: boundary || `暂未生成风险边界。${DEBUG_HINT}`,
    steps: extractSteps(content)
  }
}

export function extractDoingViewModel(resp: HCResponse): DoingViewModel {
  const card = resp.cards?.[0]
  const content = card?.content
  const contentRecord = asRecord(content)
  const lines = fallbackReadableLines(content)

  const stageDisplay = firstText([
    contentRecord.task_stage_display,
    contentRecord.stage_display,
    contentRecord.task_stage,
    resp.meta?.task_stage_display,
    resp.meta?.phase,
    parseLineValue(lines, ['当前阶段', '阶段', 'stage'])
  ])

  const todayFocus = firstText([
    contentRecord.today_focus,
    contentRecord.today_one_thing,
    contentRecord.focus,
    parseLineValue(lines, ['今天只做一件事', '今日重点', 'today'])
  ])

  const progressHint = firstText([
    contentRecord.progress_hint,
    contentRecord.day_records_summary,
    parseLineValue(lines, ['进度提示', '进度', 'progress'])
  ])

  return {
    title: firstText([resp.header, card?.title, '执行中']),
    stage_display: stageDisplay || `阶段信息缺失。${DEBUG_HINT}`,
    today_focus: todayFocus || `今天任务缺失。${DEBUG_HINT}`,
    progress_hint: progressHint || `暂无进度提示。${DEBUG_HINT}`
  }
}

export function extractStatusViewModel(resp: HCResponse): StatusViewModel {
  const card = resp.cards?.[0]
  const content = card?.content
  const contentRecord = asRecord(content)
  const lines = fallbackReadableLines(content)

  const taskName = firstText([
    contentRecord.task_name,
    contentRecord.current_task_name,
    card?.title,
    parseLineValue(lines, ['任务', 'task'])
  ])

  const stageDisplay = firstText([
    contentRecord.task_stage_display,
    contentRecord.stage_display,
    contentRecord.task_stage,
    resp.meta?.task_stage_display,
    resp.meta?.phase,
    parseLineValue(lines, ['阶段', 'stage'])
  ])

  const daySummary = firstText([
    contentRecord.day_records_summary,
    contentRecord.day_summary,
    contentRecord.summary,
    parseLineValue(lines, ['日总结', '摘要', 'summary'])
  ])

  const entitlementDisplay = firstText([
    contentRecord.entitlement_display,
    contentRecord.entitlement,
    contentRecord.rights,
    parseLineValue(lines, ['权益', 'entitlement'])
  ])

  return {
    title: firstText([resp.header, card?.title, '状态面板']),
    task_name: taskName || `当前任务缺失。${DEBUG_HINT}`,
    stage_display: stageDisplay || `阶段信息缺失。${DEBUG_HINT}`,
    day_summary: daySummary || `暂无记录。${DEBUG_HINT}`,
    entitlement_display: entitlementDisplay
  }
}