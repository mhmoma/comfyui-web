---
slug: anima-v22-inpaint-update
title: Anima v22 局部重绘工作流更新
summary: 站点局部重绘引擎已对齐 Anima v22 工作流，提供「强化小范围」与「大范围重绘」两套方案，支持 LLLite + InpaintPreprocessor 裁剪拼接。
category: tool
tags: ["anima", "inpaint", "局部重绘"]
published_at: 2026-07-10
app_link: /app/#inpaint
author: ComfyUI Web
---

## 更新内容

本次更新将局部重绘功能完全切换为 **Anima-only** 工作流，下线了旧版 SDXL 局部重绘路径，与当前 Anima 主架构保持一致。

### 两套重绘方案

- **强化小范围** — 适合换衣服、修细节、局部去衣等场景，采用裁剪拼接 + InpaintStitch，对原图干扰最小
- **大范围重绘** — 适合换背景、大面积修改，全图 + MaskFix 处理

### 默认采样参数

工作流已锁定 v22 推荐参数（步数 12、CFG 1、euler 采样器、simple 调度），面板中仅保留采样器/调度器可调。

## 如何使用

1. 在生图工具中生成一张图，或从历史记录导入
2. 点击 **局部重绘** 按钮进入全屏蒙版工作台
3. 涂抹需要修改的区域，选择预设或自定义提示词
4. 选择「强化小范围」或「大范围重绘」方案后生成

> 首次使用需安装 FLS_Sampler、CropAndStitch、essentials 等节点，可运行项目根目录的一键安装脚本。

## 相关链接

- [进入生图工具试用](/app/#inpaint)
- [局部重绘依赖安装教程](/guides/#inpaint-deps)
