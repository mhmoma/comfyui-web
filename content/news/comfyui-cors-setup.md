---
slug: comfyui-cors-setup
title: ComfyUI 跨域启动：让网页工具连上本地
summary: 启动 ComfyUI 时必须加 --enable-cors-header 参数，否则浏览器会拦截跨域请求。本文提供 Windows bat 修改方法与局域网访问配置。
category: tutorial
tags: ["comfyui", "教程", "入门"]
published_at: 2026-07-05
app_link: /app/
author: ComfyUI Web
---

## 问题现象

打开 [生图工具](/app/) 后，右上角连接状态显示红色「未连接」，控制台出现 CORS 相关错误。这是因为浏览器安全策略禁止网页直接访问不同源的 ComfyUI API。

## 解决方法

启动 ComfyUI 时加上 `--enable-cors-header` 参数：

```bash
python main.py --enable-cors-header
```

如果使用 bat 启动脚本，找到 `python main.py` 那一行，在末尾追加该参数。

## 局域网访问

若需手机或其他设备通过局域网使用：

```bash
python main.py --enable-cors-header --listen 0.0.0.0
```

然后在网站设置（⚙️）中填入 `http://你电脑的IP:8188`。

## 验证连接

1. 确保 ComfyUI 已启动且终端无报错
2. 打开 `/app/`，查看右上角连接灯是否变绿
3. 若仍失败，检查防火墙是否放行 8188 端口

## 在线生图替代方案

不想配置本地环境？切换到 **在线生图** 模式，通过 NAI API 直接出图，无需本地 ComfyUI。
