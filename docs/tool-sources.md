# 工具来源与版本

本页维护当前版本的来源。许可证范围见 [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md)；开发过程中的旧版来源核对保留在生产记录中，不表示旧版复制文件仍随当前模板分发。

## 随仓库分发的第三方 Skill

| 目录 | 上游与固定提交 | 许可与适配 |
|---|---|---|
| `qxqy-game-studio` | [miliastra-beyond-simulator](https://github.com/1475505/miliastra-beyond-simulator/tree/2c5a012eeee06ce52324655d5b988393eb8f46f5)，`2c5a012eeee06ce52324655d5b988393eb8f46f5` | GPL-3.0-only；已按单游戏根目录、模块化 Lua、存档路径引用、指定路径发布和设计工具接入调整，见 [来源](../.agents/skills/qxqy-game-studio/provenance.md) |
| `design-taste-frontend` | [taste-skill](https://github.com/Leonxlnx/taste-skill/tree/12af471f627f866411b4bd785b19646d3672784c)，2.1.5 | MIT；[来源与项目适配](../.agents/skills/design-taste-frontend/provenance.md) |
| `impeccable` | [impeccable](https://github.com/pbakaus/impeccable/tree/df3a4abe7d0840d5f60324812c432e00b66a4e75)，Skill 4.8.0 / 引擎 0.1.18 | Apache-2.0；[来源与项目适配](../.agents/skills/impeccable/provenance.md) |

设计工具的原始入口、配套文件及 LICENSE/NOTICE 保留；哈希清单为 `.agents/design-skills.lock.json`，用 `npm run design:check` 验证。可选引擎按需下载到项目内，使用与更新见 [设计指南](design-skills.md)。

## 模板原创接入说明

- `miliastra-knowledge` 与 `miliastra-knowledge-lua` 为模板维护的 MIT 指引。接口参数以 [tools/miliastra-toolbox-mcp.mjs](../tools/miliastra-toolbox-mcp.mjs) 及当前 MCP schema 为准，说明见 [knowledge-api.md](knowledge-api.md)。本地适配器将 HTTP 查询转换为 stdio MCP，不要求安装 Harness 插件。
- 外部知识服务来自 [Miliastra-toolbox](https://github.com/1475505/Miliastra-toolbox)，默认地址 `https://ugc.070077.xyz`，兼容服务可通过 `MILIASTRA_KNOWLEDGE_BASE_URL` 设置。历史 API 契约参考提交 `5ee8f5eb4be99a7a094b190c8ed8213d30339538`；更早的接入参考为 [dsh-plugin-miliastra-toolbox](https://github.com/1475505/dsh-plugin-miliastra-toolbox) 的 `f35d55c1109bb7d822e48b22695335278e7208bc`。这里只记录服务与契约来源，不声明对上游代码或语料拥有再许可权。
- `miliastra-image-css-builder` 为模板原创的 MIT 工具接入流程；原始编辑器、专有 Skill 和参考文档不随本入口复制。外部实现和版本依据见 [接入来源](../.agents/skills/miliastra-image-css-builder/references/provenance.md)。
- 模板自己的初始化、Lua 打包、复制发布和检查工具在项目内维护。Lua 使用 `src/**/*.lua`，打包为单文件，存档只保存产物路径/UI/挂载且 `source` 留空；这些是本模板工程约定，不称为官方平台限制。

2026-10-31 公开版整理时，用户确认未取得或不确定专有 Skill 的公开再分发授权，因而将三份入口改为原创接入说明，并移除旧版复制参考。历史提交仍保有旧文件，本次不重写历史。

## 安装依赖与外部图片服务

直接依赖固定为 `beyond-simulator-mcp@0.4.1`、`beyond-simulator-web@0.4.1`、`@modelcontextprotocol/sdk@1.32.1`、`fengari@0.1.5`、`undici@8.11.2`、`zod@4.6.6`。完整依赖和完整性哈希在 `package-lock.json`，安装包内许可证继续适用。

图片编辑器为 [qx.070077.xyz](https://qx.070077.xyz/) / [源码](https://github.com/1475505/Miliastra-image-editor-webui)；自动拟合为 [qx-img.070077.xyz](https://qx-img.070077.xyz/) / [源码](https://github.com/1475505/Miliastra-toolbox-primitive-shape)。服务本体按需在线使用或安装在忽略的 `.local-tools/`，当前仓库不分发。安装与交付路径见 [图片拟合指南](image-fitting.md)。
