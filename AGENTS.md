# 千星空白项目约定

这是单游戏模板，默认以仓库根目录为游戏工程目录。Skill 中 `workspace/<slug>/` 的通用布局在本项目按此约定调整。

## 默认开发流程：遵循七步 Skill

开发千星 2D+Lua 游戏时，默认使用项目内 [qxqy-game-studio](.agents/skills/qxqy-game-studio/SKILL.md)。开始或恢复任务先读取其 [接入与恢复](.agents/skills/qxqy-game-studio/references/workflow.md)，确定当前步骤，再按需读取该步骤的参考文档；不要一次加载全部参考资料。

新游戏按以下顺序推进，完成当前步骤的产物与退出条件后进入下一步：

1. **策划案**：明确核心玩法、输入、胜负、P0 范围与风险。
2. **TDD 测试用例**：先把玩法规则写成操作、预期结果和回归用例。
3. **HTML 效果展示**：制作可试玩原型，确认画面、操作和节奏。
4. **千星美术参考图与素材**：整理参考图、素材清单、目标 imageId 与 UI 还原方案；图片拟合按 [图片拟合指南](docs/image-fitting.md) 选择在线服务或 Git 源码本地部署，复杂图片默认先自动拟合再按需精修。方案一使用项目内 [miliastra-image-css-builder](.agents/skills/miliastra-image-css-builder/SKILL.md)，不需要全局安装；Skill 可读取与网站服务/WebMCP 可调用分别核验。
5. **Lua 编码实现**：核对官方客户端 API，模块化实现并打包为单文件，维护完整存档、挂载与架构说明，执行 Red→Green→Regress。
6. **测试**：使用本次产物执行模拟器用例、交互试玩和设备布局检查，记录并回归缺陷。
7. **真机试玩验证与 bug 修复**：核对导入、索引、映射与挂载，按指定路径交付，依据真实试玩反馈修复和回归。

步骤 2 在 HTML 之前；步骤 4 在 HTML 之后；步骤 1–4 不打开模拟器、不改存档、不运行 `runCase`。步骤 2 是制定用例，有效 TDD Red 在步骤 5 的可运行骨架中验证。详细退出条件以 Skill 各步骤文档为准。

以 `docs/production-plan.md` 记录当前步骤、已有证据、缺项与下一步；以 `records/playtest.md` 记录实际测试与来源，按需创建。初始化、工具测试和空入口构建只验证开发环境，不代表游戏已完成步骤 5 或 6。

已有项目从最早缺失证据的步骤继续，窄修复只回到受影响步骤；用户明确调整范围时按其要求执行并记录调整。按已有信息自主推进，仅在玩法语义、HTML 体验、美术方向或真机反馈需要用户判断时提问，不为每一步另设确认。

## 游戏视觉设计与审查

- 步骤 3 的视觉初稿或重设计按需使用项目内 [Taste](.agents/skills/design-taste-frontend/SKILL.md)；已有界面的层级、布局、文案、反馈与适配使用 [Impeccable](.agents/skills/impeccable/SKILL.md)。步骤 4 将接受的设计写入 `docs/art-bible.md`，步骤 6–7 根据实际模拟器/真机证据评审。接入细节见 [设计指南](docs/design-skills.md)。
- 本地适配入口优先于附带的上游通用网页流程；按需读取参考，不强制套用营销布局、网页风格禁令或图片/动效数量。复用现有 GDD、美术规范和试玩记录，不额外要求 PRODUCT.md / DESIGN.md。
- 执行脚本使用 `npm run design:taste -- ...`、`npm run design:impeccable -- ...`，运行文件留在项目内。不直接调用上游全局安装器、启动器或自更新；不自动注册 hooks、live 注入或上游代理配置。
- 浏览器检测仅证明 HTML 范围；Lua、GIA 和模拟器画布不能靠 DOM 检测验收。视觉评审注明来源、状态、尺寸和方法，实际交互与规则继续按七步流程验证。

## 工程与交付约定

- 所有 Skill、MCP 配置、npm 依赖都留在项目内，不安装到用户全局目录。
- 项目路径改变或首次 clone 后运行 `npm run setup`，从 `.codex/config.template.toml` 生成本机 `.codex/config.toml`。代理仅按实际需要配置，不把示例代理或游戏路径当成用户已选目标。
- Lua 按职责拆分到 `src/**/*.lua`，入口 `src/main.lua` 保留平台生命周期回调；使用静态 `require("app.lifecycle")`，模块返回 table，内部状态使用 local。
- `npm run build:lua` 将入口及依赖打包为项目内 `dist/main.lua`，配置见 `lua.project.json`。维护源是 `src`，生成文件不直接修改。新增平台 API 先通过 `miliastra-knowledge-lua` 核对。
- Git 中的模拟器存档保留 UI、索引和挂载关系，脚本 `path` 指向 `dist/main.lua`（或 `lua.project.json` 配置的产物），`scripts[].source` 留空，不内嵌生成代码。模拟器启动时按工作区路径读取同次构建产物；修改 Lua 后重新构建、重启试玩并回归；修改存档结构后显式保存。提交前执行 `npm run check:saves`。
- 旧存档或编辑器出现非空内嵌源码时，先比较并将有效改动合并回 `src`，重新构建和验证后才清空 `source`；不直接删除尚未审阅的源码。需要独立分享工程时，另带单文件产物；本机配置、备份与 `dist/` 不提交 Git。
- 交付采用“项目内打包 → 复制单个产物到用户指定完整文件路径”。用户明确指定目标且要求复制时，可在宿主权限允许范围内执行 `npm run deploy:lua`；未指定或仅给示例时只准备产物。配置目标本身不会复制文件。
- 目标路径放在 Git 忽略的 `lua.deploy.local.json`。复制前可用 `npm run deploy:lua -- --dry-run` 看源/目标和冲突；首次覆盖已有文件或目标被外部修改时先比较，合并有效改动回模块。只有用户已授权覆盖已审阅的冲突时才使用 `--overwrite`。
- 发布命令每次重新构建，失败则不复制；替换前备份旧目标，成功后核对 SHA-256。复制成功、编辑器重新加载和真机验证分别记录，不以磁盘复制成功冒充真机通过。
- 千星只给单文件产物建立映射和挂载。`.map.json`、`src` 模块、本机配置和备份不上传。

详细命令见 [README](README.md) 和 [Lua 构建与发布](docs/lua-modules.md)。不为未开始的阶段创建空文档。
