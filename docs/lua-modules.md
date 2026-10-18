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

模拟器的脚本路径指向 `dist/main.lua`。若 `scripts[].source` 非空，应更新为同次打包的完整内容，再显式保存和回归。发布命令不修改模拟器存档，也不创建脚本挂载关系。

千星编辑器只映射并挂载目标单文件，不分别映射开发模块或上传 `.map.json`。后续更新同一路径，编辑器保存/重新加载后试玩。复制成功、模拟器通过与真机通过分别记录。

官方《[客户端控件和客户端脚本](https://act.mihoyo.com/ys/ugc/tutorial/detail/mhbgxf0nynww)》说明只有建立映射的 Lua 才会上传；也提供多脚本调用机制。本模板选择单文件发布以简化映射，这是工程约定。知识库依据为 2026-09-25 快照；模板本身不包含任何游戏的真机验证结论。
