# 许可证范围与第三方声明

根目录 [LICENSE](LICENSE) 适用于本模板自有代码与原创文档。以下第三方目录、其派生修改、依赖和附带声明按各自许可证分发，根目录 MIT 不替代这些条款。

## 仓库中附带的材料

| 范围 | 来源 | 许可与随附声明 |
|---|---|---|
| `.agents/skills/qxqy-game-studio/` | [miliastra-beyond-simulator](https://github.com/1475505/miliastra-beyond-simulator/tree/2c5a012eeee06ce52324655d5b988393eb8f46f5)，经本模板调整的七步工作流 | [GPL-3.0-only](.agents/skills/qxqy-game-studio/LICENSE)、[来源及修改说明](.agents/skills/qxqy-game-studio/provenance.md) |
| `.agents/skills/design-taste-frontend/` | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill/tree/12af471f627f866411b4bd785b19646d3672784c) | [MIT](.agents/skills/design-taste-frontend/LICENSE)、[来源说明](.agents/skills/design-taste-frontend/provenance.md)，保留 Leonxlnx 的版权声明 |
| `.agents/skills/impeccable/` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable/tree/df3a4abe7d0840d5f60324812c432e00b66a4e75) | [Apache-2.0](.agents/skills/impeccable/LICENSE)、[上游 NOTICE](.agents/skills/impeccable/NOTICE.md)、[来源说明](.agents/skills/impeccable/provenance.md)；其平台设计参考另含上游列出的 MIT 来源 |

本模板对上述第三方目录的修改随相应目录的许可证分发。固定设计工具的原始文件与 SHA-256 见 `.agents/design-skills.lock.json`，文本换行按 LF 规范化。

## 通过 npm 安装的直接依赖

这些包由 `npm ci` 安装到项目 `node_modules/`，不复制进本模板源码目录。分发依赖或其修改版本时保留安装包内的许可证和通知；完整依赖树、版本与包声明见 `package-lock.json`。

| 包 | 版本 | 包声明的许可证 | 源码 |
|---|---|---|---|
| `beyond-simulator-mcp` | 0.4.1 | GPL-3.0-only | [miliastra-beyond-simulator/mcp](https://github.com/1475505/miliastra-beyond-simulator/tree/main/mcp) |
| `beyond-simulator-web` | 0.4.1 | GPL-3.0-only | [miliastra-beyond-simulator/web](https://github.com/1475505/miliastra-beyond-simulator/tree/main/web) |
| `@modelcontextprotocol/sdk` | 1.32.1 | MIT | [typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) |
| `fengari` | 0.1.5 | MIT | [fengari](https://github.com/fengari-lua/fengari) |
| `undici` | 8.11.2 | MIT | [undici](https://github.com/nodejs/undici) |
| `zod` | 4.6.6 | MIT | [zod](https://github.com/colinhacks/zod) |

Impeccable 的可选引擎从同一上游项目的固定 Release 下载到忽略的 `.local-tools/`，校验清单随对应 Skill 保存；引擎不作为本模板自有 MIT 代码分发。图片编辑器、自动拟合服务和浏览器也不是仓库内附带的软件包，单独安装或分发时查看各自版本的许可。

## 原创接入说明与外部内容

本次公开版中的 `miliastra-knowledge`、`miliastra-knowledge-lua`、`miliastra-image-css-builder` 是模板原创的 MIT 接入说明；名称表示所接入的能力，不表示上游已把专有 Skill 授权为 MIT。旧版复制的专有入口及参考文档已从当前版本移除，当前版只链接外部实现或按需调用服务。

远端知识库正文、平台官方指南、游戏图片/音频/字体以及工具查询到的素材，由原权利人保有权利；本模板许可证不授予这些内容的再分发权。使用生成或下载的素材时，另行记录其实际来源和许可。

提交 `1c010ba` 及更早版本仍保留此前复制的上游文件；本次许可证与替换说明不对其作追溯性再授权。当前文件清理与 Git 历史清理是不同操作，尚未重写仓库历史。
