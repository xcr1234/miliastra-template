# Lua 模块、构建与单文件发布

开发时维护 `src/**/*.lua`，构建时打包成项目内的可读 Lua 源文件，再复制到用户指定的完整目标路径。这里的编译是源码打包，不是字节码编译。

## 构建

`lua.project.json` 定义源目录、入口模块和产物；默认 `src`、`main`、`dist/main.lua`。运行 `npm run build:lua`，构建只写项目内文件。

```lua
-- src/game/score.lua
local M = {}
local value = 0
function M.add(points) value = value + points end
function M.get() return value end
return M
```

入口通过 `local score = require("game.score")` 使用模块。保留 `OnStart`、`OnUpdate`、`OnDestroy` 等已核验的平台回调，把实现委托给模块。模板的回调为空，不包含具体玩法。

- 模块名相对源目录，`game.score` 对应 `game/score.lua`，不隐式解析 `init.lua`。
- 支持未转义的单/双引号常量 `require("game.score")` 或 `require "game.score"`；每段以英文字母/下划线开头，后续可含数字。
- 不支持动态路径、别名或重定义/遮蔽 `require`。不使用绝对路径、`../` 或通过环境表访问宿主加载器。
- 每个模块有独立函数作用域，按需初始化，在单个脚本实例内缓存。建议返回 table；未返回值按 true 缓存，false 也只初始化一次。
- 只打包入口可达模块；缺失依赖、循环引用、路径逃逸、语法错误会在构建时失败。
- 产物自带局部模块加载函数，不依赖宿主 `require`、`package`、`load`、`loadfile`、`dofile`。`fengari@0.1.5` 仅在构建/测试时检查 Lua 5.3 语法和基本运行行为。
- 保留可读源码、模块注释与 `main.lua.map.json`。报错行落在某模块 `startLine..endLine` 内时，源行号为 `报错行 - startLine + 1`。

独立打包器也支持显式路径：

```sh
node tools/bundle-lua.mjs --root src --entry main --out dist/main.lua
```

## 编译日期与初始化日志

每次构建将构建机器的本地系统时间写入产物头部、行号映射的 `builtAt` 字段及构建终端，格式为 `2026-10-21 23:00:00.000 +08:00`。时区跟随系统配置，不强制使用 UTC 或北京时间；时间代表构建时刻，不是游戏启动时刻。

`lua.project.json` 的 `lua.startupLog` 控制运行时日志，省略时默认开启；必须使用布尔值：

```json
{
  "name": "my-game",
  "lua": {
    "root": "src",
    "entry": "main",
    "out": "dist/main.lua",
    "startupLog": true
  }
}
```

开启时，构建器在加载入口后包装已有的 `OnStart` 回调，先打印编译日期及初始化开始日志，原回调正常返回后打印完成日志。原回调的参数、返回值和错误继续传递；初始化失败不会打印完成日志。没有 `OnStart` 的纯模块产物不会新增生命周期回调，也不会打印这些日志。

将 `startupLog` 改为 `false` 后重新构建，即可关闭这些运行时日志；不会关闭游戏源码自己调用的 `print`，编译日期仍保留在产物头部和构建终端。独立打包器通过 `--startup-log false` 关闭：

```sh
node tools/bundle-lua.mjs --root src --entry main --out dist/main.lua --startup-log false
```

日志使用官方《[客户端控件API文档](https://act.mihoyo.com/ys/ugc/tutorial/detail/mhtakr07vej4)》的 `print(...)` 普通级别日志接口；在千星编辑器日志中勾选“客户端脚本”查看。资料依据为知识库 2026-09-25 快照。

构建时间变化会使产物内容和 SHA-256 变化，即使模块源码未改。发布命令仍每次重新构建，因此再次发布通常会备份并替换旧产物；仅当包括编译时间在内的完整内容相同时才跳过复制。

## 发布到指定文件

`npm run setup -- --target "完整目标.lua"` 只配置目标，不复制。也可以手工创建 `lua.deploy.local.json`：

```json
{
  "targetFile": "C:/path/to/default_import_file/workspace/my-game/main.lua"
}
```

目标必须是绝对 `.lua` 文件路径，可以包含中文、空格和任意子目录；Windows JSON 推荐用 `/`，如用 `\` 需写成 `\\`。项目内产物和目标文件名可以不同，不根据账号或关卡猜目录。

`npm run deploy:lua -- --dry-run` 先构建，输出源、目标、SHA-256、预计新增/替换/不变以及内容冲突状态；不会写入目标、备份或发布记录。

`npm run deploy:lua` 每次重新构建，构建失败便停止；成功后复制单个 Lua。相同内容不重写。替换前在项目 `.lua-deploy-backups/` 备份旧文件，先写临时文件再替换，最后核对目标哈希并记入 `.lua-deploy-state.json`。

首次发布遇到已有不同内容，或目标和上次发布记录不符时，默认停止。先比较并将有效修改合并回 `src`；确认需要覆盖才使用 `--overwrite`，旧内容仍会备份。发布记录、备份与本机目标配置均被 Git 忽略。

## 模拟器与编辑器

Git 中的模拟器存档只保存 UI、索引和脚本挂载：脚本 `path` 指向 `dist/main.lua`（自定义时与 `lua.project.json` 的 `lua.out` 一致），`source` 留空。模拟器启动试玩时读取工作区路径；非空内嵌源码会优先执行，所以不把打包结果写进受 Git 管理的存档。`src/` 是维护源，`dist/` 已被忽略，构建日期与代码变化不会再造成存档差异。

`npm run preview` 自动先构建并运行 `npm run check:saves`。单独检查时先执行 `npm run build:lua`；检查器只读扫描 Git 已跟踪和未忽略的新建 `*.save.json`，核验格式、空源码、产物路径和非空磁盘文件，有问题则返回失败。空模板无存档时通过，不创建占位工程或挂载。`npm test` 验证检查器及构建/发布保护。

迁移旧存档或遇到编辑器写回源码时，先比较内嵌内容与源模块/产物，将有效改动合并回 `src/`，重新构建和验证后再将 `source` 设为空字符串并保存。检查器不会自动删除任何源码。修改 Lua 后重新构建，再停止并重新启动试玩；修改 UI 或挂载后显式保存存档。

分享可独立运行的工程时，另带本次构建的单文件产物并保留相对目录。存档本身不再自带 Lua。本机路径/配置和备份不提交 Git；可携带源码的独立导出包放在忽略目录或通过发布附件交付。发布命令不修改模拟器存档，也不创建脚本挂载关系。

千星编辑器只映射并挂载目标单文件，不分别映射开发模块或上传 `.map.json`。后续更新同一路径，编辑器保存/重新加载后试玩。复制成功、模拟器通过与真机通过分别记录。

官方《[客户端控件和客户端脚本](https://act.mihoyo.com/ys/ugc/tutorial/detail/mhbgxf0nynww)》说明只有建立映射的 Lua 才会上传；也提供多脚本调用机制。本模板选择单文件发布以简化映射，这是工程约定。知识库依据为 2026-09-25 快照；模板本身不包含任何游戏的真机验证结论。
