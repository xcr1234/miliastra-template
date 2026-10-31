# Miliastra Template · 千星奇域 2D + Lua 开发模板

面向千星奇域创作者的社区开发模板：在一个游戏仓库内完成策划、HTML 原型、美术准备、Lua 实现、模拟器测试和真机交付。

模板提供项目级 Skill、MCP 接入、Lua 模块打包、单文件发布与回归检查。适合从零制作 2D UI + Lua 游戏，也可作为已有项目的工程基础。默认入口是空生命周期模块，具体玩法、素材和存档由使用者创建。

[快速开始](#快速开始) · [开发流程](#开发流程) · [常用命令](#常用命令) · [贡献指南](CONTRIBUTING.md) · [许可证](#许可证)

## 提供什么

| 能力 | 用途 |
|---|---|
| 七步开发流程 | 从策划和测试用例开始，逐步形成可试玩、可还原、可验证的游戏 |
| 千星知识查询 | 通过项目 MCP 查询节点、系统、客户端控件与 Lua 文档 |
| Taste 与 Impeccable | 探索 HTML 原型视觉方向，评审和打磨游戏界面 |
| 图片编辑与图元拟合接入 | 为图标、UI 和复杂图片准备可编辑素材与还原方案 |
| Lua 模块化开发 | 维护 `src/**/*.lua`，构建为千星可挂载的一个 `dist/main.lua` |
| 模拟器与交付工具 | 保存 UI/挂载、检查脚本引用，向明确指定的路径复制产物并校验 |

仓库默认提供 Codex 的项目配置模板；其他支持 Skill 或 MCP 的工具可按各自的配置方式接入。模拟器证据、HTML 体验和真机结果分别记录，完整游戏仍需在千星编辑器中完成导入、映射、挂载和试玩。

## 环境要求

- Node.js **22.19.0 或更高版本**、npm 和 Git。
- 需要实际试玩、导入和发布时，准备可使用的千星奇域编辑器环境。
- 浏览器视觉检查按需使用本机已安装的 Chrome、Edge 或 Chromium。
- 首次安装依赖、访问远端知识库或下载可选设计引擎时需要网络。图片服务本地部署另需对应工具的运行环境，见[图片拟合指南](docs/image-fitting.md)。

基础工具使用 Node；Python 和图片服务不是初始化空模板的必需依赖。项目示例优先覆盖 Windows 工作流，其他平台的游戏编辑器和真机链路请自行核验。

## 快速开始

1. 打开 [GitHub 模板仓库](https://github.com/xcr1234/miliastra-template)，选择 **Use this template → Create a new repository**，创建自己的游戏仓库。
2. 克隆新仓库并安装：

   ```sh
   git clone https://github.com/你的用户名/你的游戏仓库.git my-game
   cd my-game
   npm ci
   npm run setup
   npm test
   npm run design:check
   ```

3. 在编码工具中打开并信任项目。确认项目配置的 `qxqy_simulator` 和 `miliastra_toolbox` 可见；可在终端运行 `npm run check` 检查连接，远端知识查询另用 `npm run check -- --online`。
4. 从策划开始说明你想做的游戏，例如：

   > 按项目七步流程制作一个简单的 2D 游戏，先明确核心玩法、输入、胜负和首版范围。

`npm run setup` 根据当前目录生成 Git 忽略的 `.codex/config.toml`。移动项目后重新运行即可。它不会全局安装 Skill 或 MCP，不设置示例游戏目标，也不会复制文件到游戏目录。

如果只是试用或参与模板开发，可直接克隆：

```sh
git clone https://github.com/xcr1234/miliastra-template.git
cd miliastra-template
npm ci
npm run setup
```

创建自己的游戏后，修改 `package.json` 的项目名、repository、homepage 和 bugs，用 `npm install --package-lock-only` 同步锁文件；游戏工程名在 `lua.project.json`。安装和工具测试只验证开发环境，不表示完成了游戏。

## 开发流程

默认遵循 [AGENTS.md](AGENTS.md) 与项目内 [qxqy-game-studio](.agents/skills/qxqy-game-studio/SKILL.md)：

| 步骤 | 本阶段交付 |
|---|---|
| 1. 策划案 | 核心循环、输入、胜负、P0 范围与风险 |
| 2. TDD 测试用例 | 操作、预期结果和回归用例；有效 Red 在步骤 5 的可运行骨架验证 |
| 3. HTML 效果展示 | 可试玩原型及画面、操作、节奏反馈 |
| 4. 美术与素材 | 参考图、素材清单、目标 imageId 和千星 UI 还原方案 |
| 5. Lua 实现 | 模块源码、单文件产物、完整存档与架构/挂载说明 |
| 6. 模拟器测试 | 规则用例、交互试玩、布局截图与缺陷回归 |
| 7. 真机验证与修复 | 实际导入、索引、映射、挂载和试玩结果 |

步骤 1–4 不操作游戏模拟器存档。进度与依据写入 `docs/production-plan.md`，实际试玩按需写入 `records/playtest.md`，并标明 `runtime=html|simulator|device`。已有项目从最早缺失证据的步骤继续，局部修复只处理受影响阶段。

## 常用命令

| 命令 | 作用 |
|---|---|
| `npm run setup` | 生成当前项目的本机 MCP 配置 |
| `npm test` | 回归 Lua 构建、发布、存档引用、初始化和设计工具 |
| `npm run check` | 启动两个项目 MCP 并检查工具列表 |
| `npm run check -- --online` | 增加一次远端知识库查询 |
| `npm run build:lua` | 构建 `dist/main.lua`，不复制到游戏目录 |
| `npm run check:saves` | 只读检查 Git 管理范围内的模拟器存档 |
| `npm run preview` | 先构建并检查存档，再打开 Web 编辑器 |
| `npm run design:check` | 校验设计工具固定文件与项目文档链接 |
| `npm run design:taste -- --help` | 查看 Taste 的项目包装命令 |
| `npm run design:impeccable -- --help` | 查看 Impeccable 的项目包装命令 |
| `npm run deploy:lua -- --dry-run` | 重新构建并预览已配置目标，不复制 |

存档保存 UI、索引、挂载与脚本路径，`scripts[].source` 留空；生成代码留在忽略的 `dist/`。修改 Lua 后重新构建并重启试玩；旧内嵌源码先审阅、合并有效修改，再清空。提交前执行 `npm run check:saves`。独立分享工程时另带单文件产物，详见 [Lua 构建与发布](docs/lua-modules.md)。

## 视觉设计与素材

- **Taste**：用于原型的配色、字体、构图和视觉方向。
- **Impeccable**：用于菜单、HUD、背包、商店与结算界面的层级、文案、反馈和适配。
- **图片工具接入**：简单图标可准备 CSS 图元导入[图片编辑器](https://qx.070077.xyz/)；复杂图片可先用[自动拟合工具](https://qx-img.070077.xyz/)生成场景，再精修。

两套设计工具固定版本随仓库附带；Impeccable 引擎首次使用时下载到项目 `.local-tools/` 并核对 SHA-256。网页规则需按游戏用途筛选，DOM 检测不能验收 Lua 或千星画布。

图片编辑入口和两份知识库 Skill 是本项目原创的接入说明；外部服务、官方语料和完整图片编辑器由各自项目提供。使用与更新见[设计工具指南](docs/design-skills.md)、[图片拟合指南](docs/image-fitting.md)和[知识查询接入](docs/knowledge-api.md)。

## Lua 发布与本机配置

为本机保存真实的单文件目标路径：

```powershell
npm run setup -- --target 'C:\你的游戏脚本目录\main.lua'
npm run deploy:lua -- --dry-run
npm run deploy:lua
```

目标必须是实际的完整 `.lua` 路径；示例路径不代表已配置目标。发布会重新构建，替换前备份，复制后核对 SHA-256。已有未知内容或外部修改会阻止覆盖，先比较并合并回 `src/`。磁盘复制、编辑器重新加载与真机验证是三个独立步骤。

需要代理时按实际地址设置，例如 `npm run setup -- --proxy http://127.0.0.1:你的端口`，清除用 `npm run setup -- --no-proxy`。本机代理、部署目标、备份、缓存和生成配置均被 Git 忽略。

## 目录与进一步阅读

```text
.agents/skills/              项目 Skill 与分目录许可证
.agents/design-skills.lock.json  固定设计工具的来源和哈希
.codex/config.template.toml  可提交的 MCP 配置模板
src/                        Lua 维护源码
tools/                      构建、发布、检查与知识库适配器
scripts/                    回归测试与连接检查
docs/                       开发流程、来源、工具与交付说明
dist/                       本机构建产物，Git 忽略
```

- [Lua 模块、构建日志、存档与发布](docs/lua-modules.md)
- [七步流程接入与恢复](.agents/skills/qxqy-game-studio/references/workflow.md)
- [第三方来源及版本](docs/tool-sources.md)
- [贡献、问题反馈与验证方式](CONTRIBUTING.md)

## 许可证

仓库采用**多许可证**分发：模板自有代码和原创接入文档使用 [MIT License](LICENSE)；附带的第三方内容保留各自许可，其中七步工作流为 GPL-3.0-only，Taste 为 MIT，Impeccable 为 Apache-2.0。范围、原始声明与依赖清单见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

复用或分发时保留对应的版权与许可声明；不能用根目录 MIT 覆盖第三方目录的许可证。自行添加的游戏内容由其权利人选择授权，平台文档、图片、音频和官方游戏资产的权利不随模板一并授予。此模板是社区项目，不代表官方支持。

`package.json` 保留 `private: true`，仅用于[防止误发布到 npm](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#private)，不影响 GitHub 仓库公开或本项目的开源许可。
