#!/usr/bin/env node
/** 发布实用深度教程到 D1 */
const API = 'https://comfyui-web-89u.pages.dev/api/articles';
const KEY = 'Tomkk520525';
const headers = { 'Content-Type': 'application/json', 'x-admin-key': KEY };
const adminHeaders = { 'x-admin-key': KEY };

const articles = [
  {
    slug: 'anima-setup-complete-guide',
    category: 'tutorial',
    tags: ['anima', '模型', '安装', 'ComfyUI'],
    title: 'Anima 从零到出图：文件下载、目录放置、三套变体怎么选',
    summary: '手把手说明 Anima 三个权重文件放哪、Base/Turbo/Aesthetic 各自适合什么场景、本站默认采样参数含义，以及最常见的「连上了但出不了图」排错步骤。',
    content: `## 适用人群

你已经装好 ComfyUI，想用 **Anima** 出二次元插画，但不确定文件放哪、三个变体有什么区别、参数该怎么填。本文按实际操作顺序写，不讲概念废话。

## 第一步：下载三个文件

Anima 不是单文件 checkpoint，而是 **扩散模型 + 文本编码器 + VAE** 分开加载。三个文件缺一不可。

| 文件名 | 放到 ComfyUI 目录 | 直链 |
|--------|-------------------|------|
| anima-base-v1.0.safetensors | models/diffusion_models/ | [HuggingFace](https://huggingface.co/circlestone-labs/Anima/resolve/main/split_files/diffusion_models/anima-base-v1.0.safetensors) |
| qwen_3_06b_base.safetensors | models/text_encoders/ | [HuggingFace](https://huggingface.co/circlestone-labs/Anima/resolve/main/split_files/text_encoders/qwen_3_06b_base.safetensors) |
| qwen_image_vae.safetensors | models/vae/ | [HuggingFace](https://huggingface.co/circlestone-labs/Anima/resolve/main/split_files/vae/qwen_image_vae.safetensors) |

放好后**重启 ComfyUI**，否则下拉框扫不到新文件。

## 第二步：三套扩散模型变体

文本编码器和 VAE **通常不用换**，只换 diffusion_models 里的文件：

| 变体 | 文件名 | 适合场景 | 特点 |
|------|--------|----------|------|
| **Base** | anima-base-v1.0.safetensors | 日常成品、角色立绘 | 质量与稳定性最均衡，首选 |
| **Turbo** | anima-turbo-v1.0.safetensors | 试词、批量构图 | 步数可更少，速度快，细节略逊 Base |
| **Aesthetic** | anima-aesthetic-v1.0.safetensors | 偏风格化插画 | 画面更「好看」，但可控性略弱 |

**建议流程**：Turbo 快速试构图和提示词 → 满意后切 Base 出最终图。

## 第三步：在本站加载

1. 打开 [生图工具 /app/?arch=anima](/app/?arch=anima)
2. 左上角架构选 **Anima (Diffusion Model)**
3. 三个下拉框分别选：扩散模型 / 文本编码器 / VAE
4. 右上角连接灯变绿，说明已连上本地 ComfyUI

切换到 Anima 后，**ControlNet、IP-Adapter、FreeU 等 SDXL 专属功能会自动隐藏**——这是正常的架构隔离，不是 bug。

## 第四步：推荐采样参数（本站默认）

本站 Anima 模式默认参数（可在面板自行调整）：

\`\`\`
分辨率：832 × 1216（竖图常用，可改 1024×1024 等）
步数：30
CFG：4
采样器：euler
调度器：simple
Clip Skip：1
\`\`\`

正向提示词起手式（可在此基础上加内容）：

\`\`\`
masterpiece, best quality, score_7, safe
\`\`\`

负向提示词（本站已预填，一般不用动）：

\`\`\`
worst quality, low quality, score_1, score_2, score_3, blurry, bad hands ...
\`\`\`

**Anima 用 score 标签体系**（score_6、score_7 等），和 SDXL 的 masterpiece 体系可以混用，但 score 标签对 Anima 更有效。

## 第五步：常见问题排错

### 连接灯红色 / CORS 报错

ComfyUI 启动时必须加跨域参数：

\`\`\`bash
python main.py --enable-cors-header
\`\`\`

详见 [ComfyUI 跨域连接教程](/news/detail?slug=comfyui-cors-troubleshoot)。

### 下拉框是空的

- 确认文件后缀是 .safetensors，不是 .gguf 或其他格式
- 确认路径正确（diffusion_models 不是 checkpoints）
- 重启 ComfyUI 后再刷新网页

### 能连上但生成 400 报错

- 三个文件是否都选了（只选扩散模型不够）
- ComfyUI 版本是否过旧（建议更新到支持 Anima 模板的最新版）
- 看 ComfyUI 终端具体报错节点名

### 出图模糊 / 手崩

- 步数提到 30–40 试一次
- 加 \`detailed hands, detailed eyes\` 等标签
- 用 [局部重绘](/news/detail?slug=anima-inpaint-practical-guide) 修手部小区域

## 和 SDXL 怎么选

| 需求 | 推荐 |
|------|------|
| 二次元插画、新模型、轻量 2B | Anima |
| 已有大量 SDXL LoRA / ControlNet 工作流 | SDXL |
| 写实摄影 | 都不合适 |

两套架构的提示词、采样、LoRA 设置**互不影响**——切换架构时本站会自动分别保存你的参数，不会串台。`,
    app_link: '/app/?arch=anima',
  },
  {
    slug: 'anima-inpaint-practical-guide',
    category: 'tutorial',
    tags: ['anima', '局部重绘', 'inpaint', 'LLLite'],
    title: 'Anima 局部重绘实操：什么时候用小范围、什么时候用全图',
    summary: '按场景说明「强化小范围」与「大范围重绘」的选择逻辑、蒙版怎么涂、预设提示词怎么用、必装节点清单，以及引擎检查失败时逐步排查。',
    content: `## 这篇解决什么问题

你已经用 Anima 出了一张图，但想**换衣服、修手、换背景、擦水印**——不想整张重抽。本站局部重绘目前**仅支持 Anima 架构**，工作流基于 LLLite + FLS_SamplerV4，分两套方案。

## 入口在哪

以下任意位置可进入局部重绘：

- 生成结果图下方的 **局部重绘** 按钮
- 历史记录缩略图菜单
- 大图预览弹窗
- img2img / ControlNet / IP-Adapter 上传的预览图

打开后是**全屏蒙版工作台**：涂抹蒙版 → 选预设或写提示词 → 选方案 → 生成。

## 两套方案怎么选

| 方案 | 工作流 | 适合 | 不适合 |
|------|--------|------|--------|
| **强化小范围** | 裁剪蒙版区域 → LLLite 重绘 → 拼回原图 | 换衣服、修脸/手/眼、去小物件、内衣细节 | 换整张背景 |
| **大范围重绘** | 全图 + MaskFix | 换背景、大面积改构图、半身以上区域 | 精细五官微调（容易带动周围） |

**经验法则**：

- 蒙版面积 **小于画面 25%** → 强化小范围
- 蒙版超过 **半张图** → 大范围重绘
- 不确定 → 先小范围，不满意再扩大蒙版换大范围

## 蒙版操作要点

工作台快捷键与工具：

- **画笔 / 橡皮** — 手动涂蒙版
- **魔棒** — 点选颜色相近区域（可调容差）
- **反选** — 涂了背景就反选改前景
- **空格 + 拖动** — 平移画布
- **滚轮** — 缩放
- **1px 像素笔** — 修发丝、线稿边缘

涂抹技巧：

1. 蒙版比目标区域**略大一圈**（边缘融合更好）
2. 修手时只涂手，**不要涂到袖子接口**以外太多
3. 换背景时只涂背景，人物轮廓留 2–3 像素余量
4. 蒙版显示为**红色半透明**，不是全图变红——涂哪红哪

## 预设提示词（面板下拉）

| 预设 | 用途 | 正向提示词方向 |
|------|------|----------------|
| 修细节 | 眼/手/边缘崩坏 | detailed eyes, detailed hands, sharp details |
| 换衣服 | 服装替换 | detailed clothing, fabric texture |
| 换背景 | 只涂背景区 | detailed background, clean scene, depth |
| 改头发 | 发型调整 | detailed hair, natural hair strands |
| 擦除 | 去水印/杂物 | clean background, seamless |
| 自定义 | 自己写 | 只描述**蒙版内**要出现的内容 |

反向提示词由工作流**固定**，面板不显示也不可改——减少参数干扰。

## 工作流锁定参数（v22）

两套方案共享以下核心参数（面板仅采样器/调度器可调）：

\`\`\`
步数：10
CFG：1
采样器：euler_ancestral
调度器：simple
Denoise：1
\`\`\`

小范围额外走 **InpaintCropImproved + InpaintStitchImproved** 裁剪拼接，蒙版边缘 blend 32px，上下文扩展 1.2 倍。

## 必装依赖（首次使用前）

在 ComfyUI 端安装以下自定义节点，否则引擎检查会报红：

| 节点包 | 用途 |
|--------|------|
| ComfyUI-Anima-LLLite | LLLite 重绘核心 |
| comfyui_controlnet_aux | InpaintPreprocessor |
| ComfyUI-BSS_FLSampler | FLS_SamplerV4 采样 |
| ComfyUI-Inpaint-CropAndStitch | 小范围裁剪拼接 |
| ComfyUI_essentials | 大范围 MaskFix+ |

**一键安装**：运行项目根目录的 \`安装局部重绘依赖.bat\`，或在 ComfyUI Manager 搜索上述包名逐个安装。装完**重启 ComfyUI**。

LLLite 权重若缺失，工具内会提示一键下载。

## 引擎检查报红怎么办

打开局部重绘面板，看底部引擎状态：

1. **红色** — 缺节点或缺权重，按提示装对应包
2. 装完点刷新或重新打开面板
3. 仍失败 → 看 ComfyUI 终端启动有无 import error
4. 确认是 **Anima 架构**（SDXL 局部重绘已下线）

## 生成后不满意

- 蒙版太小 → 扩大一点重试
- 边缘有色差 → 小范围方案通常更好；检查蒙版是否贴边
- 内容完全不对 → 换预设或写更具体的正向提示词
- 想保留更多原图 → 保持「强化小范围」，不要切大范围

[立即打开局部重绘](/app/#inpaint)`,
    app_link: '/app/#inpaint',
  },
  {
    slug: 'comfyui-cors-troubleshoot',
    category: 'tutorial',
    tags: ['comfyui', 'CORS', '连接', '入门'],
    title: 'ComfyUI 跨域连接排错：从「未连接」到绿灯的完整检查清单',
    summary: '网页连不上本地 ComfyUI 的逐步排查：启动参数、地址格式、防火墙、HTTPS 混用、局域网手机访问，每步都有对应现象与解决办法。',
    content: `## 现象

打开 [生图工具 /app/](/app/)，右上角连接状态是**红灯「未连接」**，点击生成没反应。浏览器 F12 控制台可能出现：

\`\`\`
Access to fetch at 'http://127.0.0.1:8188/...' from origin 'https://...' has been blocked by CORS policy
\`\`\`

这不是网站坏了，是**浏览器安全策略**阻止网页访问本地 ComfyUI——ComfyUI 默认不发送跨域许可头。

## 检查清单（按顺序做）

### 1. ComfyUI 是否在运行

终端应显示 \`To see the GUI go to: http://127.0.0.1:8188\`。没有这行说明没启动成功。

### 2. 启动参数必须带 CORS

**错误**：

\`\`\`bash
python main.py
\`\`\`

**正确**：

\`\`\`bash
python main.py --enable-cors-header
\`\`\`

如果用 bat 启动，找到 \`python main.py\` 那行，末尾追加 \`--enable-cors-header\`，保存后重新双击启动。

改完参数必须**重启 ComfyUI**，热重载无效。

### 3. 本站服务器地址填对

点右上角 ⚙️ 设置：

| 场景 | 地址 |
|------|------|
| 本机浏览器访问 | http://127.0.0.1:8188 |
| 局域网手机/平板 | http://你电脑IP:8188 |
| 不要用 | https://127.0.0.1:8188（除非 ComfyUI 真开了 HTTPS） |

地址填错的表现：一直转圈后超时，无 CORS 字样。

### 4. 防火墙放行 8188

Windows 首次启动 ComfyUI 可能弹防火墙提示，选**允许专用网络**。

若手机连不上：控制面板 → Windows 防火墙 → 入站规则 → 新建端口 8188 TCP。

### 5. 局域网访问额外参数

手机要通过 WiFi 连电脑上的 ComfyUI：

\`\`\`bash
python main.py --enable-cors-header --listen 0.0.0.0
\`\`\`

\`--listen 0.0.0.0\` 让 ComfyUI 监听所有网卡，不只是 localhost。

查电脑 IP：cmd 输入 \`ipconfig\`，看 IPv4（如 192.168.1.100）。手机浏览器填 \`http://192.168.1.100:8188\`。

### 6. 验证连接成功

回到 /app/，右上角应变**绿灯**。此时：

- 模型下拉框能扫到本地文件
- 点击生成会显示进度条
- WebSocket 预览帧可能实时显示（取决于 ComfyUI 版本）

## 其他常见坑

### 在线版 ComfyUI / 云端实例

若 ComfyUI 跑在云端，把设置里的地址换成云端提供的 URL（含端口）。同样需要云端实例开启 CORS 或使用反向代理加 header。

### 浏览器插件干扰

广告拦截、隐私插件偶尔拦截 WebSocket。排错时先用 Chrome 无痕窗口试。

### 端口被占用

8188 被占用时 ComfyUI 可能换端口启动，看终端实际端口号，/settings 里同步修改。

## 不想配本地？

切换到 **在线生图** 模式（NAI API），不需要本地 ComfyUI 和 CORS：

[进入在线生图 /app/#mode=nai](/app/#mode=nai)

但在线模式没有局部重绘、角色 LoRA 自动加载等本地专属功能。`,
    app_link: '/app/',
  },
  {
    slug: 'character-artist-library-guide',
    category: 'tutorial',
    tags: ['角色库', '画师库', 'Trigger', 'LoRA'],
    title: '角色库与画师库实战：3 万角色 Trigger 和画师串怎么用到提示词里',
    summary: '说明本站角色库/画师库的数据从哪来、点选后提示词怎么拼、和 LoRA 的关系、画师串自定义栏用法，以及 Anima 与 SDXL 下标签格式差异。',
    content: `## 这套功能解决什么

记不全 Danbooru 标签、找不到角色 official trigger、不知道画师 tag 怎么写——本站内置 **862 个作品系列 / 30,609 个角色** 和完整画师库，点选即写入提示词，不用手打。

## 入口

[生图工具 /app/](/app/) → 底部或侧栏 **角色** / **画师** Tab。

手机端：底部 5 Tab 中「角色」「画师」；角色支持全屏浮层浏览。

## 角色库怎么用

### 浏览路径

**作品封面** → 点进系列 → 角色网格 → 点角色卡片。

每个角色卡片显示：

- 缩略图（全身）
- 中/英文名
- 使用次数角标（仅在「最近/常用」页，格式 \`N次\`，不是权重语法）

### 点选后发生什么

点击角色 → 弹出预览 → 可选：

- **插入 Trigger** — 把角色触发词写入正向提示词
- **插入 Trigger + Tags** — 触发词 + 特征标签一起写入
- **加载 LoRA**（若该角色有 LoRA URL 且你本地已下载）

### Trigger 是什么

来自 AnimaDex 的角色专属触发词，通常形如：

\`\`\`
ganyu (genshin impact), goat horns, blue hair, ...
\`\`\`

不同角色差异很大，**以卡片显示为准**，不要自己猜。

### 和 LoRA 的关系

- 有 LoRA 的角色：卡片会标示，需先把 LoRA 文件放到 ComfyUI \`models/loras/\`
- 没 LoRA 的角色：只用 Trigger 标签也能出相似形象，效果取决于底模是否认识该角色
- Anima 对近年角色识别较好（训练截止约 2025.9），老作品/冷门角色可能需要 LoRA

## 画师库怎么用

### 四个分类

| 分类 | 内容 |
|------|------|
| 精选 | 编辑挑选的高质量画师 |
| 热门 | 按热度排序 |
| 收藏 | 你本地收藏的画师 |
| 字母 | 按首字母浏览 |

点选画师 → 标签写入提示词，格式因架构而异（见下）。

### 画师串（自定义组合）

画师 Tab 里有 **画师串** 分类：

- 自己组合多个画师 tag（如 \`artist:xxx, artist:yyy\`）
- 可上传示例图作参考
- 数据存浏览器 localStorage + IndexedDB，**不上传服务器**

适合固定画风配方、反复使用同一组合。

## Anima vs SDXL 标签格式

本站会根据当前架构自动格式化：

| 架构 | 画师标签示例 | 说明 |
|------|-------------|------|
| SDXL | \`artist:name\` 或下划线形式 | 传统 Danbooru 风格 |
| Anima | \`@artist name\` | 空格分隔，带 @ 前缀 |

切换架构时**已写入的提示词不会自动转换**——换架构后建议重新从库中点选。

## 搜索技巧

- 角色库顶部搜索框：支持中/英文名、拼音、部分 trigger
- 画师库首次进入会清空搜索框，避免上次残留
- 数据从 Cloudflare D1 API 加载，首次稍慢；之后有 IndexedDB 缓存

## 推荐工作流

1. **定构图** — 先用大方向提示词（动作、场景、光影）
2. **加角色** — 从角色库点选，用 Trigger + Tags
3. **定画风** — 从画师库选 1–2 个画师，不要堆太多（易糊）
4. **出图后修** — 手/脸崩了用 [局部重绘](/news/detail?slug=anima-inpaint-practical-guide)

## 配置方案保存

调出一套满意的参数组合后：

- 设置面板 → **配置方案** → 另存为
- SDXL 和 Anima **各自独立保存**（LoRA、后处理、采样互不影响）
- 切换方案不会覆盖已存方案，日常改动只影响当前会话

[打开角色库 /app/#tab=characters](/app/#tab=characters) · [打开画师库 /app/#tab=artists](/app/#tab=artists)`,
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
    else console.log('OK:', data.article?.title);
    await new Promise(r => setTimeout(r, 500));
  }
}

async function main() {
  console.log('清理旧文章…');
  await clearAll();
  console.log('发布教程…');
  await publishAll();
  console.log('完成，共', articles.length, '篇');
}

main();
