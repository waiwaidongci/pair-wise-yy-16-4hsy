# 林昭 · 摄影师作品集

独立摄影师个人作品集站点：暗色编辑风、衬线标题、金色分隔线。React + TypeScript + Vite，无后端。

## 页面

- `/` 首页：摄影师简介 Hero + 三个系列（《凝视》《无人之境》《高原牧歌》）精选入口
- `/work` 作品集：全部 14 张照片的瀑布流网格，支持 全部 / 肖像 / 风光 / 牧野 筛选
- `/work/:seriesId` 系列详情：图文交替的叙事长图文 + 斜体引言，数据与 `/work` 同源
- `/about` 关于：简介与经历时间线
- `/contact` 联系：带行内校验、禁用提交与成功态的留言表单
- 全局共享 **Lightbox**（非独立路由）：左右切换（可键盘 ←/→/Esc）、关闭、说明文字

## 运行

```bash
npm install
npm run dev        # http://127.0.0.1:5173
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览生产构建
```

## 浏览器自检

```bash
# 需先安装浏览器：npx playwright install chromium
npm run dev &          # 或保证 5173 端口已起服务
node e2e-verify.mjs
```

脚本逐项核对 task.md 的 7 条耦合约束（筛选保持、灯箱范围限定、CLS 占位、数据同源、
移动端切换、本地字体、表单状态）并打印 25 项结果。

## 内容与资源

- 唯一内容数据源：`src/data/photos.json`（由 `mock-data/photos.json` 拷贝，构建期参与打包），
  页面、系列、灯箱全部从它派生，组件内不硬编码任何照片/标题/文案。
- 照片与字体通过 `public/` 下的软链接指向仓库中的 `mock-data/photos/` 与 `assets/fonts/`，
  保持两个目录的用途分离；Vite 构建会把它们复制进 `dist/`。
- 字体仅经本地 `@font-face` 加载（Inter、Playfair Display 600/italic 400），
  无任何 `fonts.googleapis.com` / `fonts.gstatic.com` 请求。
