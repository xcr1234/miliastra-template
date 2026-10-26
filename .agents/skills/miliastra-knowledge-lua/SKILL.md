---
name: miliastra-knowledge-lua
description: 查询千星奇域 2D UI 控件与客户端 Lua 脚本文档；用于界面/HUD、控件配置、脚本挂载及 API 参数核对。节点图与玩法系统问题使用 miliastra-knowledge。
license: Proprietary
metadata:
  upstream-repository: https://github.com/1475505/Miliastra-toolbox
  upstream-revision: 5ee8f5eb4be99a7a094b190c8ed8213d30339538
  upstream-version: "1.0.0"
  upstream-slug: miliastra-toolbox-lua
  upstream-display-name: 千星沙箱客户端脚本知识库
  upstream-summary: 千星奇域 2D + lua 脚本游戏制作专用：查询客户端控件与客户端脚本文档，覆盖控件配置与客户端控件 API。
---

# 千星沙箱客户端脚本知识库查询

仅覆盖千星奇域 **2D + lua 脚本游戏制作**（客户端 UI 编程）语料：客户端控件与客户端脚本文档，上游快照为 10 篇，实际数量以查询返回为准。

服务端节点图、玩法逻辑、系统配置与排障问题不在本技能范围，改用 `miliastra-knowledge`。

服务地址：`https://ugc.070077.xyz`

## 调用方式与工具选择

首次调用前阅读 [references/tools.md](references/tools.md)，了解参数、匹配方式、返回结构及 HTTP 示例。下文调用顺序中的列表写法仅为流程示意，实际调用必须使用具名字段对象。

1. **当前会话有知识库工具时优先调用 MCP。** 本项目服务名为 `miliastra_toolbox`，工具完整名称可能带宿主前缀，以当前工具 schema 为准。本地适配器已经检查 HTTP 状态及 `success`，把 `data.result` 序列化到 MCP 的文本内容中；先检查 MCP `isError`，再读取 JSON 结果，不要再从中取一层 `data.result`。仍需检查结果内部的 `error` 及每个查询项的状态。
2. **工具未加载且允许网络访问时使用 HTTP。** 向 `https://ugc.070077.xyz/api/v1/skills/miliastra-knowledge/tools/<工具名>` 发起 `POST`，使用 `Content-Type: application/json` 和下表中的 JSON 对象；若实际配置了 `MILIASTRA_KNOWLEDGE_BASE_URL`，使用该兼容服务地址。检查 HTTP 状态及响应 `success`、`error`，成功后读取 `data.result`。不要因缺少 MCP 就认定知识库没有资料，也不要绕过宿主的访问限制。
3. **MCP 和 HTTP 都不可用时**，复用已核实版本的本地资料并说明边界；所需 API 未取得时明确记录缺项，不凭记忆编造。网络错误应报告查询失败，不能解释为未找到资料。

项目配置存在、当前会话可调用、所需正文可读取是三种不同证据；目录或工具列表存在不代表查询已成功。使用 HTTP 不要求先安装 MCP 或修改宿主配置。

| 工具 | JSON 请求体示例 |
|------|----------------|
| `list_client_documents` | `{"keywords": ["控件"]}` |
| `get_client_document` | `{"titles": ["客户端控件容器"]}` |

上表对象同时适用于本项目 MCP 参数和 HTTP 请求体。

## 什么时候用

- 用户进行千星奇域 2D + lua 脚本游戏制作（客户端界面/控件编程）
- 询问客户端控件的功能与配置：客户端控件容器、文本视窗控件、预设按钮控件、按键提示控件、光标检测区域控件、网格视窗控件、模板引用控件、容器节点控件
- 询问客户端脚本（lua）如何挂载到控件、如何调用、与控件如何交互
- 需要查客户端控件 API 文档中的脚本接口与参数

## 工具一览

| 工具 | 职责 |
|------|------|
| `list_client_documents` | 按关键词列出客户端控件/脚本文档标题（不含正文）；用于不知道精确文档名时先看有哪些 |
| `get_client_document` | 按标题获取客户端控件/脚本文档全文；支持批量，一次获取多篇相关文档 |

上游客户端语料快照为 10 篇，使用专门的结构化工具查询，**不提供也不需要使用 `rag_search`**。

**独立语料**：这批文档不在 `official/` 下，`list_documents`、`get_document`、`rag_search`、`get_node_info` 都查不到它们，必须用上述两个工具。这批文档无有效节点关联；`related_nodes` 即使存在也为空，不据此推导节点图用法。

## 选择工具

1. **不确定文档名 / 想浏览有哪些客户端文档** → `list_client_documents(keywords=[关键词])`（`keywords` 传空列表可浏览该部署的全部客户端文档）
2. **已知控件/文档名，要完整内容** → `get_client_document(["控件名"])`

**批量原则：多个独立查询合并为一次调用**。两个工具均支持列表入参，不要拆成多轮单条调用，也不要重复相同调用。

## 常见调用顺序

**调研某个客户端控件**（如预设按钮怎么做）：
```
list_client_documents(["预设按钮"]) → get_client_document(["预设按钮控件"])
```

**写 lua 脚本查 API**：
```
get_client_document(["客户端控件API文档"]) → 按其中的接口说明作答
```

**从零搭建 2D 界面**：
```
get_client_document(["客户端控件容器"]) → list_client_documents(["控件"]) → get_client_document([具体控件名])
```

**客户端脚本与控件的配合**：
```
get_client_document(["客户端控件和客户端脚本", "客户端控件API文档"])
```

## 异常处理

- 带关键词查询返回 `total=0` 只表示该关键词无匹配，先换更通用词或用 `{ "keywords": [] }` 列出全部；只有成功的无关键词查询也返回 `total=0`，才说明当前部署未提供可读客户端语料。不要改用服务端 `rag_search` 反复尝试
- `get_client_document` 返回 `status="not_found"` → 先 `list_client_documents` 找候选标题再重查
- `get_client_document` 返回 `status="too_many"` → 用更精确的关键词重查
- `list_client_documents` 无结果 → 换更短/更通用的关键词（如「控件」「脚本」「API」）
- MCP `isError`、HTTP 失败、`success=false` 或结果内出现 `error` → 明确说明查询失败，不将其解释为知识库没有资料
- 临时网络错误可重试一次；仍失败则明确告知用户当前查询不可用。参数错误先修正请求，连接或权限错误不靠更换关键词解决

## 输出要求

- 控件类回答：说明功能、关键配置项、可挂载的客户端脚本调用方式，并注明来源文档
- API 类回答：给出接口名、参数与用法，必要时直接引用原文片段
- **严格区分"文档原文已说明"与"基于资料的推测建议"**
- 不得编造控件名、接口名或官方结论；查不到就明确说查不到，并建议用户换个问法

## 本项目 Lua 工程约定

写 Lua 或配置 UI 控件前，读取《客户端控件和客户端脚本》《客户端控件API文档》及涉及的具体控件文档，核对接口名、参数、枚举、生命周期与挂载方式；已在本次任务读取且版本未变化时复用结果。

遵守项目 `AGENTS.md`，按职责拆分 `src/**/*.lua`，入口 `src/main.lua` 保留生命周期回调，使用静态 `require`、模块返回 table、内部状态使用 local。通过 `npm run build:lua` 生成 `dist/main.lua`，模拟器与千星映射使用同次构建产物；修改后重新打包，存档只保留产物路径和挂载，`source` 留空；运行 `npm run check:saves` 并重启试玩，存档结构改动显式保存。旧内嵌源码先比较并将有效改动合并回模块，构建验证后再清空。详见项目 [Lua 构建与发布](../../../docs/lua-modules.md)。这是本项目工程约定，不是官方单文件限制。

## 来源与本地适配

查询规范与配套工具参考来自 [Miliastra-toolbox](https://github.com/1475505/Miliastra-toolbox/tree/5ee8f5eb4be99a7a094b190c8ed8213d30339538/skills/miliastra-knowledge-lua)；保留上游 `Proprietary` 许可标记。本地增加 MCP 优先、HTTP 备用和结果检查说明；来源版本、参考文件哈希与适配差异见项目 [工具来源](../../../docs/tool-sources.md)。
