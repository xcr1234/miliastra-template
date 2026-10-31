---
name: design-taste-frontend
description: 为千星奇域 2D 游戏的 HTML 原型、菜单和 HUD 探索美术方向、配色、字体、构图与参考图；也用于现有原型的视觉重设计。使用 Taste 研究与工具，并按千星可还原性筛选。Lua API、玩法规则、节点图和发布沿用项目流程。
license: MIT
metadata:
  upstream-version: "2.1.5"
  upstream-commit: "12af471f627f866411b4bd785b19646d3672784c"
---

# Taste：千星视觉方向适配

首次使用先读[项目接入指南](../../../docs/design-skills.md)。这是项目适配入口；[原始入口](UPSTREAM-SKILL.md)及配套 library、assets、scripts 保留用于查阅与复用。本入口决定游戏任务的流程与范围，不直接执行上游网站制作的整套流程。

游戏开发服从 [七步逐步验收](../qxqy-game-studio/references/stage-approval.md)。本 Skill 只处理当前已获准进入的阶段；HTML 展示完必须停下来等待用户验收，不能顺带进入正式素材、Lua 或存档搭建。

## 按需读取

- 步骤 3 初稿或重设计：读取已有 GDD、用例、原型和美术约束；按需读[布局](references/layout.md)、[字体](references/type.md)、[颜色](references/colour.md)。菜单、设置、背包可参考[应用界面](references/app-screens.md)的信息组织，避免套用后台仪表盘壳。
- 步骤 4：从已确认的原型提取视觉语言，按需读[图像](references/imagery.md)，将来源、素材需求及还原方式写入现有 `docs/art-bible.md`。
- 已有方向明确时保留方向，直接处理目标界面，不重新随机抽取整套风格。
- 视觉审查与局部打磨使用 [Impeccable 项目入口](../impeccable/SKILL.md)。

## 游戏中的使用方式

1. 从玩法主题和玩家任务推导视觉重点，例如危险、资源变化、当前可执行动作。保留用户确定的题材、颜色和资产。
2. 真有视觉分歧时，用同一玩法状态、同一布局准备少量方向；其他情况自主选用合适方向。抽取器的风格与数值是参考，不自动成为游戏规格。
3. HTML 覆盖开局、首次成功、失败与重开，检查文字、按钮状态、热区及画面反馈。只验证实际看到或操作的结果。
4. 将接受的色板、字号、间距、状态、素材与动效意图写入 `docs/art-bible.md`；不可移植项写入 `prototype/README.md`。不提前创建尚未进入阶段的空文件。

上游网页分支的营销文案、图片数量、滚动场景、强制动效、渐变/辉光禁令及后台配色预算不作为游戏验收门槛。稀有度、选中态、危险提示和特效服从可读性、玩法语义、性能与用户方向。考虑中文与千星实际可用字体，网页网络字体不视为已可移植。

## 工具入口

从仓库根目录运行项目包装命令，确保历史与浏览器临时目录留在项目内：

```sh
npm run design:taste -- draw --list directions
npm run design:taste -- draw --app --kind workspace --brief "游戏设置" --options 3
npm run design:taste -- inspect prototype/index.html --app
```

`draw` 提供研究参考，`lint` / `inspect` 的网页规则结果要逐项判断适用性。保留原始结果，对不适用项记录理由，不为了清零报告修改已认可的游戏语义。浏览器不可用时可继续设计并明确未实测，不自动安装浏览器。

坐标、控件、imageId 与 Lua 实现遵守七步工作流。HTML/CSS 不直接导入千星；图元拟合仍走 `miliastra-image-css-builder` 或项目图片拟合方案。版本与许可见[来源记录](provenance.md)。
