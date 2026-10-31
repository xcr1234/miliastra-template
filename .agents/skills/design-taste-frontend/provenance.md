# Taste 来源与本地适配

- 仓库：[Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)。
- 固定提交：`12af471f627f866411b4bd785b19646d3672784c`；提交时间 `2026-10-24T23:42:19Z`；接入日期 2026-10-31（Asia/Shanghai）。上游版本 2.1.5。
- 安装路径：上游 `skills/taste-skill/` → 项目 `.agents/skills/design-taste-frontend/`。
- 原始入口保存为 `UPSTREAM-SKILL.md`；配套研究库、参考、资产与脚本原样保留。本地 `SKILL.md` 为千星适配入口。
- 许可：[MIT](LICENSE)，保留版权声明。素材工具提供的图片各有自身许可，使用时仍记录来源与授权；仓库许可不代替素材许可。
- 本地调整：约束到七步流程相关阶段；不以网页图片/动效数量与风格禁令作为游戏硬门槛；复用项目美术文档；执行脚本时使用 `tools/design-tools.mjs` 将历史与临时目录定向到项目内。
- 原始文件 SHA-256 见[锁定清单](../../design-skills.lock.json)，用 `npm run design:check` 核对。更新时在项目临时目录获取新固定版本，先比较，再替换上游文件、更新清单与来源；保留本地入口。见[更新指南](../../../docs/design-skills.md#更新固定版本)。
