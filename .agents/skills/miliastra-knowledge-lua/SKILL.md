---
name: miliastra-knowledge-lua
description: Query official Miliastra Wonderland 2D client UI controls and Lua scripting documentation when building or debugging client-side game interfaces. Use the server-side knowledge skill for node graphs and gameplay systems.
---

# 千星奇域客户端 Lua 知识库

使用本项目 `miliastra_toolbox` MCP 的 `list_client_documents` 和 `get_client_document`。不确定控件或文档名称时先列标题；已知名称时直接取全文。可在一次调用中查询多个标题。客户端语料不使用服务端的 `rag_search`。

写 Lua 或配置 UI 控件前，核对相关文档中的接口名、参数和脚本挂载方式。回答时注明来源，区分文档事实与推测；查不到时说明缺失，不要臆造 API。服务端节点图和玩法系统问题改用 `miliastra-knowledge`。

本项目的 Lua 工程约定是模块化源码、单文件交付：遵守项目 `AGENTS.md`，按职责拆分 `src/**/*.lua`，使用静态 `require`，通过项目内 `tools/bundle-lua.mjs` 生成一个 Lua 文件。模拟器与千星映射均使用产物；修改源码后重新构建并同步非空存档内联源码。实现方式与支持范围见项目 `docs/lua-modules.md`；这是工程约定，不是官方单文件限制。

原始查询指引来自 [dsh-plugin-miliastra-toolbox](https://github.com/1475505/dsh-plugin-miliastra-toolbox)，本项目通过 MCP 适配其六项 HTTP 工具。
