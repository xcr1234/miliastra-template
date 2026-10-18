---
name: miliastra-knowledge
description: Query official Miliastra Wonderland server-side node graphs, systems, guides, tutorials, and FAQ while planning or debugging gameplay. Use the Lua client skill for 2D UI and client scripts.
---

# 千星奇域服务端知识库

使用本项目的 `miliastra_toolbox` MCP 工具读取知识库。具体节点用 `get_node_info`；不确定文档名先用 `list_documents`，随后用 `get_document` 取全文；开放问题和排障用 `rag_search`，再核对命中的节点或来源文档。多个独立查询尽量合并为一次工具调用。

回答节点用法时写明工具返回的归属端 `side`、关键参数和来源文档。区分文档明确说明的内容与推测；找不到资料时说明未找到，不要编造节点或参数。客户端 2D 控件和 Lua 脚本问题改用 `miliastra-knowledge-lua`。

原始查询指引来自 [dsh-plugin-miliastra-toolbox](https://github.com/1475505/dsh-plugin-miliastra-toolbox)，本项目通过 MCP 适配其六项 HTTP 工具。
