---
slug: anima-base-model-guide
title: Anima Base v1.0 模型安装与使用指南
summary: CircleStone Labs 开源二次元扩散模型 Anima 的安装步骤、文件放置路径，以及在本站选择 Anima 架构后的推荐参数。
category: tutorial
tags: ["anima", "模型", "教程"]
published_at: 2026-07-08
app_link: /app/?arch=anima
author: ComfyUI Web
---

## 什么是 Anima

**Anima Base v1.0** 是 CircleStone Labs 发布的开源二次元向扩散模型（2B 参数），擅长动漫插画与概念图生成。与 SDXL 不同，Anima 采用分离式架构：扩散模型 + 文本编码器 + VAE 各自独立加载。

## 需要下载的文件

将以下三个文件放入 ComfyUI 对应目录：

- `anima-base-v1.0.safetensors` → `models/diffusion_models/`
- `qwen_3_06b_base.safetensors` → `models/text_encoders/`
- `qwen_image_vae.safetensors` → `models/vae/`

完整下载链接见 [教程页](/guides/#anima)。

## 在本站使用

1. 打开 [生图工具](/app/)
2. 左侧面板选择 **Anima (Diffusion Model)** 架构
3. 在三个下拉框中分别选择上述文件
4. 推荐采样：euler + simple，步数 12，CFG 1

## Turbo 与 Aesthetic 变体

除 Base 外，还提供：

- **anima-turbo-v1.0** — 更快出图，适合草稿
- **anima-aesthetic-v1.0** — 偏美学风格

切换方式：在「Anima 模型」下拉框中选择对应扩散模型即可，文本编码器与 VAE 共用。

> 提示：Anima 模式下 ControlNet、IP-Adapter、FreeU 等 SDXL 专属功能会自动隐藏。
