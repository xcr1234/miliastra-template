# 知识库 API 接入

本页描述本模板自己的 [stdio MCP 适配器](../tools/miliastra-toolbox-mcp.mjs)。参数来自该实现，不复制上游专有 Skill 或知识库正文。实际远端响应与资料范围以所连接服务为准。

## 连接与请求

默认服务为 `https://ugc.070077.xyz`，可用 `MILIASTRA_KNOWLEDGE_BASE_URL` 指向兼容服务。适配器将六个工具的具名参数转为 JSON POST，请求路径为 `/api/v1/skills/miliastra-knowledge/tools/<工具名>`。

会话已有 `miliastra_toolbox` 时优先调用 MCP；工具可能带宿主前缀，以当前 schema 为准。只有工具不可用且宿主允许网络请求时才直接调用 HTTP，不为此绕过访问限制或修改全局配置。

| 工具 | 请求对象 | 用途 |
|---|---|---|
| `get_node_info` | `{"names":["节点名称"]}` | 节点条目与参数 |
| `list_documents` | `{}` 或 `{"keywords":["关键词"]}` | 节点图、系统和指南标题 |
| `get_document` | `{"titles":["文档标题"]}` | 对应文档正文 |
| `rag_search` | `{"queries":["待解决的问题"],"top_k":5}` | 语义检索；`top_k` 可省略，范围 1–20 |
| `list_client_documents` | `{}` 或 `{"keywords":["关键词"]}` | 客户端 2D/Lua 标题 |
| `get_client_document` | `{"titles":["文档标题"]}` | 客户端文档正文 |

必填查询数组必须非空，字符串不能只包含空白。`keywords` 可以省略；不假设不同部署有相同文档数量或支持额外的文件名过滤字段。

## 两层结果

- **直接 HTTP**：检查 HTTP 状态，再解析 JSON 包裹的 `success` 与 `error`；成功内容在 `data.result`。请求使用 `Content-Type: application/json`。
- **本模板 MCP**：适配器已经处理上述 HTTP 包裹。先检查 MCP `isError`，再解析文本块中的 JSON；该 JSON 就是结果，不再取一次 `data.result`。
- **结果内部**：仍逐项检查状态和错误。拿到候选标题、检索摘要或部分结果不能当成已经读取了所需全文。

连接失败与查询无匹配分别记录。临时网络故障最多重试一次；重复失败时报告实际错误，继续与查询无关的工作。不要通过反复换关键词“修复”网络问题。

## 引用与使用

核对文档标题、所属端、版本/快照日期、接口签名、枚举和单位。无法唯一定位来源时说明缺项，不把主题相关资料冒充精确出处。文档描述、项目推断、模拟器观察与真机反馈分别标注。

节点图资料使用 [miliastra-knowledge](../.agents/skills/miliastra-knowledge/SKILL.md)，客户端控件和脚本使用 [miliastra-knowledge-lua](../.agents/skills/miliastra-knowledge-lua/SKILL.md)。远端服务与语料不由本模板维护或重新授权；不要把查询所得全文自动提交到公开仓库。
