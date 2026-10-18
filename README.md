# 千星奇域空白项目模板

项目内的千星 Skill、模拟器/知识库 MCP、Lua 模块打包与单文件发布工具。没有派蒙玩法、素材、旧存档或账号配置；Lua 仅包含空生命周期入口。

## 默认开发规范：按 Skill 七步推进

本模板的游戏开发默认遵循项目内 [qxqy-game-studio 七步规范](.agents/skills/qxqy-game-studio/SKILL.md)，并由根目录 [AGENTS.md](AGENTS.md) 指导后续 Codex 会话执行。新游戏按 1→7 顺序推进，每一步达到对应完成条件后再进入下一步。

| 步骤 | 主要产物与完成条件 |
|---|---|
| 1. 策划案 | 明确核心循环、输入、胜负和 P0 范围的 GDD。 |
| 2. TDD 测试用例 | 规则对应的操作步骤、预期结果与回归用例。 |
| 3. HTML 效果展示 | 可试玩原型及画面、操作、节奏反馈。 |
| 4. 千星美术参考图与素材 | 参考图、素材清单、目标 imageId 和 UI 还原方案。 |
| 5. Lua 编码实现 | 模块化源码、单文件产物、完整存档、挂载/架构说明及 Red→Green→Regress 记录。 |
| 6. 测试 | 模拟器用例、试玩截图、设备布局检查与缺陷回归结果。 |
| 7. 真机试玩验证与 bug 修复 | 导入/索引/映射核对、指定路径交付、真实试玩反馈及修复记录。 |

步骤 2 先制定用例，有效 TDD Red 在步骤 5 的可运行骨架中验证。步骤 1–4 不打开模拟器、不修改存档；Lua 编码前先核对所需官方客户端 API。项目进度与证据写入 `docs/production-plan.md`，实际试玩结果按需记入 `records/playtest.md`。

已有项目从最早缺失证据的步骤继续，窄修复只处理受影响步骤。用户明确调整范围时按其要求执行；正常推进无需逐步重复确认。模拟器结果与真机结果分别记录。

## 第 4 步：图片拟合

- **方案一：Codex + `miliastra-image-css-builder` → 导入 CSS/JSON → 精修导出**，在线使用[千星图片编辑器](https://qx.070077.xyz/)，适合简单图标、几何装饰、UI 拼接和局部修改。
- **方案二：上传参考图 → 算法拟合 → 导出**，在线使用[千星图片图元拟合](https://qx-img.070077.xyz/)，适合头像、立绘和复杂插画。
- 默认复杂图片先用方案二拟合，保存 JSON，再按需导入方案一编辑器精修。在线服务不可用时，可克隆对应 GitHub 仓库在本地启动，源码与依赖均留在项目 `.local-tools/`。

具体选择、文件留存、Windows 本地部署命令和单文件 Lua 接入见 [图片拟合指南](docs/image-fitting.md)。[miliastra-image-css-builder](.agents/skills/miliastra-image-css-builder/SKILL.md) 及配套参考已随模板放在项目内，clone 后可用；两个图片服务本体仍按需要在线使用或本地部署。

## 每次开始新游戏

Node.js 22.19+。clone 本仓库到新目录后，在新项目根目录运行：

```sh
npm ci
npm run setup
npm test
npm run build:lua
```

`setup` 自动生成当前项目绝对路径的 `.codex/config.toml`。在 Codex 打开并信任新项目，新开聊天，用 `/mcp` 核验 `qxqy_simulator` 与 `miliastra_toolbox`。初始化和安装不写全局 Skill 或 MCP 配置。

以上命令只检查模板工具链、构建空入口；开发具体游戏时，从七步规范的策划案开始。

从 GitHub 创建新项目：

```sh
git clone https://github.com/xcr1234/miliastra-template.git E:/miliastra/my-game
```

`clone` 会保留模板历史及 `origin`；新游戏若使用独立远程仓库，按实际仓库地址调整 `origin`。修改 `package.json` 的项目名后，用 `npm install --package-lock-only` 同步锁文件；游戏名在 `lua.project.json`。

## 开发、检查与预览

```text
.agents/skills/                 千星服务端、Lua 知识库与七步开发流程
.codex/config.template.toml     可提交的 MCP 配置模板
src/main.lua                   生命周期入口
src/app/lifecycle.lua           空的应用模块
lua.project.json               构建入口与项目内产物路径
tools/                         初始化、Lua 打包、发布、知识库适配器
scripts/                       构建/发布回归与 MCP 连接检查
dist/main.lua                  本地生成的单文件，Git 忽略
dist/main.lua.map.json          排错行号映射，不上传
```

`npm run check` 启动两个本地 MCP 并检查工具列表；`npm run check -- --online` 另做一次知识库远端查询。工具列表通过不代表网络查询通过。

如果当前机器需要 HTTP 代理，可运行以下命令（端口按实际值修改）：

```sh
npm run setup -- --proxy http://127.0.0.1:7897
```

代理保存在本项目 `.codex/mcp.local.json`，不会提交；清除配置用 `npm run setup -- --no-proxy`。宿主的网络限制仍以实际环境为准。

`npm run preview` 启动项目内 Web 编辑器。首次按需创建模拟器存档，给客户端控件挂载 `dist/main.lua`；存档含内联脚本时同步打包内容。模板没有预建 UI 或游戏存档。

## 复制到用户指定路径

为当前电脑设置完整目标文件路径，支持中文和空格，例如：

```powershell
npm run setup -- --target 'C:\Users\你的用户名\AppData\LocalLow\miHoYo\原神\BeyondLocal\账号目录\Beyond_Local_Save_Level\关卡目录\external_lua_file\default_import_file\workspace\my-game\main.lua'
```

配置写入 Git 忽略的 `lua.deploy.local.json`，此时不会复制文件。也可以参照 `lua.deploy.local.example.json` 手动创建本机配置。

```sh
npm run build:lua                 # 只在项目内生成 dist/main.lua
npm run deploy:lua -- --dry-run   # 构建并查看目标，不写入目标
npm run deploy:lua                # 重新构建成功后复制到指定目标
```

发布仅复制一个 `.lua`，文件名可与项目内产物不同。失败构建不会发布旧产物；替换前备份到项目 `.lua-deploy-backups/`，复制后核对哈希。目标已有未知内容或被手工改过时，先比较/合并；确定覆盖时显式运行 `npm run deploy:lua -- --overwrite`。

后续一直更新同一目标路径，游戏内复用该文件的脚本映射和挂载，保存并重新试玩。复制文件不会自动完成编辑器加载或真机验证。

更多模块规则见 [Lua 构建与发布](docs/lua-modules.md)；工具来源见 [来源记录](docs/tool-sources.md)。
