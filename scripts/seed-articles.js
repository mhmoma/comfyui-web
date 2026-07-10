#!/usr/bin/env node
/** 清空旧帖并重新发布资讯（修复中文 slug 导致详情 404） */
const API = 'https://comfyui-web-89u.pages.dev/api/articles';
const KEY = 'Tomkk520525';
const headers = { 'Content-Type': 'application/json', 'x-admin-key': KEY };
const adminHeaders = { 'x-admin-key': KEY };

const articles = [
  {
    slug: 'anima-model-family-2026',
    category: 'model',
    tags: ['anima', '模型', 'CircleStone'],
    title: 'Anima 模型族 2026 速览：Base、Turbo、Aesthetic 怎么选',
    summary: 'CircleStone Labs 与 Comfy Org 合作的 2B 二次元扩散模型 Anima 已有 Base / Turbo / Aesthetic 等变体，本文梳理文件结构、推荐采样与在本站的用法。',
    content: `## 什么是 Anima

**Anima** 是 CircleStone Labs 与 Comfy Org 联合发布的 **2B 参数**文生图扩散模型，主攻动漫插画、角色设计与非写实风格。训练数据以数百万张动漫图为主，知识截止约 **2025 年 9 月**，不适合写实摄影类题材。

官方主页：[circlestone-labs/Anima](https://huggingface.co/circlestone-labs/Anima)

## 三个核心文件（ComfyUI 分离式加载）

| 文件 | 目录 |
|------|------|
| anima-base-v1.0.safetensors（或 Turbo/Aesthetic 变体） | models/diffusion_models/ |
| qwen_3_06b_base.safetensors | models/text_encoders/ |
| qwen_image_vae.safetensors | models/vae/ |

## 变体怎么选

- **Anima Base v1.0** — 质量与稳定性平衡，日常出图首选
- **Anima Turbo v1.0** — 步数更少、出图更快，适合草稿与批量试词
- **Anima Aesthetic v1.0** — 偏美学与风格化，适合插画向作品

文本编码器与 VAE 通常可共用，只需更换扩散模型权重。

## ComfyUI 官方工作流

ComfyUI 文档已收录 **Anima Base v1** 模板：更新到最新版后，在 Template 搜索「Anima Base v1」即可一键加载。

## 在本站使用

打开 [生图工具 /app/?arch=anima](/app/?arch=anima)，选择 **Anima 架构**，在三个下拉框分别加载上述文件。`,
    app_link: '/app/?arch=anima',
  },
  {
    slug: 'anima-flow-sampler-rf',
    category: 'model',
    tags: ['anima', '采样器', 'ComfyUI', '插件'],
    title: '社区速递：Anima Flow Corrective 采样器与 RF 推理优化',
    summary: 'KeithZ117 发布的 Comfyui-anima-sampler 将 Cosmos 风格 Rectified Flow 采样引入 Anima，社区反馈在语义贴合、构图稳定性上优于传统 euler 组合。',
    content: `## 背景

Anima 基于 Cosmos 系 Rectified Flow 训练，ComfyUI 默认 euler/simple 并非始终最优。社区开源了 **Comfyui-anima-sampler** 节点。

项目：[KeithZ117/Comfyui-anima-sampler](https://github.com/KeithZ117/Comfyui-anima-sampler)

## 推荐参数（高质量向）

\`\`\`
solver     = flow_pc3_damped
schedule   = flow_rf_linear_shift
flow_shift = 5.0
steps      = 35
cfg        = 7.0
\`\`\`

## 安装

ComfyUI Manager 搜索安装，或 clone 到 custom_nodes 后重启 ComfyUI。`,
    app_link: '/app/?arch=anima',
  },
  {
    slug: 'site-anima-inpaint-v22',
    category: 'tool',
    tags: ['anima', '局部重绘', 'ComfyUI Web'],
    title: '本站更新：Anima 局部重绘 v22 工作流与两套重绘方案',
    summary: 'ComfyUI Web 局部重绘已全面切换为 Anima-only，提供「强化小范围」与「大范围重绘」两套方案，默认对齐 v22 采样参数。',
    content: `## 两套方案

- **强化小范围** — 换衣服、修细节，裁剪拼接 + LLLite
- **大范围重绘** — 换背景、大面积改图，全图 + MaskFix

## 默认参数

步数 12、CFG 1、euler + simple，面板仅采样器/调度器可调。

## 使用入口

[生图工具 → 局部重绘](/app/#inpaint)`,
    app_link: '/app/#inpaint',
  },
  {
    slug: 'civitai-gpu-crunch-2026',
    category: 'community',
    tags: ['Civitai', 'C站', 'GPU', '资讯'],
    title: 'Civitai 公告：GPU 资源紧张与在线生成限速说明',
    summary: '2026 年 6 月初 Civitai 主数据中心收回 GPU 算力，在线生成一度降速并临时限制部分模型，目前多数服务已恢复。',
    content: `## 发生了什么

2026 年 6 月 5 日 Civitai 官方称主要数据中心 **不足 48 小时通知**收回 GPU，转向加密货币挖矿。

官方文章：[A GPU Crunch, and Bumpy Days Ahead](https://civitai.com/articles/30980/a-gpu-crunch-and-bumpy-days-ahead)

## 影响

- 在线生成速度变慢
- 免费/会员资源上限临时下调
- Anima 等模型曾数度开关调试

## 建议

在线试词用 C 站，量产用本地 ComfyUI + [本站 Web 前端](/app/)。`,
    app_link: '/app/',
  },
  {
    slug: 'civitai-new-generator-2026',
    category: 'community',
    tags: ['Civitai', 'C站', '生成器', 'Buzz'],
    title: 'Civitai 新版在线生成器：工作流、架构匹配与 Buzz 消耗',
    summary: 'Civitai 静默上线新版 Generator：LoRA 必须与底模架构一致，叠加资源越多 Buzz 消耗越高。',
    content: `## 关键变化

1. **架构必须匹配** — Pony 底模只能配 Pony LoRA
2. **工作流增强** — 支持更完整在线流程
3. **Buzz 计价** — 叠加模型越多消耗越高
4. **Enhanced Compatibility** — 曾出现失败不退 Buzz，官方已暂时关闭

## 建议

本地出图用 [角色库/画师库](/app/) 管理 Trigger，更省 Buzz。`,
    app_link: '/app/#tab=characters',
  },
];

async function clearAll() {
  const res = await fetch(`${API}?limit=100`, { headers: adminHeaders });
  const data = await res.json();
  for (const a of data.articles || []) {
    let r = await fetch(`${API}/by-id/${encodeURIComponent(a.id)}`, { method: 'DELETE', headers: adminHeaders });
    if (!r.ok) {
      r = await fetch(`${API}?id=${encodeURIComponent(a.id)}`, { method: 'DELETE', headers: adminHeaders });
    }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) console.error('DEL FAIL:', a.title, d);
    else console.log('DEL:', a.title);
    await new Promise(res => setTimeout(res, 300));
  }
}

async function publishAll() {
  for (const a of articles) {
    const res = await fetch(API, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...a, status: 'published' }),
    });
    const data = await res.json();
    if (!res.ok) console.error('FAIL:', a.title, data);
    else console.log('OK:', data.article?.title, '→', data.article?.id);
    await new Promise(r => setTimeout(r, 400));
  }
}

async function main() {
  console.log('清理旧文章…');
  await clearAll();
  console.log('重新发布…');
  await publishAll();
}

main();
