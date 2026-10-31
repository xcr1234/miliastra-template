# 游戏视觉设计与界面审查

模板随仓库附带 Taste 和 Impeccable 的固定版本、配套资料与工具，入口已按千星 2D + Lua 调整。clone 后即可读取 Skill；运行命令需要 Node.js 22.19+，浏览器检查另需现有 Chrome、Edge 或 Chromium。Impeccable 引擎按需下载，不是 clone 的必需步骤。

## 在七步流程中使用

| 阶段 | 使用方式 | 结果去向 |
|---|---|---|
| 3. HTML 原型 | Taste 探索视觉方向；Impeccable 审查层级、操作、反馈与局部细节 | `prototype/`、体验记录与不可移植项 |
| 4. 美术与还原 | 提取色板、字号、间距、控件状态、资产与动效意图 | `docs/art-bible.md` 中的现有美术规范、素材清单与 UI 还原规格 |
| 5. Lua 实现 | 依照已确认设计，用官方 API 实现；设计参考不能充当 API 依据 | `src/**/*.lua`、同次打包产物与保存的存档 |
| 6. 模拟器测试 | 根据实际画面评审遮挡、裁切、热区和状态，再回归规则 | `records/playtest.md`，标 `runtime=simulator` |
| 7. 真机验证 | 根据实际回传处理字体、素材、设备布局与反馈差异 | 真机记录与交接说明，标 `runtime=device` |

步骤 1–2 仍先明确规则与用例；步骤 1–4 不操作模拟器。窄修复只处理受影响阶段。不要为接入设计工具预建空原型、美术文档或试玩结果。

## Skill 路由

- [design-taste-frontend](../.agents/skills/design-taste-frontend/SKILL.md)：初稿、美术方向、配色、构图或明确的视觉重设计。
- [impeccable](../.agents/skills/impeccable/SKILL.md)：已有界面的评审、布局、文案、反馈、打磨与设备适配。
- [miliastra-image-css-builder](../.agents/skills/miliastra-image-css-builder/SKILL.md)：图标和图元拟合的具体制作。Taste 的网页 CSS 不等于千星图片编辑器可导入 CSS。
- [miliastra-knowledge-lua](../.agents/skills/miliastra-knowledge-lua/SKILL.md)：控件属性、Lua API、生命周期和挂载资料。

本地 `SKILL.md` 是执行入口。两份 `UPSTREAM-SKILL.md` 与上游 reference 保留为研究资料，按需参考；其通用网页工作流、安装、hook、委派和文档创建规则不覆盖项目适配入口。

可以直接向 Agent 说：

> 按七步流程制作第 3 步 HTML 原型，用 Taste 探索符合玩法的视觉方向，再用 Impeccable 检查按钮、反馈和信息层级。

> 用 Impeccable 评审这张千星结算界面截图，先找遮挡、文字裁切和重开入口的问题；注明截图来源与未验证的交互。

新 Skill 通常在下一轮会话发现；尚未出现在技能菜单时也可直接读取上面的项目入口。

## 游戏适配边界

- 使用已有 `docs/gdd.md`、测试、`docs/art-bible.md` 和试玩记录；不强制生成另一套 `PRODUCT.md` / `DESIGN.md`。上游 context 只取 `RESOLVED_CONTEXT` 的目标与路径事实；初始化、自主性和代理授权提示属于上游流程，按项目入口替换，不作为新文件门槛或用户授权。
- 游戏美术遵循用户方向和可读性。上游网页禁用渐变、辉光、描边、等宽字体，或要求一定图片/动效数量等意见，不自动成为游戏门槛。中文、字体和数字样式以平台可用性与玩家辨读为依据。
- 默认以项目适配／单上下文进行评审，明确方法，不宣称完成上游双独立评审。普通评审不增加委派确认；用户明确要求多代理时遵守宿主授权规则。
- HTML 参考图的坐标、CSS、DOM、字体和动效需要重新落到千星控件、imageId 与 Lua；HTML 左上原点/Y 向下，千星左下原点/Y 向上。按步骤 3 标明 `must-reproduce`、`can-degrade`、`concept-only`。
- 网页检查不证明 Lua、GIA、模拟器画布或真机通过。记录实际来源、尺寸、状态和版本；截图评审不证明交互、规则与性能。

## 项目内命令

从仓库根目录运行包装入口，不直接运行上游启动器或 `npx impeccable install`：

```sh
npm run design:check
npm run design:taste -- draw --list directions
npm run design:taste -- draw --app --kind workspace --brief "游戏设置" --options 3
npm run design:taste -- lint prototype/ --app
npm run design:taste -- inspect prototype/index.html --app
npm run design:impeccable -- engine-probe
npm run design:impeccable -- context --target prototype/index.html
npm run design:impeccable -- detect prototype/index.html
```

`draw` 的方案作为参考，不强制把游戏套成网站或后台。Taste 的网页检查结果保留原文，逐项判断适用性；保留必要游戏表达时记录理由，不通过隐藏内容清零。Impeccable 静态源码扫描与 URL/浏览器检测的覆盖范围不同；需要实际渲染的文字、对比度和溢出问题要以浏览器或实际平台画面复核。

`tools/design-tools.mjs` 将 Taste 历史写到 `.taste-skill/`，浏览器临时文件写到 `.local-tools/design-tools/tmp/`；Impeccable 引擎留在 `.local-tools/impeccable/`，每次执行核对固定 SHA-256。不会使用全局引擎候选或安装 hooks。包装入口关闭匿名使用遥测，并保留用户原有 HOME 等环境变量。两个工具自己的工作目录 `.taste-skill/`、`.impeccable/` 均 Git 忽略，认可的设计结论须回写项目文档。

首次调用 Impeccable 的三个引擎命令需要从官方 GitHub Release 下载本平台引擎，并沿用宿主已配置的 HTTP_PROXY / HTTPS_PROXY / NO_PROXY；不写入示例代理。失败则报告网络/权限或校验错误，不改用未校验的二进制。Chrome 类检查需要本机已安装浏览器，可用 `CHROME_PATH` 指定；缺少浏览器时不自动安装，保留未验证项并使用当前宿主可用的截图工具。

此接入提供设计资料及三个 Impeccable 引擎命令。上游 live 注入、hooks、全局安装、自更新和代理 TOML 未注册到项目配置；需要扩展时单独审查其目录、生命周期与副作用。

## 更新固定版本

来源与许可见两份 Skill 的 `provenance.md` 和 [工具来源](tool-sources.md)；所有上游文件的 SHA-256 在 `.agents/design-skills.lock.json`。目前资源均为文本，哈希按 LF 换行规范化，兼容 Windows CRLF checkout。`npm run design:check` 离线检查原始文件，不联网自动追随 main，也不校验项目适配入口的文字。

1. 在项目 `.local-tools/` 获取上游新提交，并固定完整 commit SHA；比较对应 Skill 目录、LICENSE 和 NOTICE。Taste 的来源是 `skills/taste-skill/`；Impeccable 是 `.agents/skills/impeccable/`。
2. 保留项目适配 `SKILL.md`、`provenance.md`、中文 UI 元数据和本地评审清单。将新原始入口保存为 `UPSTREAM-SKILL.md`，原始 Impeccable UI 元数据保存为 `agents/openai.upstream.yaml`；其余上游文件按比较结果更新，移除已废弃的上游文件。
3. 核对新脚本是否新增全局目录、依赖、下载、hook 或调用方式；引擎更新同时审查 VERSION 和 engine-checksums.txt。相应修改项目包装入口，不能运行上游自更新覆盖适配。
4. 更新来源版本、commit 与锁定清单中的每文件 SHA-256；执行 `npm run design:check`、Skill 校验、`npm test`，再 smoke 实际会用的命令。没有真实游戏画面时，只记录工具接入结果。
