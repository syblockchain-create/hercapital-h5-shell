import {
  extractPreviewViewModel,
  extractDoingViewModel,
  extractStatusViewModel
} from '../src/lib/extractors.js'
import type { HCResponse } from '../src/lib/rendererRouter.js'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[extractors-smoke] ${message}`)
  }
}

const previewResp: HCResponse = {
  header: '方案预览',
  cards: [
    {
      type: 'preview_card',
      content: {
        judgement_one_liner: '先守住预算，再处理债务滚动。',
        risk_boundary: '单笔非刚需支出不超过 200。',
        steps_mosaic: [
          { title: '记录', description: '今天把固定支出列出来。' },
          { title: '排序', description: '按利率排序债务。' },
          { title: '执行', description: '先还最高利率项。' }
        ]
      }
    }
  ]
}

const doingResp: HCResponse = {
  header: '执行中',
  cards: [
    {
      type: 'doing_card',
      content: {
        task_stage_display: '第 2 天 · 打卡阶段',
        today_focus: '今天只做一件事：完成支出打卡。',
        progress_hint: '连续 2/7 天，保持节奏。'
      }
    }
  ],
  meta: {
    phase: 'doing'
  }
}

const statusRespMissing: HCResponse = {
  header: '状态面板',
  cards: [
    {
      type: 'status_card',
      content: {}
    }
  ]
}

function run() {
  const previewVM = extractPreviewViewModel(previewResp)
  assert(previewVM.one_liner.length > 0, 'preview one_liner should not be empty')
  assert(previewVM.boundary.length > 0, 'preview boundary should not be empty')
  assert(previewVM.steps.length > 0 && previewVM.steps.length <= 3, 'preview steps should be within 1~3')

  const doingVM = extractDoingViewModel(doingResp)
  assert(doingVM.stage_display.length > 0, 'doing stage_display should not be empty')
  assert(doingVM.today_focus.length > 0, 'doing today_focus should not be empty')

  const statusVM = extractStatusViewModel(statusRespMissing)
  assert(statusVM.task_name.length > 0, 'status task_name should fallback')
  assert(statusVM.day_summary.length > 0, 'status day_summary should fallback')

  console.log('extractors smoke passed')
}

run()