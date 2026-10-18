# 来源与项目内适配

- 上游仓库：[1475505/Miliastra-image-editor-webui](https://github.com/1475505/Miliastra-image-editor-webui)。
- 固定提交：`cd4e08accc63f19774f844f38ad9b9c8dc2d3b79`。
- Skill 版本：`1.0.13`；[该提交的原始 SKILL.md](https://github.com/1475505/Miliastra-image-editor-webui/blob/cd4e08accc63f19774f844f38ad9b9c8dc2d3b79/skills/miliastra-image-css-builder/SKILL.md)。
- 附带同一提交的 `docs/rotation-xy.md`、`docs/image-stretch.md`，原文保存在当前 `references/`。其中测试记录、真机证据和外部文件路径属于上游项目，不代表本模板已经取得相同证据或可读取这些路径。
- 上游 Skill 的 `license: Proprietary` 声明保留不变；仓库根目录 GNU GPL v3 许可原文另存为 [UPSTREAM-LICENSE](UPSTREAM-LICENSE)。两处声明均保留，不把仓库级许可替换成 Skill 的新许可声明。

项目内适配仅包含：将上游非标准顶层展示/版本字段移入 `metadata`，按固定提交保存来源信息；把两个跨目录引用改为随 Skill 一起分发的本地参考；新增本项目入口和七步流程说明。保留上游 CSS 契约、能力边界与导入陷阱。

Skill 文件纳入模板 Git，后续 clone 会同时取得。更新时先比较上游差异，再同步同一提交的 Skill 与参考资料，并复核元数据及本地链接；不在 `npm ci` 或 `setup` 时自动跟踪上游 main。
