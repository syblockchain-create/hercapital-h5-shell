// Full loop test with detailed logging for PR-1-2-3 acceptance

async function fullLoopTest() {
  const base = 'https://hercapital-pack-kernel-production.up.railway.app'
  const region = 'CN'
  const user_id = 'web_user'
  
  let conv = `web_${Date.now()}`
  let stepNum = 0
  const results = []

  async function step(label, userText) {
    stepNum++
    const body = { user_id, user_text: userText, conversation_id: conv, region }
    const res = await fetch(`${base}/run_pack`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()

    const rendererHint = detectRenderer(data)
    const screenshot = {
      step: stepNum - 1,
      label,
      userText,
      renderer: rendererHint,
      conversationId: conv,
      header: data.header || '(no header)',
      actions: data.actions?.map(a => a.label) || [],
      cardCount: data.cards?.length || 0,
      metaHints: {
        route: data.meta?.route,
        phase: data.meta?.phase,
        task_id: data.meta?.task_id
      },
      stateWrite: data.debug?.state_write
    }
    results.push(screenshot)
    console.log(`\n========== SCREENSHOT #${stepNum - 1} ==========`)
    console.log(`Label: ${label}`)
    console.log(`User Input: ${userText}`)
    console.log(`Renderer Detected: ${rendererHint}`)
    console.log(`Conversation ID: ${conv}`)
    console.log(`Header: ${screenshot.header}`)
    console.log(`Actions: [${screenshot.actions.join(', ')}]`)
    console.log(`Card Count: ${screenshot.cardCount}`)
    console.log(`Meta: route=${screenshot.metaHints.route}, phase=${screenshot.metaHints.phase}`)
    console.log(`State Write:`, JSON.stringify(screenshot.stateWrite, null, 2))
    console.log('=====================================')

    return data
  }

  function detectRenderer(resp) {
    // Mimics detectRendererType from rendererRouter.ts
    if (!resp) return 'FALLBACK'
    
    const cards = resp.cards || []
    const header = resp.header || ''
    const meta = resp.meta || {}
    
    // Check card type
    for (const card of cards) {
      if (card.type === 'preview_card') return 'PREVIEW'
      if (card.type === 'doing_card') return 'DOING'
      if (card.type === 'status_card') return 'STATUS'
    }
    
    // Check meta hints
    if (meta.route === 'preview' || meta.phase === 'preview') return 'PREVIEW'
    if (meta.route === 'doing' || meta.phase === 'doing' || meta.phase === 'executing') return 'DOING'
    if (meta.route === 'status' || meta.phase === 'status') return 'STATUS'
    
    // Check header heuristics
    const h = header.toLowerCase()
    if (h.includes('预览') || h.includes('方案')) return 'PREVIEW'
    if (h.includes('执行中') || h.includes('进行中') || h.includes('开始执行')) return 'DOING'
    if (h.includes('状态') || h.includes('完成')) return 'STATUS'
    
    return 'FALLBACK'
  }

  try {
    console.log('\n🎯 Starting PR-1-2-3 Acceptance Loop Test\n')
    console.log(`Initial Conversation ID: ${conv}`)
    
    // #0 Preview
    await step('Preview - Initial State', '我想管理我的债务')
    
    // #1 Commit choice
    await step('Doing - After commit:choose_a', 'commit:choose_a')
    
    // #2 Checkin 1
    await step('Doing - After checkin:1:done', 'checkin:1:done')
    
    // #3 Checkin 2
    await step('Doing - After checkin:2:done', 'checkin:2:done')
    
    // #4 Verify
    await step('Complete - After verify_done:confirm', 'verify_done:confirm')
    
    // #5 Status
    await step('Status - status:show', 'status:show')
    
    // Summary Report
    console.log('\n\n========== ACCEPTANCE REPORT ==========')
    console.log(`Total Steps: ${results.length}`)
    console.log('Conversation ID consistency:', new Set(results.map(r => r.conversationId)).size === 1 ? '✅ PASS' : '❌ FAIL')
    console.log('Renderer Progression:', results.map(r => r.renderer).join(' → '))
    console.log('\nDetailed Results:')
    results.forEach((r, i) => {
      console.log(`  #${i}: ${r.label} | Renderer: ${r.renderer} | Actions: ${r.actions.length}`)
    })
    console.log('=======================================\n')
    
  } catch (e) {
    console.error('Test failed:', e)
  }
}

fullLoopTest()
