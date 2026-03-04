# P1-2 Git 交付证明（本地阶段完成）

## 仓库初始化状态

```
仓库路径: E:\newhercapital-h5-shell
本地分支: 
  - main (基础 P1-2 代码提交)
  - feat/p1-2-ui-renderers (PR 分支，包含 CI 配置)
```

## Main 分支 (Baseline)

**Commit SHA**: `e4eba3f6ff48b2dc997e2304914bccc6f35342c9`

**Message**:
```
feat: P1-2 H5 UI renderers (preview/doing/status) + debug drawer + evidence mode

- Render-only change; preserves action.value passthrough
- Adds RendererRouter for intelligent route detection
- Implements PreviewView, DoingView, StatusView, FallbackView
- Debug panel with Evidence Mode watermark
- Safe getter utility to avoid crashes on missing fields
```

**Content**:
- `.gitignore` (排除 node_modules, dist, .env 等)
- `src/lib/rendererRouter.ts` (PR-1: Renderer Router)
- `src/components/PreviewView.vue` (PR-2A)
- `src/components/DoingView.vue` (PR-2B)
- `src/components/StatusView.vue` (PR-2C)
- `src/components/FallbackView.vue` (PR-2D)
- `src/components/DebugDrawer.vue` (PR-3)
- `src/App.vue` (集成所有渲染器)
- `package.json`, `vite.config.ts`, TypeScript 配置等

## PR 分支 (feat/p1-2-ui-renderers)

**Branch Tip SHA**: `185c4dfea6293696e8f0a119cc8a0cc308fc53ef`

**Commits**:
1. `e4eba3f` - Main baseline (P1-2 代码)
2. `185c4df` - CI workflow 提交

**CI 配置**:
- 文件: `.github/workflows/build.yml`
- 触发: push to main/feat/* + PR to main
- 步骤: node setup → npm ci → npm run build → artifact upload
- Status: ✅ 本地能通过 npm run build

## 本地验证

✅ npm ci：通过（50 packages）
✅ npm run build：成功（dist/ 生成）
✅ Git log：清晰的提交历史
✅ .gitignore：配置完整

## 下一步：上传到 GitHub（需用户执行）

### 0. 创建远端仓库（若未创建）
```bash
# 方式 A: 用 GitHub CLI
gh repo create syblockchain-create/hercapital-h5-shell --public --confirm

# 方式 B: 网页创建
# https://github.com/new
# Org: syblockchain-create
# Repo: hercapital-h5-shell
# DefaultBranch: main
```

### 1. 绑定远端
```bash
cd E:\newhercapital-h5-shell
git remote add origin https://github.com/syblockchain-create/hercapital-h5-shell.git
git remote -v  # 应显示 origin 指向上述 URL
```

### 2. 推送 main
```bash
git push -u origin main
```

### 3. 推送 PR 分支
```bash
git push -u origin feat/p1-2-ui-renderers
```

### 4. 创建 Pull Request
```bash
# 方式 A: GitHub CLI
gh pr create --base main --head feat/p1-2-ui-renderers \
  --title "P1-2: H5 UI renderers + debug drawer" \
  --body "Render-only. Keep action.value passthrough. Add Evidence/Debug panel + fallback."

# 方式 B: 网页
# https://github.com/syblockchain-create/hercapital-h5-shell/compare/main...feat/p1-2-ui-renderers
```

### 5. 等待 CI，合并后获取 main_sha
```bash
# 在 GitHub 网页上点 "Merge"（或 gh pr merge <number>）
# 然后拉取最新 main
git checkout main
git pull
git rev-parse HEAD  # 这就是合并后的 main_sha
```

## 截图验收清单

需在 `npm run dev` 的浏览器中采集 6 张截图（同一 conversation_id）：

- #0: Preview 初始态（蓝色卡，3 个方案按钮）
- #1: commit:choose_a 后（橙色 Doing 卡）
- #2: checkin:1:done 后（橙色卡继续）
- #3: checkin:2:done 后（橙色卡 + verify 按钮）
- #4: verify_done:confirm 后（完成提示）
- #5: status:show 后（绿色 Status 卡）

每张必须包含：Evidence Mode 水印 或 DebugDrawer 展示 conversation_id + state_write.status

---

**本地阶段完成时间**: 2026-03-04
**预期 GitHub PR 链接**: https://github.com/syblockchain-create/hercapital-h5-shell/pull/<number>
