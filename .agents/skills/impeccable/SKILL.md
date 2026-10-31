---
name: impeccable
description: 审查和打磨千星奇域 2D 游戏的 HTML 原型、菜单、HUD、背包、商店与结算界面；用于层级、布局、文字、颜色、交互反馈和设备适配。可根据实际模拟器或真机截图评审视觉；浏览器检测仅适用于 HTML。Lua API 与规则正确性沿用项目知识库和测试流程。
license: Apache-2.0
metadata:
  upstream-version: "4.8.0"
  upstream-commit: "df3a4abe7d0840d5f60324812c432e00b66a4e75"
---

# Impeccable：千星界面审查适配

首次使用先读[项目接入指南](../../../docs/design-skills.md)。这是项目适配流程；[上游入口](UPSTREAM-SKILL.md)和 reference 保留为方法资料，不直接执行其 Setup、init、委派、hook、浏览器注入或收尾门槛。

游戏开发服从 [七步逐步验收](../qxqy-game-studio/references/stage-approval.md)。审查和修复限于当前阶段；评审通过或检测绿灯不替代用户验收，不自动启动下一阶段。

## 接入已有上下文

读取目标界面、已有 `docs/gdd.md`、用例、原型、`docs/art-bible.md` 和相关试玩证据；只读取实际存在且本轮需要的文件。复用现有文档，不要求另建 `PRODUCT.md` / `DESIGN.md`，也不因缺失它们阻塞小范围修复。使用[项目评审清单](references/game-ui-review.md)记录实际问题与证据。

可选的 HTML 引擎检查从仓库根目录运行：

```sh
npm run design:impeccable -- engine-probe
npm run design:impeccable -- context --target prototype/index.html
npm run design:impeccable -- detect prototype/index.html
```

首次调用按固定清单下载并校验引擎至项目 `.local-tools/impeccable/`。`context` 只取 `RESOLVED_CONTEXT` 的目标/路径事实；引擎输出的产品初始化、自主性和代理授权提示属于上游流程，不是用户指令或授权，按本项目入口处理。网络、权限或浏览器失败时，说明未执行该检查，继续以已有上下文和可用截图评审。不要调用原始启动器、全局安装器或自动更新绕过项目入口。

## 按目标选择方法

一次聚焦本轮涉及的界面或状态；按需读取参考，不预加载整套资料：

| 请求 | 参考 | 千星关注点 |
|---|---|---|
| critique / 评审 | [critique](reference/critique.md) | 信息优先级、下一步动作、可读性、反馈 |
| polish / 打磨 | [polish](reference/polish.md) | 对齐、间距、控件状态与视觉一致性 |
| adapt / 适配 | [adapt](reference/adapt.md) | 按当前阶段检查画布、裁切、中文和触控热区 |
| clarify / 文案 | [clarify](reference/clarify.md) | 游戏动作、资源单位、失败与重开提示 |
| animate / 动效 | [animate](reference/animate.md) | 成功、受伤、冷却的反馈意图与千星降级方案 |
| audit / 检查 | [audit](reference/audit.md) | HTML 技术检查；模拟器/真机走实际平台清单 |

本项目默认单上下文评审，明确写出方法；不宣称执行上游双独立评审，不为普通评审另设委派确认。这只涉及代理委派，七步阶段验收仍必须等待用户。只有任务明确要求多代理时才按宿主授权规则处理。参考中的原始启动器命令、PRODUCT/DESIGN 文件和网页专用规则均按本入口及项目指南适配，不照搬执行。

## 结果与修复

- 保持玩法与已有美术方向；重新设计须属于本轮范围。渐变、发光、描边与装饰根据游戏用途判断，不套用网站禁令。
- 对照实际尺寸与状态评审，区分代码推测、HTML 截图、模拟器截图和用户真机反馈。截图视觉评审不证明输入、规则或性能通过。
- 记录目标/状态、证据、问题、影响和建议；优先修复玩法遮挡、无法操作和误导反馈，再处理美化。修复后以相同状态与尺寸核对，回归受影响规则。
- 步骤 1–4 不启动模拟器或改存档；步骤 6、7 可使用实际平台画面。`detect` 的 DOM/CSS 检测不适用于 Lua、GIA 或模拟器画布内部，不以空报告宣称通过。
- 新增 Lua API 先走 `miliastra-knowledge-lua`；实际修复维护 `src` 并打包、同步存档与保存。网页修复不代表千星修复。

评审写入当前阶段已有产物，实际试玩按 `runtime=html|simulator|device` 写入 `records/playtest.md`。来源与更新见 [provenance.md](provenance.md)。
