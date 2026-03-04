# P1-2 表现层 UI 升级 - 验收报告

## 实现完成状态

### ✅ PR-1: Renderer Router（卡片分类与路由）
**文件**: `src/lib/rendererRouter.ts`

**功能**:
- 函数 `detectRendererType(resp)` 实现四优先级检测：
  1. 检查 `cards[].type` 中的明确标记（preview_card / doing_card / status_card）
  2. 检查 `meta.route` / `meta.phase` 字段
  3. 启发式检查 `header` 中的关键词（预览/方案/执行中/进行中/状态）
  4. 默认回退为 FALLBACK

**验收**:
- ✅ 任意响应都能被路由到合适的 Renderer，无白屏
- ✅ 控制台输出 `[Router] Matched by ...` 日志便于排障
- ✅ 导出 `HCResponse` 类型、`safeGet()` 工具函数

### ✅ PR-2: 三类专用渲染组件 + Fallback

#### A) PreviewView.vue (`src/components/PreviewView.vue`)
- UI: 蓝色顶部边框 (#1976d2)、半张卡布局
- 显示: header + cards[0].content + actions 按钮
- 行为: 点击按钮触发回传，action.value 原样发送

#### B) DoingView.vue (`src/components/DoingView.vue`)
- UI: 橙色顶部边框 (#f57c00)、脉冲点动画指示进行中
- 显示: header + meta.phase + cards[0].content + checkin/verify 按钮
- 行为: 保持现有 action 回传逻辑，无前端额外处理

#### C) StatusView.vue (`src/components/StatusView.vue`)
- UI: 绿色顶部边框 (#388e3c)
- 显示: header + 多张卡列表（cards 全部）+ status/reset 按钮
- 行为: 每个卡片单独渲染，card.title 作为小标题

#### D) FallbackView.vue (`src/components/FallbackView.vue`)
- UI: 灰色顶部边框 (#757575)
- 显示: 所有卡片 + Raw Response 可展开的 JSON viewer
- 兜底: 字段缺失时显示 "暂无可展示内容"

**验收**:
- ✅ 四个 Renderer 都支持空 cards、空 actions 的兜底
- ✅ 均采用 `safeGet()` 避免字段缺失导致崩
- ✅ 无新增字段读写，仅做"读字段→渲染"

### ✅ PR-3: Debug 面板与灰测证据模式

**文件**: `src/components/DebugDrawer.vue`

**功能**:
1. **Debug 折叠面板**（默认折叠）:
   - 显示 `meta.conversation_id` / `meta.version_id` / `meta.git_commit`
   - 展示 `debug.state_write` 完整内容（包括 status/reason/parsed_action）
   - 显示 `lastRequest` 摘要（user_text / conversation_id）
   - Console 输出 Renderer 选择日志

2. **证据模式开关**:
   - 右下角水印显示：conversation_id + renderer + state_write.status
   - 用于截图验收，不影响正常 UI

**验收**:
- ✅ 任意响应的 `debug.state_write` 可展示（后端已保证必出）
- ✅ 证据模式水印位置清晰、不遮挡内容

### ✅ App.vue 更新
- ✅ 导入四个 Renderer 和 DebugDrawer
- ✅ 使用 `detectRendererType()` 动态选择 Renderer
- ✅ 保持原 action.value 回传逻辑不变
- ✅ 新增 `lastRequest` 追踪，用于 DebugDrawer 显示

---

## 验收清单（已完成）

| 项目 | 状态 | 备注 |
|------|------|------|
| Renderer Router 实现 | ✅ | 四优先级检测，无崩 |
| Preview/Doing/Status/Fallback 最小可用 | ✅ | 各组件已实现 |
| 兜底渲染（字段缺失不白屏） | ✅ | 所有组件均支持 |
| 不改 action.value 回传 | ✅ | 保持原逻辑 |
| Debug 面板与证据模式 | ✅ | 水印 + state_write 展示 |
| 代码结构（3 PR 节点） | ✅ | PR-1/PR-2/PR-3 分离 |

---

## 手工验收步骤（在浏览器进行）

**目标**: 在同一 conversation_id 下，跑通 Preview → Doing → Status 完整闭环

### 步骤 #0: 初始状态（Preview）
1. 刷新浏览器 → 应显示蓝色卡（Preview Renderer）
2. 页面标题应为 "我把这件事收敛成一个可完成方案"
3. 可见三个 action 按钮：选择方案A/B/C
4. 打开 Debug 面板，记录 conversation_id 和 state_write.status

**截图信息**:
- Renderer: PREVIEW
- conversation_id: web_xxxxxxxx
- state_write: { status: "planning", ... }

### 步骤 #1-3: 执行链路（Doing）
1. 点击 "选择方案A" 按钮
2. 页面应变为橙色卡（Doing Renderer）
3. 脉冲点应在顶部闪烁
4. 继续点击 checkin:1:done、checkin:2:done

**截图信息**:
- Renderer: DOING
- conversation_id: 保持不变
- state_write: { status: "executing", ... }

### 步骤 #4: 完成确认（Doing 或 Status）
1. 点击 verify_done:confirm
2. 页面应显示完成相关内容

### 步骤 #5: 最终状态（Status）
1. 点击 status:show
2. 页面应变为绿色卡（Status Renderer）
3. 显示任务状态信息

**截图信息**:
- Renderer: STATUS
- conversation_id: 保持不变
- state_write: { status: "done", ... }

---

## 遇到的字段适配点（3 条以内）

1. **header 为 null 时**: 各 Renderer 用 fallback 标题（如 "预览" / "执行中" / "状态面板"）
2. **actions 为空时**: 隐藏按钮区，页面仍可读
3. **cards 为空时**: 显示 "暂无可展示内容"，Fallback 展示 Raw JSON

---

## 部署指令（已在 E:\newhercapital-h5-shell 中）

```bash
cd E:\newhercapital-h5-shell
npm install    # 若需要
npm run dev    # 启动 dev server，访问 http://localhost:5173
```

浏览器应立即显示新 UI，且后续每条请求都会经由 Router 正确分发到对应 Renderer。

---

## 验收完成

- ✅ 代码层面：PR-1/PR-2/PR-3 三部分完整实现
- ⏳ 截图验收：等待用户提供 6 张截图（#0~#5，同一 conversation_id）

建议后续步骤：
1. 在浏览器手工跑通闭环，收集 6 张截图（启用 Evidence Mode 水印便于对齐）
2. 对比 Renderer Router 的命中规则与实际 UI 变化
3. 验证 debug.state_write 在每一步都正确展示
