# 文明地层 · 遗迹档案站

四个主题长卷：工具与造物、信仰与仪式、城市与聚落、艺术与表达。每类 6 条，共 24 条概念档案。原生 HTML、CSS、JavaScript，无运行时第三方依赖。

## 运行与构建

需要 Node.js 18+。在项目目录执行 `npm start`，打开 http://127.0.0.1:4173/ 。同一局域网展示用 `npm run start:lan`，使用终端显示的 LAN 地址。

`npm test` 检查内容完整性及拖动惯性；`npm run build` 生成静态网站到 `dist/`。不需要安装 npm 包。页面使用 ES modules，不能直接双击 HTML。

## 编辑内容

- `data/archive.js`：名称、标签、摘要、解读、图片路径、视频路径、来源和 AI 标注。
- `data/theme-stories.js`：四个内部页面的标题、序言、首尾横图、档案顺序及材料阅读图。
- `data/exhibit.js`：首页石质档案袋素材。
- `assets/images/content/`：本轮导入的 WebP 图片。替换时保持路径，或同步修改数据文件。建议长边 1920px、单图小于 2MB。
- `assets/videos/`：视频目录；专题视频在 `data/archive.js` 配置。目前明确显示“影像待添加”。
- `tools-story.js` / `tools-story.css`：四主题共用的长卷布局与滚动交互。
- `archive-entry.js` / `archive-entry.css`：共用进入转场。
- `floating-deck.js`、`deck-physics.js`、`stone-dust.js`：首页拖动惯性、翻转与石屑效果。

增加档案时填写唯一编号，并加入对应主题的 `cardIds`；组件没有固定六张限制。替换真实资料时同步更新来源、AI 状态、图注和“图像与证据”段落。

## 素材与内容说明

本轮素材由项目作者提供的四组文案和概念图整理。主题编号修正为 01–04；“竹简文书”调整为“简牍文书”。第四主题织物图由 ChatGPT 内置 Image 模型补绘。

图像均按 AI 概念演绎展示，不作为真实文物照片、考古复原或断代依据。参考案例来自提供的材料，未建立图像与真实实物的一一对应关系；公开展览前仍需按权威资料逐项核对。原始 Word、原始图片、录屏、个人目录和 QA 文件不包含在发布包中。暂未提供真实视频。

## GitHub Pages

仓库根目录保存可编辑源码，`docs/` 保存线上版本。更新后运行 `npm run build`，将 `dist/` 内容更新至 `docs/`，提交并推送。Pages 从 main 分支的 `/docs` 发布。资源使用相对路径，档案使用 hash 路由。

没有账号、数据库或上传后台。用户提供的素材未在此另行授予第三方再利用许可。

## 右下角主题轮盘

轮盘的四个主题按钮、中心名称、编号和进度均为可编辑网页元素；石质底纹为独立透明贴图 `assets/images/navigation-stone-dial.webp`，路径和 AI 来源在 `data/exhibit.js` 的 `navigationDial` 配置。生成提示词见 `assets/navigation-dial-source.md`。点击主题或左右箭头切换，键盘可用 Tab 和 Enter；不需要依赖悬停。
