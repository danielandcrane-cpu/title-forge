# TitleForge · 项目规范

## 是什么
多平台标题生成工作台，老泡菜内容创作配套工具。一个主题 → 5 平台差异化标题。

## 技术栈
- Vue 3.5 (`<script setup>`) + Vite 8 + Tailwind 3.4
- 原生 JS（无 TypeScript）
- localStorage 持久化（键：`title-forge-favorites` / `title-forge-last-topic`）

## 项目结构（极简）
```
src/App.vue          ← 所有代码（Day 8 单文件架构，后续再拆）
src/main.js          ← 入口
tailwind.config.js   ← 中国风配色
```
Vite 默认模板残留（HelloWorld.vue、vite.svg、vue.svg）可清理但不影响运行。

## 核心数据结构
- `TEMPLATES`：5 平台 × {zh: [], en: []} 模板库，用 `{topic}` 做槽位
- `platforms`：平台元数据数组（key/name/icon/lang/hint）
- `results`：{youtube, tiktok, douyin, bilibili, xiaohongshu} → 当前标题
- `favorites`：[{platform, title, time}] 收藏数组

## 命名规范
- 变量/函数：camelCase（`results`、`generate()`、`pickRandom()`）
- 常量：UPPER_CASE（`TEMPLATES`、`FAV_KEY`、`TOPIC_KEY`）
- Tailwind 颜色变量：小写中文语义（`paper`/`ink`/`seal`/`clay`/`tea`）

## UI 设计系统（中国风）
| Token | 值 | 用途 |
|---|---|---|
| `paper` | `#f5f0e6` 宣纸色 | 背景/卡片底 |
| `ink` | `#2a2622` 墨黑 | 主文字/深色按钮 |
| `seal` | `#b84444` 印章红 | 重点按钮/激活态 |
| `clay` | `#c4b8a4` 淡褐 | 边框/次要文字 |
| `tea` | `#8b7355` 茶褐 | 辅助说明文字 |
| `font-serif` | Songti SC / Noto Serif SC | 标题/品牌感 |

## 验证标准（改完必须过）
1. `npm run dev` → 无报错启动
2. 输入主题 → 5 平台卡片都出结果
3. `检测到中文输入 → 中文标题；英文输入 → 英文标题`
4. 5 个平台的「↻ 换一条」都能单独换
5. 复制/收藏功能正常，刷新后数据不丢

## 已知坑
- **JS 空数组 `[]` 是 truthy**！`[] || fallback` 返回 `[]`，必须显式检查 `arr.length === 0`（regenerate 函数已踩过这个坑）
- B站/抖音/小红书的 `en` 模板当前是空数组，英文输入会走 fallback 出中文标题——这是设计不是 bug

## 后续扩展位
- DeepSeek API 接入（在 `generate()` 里加 `useAI` 开关）
- 模板库管理（增删改、导入导出）
- 多版本对比（同主题生成 3 组对比选最优）
- 收藏导出（复制成 Markdown / 存到云笔记）
