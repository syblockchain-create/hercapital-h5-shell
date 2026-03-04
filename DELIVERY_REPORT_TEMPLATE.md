# P1-2 UI 升级：交付回报模板（待填）

## 📋 基本信息

### 代码交付

| 项目 | 值 |
|------|-----|
| Repo | https://github.com/syblockchain-create/hercapital-h5-shell |
| PR URL | https://github.com/syblockchain-create/hercapital-h5-shell/pull/`<PR_NUMBER>` |
| PR 分支 | `feat/p1-2-ui-renderers` |
| PR Commit SHA | `185c4dfea6293696e8f0a119cc8a0cc308fc53ef` |
| Main Commit SHA (baseline) | `e4eba3f6ff48b2dc997e2304914bccc6f35342c9` |
| Main SHA (merged) | `<待填：git pull && git rev-parse HEAD>` |

### CI 状态

- [ ] CI 通过（npm ci + npm run build）
- [ ] PR 已合并到 main
- CI 工作流路径: `.github/workflows/build.yml`

---

## 🎯 功能特性

### PR-1: Renderer Router
- 文件: `src/lib/rendererRouter.ts`
- 功能: 四优先级检测（explicit type > meta hints > header heuristic > fallback）
- 状态: ✅ 完成，无字段缺失时崩

### PR-2: 三类专用渲染组件
- PreviewView.vue: 蓝色卡，半张布局（header + content + actions）
- DoingView.vue: 橙色卡，脉冲指示（header + phase + content + checkin/verify）
- StatusView.vue: 绿色卡，任务列表（header + multi-cards + status actions）
- FallbackView.vue: 灰色卡，兜底方案（JSON viewer + raw response）
- 状态: ✅ 完成，全部支持字段缺失兜底

### PR-3: Debug 面板 & 证据模式
- 文件: `src/components/DebugDrawer.vue`
- 功能: 
  - 显示 meta.conversation_id / version_id / git_commit
  - 展示 debug.state_write 完整内容
  - Evidence Mode 水印：conversation_id + renderer + state_write.status
- 状态: ✅ 完成

---

## 📸 验收截图（需用户采集）

**闭环场景**: `npm run dev` 启动后在浏览器中走完整流程，同一 conversation_id

| # | 阶段 | Renderer | State | 凭证 |
|---|------|----------|-------|------|
| 0 | Preview 初始 | PREVIEW | planning | [截图URL或属性] |
| 1 | commit:choose_a | DOING | executing | [截图URL或属性] |
| 2 | checkin:1:done | DOING | executing | [截图URL或属性] |
| 3 | checkin:2:done | DOING | executing | [截图URL或属性] |
| 4 | verify_done:confirm | ? (Status/Done) | ? | [截图URL或属性] |
| 5 | status:show | STATUS | done | [截图URL或属性] |

**每张截图须包含：**
- Evidence Mode 水印（conversation_id + renderer + state）
  或
- DebugDrawer 展开（显示 conversation_id + debug.state_write）

---

## 🔍 技术清单

### 硬约束遵守（全部✅）
- [ ] ✅ 不改后端字段
- [ ] ✅ 不改 action.value 回传逻辑
- [ ] ✅ 仅前端"读字段→渲染"
- [ ] ✅ 字段缺失无白屏（fallback 完整）

### 代码质量
- [ ] 类型定义完整 (TypeScript interfaces: HCResponse / HCCard / HCAction)
- [ ] 公共工具函数 (safeGet 避免字段缺失)
- [ ] Router 日志清晰 ([Router] Matched by ...)
- [ ] CI 配置完整 (.github/workflows/build.yml)

### 文档
- [ ] GIT_DELIVERY_EVIDENCE.md (本地阶段完成)
- [ ] ACCEPTANCE_REPORT.md (PR-1/2/3 实现总结)
- [ ] README.md (项目说明，如需更新)

---

## 📝 说明

### Renderer 检测规则

1. **优先级 1: Explicit Card Type**
   - 检查 `cards[].type` 中的明确标记（preview_card / doing_card / status_card）
   
2. **优先级 2: Meta Hints**
   - 检查 `meta.route` / `meta.phase` 字段
   
3. **优先级 3: Header Heuristics**
   - 检查 header 中的关键词（预览、方案、执行中、进行中、状态）
   
4. **优先级 4: Fallback**
   - 通用 FallbackView，展示 RAW JSON

### Evidence Mode 截图要求

点击 DebugDrawer 中的 "启用证据模式" 复选框，右下角会显示水印：
```
conv: web_xxxxxxxx
renderer: PREVIEW/DOING/STATUS
state: planning/executing/done
```

这样可在截图上直观看出 conversation_id 续传与 Renderer 变化。

---

## ✅ 最终验收清单

- [ ] PR 已创建（/pull/<number>）
- [ ] CI 已通过（绿）
- [ ] PR 已合并到 main
- [ ] main_sha 已获取
- [ ] 分支 tip sha 已获取
- [ ] 6 张截图已采集（#0~#5，同一 conversation_id）
- [ ] 所有截图含 Evidence Mode 或 DebugDrawer 凭证
- [ ] 本文档已填完

---

**交付日期**: 2026-03-04  
**交付阶段**: ✅ 本地完成 → ⏳ GitHub 推送 → ⏳ CI/合并 → ⏳ 截图验收 → ✅ 完全交付
