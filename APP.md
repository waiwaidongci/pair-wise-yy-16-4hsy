# 林见山 · 摄影师作品集

React + TypeScript + Vite 构建的独立摄影师作品集：五个页面（首页 / 作品集 / 系列详情 / 关于 / 联系）与一个全局共享灯箱。

## 启动

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # 类型检查 + 生产构建
npm run preview
```

`predev` / `prebuild` 会自动执行 `scripts/sync-assets.mjs`，把项目外的权威素材同步进应用：

- `../assets/fonts/*.woff2` → `public/fonts/`（本地字体，不连任何外部 CDN）
- `../mock-data/photos/` → `public/photos/`（真实照片）
- `../mock-data/photos.json` → `src/data/photos.json`（唯一内容数据源）

> 设计参考图（`assets/reference_*.png`）永远不会被应用引用；照片也不会被拷进 `assets/`。

## 内容数据流

所有照片、标题、文案只来自 `src/data/photos.json`（即 `mock-data/photos.json` 的同步副本）：

- `src/lib/photos.ts` 是唯一的数据访问层：`photosByFilter()`（作品集网格）、
  `photosBySeries()`（系列页，按 `order` 排序）、`categoryLabel()`、`photoSrc()`。
- 系列详情页不硬编码任何照片列表，全部按 `seriesId` 从同一份数据派生。

## 关键约束的实现位置

| 约束 | 实现 |
|---|---|
| 筛选状态跨导航保持 | `src/lib/filter-context.tsx`，Provider 位于 Router 之外，`/work` 卸载不丢状态 |
| 灯箱只在当前结果集内切换 | `src/lib/lightbox-context.tsx` 持有 `{ list, index }`；`openLightbox(list, index)` 由调用方传入当前筛选结果，导航在该数组内取模循环 |
| 图片防 CLS | `RatioImage.tsx` 用数据中的 `width/height` 生成 `aspect-ratio` 占位盒，图片绝对定位填充 |
| 移动端单列 + 灯箱底部说明 | `styles.css` 中 480px 断点网格降为单列，灯箱信息条位于图片下方 |
| 本地字体 | `styles.css` 顶部三个 `@font-face`，全部指向 `/fonts/*.woff2` |
| 表单校验 | `ContactPage.tsx`：失焦显示行内错误，整体未通过时提交按钮 `disabled`，提交后切换为成功态 |

## 浏览器自测

`tests/` 下附 Playwright 自测脚本（需 Playwright chromium）：

- `verify.mjs` —— 42 项交互断言（target states A–F、CLS、字体请求、表单三态等）
- `verify-extra.mjs` —— 键盘切换、遮罩关闭、移动菜单、三个系列数据顺序
- `shots.mjs` / `mobile-shots.mjs` —— 各验收状态截图，输出到 `tests/verify-shots/`
