# 工具来源

- 模拟器与 Web 编辑器：`beyond-simulator-mcp@0.4.1`、`beyond-simulator-web@0.4.1`，来源 [miliastra-beyond-simulator](https://github.com/1475505/miliastra-beyond-simulator)。
- `qxqy-game-studio` 工作流以模拟器仓库提交 `2c5a012eeee06ce52324655d5b988393eb8f46f5` 为基础，已按本模板的模块化源码、单文件构建与用户指定路径发布流程调整。
- 节点图/Lua 知识库 Skill 以 [Miliastra-toolbox](https://github.com/1475505/Miliastra-toolbox) 的原版为基础；固定提交、配套参考和本地适配见下节。`tools/miliastra-toolbox-mcp.mjs` 是本项目的 HTTP → stdio MCP 适配器，不需要安装 Harness 插件。
- 其余直接依赖锁定为 `@modelcontextprotocol/sdk@1.32.1`、`fengari@0.1.5`、`undici@8.11.2`、`zod@4.6.6`。完整依赖与完整性哈希记录在 `package-lock.json`；第三方许可见安装包对应的 LICENSE。
- 模板自己的初始化、Lua 打包、复制发布工具从本地千星项目整理而来，不需要运行 DSH 或全局安装 npm 工具。
- 图片编辑器：[在线服务](https://qx.070077.xyz/)、[源码仓库](https://github.com/1475505/Miliastra-image-editor-webui)。项目内已附带 `miliastra-image-css-builder@1.0.13`，固定上游提交 `cd4e08accc63f19774f844f38ad9b9c8dc2d3b79`；来源、原始许可声明与本地调整见 [Skill 来源记录](../.agents/skills/miliastra-image-css-builder/references/provenance.md)。自动图元拟合：[在线服务](https://qx-img.070077.xyz/)、[源码仓库](https://github.com/1475505/Miliastra-toolbox-primitive-shape)。在线入口由用户提供，流程与本地部署根据上游文档整理；两个图片服务本体未安装，按需在线使用或本地部署，见 [图片拟合指南](image-fitting.md)。

## 知识库 Skill 来源与适配

- 原版源码：[Miliastra-toolbox/skills](https://github.com/1475505/Miliastra-toolbox/tree/5ee8f5eb4be99a7a094b190c8ed8213d30339538/skills)，固定提交 `5ee8f5eb4be99a7a094b190c8ed8213d30339538`（提交时间 `2026-10-06T17:15:14Z`），本次核对日期为 2026-10-22（Asia/Shanghai）。节点图 Skill 上游版本 `1.2.0`；Lua Skill 上游版本 `1.0.0`。
- 用户指定的发布入口：[SkillHub](https://skillhub.cn/skills/user_3a6be892/miliastra-toolbox)。本次未能读取该页面，不声称其发布包与上述 GitHub 提交一致；本地文件依据已获取的固定 GitHub 提交整理。
- 历史适配来源：[dsh-plugin-miliastra-toolbox](https://github.com/1475505/dsh-plugin-miliastra-toolbox) 提交 `f35d55c1109bb7d822e48b22695335278e7208bc`。这是本项目原有 MCP 适配契约的来源，不能替代原版 Skill 来源记录。本次核对六个工具的具名参数与正确上游一致，未改动适配器执行逻辑。
- 上游两份 Skill 均声明 `license: Proprietary`，本地保留此标记。上游 `slug`、显示名称、版本和摘要移入 Codex 支持的 `metadata`；保留 `name`、`description`，调整 description 的触发范围。
- 两份 `references/tools.md` 原样保留；两份 `SKILL.md` 保留原版工具选择、批量与顺序查询、领域示例、异常处理、排障和输出规范，并加入本项目接入说明：MCP 优先；工具未加载且允许网络访问时可直接 HTTP 查询；区分 MCP 文本内的结果与 HTTP 的 `data.result` 包裹，检查内部错误。
- 本地语义澄清：节点图的 `side=client` 不等于客户端 Lua 控件；带关键词无结果不等于部署无语料，应通过无关键词查询核对；客户端 `related_nodes` 即使存在也为空；临时网络失败最多重试一次，不用换关键词解决连接或权限错误。来源标题无法唯一定位时说明限制，不假设支持文件名过滤、不将相关系统文档冒充精确来源全文。Lua 文档数量按快照标注，实际以服务返回为准。
- Lua 工程约定另列为本地规则：`src/**/*.lua` 模块化维护、`dist/main.lua` 单文件构建、存档只保留产物路径/挂载且 `source` 留空、模拟器按路径读取同次产物、提交前执行只读 `check:saves`，不将其称为官方限制。

默认远端知识库为 `https://ugc.070077.xyz`，HTTP 端点前缀为 `/api/v1/skills/miliastra-knowledge/tools/`；客户端和节点图工具共用端点前缀但使用不同语料。可用 `MILIASTRA_KNOWLEDGE_BASE_URL` 指定兼容服务。工具名和参数以当前 MCP schema 为准；响应结构与语料快照可能随部署更新，需要实际查询核验。

以下为固定提交的原始文件 SHA-256。配套参考的本地文件应与表中一致；本地 `SKILL.md` 已适配，不要求与原文哈希相同。

| 上游文件（相对 `skills/`） | SHA-256 |
|---|---|
| `miliastra-knowledge/SKILL.md` | `c35872a2d13917c1af34011cede93d8c0d589dece930c4ea8fb5a1b4e40ec5ce` |
| `miliastra-knowledge/references/tools.md` | `d1288df452d30097445df0c56175e190f64a0ecc9ba719f31002dc758354f77a` |
| `miliastra-knowledge-lua/SKILL.md` | `d567367bec00744182dfd48f95e497e16ce2ab4c0b6a155b1de41fccb0d4f89c` |
| `miliastra-knowledge-lua/references/tools.md` | `6ce4c7f4db4c8231dc1c119b1141394982c9b853f218a0db46af0d03a7337ca5` |
