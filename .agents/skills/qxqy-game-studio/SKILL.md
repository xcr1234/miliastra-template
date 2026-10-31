---
name: qxqy-game-studio
description: 严格按策划案、TDD 测试用例、HTML 展示、美术素材、Lua 实现、测试、真机修复七步制作千星奇域 2D+Lua 游戏；每步交付后等待用户明确验收，再进入下一步。不用于 3D 节点图。
license: GPL-3.0-only
---

# 千星 2D+Lua 游戏工作室

目标是交付可在千星奇域真机运行的 Lua 游戏与完整存档。本工作流可供不同 AI 工具读取；模拟器操作以当前宿主实际提供的 MCP 或 Harness 工具为准。

本目录来源与本地修改见 [provenance.md](provenance.md)，许可见 [LICENSE](LICENSE)。

## 按需读取

首次进入或恢复会话先读 [接入与恢复](references/workflow.md)，检查工作区及当前 AI 配置中的知识库来源和实际可用性，确定一个当前步骤，再只读取下表对应文档。步骤切换时读取下一份；遇到缺项再回读相关步骤，不预先加载七份全文。

新游戏强制按 1→7 推进，每步都须先交付并等待用户明确验收，不跳步、合并或预做后续阶段。已有工程复用有效的用户验收记录，从最早尚未验收的步骤继续。`PREFLIGHT` 只负责盘点，不计入七步。执行和恢复前核对 [逐步验收规则](references/stage-approval.md)。

| 当前步骤 / 何时读取 | 产物与完成条件 |
|---|---|
| [1. 策划案](references/01-game-design.md)：创意尚未明确为玩法规则 | GDD 明确核心循环、输入、胜负、P0 范围和风险。 |
| [2. TDD 制定测试用例](references/02-test-cases.md)：规则明确，需定义预期或补回归用例 | 规则到用例的追踪、操作与可观察结果、静态/schema 检查。 |
| [3. HTML 效果展示](references/03-html-prototype.md)：需要确认画面、操作与节奏 | 可打开试玩的演示、用户明确验收记录和不可移植项；未确认停在本步。 |
| [4. 千星美术参考图和素材](references/04-art-assets.md)：HTML 体验已确认，需准备正式美术 | 参考图、素材清单、官方 imageId / 图元与 UI 还原方案。 |
| [5. Lua 编码实现](references/05-lua-implementation.md)：需搭建、实现或修复游戏 | Lua、完整存档、挂载/架构说明和 Red→Green→Regress 记录。 |
| [6. 测试](references/06-simulator-testing.md)：已有可运行版本，需验证规则与体验 | 用例、模拟器试玩/截图、设备布局与缺陷回归结果。 |
| [7. 真机试玩验证与 bug 修复](references/07-device-validation.md)：准备交付或处理真机回传 | 导入/挂载与索引校准、脚本目录绑定和更新交接、真机结果及未验证项。 |

## 贯穿各步骤的约束

- 步骤 2 在 HTML 之前，步骤 4 在 HTML 之后；步骤 1–4 不打开模拟器、不改存档、不运行 `runCase`。有效 TDD Red 要等步骤 5 的可运行骨架缺少目标生产行为；路径、JSON 和工具故障不算 Red。
- 启动前按 PREFLIGHT 查找已配置的 `miliastra-toolbox` 系列、其他知识库服务或本地文档，遵守 `AGENTS.md`，核验能否读到所需官方 2D/Lua API 与指南。已有资料直接复用，仅询问缺项；不从普通 Lua/UI 或 3D 节点经验猜接口。
- HTML 用于体验沟通；模拟器验证规则、布局与交互；真机证据验证平台实际行为。每条结果区分 `runtime=html|simulator|device`，模拟器绿灯不等于真机通过。
- 本项目采用 Lua 模块化源码、单文件交付；步骤 5 按项目 `AGENTS.md` 和 `docs/lua-modules.md` 构建，模拟器和真机均使用同次打包的产物；受 Git 管理的存档只保留产物路径和挂载，`source` 留空，提交前运行 `npm run check:saves`。
- 步骤 7 首次交付一个含空白 Lua 的 GIA 整合包；用户导入、打开千星沙箱并填写真实 Lua 路径后，立即发起 deploy。已有目标先校验产物首行 UUID，空白/无效标记或其他项目 UUID 也必须取得用户明确覆盖同意，不能自行加 `--overwrite`。此后每次编译自动 deploy，纯 Lua 更新不重新生成 GIA；需要重新导入的结构或资源变化才重导并复核路径/索引。
- 官方素材可以用；模拟器只预览 `100001–100006` 六种基础图元，其余图片显示缺失框，记录目标 ID 并在真机核验。千星原点左下、Y 向上，不能直接搬 HTML/CSS 坐标。
- 操作前检查实际工具与 schema；有 `qxqy-simulator` 操作 Skill 时按需读取，其他宿主使用相应接入指南。没有可用模拟器工具时，可处理已获准进入的步骤 1–4 当前任务，阶段间仍须用户验收，不能声称通过模拟器或真机验证。

## 决策与交接

视觉设计与界面审查按项目 [设计指南](../../../docs/design-skills.md) 接入 Taste 与 Impeccable：步骤 3 探索/打磨 HTML，步骤 4 记录可还原的美术规范，步骤 6–7 依据实际平台画面评审。只在任务涉及视觉时读取相应入口，不以网页工具替代 Lua API、规则测试或真机证据。

每一步交付都是固定验收点：展示本步产物、证据和未完成项，标记 `awaiting-user-confirmation` 并结束本轮；用户明确验收后只进入下一步。阶段内的实现细节、路径、断言和控件拆分自行处理，不为这些事项重复请求确认。工具通过或 Agent 评审不替代用户验收。

以 `docs/production-plan.md` 记录当前步骤、退出证据、阻塞项；以 `records/playtest.md` 记录实际结果与来源。恢复与跨步骤回退规则见 [workflow.md](references/workflow.md)；阶段操作细节只在对应步骤文档维护。
