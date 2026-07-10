---
slug: site-portal-launch
title: 站点升级：AI 绘画资讯站 + 生图工具
summary: ComfyUI Web 从纯生图工具升级为「资讯 + 教程 + 工具」一站式设计，生图功能迁移至 /app，首页发布模型动态与教程内容。
category: tool
tags: ["更新", "门户"]
published_at: 2026-07-10
app_link: /app/
author: ComfyUI Web
---

## 新定位

**看资讯、学技巧、用工具生图，一站完成。**

本次重构将网站拆分为两个区域：

- **门户区**（首页、资讯、教程）— 面向浏览阅读与 SEO
- **工具区**（`/app`）— 保留全部 ComfyUI Web 生图能力

## 页面结构

| 路径 | 说明 |
|------|------|
| `/` | 门户首页，最新资讯 + 快速入口 |
| `/news/` | 资讯列表与文章详情 |
| `/guides/` | 教程与模型下载指南 |
| `/app/` | 本地 ComfyUI + 在线 NAI 生图工具 |
| `/about/` | 关于本站 |

## 资讯发布流程

文章以 Markdown 管理，存放在 `content/news/` 目录：

```bash
# 写完 md 后构建
npm run build:news

# 构建 + 同步 deploy
npm run build
```

构建产物包括 `news.json`、静态详情页、`feed.xml` 和 `sitemap.xml`。

## 下一步计划

- 文章与生图工具深链联动（`?tag=xxx`）
- D1 数据库后台发帖（阶段 B）
- 前端模块化拆分（阶段 C）
