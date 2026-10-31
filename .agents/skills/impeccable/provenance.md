# Impeccable 来源与本地适配

- 仓库：[pbakaus/impeccable](https://github.com/pbakaus/impeccable)。
- 固定提交：`df3a4abe7d0840d5f60324812c432e00b66a4e75`；提交时间 `2026-10-30T10:16:26Z`；接入日期 2026-10-31（Asia/Shanghai）。Skill 版本 4.8.0；引擎版本 0.1.18。
- 安装路径：上游 `.agents/skills/impeccable/` → 项目同路径。
- 原始入口保存为 `UPSTREAM-SKILL.md`，配套 reference、数据与 scripts 原样保留。本地 `SKILL.md`、中文 `agents/openai.yaml` 和 `references/game-ui-review.md` 为千星适配；原始 UI 元数据保存为 `agents/openai.upstream.yaml`。
- 许可：[Apache-2.0](LICENSE)；[上游第三方声明](NOTICE.md)同时保留。
- 本地调整：复用 GDD、美术规范和试玩记录；默认单上下文评审并标明方法；网页检测只用于 HTML；保留游戏语义所需的渐变/发光等表达。原始入口与参考中的安装、hook、委派和上下文创建流程不自动执行。
- `tools/design-tools.mjs` 按原始 `scripts/VERSION` 与 `engine-checksums.txt` 下载并校验引擎，留在项目 `.local-tools/impeccable/`；不使用用户全局缓存或 PATH 候选，仅开放 `engine-probe`、`context`、`detect`。hooks、live 注入和代理配置未接入项目运行配置。包装命令通过 `DO_NOT_TRACK=1` 关闭匿名使用遥测；需要网络的资源请求仍按任务实际情况处理。
- 原始文件 SHA-256 见[锁定清单](../../design-skills.lock.json)。更新时比较 Skill、引擎与校验清单，并保留本地适配，见[更新指南](../../../docs/design-skills.md#更新固定版本)。
