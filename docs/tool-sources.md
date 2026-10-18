# 工具来源

- 模拟器与 Web 编辑器：`beyond-simulator-mcp@0.4.1`、`beyond-simulator-web@0.4.1`，来源 [miliastra-beyond-simulator](https://github.com/1475505/miliastra-beyond-simulator)。
- `qxqy-game-studio` 工作流以模拟器仓库提交 `2c5a012eeee06ce52324655d5b988393eb8f46f5` 为基础，已按本模板的模块化源码、单文件构建与用户指定路径发布流程调整。
- 服务端/Lua 知识库 Skill 与 `tools/miliastra-toolbox-mcp.mjs` 适配契约来自 [dsh-plugin-miliastra-toolbox](https://github.com/1475505/dsh-plugin-miliastra-toolbox) 提交 `f35d55c1109bb7d822e48b22695335278e7208bc`。默认远端知识库为 `https://ugc.070077.xyz`，查询需要网络；可用 `MILIASTRA_KNOWLEDGE_BASE_URL` 指定兼容服务。
- 其余直接依赖锁定为 `@modelcontextprotocol/sdk@1.32.1`、`fengari@0.1.5`、`undici@8.11.2`、`zod@4.6.6`。完整依赖与完整性哈希记录在 `package-lock.json`；第三方许可见安装包对应的 LICENSE。
- 模板自己的初始化、Lua 打包、复制发布工具从本地千星项目整理而来，不需要运行 DSH 或全局安装 npm 工具。
- 图片编辑器：[在线服务](https://qx.070077.xyz/)、[源码仓库](https://github.com/1475505/Miliastra-image-editor-webui)。项目内已附带 `miliastra-image-css-builder@1.0.13`，固定上游提交 `cd4e08accc63f19774f844f38ad9b9c8dc2d3b79`；来源、原始许可声明与本地调整见 [Skill 来源记录](../.agents/skills/miliastra-image-css-builder/references/provenance.md)。自动图元拟合：[在线服务](https://qx-img.070077.xyz/)、[源码仓库](https://github.com/1475505/Miliastra-toolbox-primitive-shape)。在线入口由用户提供，流程与本地部署根据上游文档整理；两个图片服务本体未安装，按需在线使用或本地部署，见 [图片拟合指南](image-fitting.md)。
