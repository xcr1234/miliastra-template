---
name: miliastra-image-css-builder
description: 为千星图片编辑器准备可导入的 CSS 图元或场景文件，并按实际页面工具编辑、预览和导出；用于简单图标、UI 拼图和图像局部精修。普通网页开发与任意 SVG 绘制不使用此入口。
license: MIT
---

# 千星图片编辑器接入

这是模板原创的工具接入流程。完整编辑器和上游 Skill 不随本入口分发；格式与能力要对照实际使用版本的解析器或页面 schema 核实。

先读项目 [图片拟合指南](../../../docs/image-fitting.md)。在线入口是 [图片编辑器](https://qx.070077.xyz/)，复杂图片可先使用[自动拟合工具](https://qx-img.070077.xyz/)，再将场景文件交给编辑器精修。

## 选择工作方式

- 简单图标或几何 UI：根据用途、画布、显示尺寸和图元预算规划形状，生成编辑器接受的 CSS 子集。
- 复杂图片：先用自动拟合得到可编辑场景，再处理重要轮廓与局部细节。
- 当前页面有可调用工具：先发现实际 schema，读取场景与目标元素后再修改。页面不可操作时交付文件和导入步骤，不假称已在编辑器应用。
- 需要本地部署：源码和依赖安装在项目 `.local-tools/`，按所用版本的 README 操作。在线服务或网页能打开不等于导入和导出已验证。

## 导入格式的依据

CSS 是编辑器的交换格式，不能把网页的任意布局、渐变或滤镜当成支持能力。生成前读取所用版本的解析实现；项目历史参考版本为：

- [CSS 与场景解析器](https://github.com/1475505/Miliastra-image-editor-webui/blob/cd4e08accc63f19774f844f38ad9b9c8dc2d3b79/backend/app/main.py)。
- [旋转实现](https://github.com/1475505/Miliastra-image-editor-webui/blob/cd4e08accc63f19774f844f38ad9b9c8dc2d3b79/backend/app/rotation.py)。
- [图片拉伸实现](https://github.com/1475505/Miliastra-image-editor-webui/blob/cd4e08accc63f19774f844f38ad9b9c8dc2d3b79/backend/app/image_stretch.py)。

使用本地新版时优先核对本地源码，不混用不同版本的属性。画布使用 `.shaper-container`，每个图元有唯一的 `.shaper-element.shaper-eN` 规则；公共规则只放公共样式，避免额外解析出图元。尺寸、坐标、形状、颜色、透明度、旋转和切片参数均以解析器或页面工具的实际契约为准。场景 JSON 同样先核对结构，不手编未知字段。

## 检查和交付

导入后核对画布、图元数量、层序、透明度和关键轮廓；保存可编辑场景与预览。对比候选时保持同图、同尺寸、同预算。不能仅看 CSS 源码或导出文件存在就判断效果通过。

在步骤 4 的 `docs/art-bible.md` 记录资产来源、工具版本、预算、预览和交付路径。CSS/JSON、GIA、PNG 与 Lua 的用途分别说明；PNG 预览不等于已经取得游戏可用 imageId。

步骤 5 才把导出的绘制逻辑整理为 `src` 模块，统一生命周期并构建；步骤 6–7 验证交互、预算和真机效果。步骤 4 不改游戏模拟器存档。来源范围见 [说明](references/provenance.md)。
