# 图片拟合与素材交付

图片拟合属于七步规范的第 4 步“千星美术参考图与素材”，在 HTML 体验确认后进行。先确定图片用途、目标显示尺寸、透明背景和图元预算，再选择下面的方式。步骤 4 可操作图片工具；模拟器存档、Lua 集成与试玩在后续步骤推进。

## 两种方式与在线入口

| 方式 | 在线服务 | 源码与说明 | 适用场景 |
|---|---|---|---|
| 方案一：Codex 设计图元，图片编辑器导入与精修 | [千星图片编辑器](https://qx.070077.xyz/) | [编辑器仓库](https://github.com/1475505/Miliastra-image-editor-webui)、[miliastra-image-css-builder Skill](https://github.com/1475505/Miliastra-image-editor-webui/blob/main/skills/miliastra-image-css-builder/SKILL.md) | 简单图标、几何装饰、简化角色、文字与素材拼接，以及对拟合结果做局部调整。 |
| 方案二：图片算法拟合并导出 | [千星图片图元拟合](https://qx-img.070077.xyz/) | [拟合工具仓库](https://github.com/1475505/Miliastra-toolbox-primitive-shape)、[使用指南](https://github.com/1475505/Miliastra-toolbox-primitive-shape/blob/main/user_guide.md) | 将现有头像、立绘、插画等图片转为大量基础图元，或批量拟合。 |

默认建议：复杂参考图先走方案二，保存场景 JSON；需要精修时导入方案一编辑器，调整后再导出。简单图标可直接采用方案一。该建议依据工具机制，不能当成同图同预算的实测质量排名。

```text
复杂参考图 → 方案二自动拟合 → 场景 JSON → 方案一编辑器精修 → GIA / Lua
简单图标   → Codex + CSS Skill → 导入方案一编辑器检查 → GIA / Lua
```

在线服务不可用时，可克隆对应 GitHub 仓库在本地启动，见下文；继续沿用同一套场景文件和交付流程。

## 方案一：Codex + CSS Skill + 编辑器

1. 阅读项目内 [miliastra-image-css-builder](../.agents/skills/miliastra-image-css-builder/SKILL.md)，明确画布、图元预算与需要保留的识别特征。它生成的是编辑器可解析的 CSS 子集，普通网页 CSS 的渐变、伪元素、滤镜等不能直接套用。
2. 使用符合该 Skill 约定的 CSS；若直接生成完整场景 JSON，应遵循编辑器的 `canvas`、扁平 `elements` 等结构，不把普通业务 JSON 当作场景。
3. 在在线或本地图片编辑器导入 CSS/JSON，检查画布尺寸、图元数量、层序、颜色、透明度与警告，以导入后的预览为准。
4. 调整关键轮廓、五官或 UI 对齐，保存可继续编辑的场景 JSON，再导出所需 GIA 或 Lua。

该 Skill 已随模板放入项目 `.agents/skills/miliastra-image-css-builder/`，版本 `1.0.13`，固定上游提交 `cd4e08accc63f19774f844f38ad9b9c8dc2d3b79`，配套参考和来源说明一并纳入 Git；后续 clone 无需另装全局 Skill。Skill 本身不会启动图片服务或配置网站 WebMCP，只有实际发现页面工具后才按其 schema 操作，否则通过文件导入/导出。

## 方案二：自动拟合

1. 在在线或本地拟合工具中选择参考图，设定目标尺寸、图元预算和圆/椭圆、矩形、三角形等形状。
2. 需要透明背景时使用 PNG 并检查 PNG 模式；在目标实际显示尺寸查看轮廓、五官与边缘。
3. 保存拟合参数、预览和场景 JSON。JSON 可直接导入方案一编辑器继续调整，也可按需要直接导出 GIA/Lua。
4. 还原不理想时先调整图元类型、预算和主体处理；在同一张图、相同尺寸和相同预算下比较候选结果。

拟合工具提供浏览器 WASM 本地拟合模式，但页面是否可访问与整套服务能否离线运行是不同问题；服务不可用时使用下述 Git 源码本地部署。

## 在线不可用时：克隆源码本地启动

以下是 Windows PowerShell 的手动操作示例，均从当前游戏项目根目录开始。预先准备 Git、Node.js/npm 和 Python **3.13**；`py -3.13` 不可用时换成实际的 Python 3.13 可执行文件路径。上游 GIA 导出包含 Python 3.13 构建产物，不能默认换其他 Python 版本。

源码放到项目 `.local-tools/`，Python 使用工具目录内的 `.venv`，前端依赖使用工具目录内的 `node_modules`。该目录已被模板 Git 忽略；最终素材和 JSON 要另存到项目 `assets/` 等受版本管理的目录。

首次克隆和安装依赖仍需访问 GitHub、包仓库；本地部署不能替代缺失的源码或构建产物。素材库远端图片等功能也可能继续需要网络。部署前阅读所用版本的 README，环境和命令变化时按对应版本调整。

### 本地启动方案一编辑器

```powershell
git clone https://github.com/1475505/Miliastra-image-editor-webui.git .local-tools/image-editor

Push-Location .local-tools/image-editor/backend
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Pop-Location

Push-Location .local-tools/image-editor/frontend
npm install
npm run build
Pop-Location

Push-Location .local-tools/image-editor/backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8439
```

打开 [本地图片编辑器](http://127.0.0.1:8439/)。最后一条命令保持运行，停止时按 Ctrl+C，再执行 `Pop-Location` 回到项目根目录。前端构建输出到 `backend/app/static/`；不要只启动后端却遗漏静态页面构建。

后续启动无需重复安装，在项目根目录运行：

```powershell
Push-Location .local-tools/image-editor/backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8439
```

环境已准备好时，也可参照上游 README 使用 `start.bat`；启动前确认其使用的是该工具虚拟环境中的 Python。

### 本地启动方案二拟合工具

在另一个终端，从项目根目录执行：

```powershell
git clone https://github.com/1475505/Miliastra-toolbox-primitive-shape.git .local-tools/primitive-shape

Push-Location .local-tools/primitive-shape
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe server.py --host 127.0.0.1 --port 5555
```

打开 [本地图元拟合工具](http://127.0.0.1:5555/)。保持终端运行；停止时按 Ctrl+C，再执行 `Pop-Location`。

浏览器本地拟合需要该版本的 WASM 产物。服务端/CLI 拟合需要可用的 `primitive` 可执行文件；上游说明 Windows 可放到 `tools/primitive.exe`，Linux/macOS 放到 `tools/primitive`。缺失时按仓库说明准备，或使用仓库附带的 `third_party/primitive` 源码和 Go 工具链构建到工具自己的目录。不要为了此流程使用全局 `go install`。拟合和 GIA 导出都应分别试一张样图，不能仅凭服务页面打开就认为整条链路可用。

工具依赖准备完成后，可从拟合工具目录使用 CLI，例如：

```powershell
.\.venv\Scripts\python.exe server.py --cli --input "E:/path/to/reference.png" --export lua --output "E:/path/to/game/assets/fitted/generated.lua"
```

将示例路径换成真实输入和项目内输出。导出的独立 Lua 先保留为原始文件，按下一节整理后再接入游戏；不要直接发布该示例输出。

部署依据：[编辑器部署说明](https://github.com/1475505/Miliastra-image-editor-webui/blob/main/README.zh-CN.md)、[拟合工具部署说明](https://github.com/1475505/Miliastra-toolbox-primitive-shape#quick-start)。以上命令为文档操作指南，本模板未随文档更新安装这两个服务，也未实测完整本地部署。

## 质量记录与接入单文件 Lua

- 在 `docs/art-bible.md` 记录所用方案、在线/本地入口、源码提交或实际版本、参考图、画布/显示尺寸、图元数量、透明背景、参数与输出位置。源码版本可用 `git -C .local-tools/image-editor rev-parse HEAD` 或对应拟合工具目录查询。
- 建议把原图、`scene.json` 和预览放在 `assets/<素材名>/`，GIA/原始 Lua 按用途保存；不要只留在下载目录或 `.local-tools/`。
- 同预算比较后再选用。少图元时优先保住轮廓和关键识别特征；大量图元时同时检查加载与真机表现，不能用默认数量不同的结果判断工具优劣。
- 当前 Lua 图元绘制实现会逐图元创建控件，复杂拼图需核验实际控件数量。PNG 预览不是自动可用的游戏图片资产；GIA 导入、图片控件模板索引及实际挂载仍需核对。
- 外部导出的独立 Lua 可能自带 `OnStart`、`OnDestroy` 并修改宿主容器。步骤 5 中把图元数据与绘制/销毁逻辑整理成项目 `src` 模块，由入口统一调用，明确父容器和缩放；不要直接拼接多个全局生命周期回调。模板打包器不会自动完成这种适配。
- 集成后构建 `dist/main.lua`，同步模拟器路径及非空内联源码，回归后按 [Lua 构建与发布](lua-modules.md) 复制到用户指定位置。第 4 步只交付参考和素材方案，第 5–7 步完成集成、测试及真机验证。
