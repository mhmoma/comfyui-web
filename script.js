(function () {
    'use strict';

    // ==================== 配置管理 ====================
    const DEFAULT_SERVER = 'http://127.0.0.1:8188';

    function isLocalProxy() {
        // 判断是否通过本地代理服务器访问（localhost/127.0.0.1 + 非8188端口）
        if (window.location.protocol === 'file:') return false;
        const host = window.location.hostname;
        return (host === 'localhost' || host === '127.0.0.1') && window.location.port !== '8188';
    }

    function getServer() {
        if (isLocalProxy()) return '';
        const saved = localStorage.getItem('comfyui_address');
        if (saved) return saved;
        return DEFAULT_SERVER;
    }

    function getComfyUIAddress() {
        return localStorage.getItem('comfyui_address') || DEFAULT_SERVER;
    }

    function setComfyUIAddress(url) {
        localStorage.setItem('comfyui_address', url.replace(/\/+$/, ''));
    }

    // ==================== DOM 引用 ====================
    const $ = (sel) => document.querySelector(sel);
    const dom = {
        selArch: $('#sel-arch'),
        panelSdxlModel: $('#panel-sdxl-model'),
        panelAnimaModel: $('#panel-anima-model'),
        selCheckpoint: $('#sel-checkpoint'),
        selUnet: $('#sel-unet'),
        selClip: $('#sel-clip'),
        selAnimaVae: $('#sel-anima-vae'),
        selSampler: $('#sel-sampler'),
        selScheduler: $('#sel-scheduler'),
        inpSteps: $('#inp-steps'),
        inpCfg: $('#inp-cfg'),
        inpWidth: $('#inp-width'),
        inpHeight: $('#inp-height'),
        inpSeed: $('#inp-seed'),
        btnRandomSeed: $('#btn-random-seed'),
        txtPositive: $('#txt-positive'),
        txtNegative: $('#txt-negative'),
        btnGenerate: $('#btn-generate'),
        progressContainer: $('#progress-container'),
        progressBar: $('#progress-bar'),
        progressText: $('#progress-text'),
        resultPlaceholder: $('#result-placeholder'),
        resultImage: $('#result-image'),
        resultActions: $('#result-actions'),
        btnDownload: $('#btn-download'),
        btnSendToHistory: $('#btn-send-to-history'),
        historyGrid: $('#history-grid'),
        btnClearHistory: $('#btn-clear-history'),
        btnTutorial: $('#btn-tutorial'),
        modalTutorial: $('#modal-tutorial'),
        btnCloseTutorial: $('#btn-close-tutorial'),
        btnSettings: $('#btn-settings'),
        modalSettings: $('#modal-settings'),
        inpServer: $('#inp-server'),
        btnSaveSettings: $('#btn-save-settings'),
        btnCancelSettings: $('#btn-cancel-settings'),
        modalPreview: $('#modal-preview'),
        previewImage: $('#preview-image'),
        btnClosePreview: $('#btn-close-preview'),
        // 可选模块
        chkVae: $('#chk-vae'),
        panelVae: $('#panel-vae'),
        selVae: $('#sel-vae'),
        chkLora: $('#chk-lora'),
        panelLora: $('#panel-lora'),
        loraList: $('#lora-list'),
        btnAddLora: $('#btn-add-lora'),
        chkHires: $('#chk-hires'),
        panelHires: $('#panel-hires'),
        inpHiresScale: $('#inp-hires-scale'),
        selUpscaleMethod: $('#sel-upscale-method'),
        inpHiresDenoise: $('#inp-hires-denoise'),
        inpHiresSteps: $('#inp-hires-steps'),
        chkControlnet: $('#chk-controlnet'),
        panelControlnet: $('#panel-controlnet'),
        selControlnet: $('#sel-controlnet'),
        inpCnStrength: $('#inp-cn-strength'),
        inpCnStart: $('#inp-cn-start'),
        inpCnEnd: $('#inp-cn-end'),
        cnModelDesc: $('#cn-model-desc'),
        inpCnImage: $('#inp-cn-image'),
        btnCnPreview: $('#btn-cn-preview'),
        cnUploadPreview: $('#cn-upload-preview'),
        cnUploadImg: $('#cn-upload-img'),
        cnProcessedPreview: $('#cn-processed-preview'),
        cnProcessedImg: $('#cn-processed-img'),
        cnPreviewContainer: $('#cn-preview-container'),
        cnPreview: $('#cn-preview'),
        chkImg2img: $('#chk-img2img'),
        panelImg2img: $('#panel-img2img'),
        inpRefImage: $('#inp-ref-image'),
        refPreviewContainer: $('#ref-preview-container'),
        refPreview: $('#ref-preview'),
        inpDenoise: $('#inp-denoise'),
        btnUseAsRef: $('#btn-use-as-ref'),
        btnCompare: $('#btn-compare'),
        modalCompare: $('#modal-compare'),
        compareContainer: $('#compare-container'),
        compareBefore: $('#compare-before'),
        compareAfter: $('#compare-after'),
        compareSlider: $('#compare-slider'),
        btnCloseCompare: $('#btn-close-compare'),
        btnPreviewRef: $('#btn-preview-ref'),
        btnPreviewDownload: $('#btn-preview-download'),
        // ADetailer
        chkAdetailer: $('#chk-adetailer'),
        panelAdetailer: $('#panel-adetailer'),
        selAdetailerModel: $('#sel-adetailer-model'),
        inpAdetailerDenoise: $('#inp-adetailer-denoise'),
        inpAdetailerThreshold: $('#inp-adetailer-threshold'),
        inpAdetailerDilation: $('#inp-adetailer-dilation'),
        // Regional Prompt
        chkRegional: $('#chk-regional'),
        panelRegional: $('#panel-regional'),
        regionalList: $('#regional-list'),
        btnAddRegion: $('#btn-add-region'),
        // IP-Adapter
        chkIpadapter: $('#chk-ipadapter'),
        panelIpadapter: $('#panel-ipadapter'),
        sectionIpadapter: $('#section-ipadapter'),
        selIpadapterModel: $('#sel-ipadapter-model'),
        inpIpaImage: $('#inp-ipa-image'),
        ipaPreviewContainer: $('#ipa-preview-container'),
        ipaPreview: $('#ipa-preview'),
        inpIpaWeight: $('#inp-ipa-weight'),
        inpIpaStart: $('#inp-ipa-start'),
        inpIpaEnd: $('#inp-ipa-end'),
        ipaStatus: $('#ipa-status'),
        ipaDownloadArea: $('#ipa-download-area'),
        btnIpaDownload: $('#btn-ipa-download'),
        ipaDownloadProgress: $('#ipa-download-progress'),
        ipaProgressBar: $('#ipa-progress-bar'),
        ipaProgressText: $('#ipa-progress-text'),
    };

    // ==================== 开关面板逻辑 ====================
    function setupToggles() {
        const pairs = [
            [dom.chkVae, dom.panelVae],
            [dom.chkLora, dom.panelLora],
            [dom.chkHires, dom.panelHires],
            [dom.chkControlnet, dom.panelControlnet],
            [dom.chkImg2img, dom.panelImg2img],
            [dom.chkAdetailer, dom.panelAdetailer],
            [dom.chkRegional, dom.panelRegional],
            [$('#chk-freeu'), $('#panel-freeu')],
            [dom.chkIpadapter, dom.panelIpadapter],
        ];
        pairs.forEach(([chk, panel]) => {
            const update = () => {
                panel.classList.toggle('hidden', !chk.checked);
            };
            chk.addEventListener('change', update);
            update();
        });
    }

    // ==================== LoRA 多选管理 ====================
    let loraOptions = [];
    let loraCount = 0;

    function addLoraRow() {
        loraCount++;
        const row = document.createElement('div');
        row.className = 'lora-row';
        row.dataset.id = loraCount;
        row.innerHTML = `
            <select class="lora-select">${loraOptions.map(l => `<option value="${l}">${l}</option>`).join('')}</select>
            <input type="number" class="lora-strength" value="1" min="0" max="2" step="0.05" title="强度">
            <button class="btn-icon lora-remove" title="移除">✕</button>
        `;
        row.querySelector('.lora-remove').addEventListener('click', () => row.remove());
        dom.loraList.appendChild(row);
    }

    function getLoraSelections() {
        const rows = dom.loraList.querySelectorAll('.lora-row');
        return Array.from(rows).map(row => ({
            name: row.querySelector('.lora-select').value,
            strength: parseFloat(row.querySelector('.lora-strength').value),
        })).filter(l => l.name);
    }

    // ==================== 用作参考图 ====================
    let refImageUrl = null;

    async function useImageAsRef(imageUrl) {
        refImageUrl = imageUrl;
        dom.chkImg2img.checked = true;
        dom.chkImg2img.dispatchEvent(new Event('change'));
        dom.refPreview.src = imageUrl;
        dom.refPreviewContainer.classList.remove('hidden');
        dom.modalPreview.classList.add('hidden');
    }

    // ==================== 区域提示词管理 ====================
    let regionCount = 0;
    const REGION_COLORS = [
        'rgba(233,69,96,0.35)', 'rgba(69,170,233,0.35)',
        'rgba(96,233,69,0.35)', 'rgba(233,180,69,0.35)',
        'rgba(180,69,233,0.35)', 'rgba(69,233,200,0.35)',
    ];
    const REGION_BORDERS = [
        '#e94560', '#45aae9', '#60e945', '#e9b445', '#b445e9', '#45e9c8',
    ];

    function addRegionRow(x, y, w, h) {
        regionCount++;
        const colorIdx = (regionCount - 1) % REGION_COLORS.length;
        const row = document.createElement('div');
        row.className = 'region-row';
        row.dataset.id = regionCount;
        row.style.borderLeftColor = REGION_BORDERS[colorIdx];
        row.innerHTML = `
            <div class="region-header">
                <span style="color:${REGION_BORDERS[colorIdx]}">■ 区域 ${regionCount}</span>
                <button class="btn-icon region-remove" title="移除">✕</button>
            </div>
            <div class="region-pos">
                <label>X% <input type="number" class="region-x" value="${x ?? 0}" min="0" max="100" step="5"></label>
                <label>Y% <input type="number" class="region-y" value="${y ?? 0}" min="0" max="100" step="5"></label>
                <label>宽% <input type="number" class="region-w" value="${w ?? 50}" min="5" max="100" step="5"></label>
                <label>高% <input type="number" class="region-h" value="${h ?? 50}" min="5" max="100" step="5"></label>
            </div>
            <textarea class="region-prompt" rows="2" placeholder="该区域的提示词..."></textarea>
        `;
        row.querySelector('.region-remove').addEventListener('click', () => {
            row.remove();
            drawRegionCanvas();
        });
        row.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', drawRegionCanvas);
        });
        dom.regionalList.appendChild(row);
        drawRegionCanvas();
    }

    function getRegions() {
        const rows = dom.regionalList.querySelectorAll('.region-row');
        return Array.from(rows).map(row => ({
            x: parseFloat(row.querySelector('.region-x').value) / 100,
            y: parseFloat(row.querySelector('.region-y').value) / 100,
            w: parseFloat(row.querySelector('.region-w').value) / 100,
            h: parseFloat(row.querySelector('.region-h').value) / 100,
            strength: 1,
            prompt: row.querySelector('.region-prompt').value || '',
        }));
    }

    function drawRegionCanvas() {
        const canvas = document.getElementById('regional-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cw = canvas.width;
        const ch = canvas.height;

        ctx.clearRect(0, 0, cw, ch);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, cw, ch);

        ctx.strokeStyle = '#2a2a4e';
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(cw * i / 4, 0);
            ctx.lineTo(cw * i / 4, ch);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, ch * i / 4);
            ctx.lineTo(cw, ch * i / 4);
            ctx.stroke();
        }

        const rows = dom.regionalList.querySelectorAll('.region-row');
        rows.forEach((row, i) => {
            const x = parseFloat(row.querySelector('.region-x').value) / 100 * cw;
            const y = parseFloat(row.querySelector('.region-y').value) / 100 * ch;
            const w = parseFloat(row.querySelector('.region-w').value) / 100 * cw;
            const h = parseFloat(row.querySelector('.region-h').value) / 100 * ch;
            const colorIdx = i % REGION_COLORS.length;

            ctx.fillStyle = REGION_COLORS[colorIdx];
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = REGION_BORDERS[colorIdx];
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            ctx.fillStyle = REGION_BORDERS[colorIdx];
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`${i + 1}`, x + 4, y + 14);
        });
    }

    function applyPreset(type) {
        dom.regionalList.innerHTML = '';
        regionCount = 0;
        if (type === 'lr') {
            addRegionRow(0, 0, 50, 100);
            addRegionRow(50, 0, 50, 100);
        } else if (type === 'tb') {
            addRegionRow(0, 0, 100, 50);
            addRegionRow(0, 50, 100, 50);
        } else if (type === 'quad') {
            addRegionRow(0, 0, 50, 50);
            addRegionRow(50, 0, 50, 50);
            addRegionRow(0, 50, 50, 50);
            addRegionRow(50, 50, 50, 50);
        } else if (type === 'center') {
            addRegionRow(0, 0, 100, 100);
            addRegionRow(20, 15, 60, 70);
        } else if (type === 'clear') {
            drawRegionCanvas();
        }
    }

    // ==================== 图片上传预览 ====================
    function setupFilePreview(input, preview, container) {
        input.addEventListener('change', () => {
            const file = input.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.src = e.target.result;
                    container.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                container.classList.add('hidden');
            }
        });
    }

    // ==================== ComfyUI API ====================
    async function apiGet(path) {
        const res = await fetch(`${getServer()}${path}`);
        if (!res.ok) throw new Error(`API ${path} 返回 ${res.status}`);
        return res.json();
    }

    async function apiPost(path, body) {
        console.log('[POST]', path, JSON.stringify(body).substring(0, 500));
        const res = await fetch(`${getServer()}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const text = await res.text();
        console.log('[Response]', res.status, text.substring(0, 500));
        if (!res.ok) {
            let detail;
            try { detail = JSON.parse(text); } catch { detail = text; }
            const msg = detail?.error?.message || detail?.error || text || `HTTP ${res.status}`;
            throw new Error(`${path} 错误(${res.status}): ${msg}`);
        }
        return JSON.parse(text);
    }

    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('overwrite', 'true');
        const res = await fetch(`${getServer()}/upload/image`, {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) throw new Error('图片上传失败');
        return res.json();
    }

    async function uploadImageFromUrl(imageUrl) {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `ref_${Date.now()}.png`, { type: blob.type || 'image/png' });
        return uploadImage(file);
    }

    const ANIMA_DEFAULTS = {
        positive: 'masterpiece, best quality, score_7, safe',
        negative: 'worst quality, low quality, score_1, score_2, score_3, blurry, jpeg artifacts, sepia, bad hands, bad arm, bad knees, missing fingers, extra fingers, anatomical nonsense, bad perspective',
        width: 832,
        height: 1216,
        steps: 30,
        cfg: 4,
        sampler: 'euler',
        scheduler: 'simple',
        clipSkip: '1',
    };

    const SDXL_DEFAULTS = {
        positive: '',
        negative: '',
        width: 1024,
        height: 1536,
        steps: 30,
        cfg: 6,
        sampler: 'euler',
        scheduler: 'normal',
        clipSkip: '2',
    };

    const _archState = { sdxl: null, anima: null };

    function isAnimaMode() {
        return dom.selArch.value === 'anima';
    }

    function captureArchState() {
        return {
            positive: dom.txtPositive.value,
            negative: dom.txtNegative.value,
            sampler: dom.selSampler.value,
            scheduler: dom.selScheduler.value,
            steps: dom.inpSteps.value,
            cfg: dom.inpCfg.value,
            width: dom.inpWidth.value,
            height: dom.inpHeight.value,
            clipSkip: document.getElementById('inp-clip-skip')?.value ?? '2',
        };
    }

    function setSelectIfExists(sel, value) {
        if (!value || !sel) return;
        if ([...sel.options].some(o => o.value === value)) sel.value = value;
    }

    function applyArchState(state) {
        if (!state) return;
        if (state.positive !== undefined) {
            dom.txtPositive.value = state.positive;
            dom.txtPositive.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (state.negative !== undefined) {
            dom.txtNegative.value = state.negative;
            dom.txtNegative.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (state.steps !== undefined) dom.inpSteps.value = state.steps;
        if (state.cfg !== undefined) dom.inpCfg.value = state.cfg;
        if (state.width !== undefined) dom.inpWidth.value = state.width;
        if (state.height !== undefined) dom.inpHeight.value = state.height;
        const clipSkip = document.getElementById('inp-clip-skip');
        if (clipSkip && state.clipSkip !== undefined) clipSkip.value = state.clipSkip;
        setSelectIfExists(dom.selSampler, state.sampler);
        setSelectIfExists(dom.selScheduler, state.scheduler);
    }

    function formatAnimaArtistTag(tag) {
        let name = tag.replace(/_/g, ' ');
        if (!name.startsWith('@')) name = '@' + name;
        return name;
    }

    function formatAnimaTag(tag) {
        return tag.replace(/_/g, ' ');
    }

    function setupArchSwitch() {
        dom.selArch.addEventListener('change', () => {
            const newArch = dom.selArch.value;
            const prevArch = newArch === 'anima' ? 'sdxl' : 'anima';
            _archState[prevArch] = captureArchState();

            const isAnima = newArch === 'anima';
            dom.panelSdxlModel.classList.toggle('hidden', isAnima);
            dom.panelAnimaModel.classList.toggle('hidden', !isAnima);

            const defaults = isAnima ? ANIMA_DEFAULTS : SDXL_DEFAULTS;
            applyArchState(_archState[newArch] || defaults);

            updateArchAwarePanels();
        });
    }

    async function loadAnimaModels() {
        try {
            const unetData = await apiGet('/object_info/UNETLoader');
            const unets = unetData.UNETLoader.input.required.unet_name[0];
            dom.selUnet.innerHTML = '';
            unets.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; dom.selUnet.appendChild(o); });
        } catch (e) { dom.selUnet.innerHTML = '<option>无可用模型</option>'; }

        try {
            const clipData = await apiGet('/object_info/CLIPLoader');
            const clips = clipData.CLIPLoader.input.required.clip_name[0];
            dom.selClip.innerHTML = '';
            clips.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; dom.selClip.appendChild(o); });
        } catch (e) { dom.selClip.innerHTML = '<option>无可用编码器</option>'; }

        try {
            const vaeData = await apiGet('/object_info/VAELoader');
            const vaes = vaeData.VAELoader.input.required.vae_name[0];
            dom.selAnimaVae.innerHTML = '';
            vaes.forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = m; dom.selAnimaVae.appendChild(o); });
        } catch (e) { dom.selAnimaVae.innerHTML = '<option>无可用VAE</option>'; }
    }

    async function loadCheckpoints() {
        try {
            const data = await apiGet('/object_info/CheckpointLoaderSimple');
            const models = data.CheckpointLoaderSimple.input.required.ckpt_name[0];
            dom.selCheckpoint.innerHTML = '';
            models.forEach((m) => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                dom.selCheckpoint.appendChild(opt);
            });
        } catch (e) {
            dom.selCheckpoint.innerHTML = '<option>加载失败 - 检查连接</option>';
            console.error('加载模型列表失败:', e);
        }
    }

    async function loadSamplers() {
        try {
            const data = await apiGet('/object_info/KSampler');
            const info = data.KSampler.input.required;
            const samplers = info.sampler_name[0];
            const schedulers = info.scheduler[0];

            dom.selSampler.innerHTML = '';
            samplers.forEach((s) => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                dom.selSampler.appendChild(opt);
            });

            dom.selScheduler.innerHTML = '';
            schedulers.forEach((s) => {
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                dom.selScheduler.appendChild(opt);
            });
        } catch (e) {
            console.error('加载采样器列表失败:', e);
        }
    }

    async function loadVAEs() {
        try {
            const data = await apiGet('/object_info/VAELoader');
            const vaes = data.VAELoader.input.required.vae_name[0];
            dom.selVae.innerHTML = '';
            vaes.forEach((v) => {
                const opt = document.createElement('option');
                opt.value = v;
                opt.textContent = v;
                dom.selVae.appendChild(opt);
            });
        } catch (e) {
            dom.selVae.innerHTML = '<option>无可用 VAE</option>';
        }
    }

    async function loadLoRAs() {
        try {
            const data = await apiGet('/object_info/LoraLoader');
            loraOptions = data.LoraLoader.input.required.lora_name[0];
        } catch (e) {
            loraOptions = [];
        }
    }

    async function loadControlNets() {
        try {
            const data = await apiGet('/object_info/ControlNetLoader');
            const nets = data.ControlNetLoader.input.required.control_net_name[0];
            dom.selControlnet.innerHTML = '';
            nets.forEach((n) => {
                const opt = document.createElement('option');
                opt.value = n;
                opt.textContent = n;
                dom.selControlnet.appendChild(opt);
            });
        } catch (e) {
            dom.selControlnet.innerHTML = '<option>无可用 ControlNet</option>';
        }
    }

    // ==================== IP-Adapter 模型管理 ====================
    let ipaPluginInstalled = false;
    let ipaModels = [];
    let ipaLoaderNode = '';
    let ipaApplyNode = '';
    let ipaWeightTypes = [];
    let ipaClipVisionModels = [];
    let hasComfyUIManager = false;

    async function loadIPAdapterModels() {
        const loaderNodes = ['IPAdapterModelLoader', 'IPAdapterUnifiedLoader', 'IPAdapterSimple', 'IPAdapter'];
        ipaPluginInstalled = false;
        ipaModels = [];
        ipaLoaderNode = '';
        ipaApplyNode = '';

        for (const nodeName of loaderNodes) {
            try {
                const data = await apiGet('/object_info/' + nodeName);
                if (!data[nodeName] || !data[nodeName].input) continue;
                ipaPluginInstalled = true;
                const nodeInfo = data[nodeName].input.required;
                const models = nodeInfo?.ipadapter_file?.[0] || nodeInfo?.model_name?.[0] || [];
                ipaModels = models;
                ipaLoaderNode = nodeName;
                console.log('[IPA] Loader node:', nodeName, 'models:', models.length);
                break;
            } catch (_) {}
        }

        if (ipaPluginInstalled) {
            const applyNodes = ['IPAdapterApply', 'IPAdapterSimple', 'IPAdapter', 'IPAdapterAdvanced',
                                'IPAdapterTiled', 'IPAdapterBatch', 'IPAdapterEmbeds'];
            for (const nodeName of applyNodes) {
                try {
                    const data = await apiGet('/object_info/' + nodeName);
                    if (data[nodeName] && data[nodeName].input) {
                        ipaApplyNode = nodeName;
                        const req = data[nodeName].input.required || {};
                        if (req.weight_type) ipaWeightTypes = req.weight_type[0] || [];
                        console.log('[IPA] Apply node:', nodeName, 'weight_types:', ipaWeightTypes);
                        break;
                    }
                } catch (_) {}
            }
            if (!ipaApplyNode) {
                console.warn('[IPA] No apply node found, trying unified loader as apply');
                if (ipaLoaderNode === 'IPAdapterUnifiedLoader') {
                    ipaApplyNode = 'IPAdapterUnifiedLoader';
                }
            }
        }

        try {
            const cvData = await apiGet('/object_info/CLIPVisionLoader');
            if (cvData.CLIPVisionLoader?.input?.required) {
                ipaClipVisionModels = cvData.CLIPVisionLoader.input.required.clip_name[0] || [];
                console.log('[IPA] CLIP Vision models:', ipaClipVisionModels.length);
            }
        } catch (_) {}

        updateIPAdapterUI();

        try {
            await apiGet('/api/extensions');
            hasComfyUIManager = true;
        } catch (e) {
            try {
                const info = await apiGet('/object_info');
                hasComfyUIManager = !!info['ManagerButton'] || !!info['CLIPTextEncodeAdvanced'];
            } catch (_) {
                hasComfyUIManager = false;
            }
        }
    }

    function updateIPAdapterUI() {
        if (!dom.selIpadapterModel) return;

        dom.selIpadapterModel.innerHTML = '';

        if (!ipaPluginInstalled) {
            dom.ipaStatus.classList.remove('hidden', 'ipa-ok');
            dom.ipaStatus.classList.add('ipa-warn');
            dom.ipaStatus.textContent = '⚠️ 未检测到 IP-Adapter 插件，请先安装 ComfyUI_IPAdapter_plus';
            dom.selIpadapterModel.innerHTML = '<option value="">需安装插件</option>';
            dom.ipaDownloadArea.classList.add('hidden');
            return;
        }

        if (ipaModels.length === 0) {
            dom.ipaStatus.classList.remove('hidden', 'ipa-ok');
            dom.ipaStatus.classList.add('ipa-warn');
            dom.ipaStatus.textContent = '⚠️ 已安装插件但未检测到 IPA 模型';
            dom.selIpadapterModel.innerHTML = '<option value="">无可用模型</option>';
            dom.ipaDownloadArea.classList.remove('hidden');
            const hint = dom.ipaDownloadArea.querySelector('.ipa-download-hint');
            if (hint) hint.textContent = '需要下载 IP-Adapter 模型和 CLIP Vision 模型';
            if (dom.btnIpaDownload) dom.btnIpaDownload.textContent = '📥 一键下载全部所需模型';
            return;
        }

        if (!ipaApplyNode) {
            dom.ipaStatus.classList.remove('hidden', 'ipa-ok');
            dom.ipaStatus.classList.add('ipa-warn');
            dom.ipaStatus.textContent = `⚠️ 检测到 ${ipaModels.length} 个模型但未找到兼容的应用节点 (Loader: ${ipaLoaderNode})`;
            dom.selIpadapterModel.innerHTML = '<option value="">节点不兼容</option>';
            dom.ipaDownloadArea.classList.add('hidden');
            return;
        }

        dom.ipaStatus.classList.remove('hidden', 'ipa-warn');
        dom.ipaStatus.classList.add('ipa-ok');
        let statusMsg = `✓ ${ipaModels.length} 个 IPA 模型`;
        if (ipaClipVisionModels.length > 0) {
            statusMsg += ` · ${ipaClipVisionModels.length} 个 CLIP Vision`;
        } else {
            dom.ipaStatus.classList.remove('ipa-ok');
            dom.ipaStatus.classList.add('ipa-warn');
            statusMsg += ' · ⚠️ 缺少 CLIP Vision 模型';
        }
        dom.ipaStatus.textContent = statusMsg;

        if (ipaClipVisionModels.length === 0) {
            dom.ipaDownloadArea.classList.remove('hidden');
            const hint = dom.ipaDownloadArea.querySelector('.ipa-download-hint');
            if (hint) hint.textContent = '⚠️ 缺少 CLIP Vision 模型（IP-Adapter 必需）';
            if (dom.btnIpaDownload) dom.btnIpaDownload.textContent = '📥 一键下载 CLIP Vision 模型';
            const manualHint = dom.ipaDownloadArea.querySelector('.ipa-manual-hint');
            if (manualHint) manualHint.innerHTML = '手动下载: <a href="https://huggingface.co/h94/IP-Adapter/resolve/main/models/image_encoder/model.safetensors" target="_blank" rel="noopener">CLIP-ViT-H model.safetensors</a> → 放入 <code>models/clip_vision/</code>';
        } else {
            dom.ipaDownloadArea.classList.add('hidden');
        }

        ipaModels.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            dom.selIpadapterModel.appendChild(opt);
        });

        const wtSel = document.getElementById('sel-ipa-weight-type');
        if (wtSel && ipaWeightTypes.length > 0) {
            const wtLabels = {
                'standard': '标准 — 均衡混合参考图和提示词',
                'linear': '线性 — 均匀混合（通用）',
                'prompt is more important': '提示词优先 — 参考图影响较弱',
                'style transfer': '风格迁移 — 只提取风格，不复制内容',
                'composition': '构图迁移 — 保留参考图布局',
                'original': '原始算法 — 最初的混合方式',
                'ease in': '渐入 — 前期弱后期强',
                'ease out': '渐出 — 前期强后期弱',
                'ease in-out': '渐入渐出 — 中段最强',
                'reverse in-out': '反向渐入渐出',
                'weak input': '弱输入 — 参考图影响极弱',
                'weak output': '弱输出',
                'strong style transfer': '强风格迁移 — 更强的风格提取',
            };
            wtSel.innerHTML = '';
            ipaWeightTypes.forEach(wt => {
                const opt = document.createElement('option');
                opt.value = wt;
                opt.textContent = wtLabels[wt] || wt;
                wtSel.appendChild(opt);
            });
        }
    }

    function setupIPAdapter() {
        if (!dom.inpIpaImage) return;

        dom.inpIpaImage.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                dom.ipaPreview.src = url;
                dom.ipaPreviewContainer.classList.remove('hidden');
            } else {
                dom.ipaPreviewContainer.classList.add('hidden');
            }
        });

        if (dom.btnIpaDownload) {
            dom.btnIpaDownload.addEventListener('click', downloadIPAdapterModel);
        }
    }

    async function downloadIPAdapterModel() {
        const needsIPA = ipaModels.length === 0;
        const needsCLIP = ipaClipVisionModels.length === 0;
        const downloads = [];
        if (needsIPA) {
            downloads.push({
                url: 'https://huggingface.co/h94/IP-Adapter/resolve/main/sdxl_models/ip-adapter-plus_sdxl_vit-h.safetensors',
                filename: 'ip-adapter-plus_sdxl_vit-h.safetensors',
                save_path: 'ipadapter',
                size: '~850MB',
            });
        }
        if (needsCLIP) {
            downloads.push({
                url: 'https://huggingface.co/h94/IP-Adapter/resolve/main/models/image_encoder/model.safetensors',
                filename: 'model.safetensors',
                save_path: 'clip_vision',
                size: '~2.5GB',
            });
        }
        if (downloads.length === 0) return;

        dom.btnIpaDownload.disabled = true;
        dom.ipaDownloadProgress.classList.remove('hidden');
        const totalLabel = downloads.map(d => `${d.filename} (${d.size})`).join(' + ');
        dom.ipaProgressText.textContent = `正在下载 ${totalLabel}...`;
        dom.ipaProgressBar.style.width = '10%';

        try {
            for (const dl of downloads) {
                const res = await fetch(`${getServer()}/api/install-model`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: dl.url, filename: dl.filename, save_path: dl.save_path }),
                });
                if (!res.ok) throw new Error(`Manager API failed for ${dl.filename}`);
            }

            dom.ipaProgressBar.style.width = '30%';
            dom.ipaProgressText.textContent = `下载中，请稍候（${totalLabel}）...`;

            let attempts = 0;
            const checkInterval = setInterval(async () => {
                attempts++;
                dom.ipaProgressBar.style.width = Math.min(90, 30 + attempts * 2) + '%';
                try {
                    await loadIPAdapterModels();
                    const ipaOk = !needsIPA || ipaModels.length > 0;
                    const clipOk = !needsCLIP || ipaClipVisionModels.length > 0;
                    if (ipaOk && clipOk) {
                        clearInterval(checkInterval);
                        dom.ipaProgressBar.style.width = '100%';
                        dom.ipaProgressText.textContent = '全部下载完成！';
                        setTimeout(() => {
                            dom.ipaDownloadProgress.classList.add('hidden');
                            dom.btnIpaDownload.disabled = false;
                        }, 2000);
                    }
                } catch (_) {}
                if (attempts > 180) {
                    clearInterval(checkInterval);
                    dom.ipaProgressText.textContent = '下载超时，请手动下载';
                    dom.btnIpaDownload.disabled = false;
                }
            }, 5000);
        } catch (e) {
            console.warn('下载失败:', e);
            dom.ipaProgressText.textContent = '自动下载失败，请手动下载';
            dom.btnIpaDownload.disabled = false;
            setTimeout(() => dom.ipaDownloadProgress.classList.add('hidden'), 3000);
        }
    }

    // ==================== 教程资源下载 ====================
    function triggerBrowserDownload(url, filename) {
        const a = document.createElement('a');
        a.href = url.includes('?') ? url : `${url}?download=true`;
        a.download = filename;
        a.rel = 'noopener';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    async function tryInstallToComfyUI(url, filename, savePath) {
        try {
            const res = await fetch(`${getServer()}/api/install-model`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, filename, save_path: savePath }),
            });
            return res.ok;
        } catch {
            return false;
        }
    }

    function setupTutorialDownloads() {
        document.querySelectorAll('.btn-dl-resource').forEach(btn => {
            btn.addEventListener('click', async () => {
                const url = btn.dataset.url;
                const filename = btn.dataset.filename;
                const savePath = btn.dataset.savePath || '';
                if (!url || !filename) return;

                const orig = btn.textContent;
                btn.disabled = true;
                btn.textContent = '…';

                try {
                    const installed = await tryInstallToComfyUI(url, filename, savePath);
                    if (installed) {
                        showToast(`已通过 Manager 安装: ${filename}`);
                    } else {
                        triggerBrowserDownload(url, filename);
                        showToast(savePath
                            ? `正在下载 ${filename} → 放入 models/${savePath}/`
                            : `正在下载 ${filename}`);
                    }
                } catch {
                    triggerBrowserDownload(url, filename);
                    showToast(`正在下载 ${filename}`);
                } finally {
                    btn.disabled = false;
                    btn.textContent = orig;
                }
            });
        });
    }

    // ==================== 架构感知面板管理 ====================
    function updateArchAwarePanels() {
        const isAnima = isAnimaMode();

        const sdxlOnlyEls = [
            document.querySelector('#section-ipadapter'),
            document.querySelector('#chk-freeu')?.closest('.optional-panel'),
            document.querySelector('#chk-controlnet')?.closest('.optional-panel'),
        ];

        sdxlOnlyEls.forEach(el => {
            if (!el) return;
            el.classList.toggle('arch-hidden', isAnima);
        });

        const speedupCheckbox = document.getElementById('chk-speedup');
        const speedupLabel = speedupCheckbox?.closest('label');
        if (speedupCheckbox && speedupLabel) {
            speedupLabel.classList.toggle('arch-hidden', isAnima);
            if (isAnima) {
                speedupCheckbox.checked = false;
            }
        }
    }

    // ==================== 动态工作流构建 ====================
    function buildWorkflow(uploadedImages) {
        const seed = parseInt(dom.inpSeed.value);
        const actualSeed = seed === -1 ? Math.floor(Math.random() * 2 ** 32) : seed;
        const nodes = {};
        let nextId = 10;
        const id = () => String(nextId++);

        const useVae = dom.chkVae.checked;
        const useLora = dom.chkLora.checked;
        const useHires = dom.chkHires.checked;
        const useControlnet = dom.chkControlnet.checked && uploadedImages.controlnet;
        const useImg2img = dom.chkImg2img.checked && (uploadedImages.img2img || refImageUrl);
        const useAdetailer = dom.chkAdetailer.checked;
        const useRegional = dom.chkRegional.checked;
        const useIpadapter = dom.chkIpadapter?.checked && uploadedImages.ipadapter && !isAnimaMode();

        let modelOut, clipOut, vaeOut;
        const isAnima = dom.selArch.value === 'anima';

        if (isAnima) {
            const unetId = id();
            nodes[unetId] = {
                class_type: "UNETLoader",
                inputs: { unet_name: dom.selUnet.value, weight_dtype: "default" },
            };
            modelOut = [unetId, 0];

            const clipId = id();
            nodes[clipId] = {
                class_type: "CLIPLoader",
                inputs: { clip_name: dom.selClip.value, type: "qwen_image" },
            };
            clipOut = [clipId, 0];

            const vaeId = id();
            nodes[vaeId] = {
                class_type: "VAELoader",
                inputs: { vae_name: dom.selAnimaVae.value },
            };
            vaeOut = [vaeId, 0];
        } else {
            const ckptId = id();
            nodes[ckptId] = {
                class_type: "CheckpointLoaderSimple",
                inputs: { ckpt_name: dom.selCheckpoint.value },
            };
            modelOut = [ckptId, 0];
            clipOut = [ckptId, 1];
            vaeOut = [ckptId, 2];
        }

        // VAE (optional)
        if (useVae) {
            const vaeId = id();
            nodes[vaeId] = {
                class_type: "VAELoader",
                inputs: { vae_name: dom.selVae.value },
            };
            vaeOut = [vaeId, 0];
        }

        // LoRA (optional, supports multiple)
        if (useLora) {
            const loras = getLoraSelections();
            for (const lora of loras) {
                const loraId = id();
                nodes[loraId] = {
                    class_type: "LoraLoader",
                    inputs: {
                        lora_name: lora.name,
                        strength_model: lora.strength,
                        strength_clip: lora.strength,
                        model: modelOut,
                        clip: clipOut,
                    },
                };
                modelOut = [loraId, 0];
                clipOut = [loraId, 1];
            }
        }

        // IP-Adapter (optional) - style/character transfer from reference image
        if (useIpadapter && ipaApplyNode && ipaLoaderNode) {
            const ipaLoadId = id();
            nodes[ipaLoadId] = {
                class_type: ipaLoaderNode,
                inputs: { ipadapter_file: dom.selIpadapterModel.value },
            };

            const clipVisionId = id();
            const cvModel = ipaClipVisionModels.length > 0 ? ipaClipVisionModels[0] : 'sd1.5/model.safetensors';
            nodes[clipVisionId] = {
                class_type: "CLIPVisionLoader",
                inputs: { clip_name: cvModel },
            };

            const ipaImgId = id();
            nodes[ipaImgId] = {
                class_type: "LoadImage",
                inputs: { image: uploadedImages.ipadapter },
            };

            const ipaApplyId = id();
            const weightType = document.getElementById('sel-ipa-weight-type')?.value || 'linear';
            const applyInputs = {
                model: modelOut,
                ipadapter: [ipaLoadId, 0],
                image: [ipaImgId, 0],
                weight: parseFloat(dom.inpIpaWeight.value),
                start_at: parseFloat(dom.inpIpaStart.value),
                end_at: parseFloat(dom.inpIpaEnd.value),
            };
            if (ipaApplyNode !== 'IPAdapterSimple') {
                applyInputs.weight_type = weightType;
                applyInputs.clip_vision = [clipVisionId, 0];
            }
            nodes[ipaApplyId] = {
                class_type: ipaApplyNode,
                inputs: applyInputs,
            };
            modelOut = [ipaApplyId, 0];
        }

        // Clip Skip
        const clipSkip = parseInt(document.getElementById('inp-clip-skip')?.value || '1');
        if (clipSkip > 1) {
            const csId = id();
            nodes[csId] = {
                class_type: "CLIPSetLastLayer",
                inputs: { clip: clipOut, stop_at_clip_layer: -clipSkip },
            };
            clipOut = [csId, 0];
        }

        // CLIP Text Encode - Positive (with wildcard resolution)
        const resolvedPositive = resolveWildcards(dom.txtPositive.value || '');
        const posId = id();
        nodes[posId] = {
            class_type: "CLIPTextEncode",
            inputs: { text: resolvedPositive, clip: clipOut },
        };

        // CLIP Text Encode - Negative
        const resolvedNegative = resolveWildcards(dom.txtNegative.value || '');
        const negId = id();
        nodes[negId] = {
            class_type: "CLIPTextEncode",
            inputs: { text: resolvedNegative, clip: clipOut },
        };

        let positiveOut = [posId, 0];
        let negativeOut = [negId, 0];

        // ControlNet (optional) - with auto-preprocessing
        if (useControlnet) {
            const cnLoadId = id();
            nodes[cnLoadId] = {
                class_type: "ControlNetLoader",
                inputs: { control_net_name: dom.selControlnet.value },
            };

            const cnImgId = id();
            nodes[cnImgId] = {
                class_type: "LoadImage",
                inputs: { image: uploadedImages.controlnet },
            };

            // Auto-detect preprocessor based on model name
            const cnName = dom.selControlnet.value.toLowerCase();
            let preprocessedImage = [cnImgId, 0];

            if (cnName.includes('canny')) {
                const prepId = id();
                nodes[prepId] = {
                    class_type: "CannyEdgePreprocessor",
                    inputs: { image: [cnImgId, 0] },
                };
                preprocessedImage = [prepId, 0];
            } else if (cnName.includes('openpose')) {
                const prepId = id();
                nodes[prepId] = {
                    class_type: "OpenposePreprocessor",
                    inputs: { image: [cnImgId, 0] },
                };
                preprocessedImage = [prepId, 0];
            } else if (cnName.includes('depth')) {
                const prepId = id();
                nodes[prepId] = {
                    class_type: "DepthAnythingV2Preprocessor",
                    inputs: { image: [cnImgId, 0] },
                };
                preprocessedImage = [prepId, 0];
            } else if (cnName.includes('scribble') || cnName.includes('lineart')) {
                const prepId = id();
                nodes[prepId] = {
                    class_type: "LineArtPreprocessor",
                    inputs: { image: [cnImgId, 0] },
                };
                preprocessedImage = [prepId, 0];
            }

            // Save preprocessed image for preview
            if (preprocessedImage !== [cnImgId, 0]) {
                const previewSaveId = id();
                nodes[previewSaveId] = {
                    class_type: "SaveImage",
                    inputs: { filename_prefix: "CN_Preview", images: preprocessedImage },
                };
            }

            const cnApplyId = id();
            nodes[cnApplyId] = {
                class_type: "ControlNetApplyAdvanced",
                inputs: {
                    positive: positiveOut,
                    negative: negativeOut,
                    control_net: [cnLoadId, 0],
                    image: preprocessedImage,
                    strength: parseFloat(dom.inpCnStrength.value),
                    start_percent: parseFloat(dom.inpCnStart.value),
                    end_percent: parseFloat(dom.inpCnEnd.value),
                },
            };
            positiveOut = [cnApplyId, 0];
            negativeOut = [cnApplyId, 1];
        }

        // Regional Prompt (optional)
        if (useRegional) {
            const regions = getRegions();
            if (regions.length > 0) {
                const width = parseInt(dom.inpWidth.value);
                const height = parseInt(dom.inpHeight.value);

                for (const region of regions) {
                    if (!region.prompt) continue;
                    const regionEncId = id();
                    nodes[regionEncId] = {
                        class_type: "CLIPTextEncode",
                        inputs: { text: region.prompt, clip: clipOut },
                    };
                    const condAreaId = id();
                    nodes[condAreaId] = {
                        class_type: "ConditioningSetArea",
                        inputs: {
                            conditioning: [regionEncId, 0],
                            x: Math.round(region.x * width),
                            y: Math.round(region.y * height),
                            width: Math.round(region.w * width),
                            height: Math.round(region.h * height),
                            strength: region.strength,
                        },
                    };
                    const combineId = id();
                    nodes[combineId] = {
                        class_type: "ConditioningCombine",
                        inputs: {
                            conditioning_1: positiveOut,
                            conditioning_2: [condAreaId, 0],
                        },
                    };
                    positiveOut = [combineId, 0];
                }
            }
        }

        // Latent Image source
        let latentOut;
        let denoise = 1;

        if (useImg2img) {
            const imgLoadId = id();
            nodes[imgLoadId] = {
                class_type: "LoadImage",
                inputs: { image: uploadedImages.img2img },
            };
            const vaeEncId = id();
            nodes[vaeEncId] = {
                class_type: "VAEEncode",
                inputs: { pixels: [imgLoadId, 0], vae: vaeOut },
            };
            latentOut = [vaeEncId, 0];
            denoise = parseFloat(dom.inpDenoise.value);
        } else {
            const emptyId = id();
            nodes[emptyId] = {
                class_type: "EmptyLatentImage",
                inputs: {
                    width: parseInt(dom.inpWidth.value),
                    height: parseInt(dom.inpHeight.value),
                    batch_size: 1,
                },
            };
            latentOut = [emptyId, 0];
        }

        // FreeU (quality enhancement)
        const useFreeu = document.getElementById('chk-freeu')?.checked;
        if (useFreeu) {
            const freeuId = id();
            nodes[freeuId] = {
                class_type: "FreeU_V2",
                inputs: {
                    model: modelOut,
                    b1: parseFloat(document.getElementById('inp-freeu-b1')?.value || 1.3),
                    b2: parseFloat(document.getElementById('inp-freeu-b2')?.value || 1.4),
                    s1: parseFloat(document.getElementById('inp-freeu-s1')?.value || 0.9),
                    s2: parseFloat(document.getElementById('inp-freeu-s2')?.value || 0.2),
                },
            };
            modelOut = [freeuId, 0];
        }

        // PatchModelAddDownscale (speed boost)
        const useSpeedup = document.getElementById('chk-speedup')?.checked;
        if (useSpeedup) {
            const downscaleId = id();
            nodes[downscaleId] = {
                class_type: "PatchModelAddDownscale",
                inputs: {
                    model: modelOut,
                    block_number: 3,
                    downscale_factor: 2.0,
                    start_percent: 0.0,
                    end_percent: 0.35,
                    downscale_after_skip: true,
                    downscale_method: "bicubic",
                    upscale_method: "bicubic",
                },
            };
            modelOut = [downscaleId, 0];
        }

        // KSampler
        const samplerId = id();
        nodes[samplerId] = {
            class_type: "KSampler",
            inputs: {
                seed: actualSeed,
                steps: parseInt(dom.inpSteps.value),
                cfg: parseFloat(dom.inpCfg.value),
                sampler_name: dom.selSampler.value,
                scheduler: dom.selScheduler.value,
                denoise: denoise,
                model: modelOut,
                positive: positiveOut,
                negative: negativeOut,
                latent_image: latentOut,
            },
        };

        let finalLatent = [samplerId, 0];

        // Hires Fix (optional)
        if (useHires) {
            const scale = parseFloat(dom.inpHiresScale.value);
            const upscaleId = id();
            nodes[upscaleId] = {
                class_type: "LatentUpscale",
                inputs: {
                    samples: finalLatent,
                    upscale_method: dom.selUpscaleMethod.value,
                    width: Math.round(parseInt(dom.inpWidth.value) * scale),
                    height: Math.round(parseInt(dom.inpHeight.value) * scale),
                    crop: "disabled",
                },
            };

            const hiresSamplerId = id();
            nodes[hiresSamplerId] = {
                class_type: "KSampler",
                inputs: {
                    seed: actualSeed,
                    steps: parseInt(dom.inpHiresSteps.value),
                    cfg: parseFloat(dom.inpCfg.value),
                    sampler_name: dom.selSampler.value,
                    scheduler: dom.selScheduler.value,
                    denoise: parseFloat(dom.inpHiresDenoise.value),
                    model: modelOut,
                    positive: positiveOut,
                    negative: negativeOut,
                    latent_image: [upscaleId, 0],
                },
            };
            finalLatent = [hiresSamplerId, 0];
        }

        // VAE Decode
        const decodeId = id();
        nodes[decodeId] = {
            class_type: "VAEDecode",
            inputs: { samples: finalLatent, vae: vaeOut },
        };

        let finalImage = [decodeId, 0];

        // Save intermediate "before" image for comparison (only if hires or adetailer is on)
        if (useHires || useAdetailer) {
            const beforeSaveId = id();
            nodes[beforeSaveId] = {
                class_type: "SaveImage",
                inputs: { filename_prefix: "CW_Before", images: finalImage },
            };
        }

        // ADetailer - face/hand detection + redraw
        if (useAdetailer) {
            const detectorId = id();
            nodes[detectorId] = {
                class_type: "UltralyticsDetectorProvider",
                inputs: { model_name: dom.selAdetailerModel.value },
            };

            const detailerId = id();
            nodes[detailerId] = {
                class_type: "FaceDetailer",
                inputs: {
                    image: finalImage,
                    model: modelOut,
                    clip: clipOut,
                    vae: vaeOut,
                    positive: positiveOut,
                    negative: negativeOut,
                    bbox_detector: [detectorId, 0],
                    seed: actualSeed,
                    steps: parseInt(document.getElementById('inp-adetailer-steps')?.value || 16),
                    cfg: parseFloat(dom.inpCfg.value),
                    sampler_name: dom.selSampler.value,
                    scheduler: dom.selScheduler.value,
                    denoise: parseFloat(dom.inpAdetailerDenoise.value),
                    guide_size: 384,
                    guide_size_for: true,
                    max_size: 1024,
                    feather: parseInt(document.getElementById('inp-adetailer-feather')?.value || 16),
                    noise_mask: true,
                    force_inpaint: true,
                    bbox_threshold: parseFloat(dom.inpAdetailerThreshold.value),
                    bbox_dilation: parseInt(dom.inpAdetailerDilation.value),
                    bbox_crop_factor: 3,
                    sam_detection_hint: "none",
                    sam_dilation: 4,
                    sam_threshold: 0.90,
                    sam_bbox_expansion: 0,
                    sam_mask_hint_threshold: 0.70,
                    sam_mask_hint_use_negative: "False",
                    drop_size: 16,
                    wildcard: "",
                    cycle: parseInt(document.getElementById('inp-adetailer-cycle')?.value || 1),
                },
            };
            finalImage = [detailerId, 0];
        }

        // Save Image
        const saveId = id();
        nodes[saveId] = {
            class_type: "SaveImage",
            inputs: { filename_prefix: "ComfyUI_Web", images: finalImage },
        };

        return { prompt: nodes };
    }

    // ==================== 生图流程 ====================
    async function generate() {
        dom.btnGenerate.disabled = true;
        dom.btnGenerate.textContent = '生成中...';
        dom.progressContainer.classList.remove('hidden');
        dom.resultPlaceholder.classList.add('hidden');
        dom.resultImage.classList.add('hidden');
        dom.resultActions.classList.add('hidden');
        updateMobileResultUI(false);
        setProgress(0);

        try {
            const uploadedImages = {};

            if (dom.chkControlnet.checked && dom.inpCnImage.files[0]) {
                const res = await uploadImage(dom.inpCnImage.files[0]);
                uploadedImages.controlnet = res.name;
            }

            if (dom.chkImg2img.checked) {
                if (dom.inpRefImage.files[0]) {
                    const res = await uploadImage(dom.inpRefImage.files[0]);
                    uploadedImages.img2img = res.name;
                } else if (refImageUrl) {
                    const res = await uploadImageFromUrl(refImageUrl);
                    uploadedImages.img2img = res.name;
                }
            }

            if (dom.chkIpadapter?.checked && dom.inpIpaImage.files[0] && !isAnimaMode()) {
                const res = await uploadImage(dom.inpIpaImage.files[0]);
                uploadedImages.ipadapter = res.name;
            }

            const workflow = buildWorkflow(uploadedImages);
            const result = await apiPost('/prompt', workflow);
            await pollProgress(result.prompt_id);
        } catch (e) {
            alert('生图失败: ' + e.message);
            console.error(e);
        } finally {
            dom.btnGenerate.disabled = false;
            dom.btnGenerate.textContent = '生成图片';
            dom.progressContainer.classList.add('hidden');
        }
    }

    async function pollProgress(promptId) {
        const startTime = Date.now();
        const TIMEOUT = 300000;

        while (Date.now() - startTime < TIMEOUT) {
            try {
                const res = await fetch(`${getServer()}/history/${promptId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data[promptId] && data[promptId].outputs) {
                        setProgress(100);
                        await fetchResult(promptId);
                        return;
                    }
                }

                const queueRes = await fetch(`${getServer()}/queue`);
                if (queueRes.ok) {
                    const queue = await queueRes.json();
                    const running = queue.queue_running || [];
                    const current = running.find(item => item[1] === promptId);
                    if (current) {
                        setProgress(50);
                    }
                }
            } catch (e) {
                // network hiccup, retry
            }

            await new Promise(r => setTimeout(r, 1000));
        }

        throw new Error('生图超时（5分钟）');
    }

    let lastBeforeImage = null;
    let lastAfterImage = null;

    async function fetchResult(promptId) {
        for (let attempt = 0; attempt < 5; attempt++) {
            const history = await apiGet(`/history/${promptId}`);
            const outputs = history[promptId]?.outputs;
            if (!outputs) { await new Promise(r => setTimeout(r, 1000)); continue; }

            let mainImage = null;
            let beforeImage = null;
            let previewImage = null;

            for (const nodeId of Object.keys(outputs)) {
                const nodeOutput = outputs[nodeId];
                if (nodeOutput.images && nodeOutput.images.length > 0) {
                    for (const img of nodeOutput.images) {
                        const url = `${getServer()}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${img.type || 'output'}`;
                        if (img.filename.startsWith('CN_Preview')) {
                            previewImage = url;
                        } else if (img.filename.startsWith('CW_Before')) {
                            beforeImage = url;
                        } else {
                            mainImage = url;
                        }
                    }
                }
            }

            if (previewImage && dom.cnProcessedImg) {
                dom.cnProcessedImg.src = previewImage;
                dom.cnProcessedPreview.classList.remove('hidden');
            }

            lastBeforeImage = beforeImage;
            lastAfterImage = mainImage;

            if (mainImage) {
                showResult(mainImage, !!beforeImage);
                return;
            }
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    function showResult(url, hasCompare) {
        dom.resultImage.src = url;
        dom.resultImage.classList.remove('hidden');
        dom.resultPlaceholder.classList.add('hidden');
        dom.resultActions.classList.remove('hidden');
        dom.btnCompare.classList.toggle('hidden', !hasCompare);
        updateMobileResultUI(true);
    }

    // ==================== 图片对比滑块 ====================
    function openCompare() {
        if (!lastBeforeImage || !lastAfterImage) return;
        dom.compareBefore.src = lastBeforeImage;
        dom.compareAfter.src = lastAfterImage;
        dom.modalCompare.classList.remove('hidden');
        setComparePosition(50);
    }

    function setComparePosition(pct) {
        pct = Math.max(0, Math.min(100, pct));
        dom.compareBefore.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        dom.compareSlider.style.left = pct + '%';
    }

    function setupCompareSlider() {
        function getPercent(e) {
            const rect = dom.compareContainer.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            return ((clientX - rect.left) / rect.width) * 100;
        }

        dom.compareContainer.addEventListener('mousemove', (e) => {
            setComparePosition(getPercent(e));
        });
        dom.compareContainer.addEventListener('touchmove', (e) => {
            setComparePosition(getPercent(e));
        }, { passive: true });
    }

    function setProgress(pct) {
        dom.progressBar.style.width = pct + '%';
        dom.progressText.textContent = pct + '%';
    }

    // ==================== 历史管理 ====================
    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem('comfyui_history') || '[]');
        } catch {
            return [];
        }
    }

    function saveToHistory(url) {
        const history = getHistory();
        history.unshift({ url, time: Date.now() });
        if (history.length > 50) history.length = 50;
        localStorage.setItem('comfyui_history', JSON.stringify(history));
        renderHistory();
    }

    function clearHistory() {
        localStorage.removeItem('comfyui_history');
        renderHistory();
    }

    function renderHistory() {
        const history = getHistory();
        dom.historyGrid.innerHTML = '';
        history.forEach((item) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = '历史图片';
            img.loading = 'lazy';
            div.appendChild(img);
            const overlay = document.createElement('div');
            overlay.className = 'history-overlay';
            overlay.innerHTML = '<button class="btn-history-ref" title="用作参考图">📌</button>';
            overlay.querySelector('.btn-history-ref').addEventListener('click', (e) => {
                e.stopPropagation();
                useImageAsRef(item.url);
            });
            div.appendChild(overlay);
            div.addEventListener('click', () => {
                dom.previewImage.src = item.url;
                dom.modalPreview.classList.remove('hidden');
            });
            dom.historyGrid.appendChild(div);
        });
    }

    // ==================== ControlNet 预览 ====================
    async function previewControlNet() {
        if (!dom.inpCnImage.files[0]) {
            alert('请先上传控制图片');
            return;
        }

        dom.btnCnPreview.disabled = true;
        dom.btnCnPreview.textContent = '处理中...';

        try {
            const uploaded = await uploadImage(dom.inpCnImage.files[0]);
            const cnName = dom.selControlnet.value.toLowerCase();

            let prepClass = 'CannyEdgePreprocessor';
            let prepInputs = { image: ['1', 0] };

            if (cnName.includes('openpose')) {
                prepClass = 'OpenposePreprocessor';
                prepInputs = { image: ['1', 0] };
            } else if (cnName.includes('depth')) {
                prepClass = 'DepthAnythingV2Preprocessor';
                prepInputs = { image: ['1', 0] };
            } else if (cnName.includes('scribble') || cnName.includes('lineart')) {
                prepClass = 'LineArtPreprocessor';
                prepInputs = { image: ['1', 0] };
            }

            const workflow = {
                prompt: {
                    '1': { class_type: 'LoadImage', inputs: { image: uploaded.name } },
                    '2': { class_type: prepClass, inputs: prepInputs },
                    '3': { class_type: 'SaveImage', inputs: { filename_prefix: 'CN_Preview', images: ['2', 0] } },
                },
            };

            const result = await apiPost('/prompt', workflow);
            const promptId = result.prompt_id;

            // Poll until done
            for (let i = 0; i < 60; i++) {
                await new Promise(r => setTimeout(r, 500));
                const hist = await apiGet(`/history/${promptId}`);
                if (hist[promptId]?.outputs) {
                    const outputs = hist[promptId].outputs;
                    for (const nid of Object.keys(outputs)) {
                        if (outputs[nid].images?.length > 0) {
                            const img = outputs[nid].images[0];
                            const url = `${getServer()}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${img.type || 'output'}`;
                            dom.cnProcessedImg.src = url;
                            dom.cnProcessedPreview.classList.remove('hidden');
                            return;
                        }
                    }
                }
            }
            alert('预览超时');
        } catch (e) {
            alert('预览失败: ' + e.message);
        } finally {
            dom.btnCnPreview.disabled = false;
            dom.btnCnPreview.textContent = '🔍 预览底图';
        }
    }

    // ==================== 事件绑定 ====================
    function bindEvents() {
        dom.btnGenerate.addEventListener('click', generateDispatch);

        dom.btnRandomSeed.addEventListener('click', () => {
            dom.inpSeed.value = Math.floor(Math.random() * 2 ** 32);
        });

        dom.btnDownload.addEventListener('click', () => {
            const url = dom.resultImage.src;
            if (!url) return;
            const a = document.createElement('a');
            a.href = url;
            a.download = `comfyui_${Date.now()}.png`;
            a.click();
        });

        dom.btnSendToHistory.addEventListener('click', () => {
            const url = dom.resultImage.src;
            if (url) saveToHistory(url);
        });

        dom.btnClearHistory.addEventListener('click', () => {
            if (confirm('确定清空所有历史记录？')) clearHistory();
        });

        // Tutorial modal
        dom.btnTutorial.addEventListener('click', () => {
            dom.modalTutorial.classList.remove('hidden');
        });
        dom.btnCloseTutorial.addEventListener('click', () => {
            dom.modalTutorial.classList.add('hidden');
        });
        dom.modalTutorial.addEventListener('click', (e) => {
            if (e.target === dom.modalTutorial) dom.modalTutorial.classList.add('hidden');
        });

        setupTutorialDownloads();

        // Settings modal
        dom.btnSettings.addEventListener('click', () => {
            dom.inpServer.value = getComfyUIAddress();
            const admInput = document.getElementById('inp-admin-key');
            const admStatus = document.getElementById('admin-status');
            if (admInput) admInput.value = sessionStorage.getItem('_adm') || '';
            if (admStatus) admStatus.style.display = sessionStorage.getItem('_adm') ? 'block' : 'none';
            dom.modalSettings.classList.remove('hidden');
        });

        dom.btnSaveSettings.addEventListener('click', () => {
            const url = dom.inpServer.value.trim();
            if (!url) return;
            setComfyUIAddress(url);
            const admKey = document.getElementById('inp-admin-key')?.value.trim();
            if (admKey) {
                sessionStorage.setItem('_adm', admKey);
                showToast('管理员模式已激活');
                const vcRow = document.getElementById('nai-videocode-row');
                if (vcRow) vcRow.style.display = 'none';
            } else {
                sessionStorage.removeItem('_adm');
            }
            dom.modalSettings.classList.add('hidden');
            init();
        });

        dom.btnCancelSettings.addEventListener('click', () => {
            dom.modalSettings.classList.add('hidden');
        });

        // Preview modal
        dom.btnClosePreview.addEventListener('click', () => {
            dom.modalPreview.classList.add('hidden');
        });

        dom.modalPreview.addEventListener('click', (e) => {
            if (e.target === dom.modalPreview) dom.modalPreview.classList.add('hidden');
        });

        dom.modalSettings.addEventListener('click', (e) => {
            if (e.target === dom.modalSettings) dom.modalSettings.classList.add('hidden');
        });

        // Compare slider
        dom.btnCompare.addEventListener('click', openCompare);
        dom.btnCloseCompare.addEventListener('click', () => {
            dom.modalCompare.classList.add('hidden');
        });
        dom.modalCompare.addEventListener('click', (e) => {
            if (e.target === dom.modalCompare) dom.modalCompare.classList.add('hidden');
        });
        setupCompareSlider();

        // Use as reference image
        dom.btnUseAsRef.addEventListener('click', () => {
            const url = dom.resultImage.src;
            if (url) useImageAsRef(url);
        });

        dom.btnPreviewRef.addEventListener('click', () => {
            const url = dom.previewImage.src;
            if (url) useImageAsRef(url);
        });

        dom.btnPreviewDownload.addEventListener('click', () => {
            const url = dom.previewImage.src;
            if (!url) return;
            const a = document.createElement('a');
            a.href = url;
            a.download = `comfyui_${Date.now()}.png`;
            a.click();
        });

        // Regional prompt
        dom.btnAddRegion.addEventListener('click', () => addRegionRow());
        document.querySelectorAll('.btn-preset').forEach(btn => {
            btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
        });

        // LoRA add button
        dom.btnAddLora.addEventListener('click', addLoraRow);

        // ControlNet model description
        dom.selControlnet.addEventListener('change', updateCnDesc);
        function updateCnDesc() {
            const name = dom.selControlnet.value.toLowerCase();
            const descs = {
                'canny': '🖊️ Canny: 提取图片边缘轮廓，精确控制线条走向',
                'openpose': '🤸 OpenPose: 检测人体骨架姿势，控制人物动作',
                'depth': '🏔️ Depth: 生成深度图，控制画面前后远近关系',
                'scribble': '✏️ Scribble: 把涂鸦/草图转为精细图片',
                'lineart': '📐 Lineart: 把线稿转为上色成品',
                'tile': '🔍 Tile: 保持细节增强/放大修复',
            };
            let desc = '';
            for (const [key, val] of Object.entries(descs)) {
                if (name.includes(key)) { desc = val; break; }
            }
            dom.cnModelDesc.textContent = desc;
        }

        // File previews
        setupFilePreview(dom.inpCnImage, dom.cnUploadImg, dom.cnUploadPreview);
        setupFilePreview(dom.inpRefImage, dom.refPreview, dom.refPreviewContainer);

        // ControlNet preview button
        dom.btnCnPreview.addEventListener('click', previewControlNet);

        // Ctrl+Enter shortcut
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!dom.btnGenerate.disabled) generateDispatch();
            }
        });
    }

    // ==================== 通配符系统 ====================
    function getWildcardCategories() {
        const cats = [];
        tagData.forEach(group => {
            group.subgroups.forEach(sub => {
                if (sub.tags.length > 0) {
                    cats.push({
                        group: group.name,
                        name: sub.name,
                        tags: sub.tags.map(t => t.t),
                    });
                }
            });
        });
        return cats;
    }

    function renderWildcardPanel() {
        const list = document.getElementById('wildcard-list');
        const search = document.getElementById('wildcard-search');
        if (!list) return;

        const cats = getWildcardCategories();
        const query = (search?.value || '').toLowerCase();

        list.innerHTML = '';
        let lastGroup = '';
        cats.forEach(cat => {
            if (query && !cat.name.toLowerCase().includes(query) && !cat.group.toLowerCase().includes(query)) return;

            if (cat.group !== lastGroup) {
                lastGroup = cat.group;
                const label = document.createElement('div');
                label.className = 'wildcard-group-label';
                label.textContent = cat.group;
                list.appendChild(label);
            }

            const item = document.createElement('span');
            item.className = 'wildcard-item';
            item.textContent = cat.name;
            item.title = `${cat.tags.length} 个选项 — 点击插入 __${cat.name}__`;
            item.addEventListener('click', () => {
                insertWildcard(cat.name);
            });
            list.appendChild(item);
        });
    }

    function insertWildcard(name) {
        const textarea = dom.txtPositive;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const insert = `__${name}__`;

        const before = text.substring(0, start);
        const after = text.substring(end);
        const needComma = before.length > 0 && !before.endsWith(', ') && !before.endsWith(',');
        textarea.value = before + (needComma ? ', ' : '') + insert + after;
        textarea.focus();

        const newPos = start + (needComma ? 2 : 0) + insert.length;
        textarea.setSelectionRange(newPos, newPos);

        updateWildcardHint();
    }

    function resolveWildcards(text) {
        const cats = getWildcardCategories();
        const custom = getCustomWildcards();
        const anima = isAnimaMode();
        return text.replace(/__(.+?)__/g, (match, name) => {
            const customCat = custom.find(c => c.name === name);
            if (customCat && customCat.values.length > 0) {
                const val = customCat.values[Math.floor(Math.random() * customCat.values.length)];
                return anima ? formatAnimaTag(val) : val;
            }
            const cat = cats.find(c => c.name === name);
            if (!cat || cat.tags.length === 0) return match;
            const tag = cat.tags[Math.floor(Math.random() * cat.tags.length)];
            if (anima) {
                const isArtist = cat.group?.includes('画师');
                return isArtist ? formatAnimaArtistTag(tag) : formatAnimaTag(tag);
            }
            return tag;
        });
    }

    function updateWildcardHint() {
        const hint = document.getElementById('wildcard-hint');
        if (!hint) return;
        const text = dom.txtPositive.value;
        const matches = text.match(/__(.+?)__/g);
        if (matches && matches.length > 0) {
            hint.textContent = `🎲 检测到 ${matches.length} 个通配符: ${matches.join(', ')} — 生成时自动随机替换`;
            hint.classList.remove('hidden');
        } else {
            hint.classList.add('hidden');
        }
    }

    // Custom wildcards (stored in localStorage)
    function getCustomWildcards() {
        try {
            return JSON.parse(localStorage.getItem('custom_wildcards') || '[]');
        } catch { return []; }
    }

    function saveCustomWildcards(list) {
        localStorage.setItem('custom_wildcards', JSON.stringify(list));
    }

    function addCustomWildcard(name, values) {
        if (!name || values.length === 0) return;
        const list = getCustomWildcards();
        const existing = list.findIndex(w => w.name === name);
        if (existing >= 0) {
            list[existing].values = values;
        } else {
            list.push({ name, values });
        }
        saveCustomWildcards(list);
        renderCustomWildcardList();
    }

    function removeCustomWildcard(name) {
        const list = getCustomWildcards().filter(w => w.name !== name);
        saveCustomWildcards(list);
        renderCustomWildcardList();
    }

    function renderCustomWildcardList() {
        const container = document.getElementById('wc-custom-list');
        if (!container) return;
        const list = getCustomWildcards();
        container.innerHTML = '';
        list.forEach(wc => {
            const item = document.createElement('div');
            item.className = 'wc-custom-item';
            item.innerHTML = `
                <span class="wc-name" title="点击插入 __${wc.name}__">${wc.name}</span>
                <span class="wc-count">${wc.values.length} 项</span>
                <button class="wc-remove" title="删除">✕</button>
            `;
            item.querySelector('.wc-name').addEventListener('click', () => insertWildcard(wc.name));
            item.querySelector('.wc-remove').addEventListener('click', () => removeCustomWildcard(wc.name));
            container.appendChild(item);
        });
    }

    function setupWildcard() {
        const btn = document.getElementById('btn-wildcard');
        const panel = document.getElementById('wildcard-panel');
        const search = document.getElementById('wildcard-search');
        const wcTabs = panel?.querySelectorAll('.wildcard-tabs .tab');
        const listEl = document.getElementById('wildcard-list');
        const customEl = document.getElementById('wildcard-custom');
        if (!btn || !panel) return;

        btn.addEventListener('click', () => {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                renderWildcardPanel();
                renderCustomWildcardList();
            }
        });

        wcTabs?.forEach(tab => {
            tab.addEventListener('click', () => {
                wcTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const isBuiltin = tab.dataset.wcTab === 'builtin';
                listEl?.classList.toggle('hidden', !isBuiltin);
                customEl?.classList.toggle('hidden', isBuiltin);
                if (isBuiltin) renderWildcardPanel();
                else renderCustomWildcardList();
            });
        });

        if (search) {
            let debounce;
            search.addEventListener('input', () => {
                clearTimeout(debounce);
                debounce = setTimeout(renderWildcardPanel, 200);
            });
        }

        // Add custom wildcard
        document.getElementById('btn-wc-add')?.addEventListener('click', () => {
            const nameEl = document.getElementById('wc-custom-name');
            const valEl = document.getElementById('wc-custom-values');
            const name = nameEl.value.trim();
            const values = valEl.value.split('\n').map(s => s.trim()).filter(Boolean);
            if (name && values.length > 0) {
                addCustomWildcard(name, values);
                nameEl.value = '';
                valEl.value = '';
            }
        });

        // Import txt file
        document.getElementById('inp-wc-import')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const name = file.name.replace(/\.txt$/i, '');
            const reader = new FileReader();
            reader.onload = (ev) => {
                const values = ev.target.result.split('\n').map(s => s.trim()).filter(Boolean);
                if (values.length > 0) {
                    addCustomWildcard(name, values);
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        dom.txtPositive.addEventListener('input', updateWildcardHint);
    }

    // ==================== 收藏 & 使用记忆系统 ====================
    const FavManager = {
        _KEY: 'comfyui_fav_tags',
        _list: null,
        _load() { if (!this._list) this._list = JSON.parse(localStorage.getItem(this._KEY) || '[]'); return this._list; },
        _save() { localStorage.setItem(this._KEY, JSON.stringify(this._list)); },
        getAll() { return this._load(); },
        has(tagText) { return this._load().some(f => f.t === tagText); },
        add(tag) {
            const list = this._load();
            if (list.some(f => f.t === tag.t)) return;
            list.unshift({ t: tag.t, d: tag.d || '', th: tag.th || '', tags: tag.tags || [], lora: tag.lora || '', type: tag.th ? (tag.img ? 'artist' : 'character') : 'tag', addedAt: Date.now() });
            if (list.length > 500) list.length = 500;
            this._save();
        },
        remove(tagText) {
            const list = this._load();
            const idx = list.findIndex(f => f.t === tagText);
            if (idx >= 0) { list.splice(idx, 1); this._save(); }
        },
        toggle(tag) { this.has(tag.t) ? this.remove(tag.t) : this.add(tag); },
        clear() { this._list = []; this._save(); },
    };

    const UsageTracker = {
        _KEY: 'comfyui_tag_usage',
        _data: null,
        _load() { if (!this._data) this._data = JSON.parse(localStorage.getItem(this._KEY) || '{}'); return this._data; },
        _save() { localStorage.setItem(this._KEY, JSON.stringify(this._data)); },
        record(tagText, desc, thumb, type) {
            const data = this._load();
            if (!data[tagText]) data[tagText] = { d: desc || '', th: thumb || '', count: 0, last: 0 };
            data[tagText].count++;
            data[tagText].last = Date.now();
            if (desc) data[tagText].d = desc;
            if (thumb) data[tagText].th = thumb;
            if (type) data[tagText].type = type;
            const keys = Object.keys(data);
            if (keys.length > 1000) {
                keys.sort((a, b) => data[a].last - data[b].last);
                keys.slice(0, keys.length - 800).forEach(k => delete data[k]);
            }
            this._save();
        },
        getRecent(limit = 100) {
            const data = this._load();
            return Object.entries(data)
                .sort((a, b) => b[1].last - a[1].last)
                .slice(0, limit)
                .map(([t, v]) => ({ t, d: v.d, th: v.th, type: v.type || 'tag', _count: v.count, _last: v.last }));
        },
        getFrequent(limit = 100) {
            const data = this._load();
            return Object.entries(data)
                .sort((a, b) => b[1].count - a[1].count || b[1].last - a[1].last)
                .slice(0, limit)
                .map(([t, v]) => ({ t, d: v.d, th: v.th, type: v.type || 'tag', _count: v.count, _last: v.last }));
        },
        getCount(tagText) { return (this._load()[tagText] || {}).count || 0; },
        clear() { this._data = {}; this._save(); },
    };

    const _VIRTUAL_TABS = [
        { name: '⭐ 收藏', _virtual: 'fav' },
        { name: '🕐 最近', _virtual: 'recent' },
        { name: '🔥 常用', _virtual: 'frequent' },
    ];

    // ==================== 标签选择器（双面板） ====================
    const _SERIES_CN = {"Fate":"命运","Honkai":"崩坏","LoveLive":"LoveLive!","Nijisanji":"彩虹社","Jojo No Kimyou Na Bouken":"JOJO的奇妙冒险","Precure":"光之美少女","Fate/grand Order":"命运-冠位指定","Kemono Friends":"兽娘动物园","Gundam":"高达","Splatoon":"喷射战士","Lyrical Nanoha":"魔法少女奈叶","The Legend Of Zelda":"塞尔达传说","Boku No Hero Academia":"我的英雄学院","Suzumiya Haruhi No Yuuutsu":"凉宫春日的忧郁","Toaru Majutsu No Index":"魔法禁书目录","Mario":"马力欧","Bishoujo Senshi Sailor Moon":"美少女战士","Touken Ranbu":"刀剑乱舞","Xenoblade Chronicles":"异度神剑","Street Fighter":"街头霸王","BanG Dream":"BanG Dream!","World Witches Series":"强袭魔女","Tales Of":"传说系列","Project Moon":"月亮计划","Omori":"奥日","Guilty Gear":"罪恶装备","Overwatch":"守望先锋","Indie Virtual Youtuber":"独立虚拟主播","Umineko No Naku Koro Ni":"海猫鸣泣之时","Gochuumon Wa Usagi Desu Ka?":"请问您今天要来点兔子吗？","Shingeki No Kyojin":"进击的巨人","Ragnarok Online":"仙境传说","Project Sekai":"世界计划 缤纷舞台！","Re:Zero":"Re:从零开始的异世界生活","Voiceroid":"VOICEROID","Monogatari":"物语系列","Marvel":"漫威","Dragon Quest":"勇者斗恶龙","Kirby":"星之卡比","Code Geass":"反叛的鲁路修","Lucky Star":"幸运星","Mega Man":"洛克人","Sonic":"索尼克","Tengen Toppa Gurren Lagann":"天元突破红莲螺岩","Higurashi No Naku Koro Ni":"寒蝉鸣泣之时","Neptune":"海王星","Digimon":"数码宝贝","Saibou Shinkyoku":"细胞神曲","Inazuma Eleven":"闪电十一人","Blazblue":"苍翼默示录","Bleach":"境·界","Tokyo Afterschool Summoners":"东京放课后召唤师","Macross":"超时空要塞","Rwby":"RWBY","Tiger & Bunny":"老虎和兔子","Tsukihime":"月姬","Rozen Maiden":"蔷薇少女","Go-toubun No Hanayome":"五等分的新娘","Osomatsu-san":"阿松","Assault Lily":"突击莉莉","Yuru Yuri":"摇曳百合","Onii-chan Wa Oshimai!":"别当欧尼酱了！","Axis Powers Hetalia":"黑塔利亚","Utau":"UTAU","Apex Legends":"Apex英雄","Saki":"天才麻将少女","Elsword":"艾尔之光","The King Of Fighters":"拳皇","Vampire (game)":"恶魔战士","Watashi Ga Motenai No Wa Dou Kangaetemo Omaera Ga Warui!":"我不受欢迎，怎么想都是你们的错！","Cardcaptor Sakura":"魔卡少女樱","Kamen Rider":"假面骑士","Dc Comics":"DC漫画","Senran Kagura":"闪乱神乐","Ensemble Stars!":"偶像梦幻祭","Little Busters!":"小小克星！","Punishing: Gray Raven":"战双帕弥什","Queen's Blade":"女王之刃","Helltaker":"地狱把妹王","Kagerou Project":"阳炎计划","Atelier":"工作室系列","Ace Attorney":"逆转裁判","Hibike! Euphonium":"吹响！上低音号","Pretty Series":"美妙系列","Gridman Universe":"古立特宇宙","Eiyuu Densetsu":"英雄传说","Girls Band Cry":"GIRLS BAND CRY","Monster Hunter":"怪物猎人","Disgaea":"魔界战记","Ore No Imouto Ga Konna Ni Kawaii Wake Ga Nai":"我的妹妹哪有这么可爱！","Aikatsu!":"偶像活动！","To Heart":"同班同学","Nanashi Inc.":"ななしinc.","Clannad":"CLANNAD","Resident Evil":"生化危机","To Love-ru":"出包王女","Fullmetal Alchemist":"钢之炼金术师","Panty & Stocking With Garterbelt":"吊带袜天使","Ranma 1/2":"乱马1/2","Kingdom Hearts":"王国之心","Skullgirls":"骷髅女孩","One-punch Man":"一拳超人","Undertale":"传说之下","Last Origin":"最后生还者","Hunter X Hunter":"全职猎人","Vshojo":"VShojo","Gintama":"银魂","Len'en":"连缘","Vspo!":"VSPO!","Metroid":"银河战士","Twisted Wonderland":"扭曲仙境","Yuri!!! On Ice":"冰上的尤里","Puyopuyo":"噗よ噗よ","Houseki No Kuni":"宝石之国","Golden Kamuy":"黄金神威","Sekaiju No Meikyuu":"世界树的迷宫","Little Witch Academia":"小魔女学园","Dead Or Alive":"死或生","Kaguya-sama Wa Kokurasetai ~tensai-tachi No Renai Zunousen~":"辉夜大小姐想让我告白","Black Rock Shooter":"黑岩射手","Machikado Mazoku":"街角魔族","Zombie Land Saga":"佐贺偶像是传奇","Tekken":"铁拳","Touqi Guaitan":"头七怪谈","Pikmin":"皮克敏","Gakuen Idolmaster":"学园偶像大师","Yurucamp":"摇曳露营","Amagami":"圣诞之吻","Warship Girls R":"战舰少女R","Transformers":"变形金刚","Mahou Sensei Negima!":"魔法老师","Sono Bisque Doll Wa Koi Wo Suru":"更衣人偶坠入爱河","Gegege No Kitarou":"鬼太郎","Yahari Ore No Seishun Lovecome Wa Machigatteiru.":"我的青春恋爱物语果然有问题。","Maria-sama Ga Miteru":"圣母在上","Alice In Wonderland":"爱丽丝梦游仙境","Os-tan":"OS娘","Toradora!":"龙与虎","Hyouka":"冰菓","Dungeon Ni Deai Wo Motomeru No Wa Machigatteiru Darou Ka":"在地下城寻求邂逅是否搞错了什么","Fatal Fury":"饿狼传说","Needy Girl Overdose":"主播女孩重度依赖","Luo Xiaohei Zhanji":"罗小黑战记","Shoujo Kageki Revue Starlight":"少女☆歌剧 Revue Starlight","Dokidoki! Precure":"心跳！光之美少女","Sayonara Zetsubou Sensei":"再见！绝望先生","Zero No Tsukaima":"零之使魔","Infinite Stratos":"IS〈Infinite Stratos〉","Monster Musume No Iru Nichijou":"魔物娘的同居日常","Meitantei Conan":"名侦探柯南","Aria (manga)":"水星领航员","Puzzle & Dragons":"智龙迷城","Chuunibyou Demo Koi Ga Shitai!":"中二病也要谈恋爱！","Star Ocean":"星之海洋","Fairy Tail":"妖精的尾巴","Doki Doki Literature Club":"心跳文学部","Haikyuu!!":"排球少年！！","Senpai Ga Uzai Kouhai No Hanashi":"关于前辈很烦人的事","Dark Souls":"黑暗之魂","Animal Crossing":"动物森友会","Boku Wa Tomodachi Ga Sukunai":"我的朋友很少","Working!!":"迷糊餐厅","Sanrio":"三丽鸥","Path To Nowhere":"无期迷途","Durarara!!":"无头骑士异闻录","Happinesscharge Precure!":"Happinesscharge光之美少女！","Shakugan No Shana":"灼眼的夏娜","Nitroplus":"Nitro+","Hidamari Sketch":"向阳素描","Kid Icarus":"光神话 帕尔提娜之镜","Eromanga Sensei":"埃罗芒阿老师","Nichijou":"日常","Phantasy Star":"梦幻之星","Yume Nikki":"梦日记","Devil May Cry":"鬼泣","Metal Gear":"合金装备","Azumanga Daioh":"阿滋漫画大王","Dungeon And Fighter":"地下城与勇士","Tokyo Ghoul":"东京喰种","Kamitsubaki Studio":"神椿工作室","Yuuki Bakuhatsu Bang Bravern":"勇气爆发Bang Bravern","Cyberpunk":"赛博朋克","Spice And Wolf":"狼与香辛料","Super Robot Wars":"超级机器人大战","Cookie (touhou)":"Cookie☆","Little Nuns (diva)":"小修女(diva)","Mahou Shoujo No Majo Saiban":"魔法少女的魔女审判","Kirakira Precure A La Mode":"光之美少女：食尚甜心","Promare":"普罗米亚","Kara No Kyoukai":"空之境界","My Little Pony":"小马宝莉","Urusei Yatsura":"福星小子","Mob Psycho 100":"灵能百分百","Mahjong Soul":"雀魂","Kill Me Baby":"爱杀宝贝","Hayate No Gotoku!":"旋风管家！","Mahou Shoujo Ni Akogarete":"憧憬成为魔法少女","Baldur's Gate":"博德之门","Breath Of Fire":"火焰之息","Monster Girl Encyclopedia":"魔物娘图鉴","Youkai Watch":"妖怪手表","New Game!":"NEW GAME!","Samurai Spirits":"侍魂","Mahou Girls Precure!":"魔法使光之美少女！","Star Wars":"星球大战","Warhammer 40k":"战锤40K","Delicious Party Precure":"美味派对♡光之美少女","Among Us":"在我们之中","Sakura Taisen":"樱花大战","Soul Eater":"噬魂师","Bloodborne":"血源诅咒","Overlord (maruyama)":"Overlord","Watashi Ni Tenshi Ga Maiorita!":"天使降临到了我身边！","Muv-luv":"Muv-Luv","Wild Arms":"荒野兵器","Utawarerumono":"传颂之物","Saenai Heroine No Sodatekata":"路人女主的养成方法","Inuyasha":"犬夜叉","Hataraku Saibou":"工作细胞","Team Fortress 2":"军团要塞2","Mawaru Penguindrum":"回转企鹅罐","Go! Princess Precure":"Go! Princess光之美少女","Berserk":"剑风传奇","Darker Than Black":"黑之契约者","Avatar Legends":"降世神通：传奇","Aldnoah.zero":"ALDNOAH.ZERO","Ano Hi Mita Hana No Namae Wo Bokutachi Wa Mada Shiranai.":"我们仍未知道那天所看见的花的名字。","Shinryaku! Ikamusume":"侵略！乌贼娘","Komi-san Wa Komyushou Desu":"古见同学有交流障碍症","Seiken Densetsu":"圣剑传说","Taimanin":"对魔忍","Kin-iro Mosaic":"黄金拼图","Heaven Burns Red":"绯染天空","Sengoku Basara":"战国BASARA","Ikkitousen":"一骑当千","Aoki Hagane No Arpeggio":"苍蓝钢铁的琶音","Pani Poni Dash!":"不可思议的教室","Lord Of The Mysteries":"诡秘之主","Magi The Labyrinth Of Magic":"魔奇少年","Air (visual Novel)":"AIR","Tamako Market":"玉子市场","Poptepipic":"POP TEAM EPIC","Dorohedoro":"异兽魔都","Frozen (disney)":"冰雪奇缘","Slam Dunk":"灌篮高手","Godzilla":"哥斯拉","Soulcalibur":"灵魂能力","Tate No Yuusha No Nariagari":"盾之勇者成名录","Closers":"封印者","My-hime":"舞-HiME","Minecraft":"我的世界","Call Of Duty":"使命召唤","Sekai Seifuku: Bouryaku No Zvezda":"世界征服：谋略之星","World Trigger":"境界触发者","Yuusha De Aru":"结城友奈是勇者","Gensou Suikoden":"幻想水浒传","Real Life":"现实生活","Nekopara":"巧克力与香子兰","Dragon's Crown":"龙之皇冠","Galaxy Angel":"银河天使","Tears Of Themis":"未定事件簿","Amagi Brilliant Park":"甘城光辉游乐园","Cinderella Series":"灰姑娘系列","Hazbin Hotel":"地狱客栈","Gekkan Shoujo Nozaki-kun":"月刊少女野崎君","Katekyo Hitman Reborn!":"家庭教师HITMAN REBORN!","Pangya":"魔法飞球","Chrono Trigger":"时空之轮","Chrono Cross":"穿越时空","Uzaki-chan Wa Asobitai!":"宇崎学妹想要玩！","Guilty Crown":"罪恶王冠","Nagi No Asukara":"来自风平浪静的明天","Nu Carnival":"新世界狂欢","Scott Pilgrim":"斯科特·皮尔格林","Identity V":"第五人格","Ryuuou No Oshigoto!":"龙王的工作！","Keroro Gunsou":"Keroro军曹","Alice Gear Aegis":"机战少女Alice","God Eater":"噬神者","Heartcatch Precure!":"Heartcatch光之美少女！","Xenosaga":"异度传说","Little Red Riding Hood":"小红帽","Voicevox":"VOICEVOX","Ijiranaide Nagatoro-san":"不要欺负我，长瀞同学","Healin' Good Precure":"Healin' Good♥光之美少女","Black Lagoon":"黑礁","Koihime Musou":"恋姬†无双","Va-11 Hall-a":"VA-11 HALL-A","Trigun":"枪神","Warioware":"瓦力欧制造","Katawa Shoujo":"残疾少女","Shantae":"桑塔","My-otome":"舞-乙HiME","Ichigo Mashimaro":"草莓棉花糖","Adventure Time":"探险活宝","Shin Megami Tensei":"真·女神转生","Mahou Tsukai No Yoru":"魔法使之夜","Sinoalice":"死亡爱丽丝","Cowboy Bebop":"星际牛仔","Kuroko No Basuke":"黑子的篮球","South Park":"南方公园","Goblin Slayer!":"哥布林杀手！","Karakai Jouzu No Takagi-san":"擅长捉弄的高木同学","Doraemon":"哆啦A梦","Shoujo Shuumatsu Ryokou":"少女终末旅行","Slayers":"秀逗魔导士","Gabriel Dropout":"珈百璃的堕落","Mother 2":"地球冒险2","Kyoukaisenjou No Horizon":"境界线上的地平线","Death Note":"死亡笔记","Boku No Kokoro No Yabai Yatsu":"我心里危险的东西","Mega Man (classic)":"洛克人元祖","Kaiji":"赌博默示录","Gyee":"盖伊传说","Tokyo 7th Sisters":"东京 7th Sisters","Kannagi":"神薙","Warcraft":"魔兽","Under Night In-birth":"夜下降生","Journey To The West":"西游记",".live":".LIVE","Yama No Susume":"向山进发","Dog Days":"DOG DAYS","Love Plus":"爱相随","Re:stage!":"Re:Stage!","Denonbu":"电音部","Bayonetta":"猎天使魔女","Kimi No Na Wa.":"你的名字。","Jashin-chan Dropkick":"邪神与厨二病少女","Blue Lock":"蓝色监狱","Hollow Knight":"空洞骑士","Shoujo Kakumei Utena":"少女革命","Shokugeki No Souma":"食戟之灵","Eureka Seven":"交响诗篇","Shirobako":"白箱","Minecraft Youtube":"我的世界YouTube","Nier:automata":"尼尔：自动人形","Dagashi Kashi":"粗点心战争","Hellsing":"皇家国教骑士团","Tera Online":"TERA","Tokyo Revengers":"东京复仇者","Kami Nomi Zo Shiru Sekai":"只有神知道的世界","Shuffle!":"SHUFFLE!","Mother (game)":"地球冒险","Lupin Iii":"鲁邦三世","Miraculous Ladybug":"瓢虫雷迪","Ghost In The Shell":"攻壳机动队","Castlevania":"恶魔城","Sakura No Sekai":"樱之世界","Seishun Buta Yarou":"青春猪头少年","Silent Hill":"寂静岭","Tenchi Muyou!":"天地无用！","Gakkou Gurashi!":"学园孤岛！","Onmyoji":"阴阳师","Minami-ke":"南家三姐妹","Mon-musu Quest!":"魔物娘☆后宫","Idolish7":"IDOLiSH7","The Amazing Digital Circus":"神奇数字马戏团","Ar Tonelico":"魔塔大陆","Saint Seiya":"圣斗士星矢","Live A Hero":"LIVE A HERO","Powerpuff Girls Z":"飞天小女警Z","Zannen Onna-kanbu Black General-san":"残念女干部布莱克将军","Harry Potter":"哈利·波特","Flower Knight Girl":"美少女花骑士","Ao No Exorcist":"青之驱魔师","Haiyore! Nyaruko-san":"潛行吧！奈亞子","Master Detective Archives: Rain Code":"超侦探事件簿 雾雨谜宫","Nanatsu No Taizai":"七大罪","Sono Hanabira Ni Kuchizuke Wo":"花吻在上","Alchemy Stars":"白夜极光","Idoly Pride":"IDOLY PRIDE","Tensei Oujo To Tensai Reijou No Mahou Kakumei":"转生王女与天才千金的魔法革命","Girlfriend (kari)":"临时女友","Fushigi No Umi No Nadia":"蓝宝石之谜","Hirogaru Sky! Precure":"开阔天空！光之美少女","High School Fleet":"高校舰队","Dolphin Wave":"海豚波潮","Shugo Chara!":"守护甜心！","Arcana Heart":"圣灵之心","Yotsubato!":"四叶妹妹！","Uta No Prince-sama":"歌之☆王子殿下♪","Ryuu Ga Gotoku":"如龙","Octopath Traveler":"八方旅人","No Game No Life":"NO GAME NO LIFE 游戏人生","Shinrabanshou":"神罗万象","Cookie Run":"跑跑姜饼人","Agent Aika":"AIKa","Tokyo Mew Mew":"东京猫猫","Ganbare Douki-chan":"加油吧同期酱","Majo No Takkyuubin":"魔女宅急便","Tantei Opera Milky Holmes":"侦探歌剧 少女福尔摩斯","Kourin Tenshi En Ciel Rena":"光临天使En Ciel Rena","Aa Megami-sama":"我的女神","Non Non Biyori":"悠哉日常大王","Sennen Sensou Aigis":"千年战争Aigis","Senjou No Valkyria":"战场女武神","Nisekoi":"伪恋","School Rumble":"校园迷糊大王","Xenogears":"异度装甲","Yu Yu Hakusho":"幽游白书","Getsuyoubi No Tawawa":"星期一的丰满","Strawberry Panic!":"惊爆草莓","Ado (utaite)":"Ado","Aquarion":"创圣的大天使","7th Dragon":"七龙传说","Yagate Kimi Ni Naru":"终将成为你","Hades":"哈迪斯","Flcl":"FLCL","Da Capo":"初音岛","Blend S":"调教咖啡厅","Powerpuff Girls":"飞天小女警","Kimi Kiss":"君吻","Dispatch":"派勤","Mitsudomoe":"超元气三姐妹","Dennou Coil":"电脑线圈","Senren Banka":"千恋＊万花","Brave Witches":"勇气魔女","Kanojo Okarishimasu":"租借女友","Mabinogi":"洛奇","Juusan Kihei Bouei Ken":"十三机兵防卫圈","Odin Sphere":"奥丁领域","Gnosia":"GNOSIA","Genshiken":"现视研","Grandia":"格兰蒂亚","Ojamajo Doremi":"小魔女DoReMi","Tsurezure Children":"徒然喜欢你","Simoun":"西蒙","Kino No Tabi":"奇诺之旅","Mononoke Hime":"幽灵公主","Magic Knight Rayearth":"魔法骑士","Tokidoki Bosotto Roshia-go De Dereru Tonari No Alya-san":"时而孤独的俄语废材邻家艾莉同学","Majo No Tabitabi":"魔女之旅","Howl No Ugoku Shiro":"哈尔的移动城堡","Akuma No Riddle":"恶魔之谜","Mahou Shoujo Ikusei Keikaku":"魔法少女育成计划","Shin Sangoku Musou":"真·三国无双","Fatal Frame":"零系列","Shingeki No Bahamut":"巴哈姆特之怒","Love Hina":"纯情房东俏房客","Saga":"沙加","Sen To Chihiro No Kamikakushi":"千与千寻","Youkoso Jitsuryoku Shijou Shugi No Kyoushitsu E":"欢迎来到实力至上主义的教室","Lovebrush Chronicles":"时空中的绘旅人","Pretty Rhythm":"美妙旋律","Maoyuu Maou Yuusha":"魔王勇者","Sister Princess":"妹妹公主","Signalis":"信号","Nige Jouzu No Wakagimi":"擅长逃跑的殿下","Douluo Dalu":"斗罗大陆","Highschool Of The Dead":"学园默示录","Himouto! Umaru-chan":"干物妹！小埋","Make Heroine Ga Oo Sugiru!":"败犬女主太多了！","Voms":"VOMS","Hypnosis Mic":"催眠麦克风","Suigetsu":"水月","Rosario+vampire":"十字架与吸血鬼","The Owl House":"猫头鹰魔法社","Hataraku Maou-sama!":"打工吧！魔王大人","Tenka Hyakken":"天华百剑","Library Of Ruina":"废墟图书馆","D.gray-man":"驱魔少年","Ousama Ranking":"国王排名","Mcdonald's":"麦当劳","Tokimeki Memorial":"心跳回忆","Super Real Mahjong":"写真麻雀","Ano Natsu De Matteru":"在那个夏天等待","Funamusea":"海底囚人","Log Horizon":"记录的地平线","Brand New Animal":"BNA","Arms (game)":"ARMS","Tenshi Souzou Re-boot!":"天使创造Re-boot!","Charlotte (anime)":"Charlotte","Mirai Nikki":"未来日记","Inu X Boku Ss":"妖狐×仆SS","Fear & Hunger":"恐惧 & 饥饿","Yoru No Kurage Wa Oyogenai":"夜晚的水母不会游泳","Omniscient Reader's Viewpoint":"全知读者视角","Sword Girls":"剑之少女","Bombergirl":"炸弹女孩","Drag-on Dragoon":"龙背上的骑兵","Kage No Jitsuryokusha Ni Naritakute!":"想要成为影之实力者！","Magic Kaito":"魔术快斗","Tonari No Totoro":"龙猫","Kuroshitsuji":"黑执事","Shining":"光明系列","Super Heroine Boy":"超级女主角男孩","Violet Evergarden":"紫罗兰永恒花园","Ookami (game)":"大神","Quiz Magic Academy":"问答魔法学院","Beatmania Iidx":"狂热节拍IIDX","Accel World":"加速世界","Youjo Senki":"幼女战记","Strike The Blood":"噬血狂袭","Disney":"迪士尼","Uchuu Senkan Yamato":"宇宙战舰大和号","Eizouken Ni Wa Te Wo Dasu Na!":"别对映像研出手！","Baka To Test To Shoukanjuu":"笨蛋、测验、召唤兽","Given":"GIVEN","Metal Slug":"合金弹头","Dandadan":"DAN DA DAN","Super Smash Bros.":"任天堂明星大乱斗","Summon Night":"召唤之夜","Mermaid Melody Pichi Pichi Pitch":"人鱼的旋律","Full Metal Panic!":"全金属狂潮！","Hoozuki No Reitetsu":"鬼灯的冷彻","Valorant":"无畏契约","Soulworker":"灵魂武器","Rance":"兰斯","Hacka Doll":"骇客娃娃","Sora No Otoshimono":"天降之物","Danna Ga Nani Wo Itte Iru Ka Wakaranai Ken":"关于完全听不懂老公在说什么的事","Gravity Falls":"怪诞小镇","Star Fox":"星际火狐","Kodomo No Jikan":"萌少女的恋爱时光","Owari No Seraph":"终结的炽天使","Kidou Senkan Nadesico":"机动战舰抚子号","Final Fight":"快打旋风","Little Witch Nobeta":"小魔女诺贝塔","Musaigen No Phantom World":"无彩限的怪灵世界","Shadows House":"影宅","Gravity Daze":"重力异想世界","Magical Mirai (vocaloid)":"魔法未来","Black Survival":"黑色幸存者","Hokuto No Ken":"北斗神拳","Cafe Stella To Shinigami No Chou":"星光咖啡馆与死神之蝶","Hanasaku Iroha":"花开伊吕波","Kaze No Tani No Nausicaa":"风之谷","Bougyoryoku Zero No Yome":"防御力为0的新娘","Sanoba Witch":"魔女的夜宴","Princess Tutu":"彩梦芭蕾","Rurouni Kenshin":"浪客剑心","Denpa Onna To Seishun Otoko":"电波女与青春男","Justice Gakuen":"正义学园","Love And Deepspace":"恋与深空","Donkey Kong":"大金刚","Bungou Stray Dogs":"文豪野犬","Rou-kyuu-bu!":"萝球社！","Otome Game No Hametsu Flag Shika Nai Akuyaku Reijou Ni Tensei Shite Shimatta":"转生成为了只有乙女游戏破灭Flag的邪恶大小姐","Koutetsujou No Kabaneri":"甲铁城的卡巴内瑞","Akame Ga Kill!":"斩·赤红之瞳！","Toji No Miko":"刀使之巫女","Futaba Channel":"双叶频道","Shadowverse":"影之诗","Renkin San-kyuu Magical Pokaan":"炼金三级魔法少女","Suisei No Gargantia":"翠星之加尔刚蒂亚","Busou Shinki":"武装神姬","Yakusoku No Neverland":"约定的梦幻岛","86 -eightysix-":"86-不存在的战区-","Hentai Ouji To Warawanai Neko.":"变态王子与不笑猫。","Sakura Trick":"樱Trick","Gate - Jieitai Ka No Chi Nite Kaku Tatakaeri":"GATE 奇幻自卫队","Fresh Precure!":"Fresh光之美少女！","Ultra Series":"奥特曼系列","Arc The Lad":"亚克传承","Fushigiboshi No Futago Hime":"双子星公主","Ojisan To Marshmallow":"大叔与棉花糖","Oshiete! Galko-chan":"告诉我！辣妹子酱","Rinne No Lagrange":"轮回的拉格朗日","Shironeko Project":"白猫Project","Baccano!":"永生之酒！","Sengoku Musou":"战国无双","Sewayaki Kitsune No Senko-san":"贤惠幼妻仙狐小姐","Dirty Pair":"搞怪拍档","En'en No Shouboutai":"炎炎消防队","Bravely Default":"勇气默示录","Mikakunin De Shinkoukei":"未确认进行式","Kakegurui":"狂赌之渊","Indie Utaite":"独立唱见","Bilibili":"哔哩哔哩","Dream C Club":"梦幻俱乐部","Yosuga No Sora":"缘之空","Grisaia":"灰色的果实","Infinity Nikki":"无限暖暖","Rune Factory":"符文工房","Tianguan Cifu":"天官赐福","The Coffin Of Andy And Leyley":"安迪和莱莉的棺材","Oboro Muramasa":"胧村正","Getter Robo":"盖塔机器人","Re:creators":"Re:CREATORS","Psycho-pass":"心理测量者","Kyoukai No Kanata":"境界的彼方","Kekkai Sensen":"血界战线","Soukou Akki Muramasa":"装甲恶鬼村正","Amphibia":"奇幻沼泽","Dramatical Murder":"DRAMAtical Murder","Mother 3":"地球冒险3","Sekirei":"鹡鸰女神","Claymore":"大剑","Mazinger":"魔神","Ansatsu Kyoushitsu":"暗杀教室","Ef":"悠久之翼","Zoids":"索斯机械兽","Doom":"毁灭战士","Shinmai Maou No Testament":"新妹魔王的契约者","Sekiro: Shadows Die Twice":"只狼：影逝二度","Bamboo Blade":"竹刀少女","Fukumoto Mahjong":"福本麻将","Ys":"伊苏","Star Driver":"STAR DRIVER","Kiratto Pri Chan":"闪跃吧！星梦频道","Mass Effect":"质量效应","Mahouka Koukou No Rettousei":"魔法科高中的劣等生","Summertime Render":"夏日重现","Master Of Eternity":"战略冲撞","Jigokuraku":"地狱乐","Sk8 The Infinity":"无限滑板","Zettai Karen Children":"绝对可怜小孩","Yuusha To Maou":"勇者与魔王","Doukutsu Monogatari":"洞窟物语","Ishuzoku Reviewers":"异种族风俗娘评鉴指南","Assassin's Creed":"刺客信条","Kimi Ga Shine":"你已藏起","Orenchi No Meidosan":"我家的女仆小姐","D4dj":"D4DJ","Devil Survivor":"恶魔幸存者","Shaman King":"通灵王","La Pucelle":"光之圣女传说","Kimi Ga Nozomu Eien":"愿此刻永恒","Soukyuu No Fafner":"苍穹之法芙娜","Kimi No Koto Ga Dai Dai Dai Dai Daisuki Na 100-nin No Kanojo":"超超超超喜欢你的100个女孩子","Pandora Hearts":"潘多拉之心","Dragalia Lost":"失落的龙约","Counter:side":"未来战","Ore Twintail Ni Narimasu":"我，要成为双马尾。","Teenage Mutant Ninja Turtles":"忍者神龟","Coppelion":"核爆默示录","Azure Striker Gunvolt":"苍蓝雷霆","Fate/extra":"Fate/EXTRA","Kemurikusa":"烟草","Danshi Koukousei No Nichijou":"男子高中生的日常","Soredemo Ayumu Wa Yosetekuru":"即使如此依旧步步紧逼","Shadow Slave":"影子奴隶","Top Wo Nerae 2!":"飞越巅峰2！","Dracu-riot!":"DRACU-RIOT!","Steven Universe":"宇宙小子","Devilman":"恶魔人","Unicorn Overlord":"圣兽之王","Gj-bu":"GJ部","Sayonara Wo Oshiete":"对你说再见","Jibaku Shounen Hanako-kun":"地缚少年花子君","Maplestory":"冒险岛","Citrus (saburouta)":"citrus～柑橘味香气～","Valkyrie Profile":"北欧女神","Rainbow Six Siege":"彩虹六号：围攻","Scooby-doo":"史酷比","New Horizon":"新视野","Fate/samurai Remnant":"Fate/Samurai Remnant","Honzuki No Gekokujou":"小书痴的下克上","Ouran High School Host Club":"樱兰高校男公关部","Pacific Rim":"环太平洋","Pac-man (game)":"吃豆人","Phantom Of The Kill":"杀戮魅影","Yume 2kki":"梦2记","Haibane Renmei":"灰羽联盟","Marl Kingdom":"马尔王国","Dumbbell Nan Kilo Moteru?":"流汗吧！健身少女","Epic Seven":"第七史诗","Shy":"SHY","Wakfu":"沃土","Big Hero 6":"超能陆战队","Wind Breaker (nii Satoru)":"WIND BREAKER","Eoduun Badaui Deungbul-i Doeeo":"成为昏暗大海的灯塔","Medaka Box":"最强会长黑神","Five Nights At Freddy's":"玩具熊的五夜后宫","Armored Core":"装甲核心","Fate/zero":"Fate/Zero","Top Wo Nerae!":"飞越巅峰！","Yofukashi No Uta":"彻夜之歌","Ookami-san":"大神同学","Valkyrie Drive":"女武神驱动","Kore Wa Zombie Desu Ka?":"这样算是僵尸吗？","Gunslinger Girl":"神枪少女","Brown Dust 2":"棕色尘埃2","Katanagatari":"刀语","Urara Meirochou":"乌らら迷路帖","Yoake Mae Yori Ruri Iro Na":"夜明前的琉璃色","Black Jack":"怪医黑杰克","Voltron":"战神金刚","Pui Pui Molcar":"天竺鼠车车","Majutsushi Orphen":"魔术士奥芬","Hori-san To Miyamura-kun":"堀与宫村","Koe No Katachi":"声之形","Nikki":"暖暖","Record Of Lodoss War":"罗德斯岛战记","Kouyoku Senki Exs-tia Concert":"钢翼战姬Exs-tia Concert","Shirokami Project":"城姬Quest","Subarashiki Kono Sekai":"美妙世界","Sousai Shoujo Teien":"创彩少女庭园","Maji De Watashi Ni Koi Shinasai!":"认真和我谈恋爱！","Shikanoko Nokonoko Koshitantan":"我家的鹿乃子乃子虎视眈眈","Yatterman":"小双侠","Subarashiki Hibi":"美好的每一天","Sora Wo Kakeru Shoujo":"穿越宇宙的少女","The Witcher":"巫师","Collar X Malice":"Collar×Malice","Milgram":"MILGRAM","Demonbane":"斩魔大圣","Tenkuu No Shiro Laputa":"天空之城","Seto No Hanayome":"濑户的花嫁","Mortal Kombat":"真人快打","Dororo (tezuka)":"多罗罗","Cthulhu Mythos":"克苏鲁神话","Kamichu!":"神是中学生！","Frame Arms Girl":"机甲少女","Drifters":"漂流武士","Onegai Teacher":"拜托了，老师","Maou-jou De Oyasumi":"在魔王城说晚安","Goho Mafia! Kajita-kun":"Goho Mafia!梶田君","Witchblade":"魔女之刃","Tsugumomo":"怪怪守护神","Hitsugi No Chaika":"棺姬嘉依卡","Manatsu No Yo No Inmu":"真夏夜之淫梦","Mashle":"物理魔法使马修","Sasayaku You Ni Koi Wo Utau":"恰似细语般的恋歌","Ao No Kanata No Four Rhythm":"苍之彼方的四重奏","Sound Voltex":"SOUND VOLTEX","Enjo Kouhai":"援交后辈","Spongebob Squarepants":"海绵宝宝","Gake No Ue No Ponyo":"悬崖上的金鱼姬","Sora Yori Mo Tooi Basho":"比宇宙更遥远的地方","Hyakko":"白虎","Mashiroiro Symphony":"纯白交响曲","Hinako Note":"雏子的笔记","Addams Family":"亚当斯一家","Galaxy Angel Rune":"银河天使2","White Album":"白色相簿","Ninin Ga Shinobuden":"忍者乱太郎","Kidou Keisatsu Patlabor":"机动警察","The Little Mermaid":"小美人鱼","Portal":"传送门","Jewelpet":"宝石宠物","Baby Princess":"宝贝公主","Chaos Zero Nightmare":"混沌零噩梦","Ochame Na Okusan To No Nichijou Chabangoto":"与淘气妻子的日常茶饭事","Houkago No Pleiades":"放学后的昴星团","Ayakashi Triangle":"妖三角","Coco (disney)":"寻梦环游记","Kunio-kun Series":"热血系列","Kakumeiki Valvrave":"革命机Valvrave","Hitoribocchi No Marumaru Seikatsu":"一个人的○○小日子","Ga-rei":"喰灵","Mairimashita! Iruma-kun":"入间同学入魔了！","Musuko Ga Kawaikute Shikatanai Mazoku No Hahaoya":"儿子可爱过头的魔族母亲","Girl Cafe Gun":"少女咖啡枪","Futari Wa Precure":"光之美少女","Omamori Himari":"守护猫娘绯鞠","Bishoujo Mangekyou":"美少女万华镜","Blame!":"BLAME!","Cosmic Break":"宇宙突击队","Nerawareta Megami Tenshi Angel Tear":"被狙击的女神天使Angel Tear","Yami To Boushi To Hon No Tabibito":"暗与帽子与书之旅人"};
    let tagData = [];
    const _charCache = {};
    const _CACHE_MAX = 50;
    let _charGroupIdx = -1;
    let _seriesCharCounts = null;
    const CHAR_BASE_SUBS = 1;
    let _charPage = 1;
    const CHARS_PER_PAGE = 100;
    const CHAR_BROWSER_PER_PAGE = 40;
    let posTagPicker = null;
    let negTagPicker = null;

    const _artistCache = {};
    let _artistGroupIdx = -1;
    let _artistPage = 1;
    let _artistTotalPages = 1;
    let _artistCurrentSort = 'score';
    let _artistCurrentLetter = 'all';
    const _ARTIST_SORT_MODES = [
        { name: '精选', sort: 'score', order: 'desc', icon: '🏆' },
        { name: '热门', sort: 'count', order: 'desc', icon: '🔥' },
        { name: '收藏', sort: 'fav', order: 'desc', icon: '❤️' },
        { name: '字母', sort: 'name', order: 'asc', icon: '🔤' },
    ];

    function _isArtistGroupIndex(groupIdx) {
        const g = tagData[groupIdx];
        if (!g) return false;
        return groupIdx === _artistGroupIdx || g._isArtistGroup === true;
    }

    function _isArtistGroupHiddenOnTags(groupIdx) {
        const g = tagData[groupIdx];
        if (!g) return false;
        return _isArtistGroupIndex(groupIdx) || g.name === '画师风格';
    }

    function _prepareArtistTab(picker, subIdx = 0) {
        if (!picker || _artistGroupIdx < 0) return false;
        const maxSub = tagData[_artistGroupIdx]?.subgroups?.length || 0;
        picker.groupIdx = _artistGroupIdx;
        picker.subIdx = Math.max(0, Math.min(subIdx, maxSub - 1));
        picker._virtualMode = null;
        picker._searchMode = 'tag';
        picker.searchEl.value = '';
        if (picker.searchModeBtn) {
            picker.searchModeBtn.textContent = '标签';
            picker.searchModeBtn.classList.remove('mode-category');
        }
        picker.searchEl.placeholder = '搜索画师...';
        _artistPage = 1;
        const sub = tagData[_artistGroupIdx]?.subgroups[picker.subIdx];
        if (sub?._artistSort) {
            _artistCurrentSort = sub._artistSort;
            _artistCurrentLetter = 'all';
        }
        return true;
    }

    // ==================== 大文件缓存 (IndexedDB，避免 localStorage 5MB 上限) ====================
    const _BIG_CACHE_DB = 'comfyui-web-cache';
    let _bigCacheDbPromise = null;

    function _openBigCacheDb() {
        if (!_bigCacheDbPromise) {
            _bigCacheDbPromise = new Promise((resolve, reject) => {
                const req = indexedDB.open(_BIG_CACHE_DB, 1);
                req.onupgradeneeded = (e) => { e.target.result.createObjectStore('kv'); };
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
        }
        return _bigCacheDbPromise;
    }

    async function _bigCacheGet(key) {
        try {
            const db = await _openBigCacheDb();
            return await new Promise((resolve, reject) => {
                const req = db.transaction('kv', 'readonly').objectStore('kv').get(key);
                req.onsuccess = () => resolve(req.result ?? null);
                req.onerror = () => reject(req.error);
            });
        } catch { return null; }
    }

    async function _bigCacheSet(key, val) {
        try {
            const db = await _openBigCacheDb();
            await new Promise((resolve, reject) => {
                const tx = db.transaction('kv', 'readwrite');
                tx.objectStore('kv').put(val, key);
                tx.oncomplete = () => resolve();
                tx.onerror = () => reject(tx.error);
            });
            return true;
        } catch (e) {
            console.warn('[Cache] IndexedDB save failed:', key, e.message);
            return false;
        }
    }

    async function _migrateLargeCacheToIdb() {
        const keys = ['_tags_cache', '_tags_ver', '_series_cache', '_series_cache_ts'];
        for (const key of keys) {
            try {
                const raw = localStorage.getItem(key);
                if (!raw) continue;
                const val = (key === '_tags_cache' || key === '_series_cache')
                    ? JSON.parse(raw)
                    : (key === '_series_cache_ts' ? parseInt(raw, 10) || 0 : raw);
                await _bigCacheSet(key, val);
                localStorage.removeItem(key);
            } catch { /* ignore */ }
        }
    }

    function _injectArtistGroup() {
        tagData = tagData.filter(g => !g._isArtistGroup);
        const artistGroup = {
            name: '画师风格',
            _isArtistGroup: true,
            subgroups: _ARTIST_SORT_MODES.map(mode => ({
                name: `${mode.icon} ${mode.name}`,
                _artistSort: mode.sort,
                _artistOrder: mode.order,
                tags: [],
            }))
        };
        tagData.push(artistGroup);
        _artistGroupIdx = tagData.length - 1;
    }

    function _resolveSeriesCharCount(seriesId) {
        if (_seriesCharCounts && Object.prototype.hasOwnProperty.call(_seriesCharCounts, seriesId)) {
            return _seriesCharCounts[seriesId];
        }
        return 0;
    }

    function _patchSeriesCountsOnTagData() {
        if (_charGroupIdx < 0 || !_seriesCharCounts) return;
        const group = tagData[_charGroupIdx];
        if (!group?.subgroups) return;
        group.subgroups.forEach(sub => {
            if (sub?._seriesId) sub._seriesCount = _resolveSeriesCharCount(sub._seriesId);
        });
    }

    async function _loadSeriesCharCounts() {
        const cached = await _bigCacheGet('_series_char_counts');
        if (cached && typeof cached === 'object') {
            _seriesCharCounts = cached;
            _patchSeriesCountsOnTagData();
        }
        try {
            const res = await fetch('series_char_counts.json');
            if (!res.ok) return false;
            const currentVer = res.headers.get('etag') || res.headers.get('last-modified') || '';
            const cachedVer = (await _bigCacheGet('_series_char_counts_ver')) || '';
            if (currentVer && currentVer === cachedVer && _seriesCharCounts) return false;
            const data = await res.json();
            _seriesCharCounts = data;
            await _bigCacheSet('_series_char_counts', data);
            if (currentVer) await _bigCacheSet('_series_char_counts_ver', currentVer);
            _patchSeriesCountsOnTagData();
            return true;
        } catch {
            return false;
        }
    }

    function _applySeriesListToTagData(seriesList) {
        if (_charGroupIdx < 0) {
            _charGroupIdx = tagData.findIndex(g => g.name === '人物');
        }
        if (_charGroupIdx < 0 || !Array.isArray(seriesList) || !seriesList.length) return false;
        const group = tagData[_charGroupIdx];
        if (!group) return false;

        const hasDbSeries = group.subgroups.some(s => s && s._seriesId);
        if (hasDbSeries) {
            const seriesMap = Object.fromEntries(seriesList.map(s => [s.id, s]));
            group.subgroups.forEach(sub => {
                if (!sub?._seriesId) return;
                const row = seriesMap[sub._seriesId];
                if (row) {
                    sub._coverUrl = row.cover_url || '';
                    sub._seriesCount = _resolveSeriesCharCount(sub._seriesId);
                }
            });
        } else {
            const baseSubs = group.subgroups.filter(s => s && (s.name === '对象' || s.name === '属性'));
            const dbSubs = seriesList.map(s => ({
                name: _SERIES_CN[s.name] || s.name,
                _seriesId: s.id,
                _seriesCount: _resolveSeriesCharCount(s.id),
                _coverUrl: s.cover_url || '',
                tags: [],
            }));
            group.subgroups = [...baseSubs, ...dbSubs];
        }
        return true;
    }

    async function _loadSeriesFromLocalCache() {
        const seriesList = await _bigCacheGet('_series_cache');
        if (!seriesList || !Array.isArray(seriesList) || !seriesList.length) return false;
        return _applySeriesListToTagData(seriesList);
    }

    async function _saveSeriesLocalCache(seriesList) {
        const compact = seriesList.map(s => ({
            id: s.id,
            name: s.name,
            count: s.count,
            cover_url: s.cover_url || null,
        }));
        await _bigCacheSet('_series_cache', compact);
        await _bigCacheSet('_series_cache_ts', Date.now());
    }

    async function _loadSeriesFromApi(forceRefresh = false) {
        if (_charGroupIdx < 0) {
            _charGroupIdx = tagData.findIndex(g => g.name === '人物');
        }
        if (_charGroupIdx < 0) return false;
        const group = tagData[_charGroupIdx];
        if (!group) return false;

        const seriesSubs = group.subgroups.filter(s => s && s._seriesId);
        const hasDbSeries = seriesSubs.length > 0;
        if (!forceRefresh && hasDbSeries && seriesSubs.every(s => s._coverUrl !== undefined)) {
            return false;
        }

        try {
            const res = await fetch('/api/characters/series');
            if (!res.ok) return false;
            const seriesList = await res.json();
            _applySeriesListToTagData(seriesList);
            await _saveSeriesLocalCache(seriesList);
            console.log(`[D1] Loaded ${seriesList.length} series from database`);
            return true;
        } catch (e) {
            console.warn('[D1] 角色系列加载失败:', e.message);
            return false;
        }
    }

    const SERIES_CACHE_MAX_AGE = 60 * 60 * 1000;

    async function _refreshTagsAndSeriesInBackground() {
        let tagsChanged = false;
        try {
            const res = await fetch('tags.json');
            if (res.ok) {
                const currentVer = res.headers.get('etag') || res.headers.get('last-modified') || '';
                const cachedVer = (await _bigCacheGet('_tags_ver')) || '';
                if (currentVer && currentVer !== cachedVer) {
                    const newData = await res.json();
                    tagData = newData;
                    await _bigCacheSet('_tags_cache', tagData);
                    await _bigCacheSet('_tags_ver', currentVer);
                    _charGroupIdx = tagData.findIndex(g => g.name === '人物');
                    await _loadSeriesCharCounts();
                    await _loadSeriesFromLocalCache();
                    _injectArtistGroup();
                    tagsChanged = true;
                }
            }
        } catch { /* offline — keep cache */ }

        const cacheTs = (await _bigCacheGet('_series_cache_ts')) || 0;
        const seriesStale = !cacheTs || Date.now() - cacheTs > SERIES_CACHE_MAX_AGE;
        const seriesChanged = seriesStale ? await _loadSeriesFromApi(true) : false;
        const charCountsChanged = await _loadSeriesCharCounts();
        if (tagsChanged || seriesChanged || charCountsChanged) {
            posTagPicker?.render();
            negTagPicker?.render();
            if (document.querySelector('.main')?.classList.contains('mobile-tab-characters')) {
                renderMobileSeriesList(_seriesListState.filter || '');
            }
        }
    }

    async function loadTags() {
        await _migrateLargeCacheToIdb();

        const cached = await _bigCacheGet('_tags_cache');
        if (cached && Array.isArray(cached) && cached.length) {
            tagData = cached;
        }

        if (!tagData.length) {
            try {
                const res = await fetch('tags.json');
                tagData = await res.json();
                const currentVer = res.headers.get('etag') || res.headers.get('last-modified') || '';
                await _bigCacheSet('_tags_cache', tagData);
                if (currentVer) await _bigCacheSet('_tags_ver', currentVer);
            } catch (e) {
                console.warn('标签数据加载失败:', e);
                tagData = tagData || [];
            }
        }

        _charGroupIdx = tagData.findIndex(g => g.name === '人物');
        await _loadSeriesCharCounts();
        await _loadSeriesFromLocalCache();
        _injectArtistGroup();

        _refreshTagsAndSeriesInBackground();
    }

    function _ssGet(key) { try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } }
    function _ssSet(key, val) { try { sessionStorage.setItem(key, JSON.stringify(val)); } catch { } }

    async function _fetchSeriesChars(seriesId) {
        if (_charCache[seriesId]) return _charCache[seriesId];
        const ssKey = '_ch_' + seriesId;
        const ss = _ssGet(ssKey);
        if (ss) { _charCache[seriesId] = ss; return ss; }
        const res = await fetch(`/api/characters/${encodeURIComponent(seriesId)}`);
        if (!res.ok) return [];
        const data = await res.json();
        if (Object.keys(_charCache).length >= _CACHE_MAX) {
            delete _charCache[Object.keys(_charCache)[0]];
        }
        _charCache[seriesId] = data;
        _ssSet(ssKey, data);
        return data;
    }

    async function _searchCharsFromDb(query) {
        try {
            const res = await fetch(`/api/characters/search?q=${encodeURIComponent(query)}&limit=100`);
            if (!res.ok) { console.warn('[API] Character search failed:', res.status); return []; }
            return await res.json();
        } catch (e) { console.warn('[API] Character search error:', e.message); return []; }
    }

    async function _fetchArtists(sort = 'score', order = 'desc', page = 1, letter = 'all') {
        const key = `${sort}_${order}_${page}_${letter}`;
        if (_artistCache[key]) return _artistCache[key];
        const ssKey = '_ar_' + key;
        const ss = _ssGet(ssKey);
        if (ss) { _artistCache[key] = ss; return ss; }
        try {
            let url = `/api/artists/list?sort=${sort}&order=${order}&page=${page}&limit=100`;
            if (letter && letter !== 'all') url += `&letter=${letter}`;
            const res = await fetch(url);
            if (!res.ok) return { tags: [], pages: 1 };
            const data = await res.json();
            const tags = data.results.map(a => ({
                t: a.trigger_text,
                d: a.name,
                th: a.thumb_url,
                img: a.img_url,
                count: a.count,
                score: a.score,
                fav: a.fav_count,
            }));
            const result = { tags, pages: data.pages, total: data.total };
            if (Object.keys(_artistCache).length >= _CACHE_MAX) {
                delete _artistCache[Object.keys(_artistCache)[0]];
            }
            _artistCache[key] = result;
            _ssSet(ssKey, result);
            return result;
        } catch (e) { console.warn('[API] Artist list error:', e.message); return { tags: [], pages: 1 }; }
    }

    async function _searchArtistsFromDb(query) {
        try {
            const res = await fetch(`/api/artists/search?q=${encodeURIComponent(query)}&limit=100`);
            if (!res.ok) return [];
            const data = await res.json();
            return data.map(a => ({
                t: a.trigger_text,
                d: a.name,
                th: a.thumb_url,
                img: a.img_url,
                count: a.count,
            }));
        } catch (e) { console.warn('[API] Artist search error:', e.message); return []; }
    }

    // ==================== 懒加载与骨架屏 ====================
    let _imgObserver = null;
    function _getImgObserver() {
        if (_imgObserver) return _imgObserver;
        _imgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const img = entry.target;
                const src = img.dataset.src;
                if (!src) return;
                _imgObserver.unobserve(img);
                img.onload = () => {
                    img.classList.remove('img-loading');
                    img.classList.add('img-loaded');
                    const skel = img.parentElement?.querySelector('.thumb-skeleton');
                    if (skel) skel.classList.add('hide');
                };
                img.onerror = () => {
                    img.style.display = 'none';
                    const skel = img.parentElement?.querySelector('.thumb-skeleton');
                    if (skel) skel.classList.add('hide');
                };
                img.src = src;
            });
        }, { rootMargin: '200px' });
        return _imgObserver;
    }

    let _charGridImgObserver = null;
    function _observeCharBrowserImages(imgList) {
        const root = document.getElementById('char-browser-grid');
        if (!root || !imgList.length) return;
        if (!_charGridImgObserver) {
            _charGridImgObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (!src) return;
                    _charGridImgObserver.unobserve(img);
                    img.onload = () => {
                        img.classList.remove('img-loading');
                        img.classList.add('img-loaded');
                        img.parentElement?.querySelector('.thumb-skeleton')?.classList.add('hide');
                    };
                    img.onerror = () => {
                        img.style.display = 'none';
                        img.parentElement?.querySelector('.thumb-skeleton')?.classList.add('hide');
                    };
                    img.src = src;
                });
            }, { root, rootMargin: '160px' });
        }
        imgList.forEach(img => { if (img) _charGridImgObserver.observe(img); });
    }

    function _observeLazyImages(imgList) {
        const obs = _getImgObserver();
        imgList.forEach(img => { if (img) obs.observe(img); });
    }

    function _buildSkeletonGrid(count) {
        let html = '<div class="skeleton-row">';
        for (let i = 0; i < count; i++) {
            html += '<div class="skeleton-card"></div>';
        }
        html += '</div>';
        return html;
    }

    class TagPicker {
        constructor(pickerId, textarea) {
            this.id = pickerId;
            this.textarea = textarea;
            this.groupIdx = 0;
            this.subIdx = 0;
            this._virtualMode = null;
            this._virtualSub = 0;
            this.tabsEl = document.querySelector(`.tag-tabs[data-picker="${pickerId}"]`);
            this.subTabsEl = document.querySelector(`.tag-subtabs[data-picker="${pickerId}"]`);
            this.gridEl = document.querySelector(`.tag-grid[data-picker="${pickerId}"]`);
            this.searchEl = document.querySelector(`.tag-search[data-picker="${pickerId}"]`);
            this.searchModeBtn = document.querySelector(`.search-mode-btn[data-picker="${pickerId}"]`);
            this._searchMode = 'tag';

            if (this.searchModeBtn) {
                this.searchModeBtn.addEventListener('click', () => {
                    this._searchMode = this._searchMode === 'tag' ? 'category' : 'tag';
                    this.searchModeBtn.textContent = this._searchMode === 'tag' ? '标签' : '分类';
                    this.searchModeBtn.classList.toggle('mode-category', this._searchMode === 'category');
                    this.searchEl.placeholder = this._searchMode === 'tag' ? '搜索标签...' : '搜索分类/作品名...';
                    this.searchEl.value = '';
                    this.renderGrid();
                });
            }

            this._acDropdown = null;

            let debounce;
            this.searchEl.addEventListener('input', () => {
                clearTimeout(debounce);
                if (this._searchMode === 'category') {
                    debounce = setTimeout(() => this._showCategoryAutocomplete(), 200);
                } else {
                    this._hideAutocomplete();
                    debounce = setTimeout(() => this.renderGrid(), 350);
                }
            });
            this.searchEl.addEventListener('focus', () => {
                if (this._searchMode === 'category' && this.searchEl.value.trim()) {
                    this._showCategoryAutocomplete();
                }
            });
            document.addEventListener('click', (e) => {
                if (this._acDropdown && !this._acDropdown.contains(e.target) && e.target !== this.searchEl) {
                    this._hideAutocomplete();
                }
            });

            this.textarea.addEventListener('input', () => this.refreshHighlights());

            this.render();
        }

        refreshHighlights() {
            const selected = this.getSelectedTags();
            this.gridEl.querySelectorAll('.tag-item').forEach(el => {
                const tagName = el.dataset.tag;
                if (!tagName) return;
                el.classList.toggle('selected', selected.has(tagName));
            });
        }

        _isMobilePicker() {
            return window.matchMedia('(max-width: 640px)').matches;
        }

        _isCharSeriesActive() {
            if (this._virtualMode || _charGroupIdx < 0 || this.groupIdx !== _charGroupIdx) return false;
            const sub = tagData[this.groupIdx]?.subgroups[this.subIdx];
            return !!(sub && sub._seriesId);
        }

        _getMobileTabContext() {
            const main = document.querySelector('.main');
            if (!main) return null;
            if (main.classList.contains('mobile-tab-tags')) return 'tags';
            if (main.classList.contains('mobile-tab-artists')) return 'artists';
            return null;
        }

        _isOnArtistTab() {
            return this.id === 'tag-picker-pos' && document.querySelector('.main')?.classList.contains('mobile-tab-artists');
        }

        _shouldHideGroup(groupIdx) {
            const ctx = this._getMobileTabContext();
            if (!ctx) return false;
            if (ctx === 'tags' && _isArtistGroupHiddenOnTags(groupIdx)) return true;
            if (ctx === 'artists' && !_isArtistGroupIndex(groupIdx)) return true;
            return false;
        }

        _shouldHideSubgroup(groupIdx, subIdx) {
            const ctx = this._getMobileTabContext();
            if (ctx !== 'tags' || groupIdx !== _charGroupIdx) return false;
            const sub = tagData[groupIdx]?.subgroups[subIdx];
            return !!(sub && sub._seriesId);
        }

        _ensureValidGroupForMobile() {
            const ctx = this._getMobileTabContext();
            if (!ctx) return;
            if (ctx === 'artists' && this.id !== 'tag-picker-pos') return;

            if (this._shouldHideGroup(this.groupIdx)) {
                if (ctx === 'tags') {
                    this.groupIdx = _charGroupIdx >= 0 ? _charGroupIdx : 0;
                    this.subIdx = 0;
                } else if (ctx === 'artists' && _artistGroupIdx >= 0) {
                    this.groupIdx = _artistGroupIdx;
                    this.subIdx = 0;
                }
                this._virtualMode = null;
                this.searchEl.value = '';
                _charPage = 1;
            }

            if (ctx === 'tags' && this.groupIdx === _charGroupIdx && this._shouldHideSubgroup(this.groupIdx, this.subIdx)) {
                this.subIdx = 0;
            }

            if (ctx === 'artists' && _artistGroupIdx >= 0) {
                this.groupIdx = _artistGroupIdx;
                const maxSub = tagData[_artistGroupIdx]?.subgroups?.length || 0;
                if (this.subIdx < 0 || this.subIdx >= maxSub) this.subIdx = 0;
                this._virtualMode = null;
                this._searchMode = 'tag';
                this.searchEl.value = '';
                if (this.searchModeBtn) {
                    this.searchModeBtn.textContent = '标签';
                    this.searchModeBtn.classList.remove('mode-category');
                }
                this.searchEl.placeholder = '搜索标签...';
                _artistPage = 1;
            }
        }

        _updateMobileCharLayout() {
            const picker = this.gridEl?.closest('.tag-picker');
            if (!picker) return;
            picker.classList.remove('mobile-char-view');
            const bar = picker.querySelector('.char-series-bar');
            if (bar) bar.remove();
        }

        render() {
            this._ensureValidGroupForMobile();
            this.renderTabs();
            this.renderSubTabs();
            this.renderGrid();
        }

        renderTabs() {
            this.tabsEl.innerHTML = '';
            tagData.forEach((g, i) => {
                if (this._shouldHideGroup(i)) return;
                const tab = document.createElement('span');
                tab.className = 'tab' + (i === this.groupIdx && !this._virtualMode ? ' active' : '');
                tab.textContent = g.name;
                tab.addEventListener('click', () => {
                    this.groupIdx = i;
                    this.subIdx = 0;
                    this._virtualMode = null;
                    this.searchEl.value = '';
                    _charPage = 1;
                    if (i === _charGroupIdx && this._getMobileTabContext() === 'tags') {
                        this.subIdx = 0;
                    }
                    if (i === _artistGroupIdx) {
                        _artistPage = 1;
                        _artistCurrentSort = 'score';
                        _artistCurrentLetter = 'all';
                    }
                    this._removePagination();
                    this.render();
                    if (this._getMobileTabContext() === 'artists') syncMobileArtistNav(this.subIdx);
                });
                this.tabsEl.appendChild(tab);
            });
            _VIRTUAL_TABS.forEach(vt => {
                const tab = document.createElement('span');
                tab.className = 'tab tab-virtual' + (this._virtualMode === vt._virtual ? ' active' : '');
                tab.textContent = vt.name;
                tab.addEventListener('click', () => {
                    this._virtualMode = vt._virtual;
                    this.searchEl.value = '';
                    this._removePagination();
                    this.render();
                });
                this.tabsEl.appendChild(tab);
            });
        }

        renderSubTabs() {
            this.subTabsEl.innerHTML = '';
            if (this._virtualMode) {
                if (this._virtualMode === 'fav') {
                    ['全部', '标签', '角色', '画师'].forEach((name, i) => {
                        const tab = document.createElement('span');
                        tab.className = 'tab' + (i === (this._virtualSub || 0) ? ' active' : '');
                        tab.textContent = name;
                        tab.addEventListener('click', () => { this._virtualSub = i; this.renderSubTabs(); this.renderGrid(); });
                        this.subTabsEl.appendChild(tab);
                    });
                    const clearBtn = document.createElement('span');
                    clearBtn.className = 'tab';
                    clearBtn.textContent = '🗑️ 清空收藏';
                    clearBtn.style.marginLeft = 'auto';
                    clearBtn.addEventListener('click', () => { if (confirm('确定清空所有收藏？')) { FavManager.clear(); this.renderGrid(); } });
                    this.subTabsEl.appendChild(clearBtn);
                } else {
                    const clearBtn = document.createElement('span');
                    clearBtn.className = 'tab';
                    clearBtn.textContent = '🗑️ 清空记录';
                    clearBtn.addEventListener('click', () => { if (confirm('确定清空使用记录？')) { UsageTracker.clear(); this.renderGrid(); } });
                    this.subTabsEl.appendChild(clearBtn);
                }
                return;
            }
            const subs = (tagData[this.groupIdx]?.subgroups || []).filter(Boolean);
            const ctx = this._getMobileTabContext();
            const visibleEntries = subs.map((s, i) => ({ s, i })).filter(({ i }) => !this._shouldHideSubgroup(this.groupIdx, i));

            if (ctx === 'artists' && this.groupIdx === _artistGroupIdx) {
                return;
            }

            if (ctx === 'tags' && this.groupIdx === _charGroupIdx && visibleEntries.length <= 1) {
                if (visibleEntries.length) this.subIdx = visibleEntries[0].i;
                return;
            }

            visibleEntries.forEach(({ s, i }) => {
                const tab = document.createElement('span');
                tab.className = 'tab' + (i === this.subIdx ? ' active' : '');
                tab.textContent = s.name;
                tab.addEventListener('click', () => {
                    this.subIdx = i;
                    if (this.groupIdx === _artistGroupIdx && s._artistSort) {
                        _artistPage = 1;
                        _artistCurrentSort = s._artistSort;
                        _artistCurrentLetter = 'all';
                        syncMobileArtistNav(i);
                    }
                    if (this.groupIdx === _charGroupIdx && s._seriesId) {
                        _charPage = 1;
                        if (this._isMobilePicker() && ctx !== 'tags') {
                            openCharBrowser(s._seriesId, s.name);
                            return;
                        }
                    }
                    this.renderSubTabs();
                    if (this.groupIdx === _charGroupIdx && i >= CHAR_BASE_SUBS && s._seriesId && s.tags.length === 0) {
                        this.gridEl.innerHTML = _buildSkeletonGrid(8);
                        _fetchSeriesChars(s._seriesId).then(tags => {
                            s.tags = tags;
                            this.renderGrid();
                        });
                    } else {
                        this.renderGrid();
                    }
                });
                this.subTabsEl.appendChild(tab);
            });
            if (this.groupIdx === _artistGroupIdx) {
                this._renderArtistLetterBar();
            }
            this._updateMobileCharLayout();
        }

        _renderArtistLetterBar() {
            const sub = tagData[_artistGroupIdx]?.subgroups[this.subIdx];
            if (!sub || sub._artistSort !== 'name') return;
            let bar = this.subTabsEl.parentElement.querySelector('.artist-letter-bar');
            if (!bar) {
                bar = document.createElement('div');
                bar.className = 'artist-letter-bar';
                this.subTabsEl.parentElement.insertBefore(bar, this.gridEl);
            }
            bar.innerHTML = '';
            const letters = ['all', ...'abcdefghijklmnopqrstuvwxyz'.split(''), 'other'];
            const labels = { all: '全部', other: '#' };
            letters.forEach(l => {
                const btn = document.createElement('span');
                btn.className = 'letter-btn' + (l === _artistCurrentLetter ? ' active' : '');
                btn.textContent = labels[l] || l.toUpperCase();
                btn.addEventListener('click', () => {
                    _artistCurrentLetter = l;
                    _artistPage = 1;
                    this.renderGrid();
                    bar.querySelectorAll('.letter-btn').forEach(b => b.classList.toggle('active', b.textContent === (labels[l] || l.toUpperCase())));
                });
                bar.appendChild(btn);
            });
        }

        renderGrid() {
            if (!this.gridEl || !this.subTabsEl) { console.error('Missing elements!'); return; }
            this.gridEl.innerHTML = '';
            this._removePagination();
            this._hideAutocomplete();

            if (this._virtualMode) {
                let items = [];
                if (this._virtualMode === 'fav') {
                    const typeFilter = ['all', 'tag', 'character', 'artist'][this._virtualSub || 0];
                    items = FavManager.getAll();
                    if (typeFilter !== 'all') items = items.filter(f => f.type === typeFilter);
                } else if (this._virtualMode === 'recent') {
                    items = UsageTracker.getRecent(100);
                } else if (this._virtualMode === 'frequent') {
                    items = UsageTracker.getFrequent(100);
                }
                const search = this.searchEl.value.toLowerCase();
                if (search) items = items.filter(t => t.t.toLowerCase().includes(search) || (t.d || '').toLowerCase().includes(search));
                if (items.length === 0) {
                    const msg = this._virtualMode === 'fav' ? '还没有收藏任何标签，在标签卡片上点击 ⭐ 来收藏' : '还没有使用记录，使用标签后会自动记录';
                    this.gridEl.innerHTML = `<div style="padding:30px;color:var(--text-secondary);text-align:center;width:100%;font-size:0.85rem">${msg}</div>`;
                    this._updateMobileCharLayout();
                    return;
                }
                const useGrouped = (this._virtualMode === 'fav' && (this._virtualSub || 0) === 0) || this._virtualMode === 'recent' || this._virtualMode === 'frequent';
                if (useGrouped && items.length > 0) {
                    const emptyMsg = this._virtualMode === 'fav' ? '还没有收藏任何标签，在标签卡片上点击 ⭐ 来收藏' : '还没有使用记录';
                    this._renderGroupedFavItems(items, emptyMsg);
                } else {
                    this._renderItems(items);
                }
                this._updateMobileCharLayout();
                return;
            }

            const mobileCtx = this._getMobileTabContext();
            const onArtistTab = this._isOnArtistTab();
            if (onArtistTab && _artistGroupIdx >= 0) {
                this.groupIdx = _artistGroupIdx;
            }
            const search = (mobileCtx === 'artists' || onArtistTab || this._searchMode === 'category') ? '' : this.searchEl.value.toLowerCase();
            let items;
            if (search) {
                if (this.groupIdx === _artistGroupIdx || onArtistTab) {
                    this.gridEl.innerHTML = _buildSkeletonGrid(4);
                    _searchArtistsFromDb(search).then(dbItems => {
                        this._renderItems(dbItems);
                    });
                    return;
                }
                items = [];
                tagData.forEach(g => g.subgroups.forEach(s => (s.tags || []).forEach(t => {
                    if (t.t.toLowerCase().includes(search) || t.d.includes(search)) items.push(t);
                })));
                items = items.slice(0, 100);
                if (this.groupIdx === _charGroupIdx && items.length < 20) {
                    _searchCharsFromDb(search).then(dbItems => {
                        const existing = new Set(items.map(i => i.t));
                        const extra = dbItems.filter(d => !existing.has(d.t));
                        if (extra.length > 0) {
                            this._renderItems([...items, ...extra.slice(0, 100 - items.length)]);
                        }
                    });
                }
            } else if (this.groupIdx === _artistGroupIdx || onArtistTab) {
                if (_artistGroupIdx < 0) {
                    this.gridEl.innerHTML = '<div style="padding:30px;color:var(--text-secondary);text-align:center;width:100%">画师数据加载中…</div>';
                    return;
                }
                const sub = tagData[_artistGroupIdx]?.subgroups[this.subIdx];
                if (!sub || !sub._artistSort) return;
                this.gridEl.innerHTML = _buildSkeletonGrid(6);
                const letter = sub._artistSort === 'name' ? _artistCurrentLetter : 'all';
                _fetchArtists(sub._artistSort, sub._artistOrder, _artistPage, letter).then(result => {
                    _artistTotalPages = result.pages;
                    this._renderItems(result.tags);
                    this._renderPagination(result.total);
                });
                return;
            } else {
                const sub = tagData[this.groupIdx]?.subgroups[this.subIdx];
                if (sub && sub._seriesId && sub.tags.length === 0) {
                    this.gridEl.innerHTML = _buildSkeletonGrid(8);
                    _fetchSeriesChars(sub._seriesId).then(tags => {
                        sub.tags = tags;
                        this._renderCharPage(tags);
                    });
                    return;
                }
                items = sub?.tags || [];
                if (sub && sub._seriesId && items.length > CHARS_PER_PAGE) {
                    this._renderCharPage(items);
                    return;
                }
            }

            this._renderItems(items);
            this._updateMobileCharLayout();
        }

        _renderPagination(total) {
            this._removePagination();
            if (_artistTotalPages <= 1) return;
            const nav = document.createElement('div');
            nav.className = 'artist-pagination';
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '← 上一页';
            prevBtn.disabled = _artistPage <= 1;
            prevBtn.addEventListener('click', () => { _artistPage--; this.renderGrid(); });

            const info = document.createElement('span');
            info.className = 'page-info';
            info.textContent = `第 ${_artistPage} / ${_artistTotalPages} 页（共 ${total || '?'} 位画师）`;

            const nextBtn = document.createElement('button');
            nextBtn.textContent = '下一页 →';
            nextBtn.disabled = _artistPage >= _artistTotalPages;
            nextBtn.addEventListener('click', () => { _artistPage++; this.renderGrid(); });

            const jumpWrap = document.createElement('span');
            jumpWrap.className = 'page-jump';
            const jumpInput = document.createElement('input');
            jumpInput.type = 'number';
            jumpInput.min = 1;
            jumpInput.max = _artistTotalPages;
            jumpInput.placeholder = '跳转';
            jumpInput.style.width = '50px';
            const jumpBtn = document.createElement('button');
            jumpBtn.textContent = 'Go';
            jumpBtn.addEventListener('click', () => {
                const p = parseInt(jumpInput.value);
                if (p >= 1 && p <= _artistTotalPages) { _artistPage = p; this.renderGrid(); }
            });
            jumpWrap.append(jumpInput, jumpBtn);

            nav.append(prevBtn, info, nextBtn, jumpWrap);
            this.gridEl.parentElement.insertBefore(nav, this.gridEl.nextSibling);
        }

        _renderCharPage(allTags) {
            const total = allTags.length;
            const totalPages = Math.ceil(total / CHARS_PER_PAGE);
            if (_charPage > totalPages) _charPage = totalPages;
            if (_charPage < 1) _charPage = 1;
            const start = (_charPage - 1) * CHARS_PER_PAGE;
            const pageItems = allTags.slice(start, start + CHARS_PER_PAGE);
            this._renderItems(pageItems);
            if (totalPages > 1) this._renderCharPagination(total, totalPages);
        }

        _renderCharPagination(total, totalPages) {
            const nav = document.createElement('div');
            nav.className = 'artist-pagination';
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '← 上一页';
            prevBtn.disabled = _charPage <= 1;
            prevBtn.addEventListener('click', () => { _charPage--; this.renderGrid(); });

            const info = document.createElement('span');
            info.className = 'page-info';
            info.textContent = `第 ${_charPage} / ${totalPages} 页（共 ${total} 个角色）`;

            const nextBtn = document.createElement('button');
            nextBtn.textContent = '下一页 →';
            nextBtn.disabled = _charPage >= totalPages;
            nextBtn.addEventListener('click', () => { _charPage++; this.renderGrid(); });

            const jumpWrap = document.createElement('span');
            jumpWrap.className = 'page-jump';
            const jumpInput = document.createElement('input');
            jumpInput.type = 'number';
            jumpInput.min = 1;
            jumpInput.max = totalPages;
            jumpInput.placeholder = '跳转';
            jumpInput.style.width = '50px';
            const jumpBtn = document.createElement('button');
            jumpBtn.textContent = 'Go';
            jumpBtn.addEventListener('click', () => {
                const p = parseInt(jumpInput.value);
                if (p >= 1 && p <= totalPages) { _charPage = p; this.renderGrid(); }
            });
            jumpWrap.append(jumpInput, jumpBtn);

            nav.append(prevBtn, info, nextBtn, jumpWrap);
            this.gridEl.parentElement.insertBefore(nav, this.gridEl.nextSibling);
        }

        _removePagination() {
            const existing = this.gridEl.parentElement?.querySelector('.artist-pagination');
            if (existing) existing.remove();
            const letterBar = this.gridEl.parentElement?.querySelector('.artist-letter-bar');
            if (letterBar && this.groupIdx !== _artistGroupIdx) letterBar.remove();
        }

        _showCategoryAutocomplete() {
            const query = this.searchEl.value.toLowerCase().trim();
            this._hideAutocomplete();
            if (!query) return;

            const results = [];
            tagData.forEach((group, gi) => {
                (group.subgroups || []).forEach((sub, si) => {
                    if (!sub || !sub.name) return;
                    if (sub.name.toLowerCase().includes(query)) {
                        results.push({ groupIdx: gi, subIdx: si, groupName: group.name, subName: sub.name, tagCount: sub.tags?.length || 0 });
                    }
                });
            });

            if (results.length === 0) return;

            const dropdown = document.createElement('div');
            dropdown.className = 'ac-dropdown';
            const rect = this.searchEl.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 2) + 'px';
            dropdown.style.left = rect.left + 'px';
            dropdown.style.width = Math.max(rect.width + 60, 280) + 'px';

            results.slice(0, 15).forEach(r => {
                const item = document.createElement('div');
                item.className = 'ac-item';
                const highlighted = r.subName.replace(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark>$1</mark>');
                item.innerHTML = `<span class="ac-group">${r.groupName}</span><span class="ac-name">${highlighted}</span><span class="ac-count">${r.tagCount > 0 ? r.tagCount + '个' : '...'}</span>`;
                item.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.groupIdx = r.groupIdx;
                    this.subIdx = r.subIdx;
                    _charPage = 1;
                    this.searchEl.value = '';
                    this._hideAutocomplete();
                    this.render();
                });
                dropdown.appendChild(item);
            });

            if (results.length > 15) {
                const more = document.createElement('div');
                more.className = 'ac-more';
                more.textContent = `还有 ${results.length - 15} 个结果...`;
                dropdown.appendChild(more);
            }

            document.body.appendChild(dropdown);
            this._acDropdown = dropdown;
        }

        _hideAutocomplete() {
            if (this._acDropdown) {
                this._acDropdown.remove();
                this._acDropdown = null;
            }
        }

        _renderGroupedFavItems(items) {
            this.gridEl.innerHTML = '';
            const groups = [
                { type: 'character', label: '👤 角色', items: [] },
                { type: 'artist', label: '🎨 画师', items: [] },
                { type: 'tag', label: '🏷️ 标签', items: [] },
            ];
            const typeMap = { character: 0, artist: 1, tag: 2 };
            items.forEach(it => groups[typeMap[it.type] ?? 2].items.push(it));
            const nonEmpty = groups.filter(g => g.items.length > 0);
            if (nonEmpty.length <= 1) { this._renderItems(items); return; }
            const allLazy = [];
            nonEmpty.forEach(group => {
                const section = document.createElement('div');
                section.className = 'fav-section';
                const header = document.createElement('div');
                header.className = 'fav-section-header';
                header.innerHTML = `<span class="fav-section-label">${group.label}</span><span class="fav-section-count">${group.items.length}</span>`;
                section.appendChild(header);
                const grid = document.createElement('div');
                grid.className = 'fav-section-grid';
                const lazy = this._renderItemsInto(grid, group.items, group.type === 'artist');
                allLazy.push(...lazy);
                section.appendChild(grid);
                this.gridEl.appendChild(section);
            });
            if (allLazy.length) _observeLazyImages(allLazy);
        }

        _renderItemsInto(container, items, forceArtist) {
            const selected = this.getSelectedTags();
            const showUsageBadge = this._virtualMode === 'recent' || this._virtualMode === 'frequent';
            const lazyImages = [];
            items.forEach(tag => {
                const div = document.createElement('div');
                const isSelected = selected.has(tag.t);
                const weight = this.getTagWeight(tag.t);
                const hasThumb = !!tag.th;
                const isFav = FavManager.has(tag.t);
                const useCount = tag._count || UsageTracker.getCount(tag.t);
                const isArtistItem = forceArtist || tag.type === 'artist';
                div.className = 'tag-item' + (isSelected ? ' selected' : '') + (hasThumb ? ' tag-char' : '') + (!hasThumb && isArtistItem ? ' tag-artist' : '');
                div.dataset.tag = tag.t;
                const favStar = `<span class="tag-fav-star ${isFav ? 'fav-active' : ''}" title="${isFav ? '取消收藏' : '收藏'}">★</span>`;
                const useBadge = showUsageBadge && useCount > 0 ? `<span class="tag-use-count" title="使用${useCount}次">${useCount}次</span>` : '';
                if (hasThumb) {
                    div.innerHTML = `<div class="thumb-skeleton"></div><img class="tag-thumb img-loading" data-src="${tag.th}" alt="${tag.d}">${favStar}<span class="tag-desc">${tag.d}</span><span class="tag-text">${tag.t.split(',')[0]}</span>${useBadge}<span class="tag-weight">${weight.toFixed(1)}</span>`;
                    lazyImages.push(div.querySelector('img.tag-thumb'));
                    div.addEventListener('click', (e) => {
                        if (e.target.classList.contains('tag-fav-star')) { e.stopPropagation(); FavManager.toggle(tag); this.renderGrid(); return; }
                        e.stopPropagation();
                        if (isArtistItem) { showArtistPreview(tag); } else { showCharPreview(tag); }
                    });
                } else if (isArtistItem) {
                    const displayName = tag.t.replace(/_/g, ' ');
                    const desc = tag.d && !tag.d.match(/^\d+作品$/) ? tag.d : '';
                    div.innerHTML = `${favStar}<span class="tag-text">${displayName}</span>${desc ? `<span class="tag-desc">${desc}</span>` : ''}${useBadge}<span class="tag-weight">${weight.toFixed(1)}</span>`;
                } else {
                    div.innerHTML = `${favStar}<span class="tag-desc">${tag.d}</span><span class="tag-text">${tag.t}</span>${useBadge}<span class="tag-weight">${weight.toFixed(1)}</span>`;
                }
                if (!hasThumb) {
                    div.addEventListener('click', (e) => {
                        if (e.target.classList.contains('tag-fav-star')) { e.stopPropagation(); FavManager.toggle(tag); this.renderGrid(); return; }
                        if (e.shiftKey && isSelected) { this.adjustWeight(tag.t, 0.1); }
                        else if (e.ctrlKey && isSelected) { this.adjustWeight(tag.t, -0.1); }
                        else { this.toggleTag(tag.t, tag.d, tag.th); }
                        this.renderGrid();
                    });
                }
                div.title = hasThumb ? '点击查看详情 | 点⭐收藏' : '点击添加/移除 | 点⭐收藏 | Shift+点击加权重 | Ctrl+点击减权重';
                container.appendChild(div);
            });
            return lazyImages;
        }

        _renderItems(items) {
            this.gridEl.innerHTML = '';
            const frag = document.createDocumentFragment();
            const selected = this.getSelectedTags();
            const isArtistGroup = !this._virtualMode && tagData[this.groupIdx]?.name?.includes('画师');
            const showUsageBadge = this._virtualMode === 'recent' || this._virtualMode === 'frequent';
            const lazyImages = [];

            items.forEach(tag => {
                const div = document.createElement('div');
                const isSelected = selected.has(tag.t);
                const weight = this.getTagWeight(tag.t);
                const hasThumb = !!tag.th;
                const isFav = FavManager.has(tag.t);
                const useCount = tag._count || UsageTracker.getCount(tag.t);
                div.className = 'tag-item' + (isSelected ? ' selected' : '') + (hasThumb ? ' tag-char' : '') + (!hasThumb && isArtistGroup ? ' tag-artist' : '');
                div.dataset.tag = tag.t;

                const favStar = `<span class="tag-fav-star ${isFav ? 'fav-active' : ''}" title="${isFav ? '取消收藏' : '收藏'}">★</span>`;
                const useBadge = showUsageBadge && useCount > 0 ? `<span class="tag-use-count" title="使用${useCount}次">${useCount}次</span>` : '';

                if (hasThumb) {
                    div.innerHTML = `<div class="thumb-skeleton"></div><img class="tag-thumb img-loading" data-src="${tag.th}" alt="${tag.d}">${favStar}<span class="tag-desc">${tag.d}</span><span class="tag-text">${tag.t.split(',')[0]}</span>${useBadge}<span class="tag-weight">${weight.toFixed(1)}</span>`;
                    lazyImages.push(div.querySelector('img.tag-thumb'));
                    div.addEventListener('click', (e) => {
                        if (e.target.classList.contains('tag-fav-star')) { e.stopPropagation(); FavManager.toggle(tag); this.renderGrid(); return; }
                        e.stopPropagation();
                        if (isArtistGroup || tag.type === 'artist') {
                            showArtistPreview(tag);
                        } else {
                            showCharPreview(tag);
                        }
                    });
                } else if (isArtistGroup) {
                    const displayName = tag.t.replace(/_/g, ' ');
                    const desc = tag.d && !tag.d.match(/^\d+作品$/) ? tag.d : '';
                    div.innerHTML = `${favStar}<span class="tag-text">${displayName}</span>${desc ? `<span class="tag-desc">${desc}</span>` : ''}${useBadge}<span class="tag-weight">${weight.toFixed(1)}</span>`;
                } else {
                    div.innerHTML = `${favStar}<span class="tag-desc">${tag.d}</span><span class="tag-text">${tag.t}</span>${useBadge}<span class="tag-weight">${weight.toFixed(1)}</span>`;
                }
                if (!hasThumb) {
                div.addEventListener('click', (e) => {
                    if (e.target.classList.contains('tag-fav-star')) { e.stopPropagation(); FavManager.toggle(tag); this.renderGrid(); return; }
                    if (e.shiftKey && isSelected) {
                        this.adjustWeight(tag.t, 0.1);
                    } else if (e.ctrlKey && isSelected) {
                        this.adjustWeight(tag.t, -0.1);
                    } else {
                        this.toggleTag(tag.t, tag.d, tag.th);
                    }
                    this.renderGrid();
                });
                }
                div.title = hasThumb
                    ? '点击查看详情 | 点⭐收藏'
                    : '点击添加/移除 | 点⭐收藏 | Shift+点击加权重 | Ctrl+点击减权重';
                frag.appendChild(div);
            });
            this.gridEl.appendChild(frag);
            if (lazyImages.length) _observeLazyImages(lazyImages);
            this._updateMobileCharLayout();
        }

        _renderGroupedFavItems(items, emptyMsg) {
            this.gridEl.innerHTML = '';
            const groups = { artist: [], character: [], tag: [] };
            const showUsageBadge = this._virtualMode === 'recent' || this._virtualMode === 'frequent';
            items.forEach(item => {
                const type = item.type || (item.th ? (item.img ? 'artist' : 'character') : 'tag');
                if (groups[type]) groups[type].push(item);
                else groups.tag.push(item);
            });
            const labels = { artist: '🎨 画师', character: '👤 角色', tag: '🏷️ 标签' };
            const order = ['artist', 'character', 'tag'];
            const selected = this.getSelectedTags();
            const hasAny = order.some(t => groups[t].length > 0);
            if (!hasAny) {
                this.gridEl.innerHTML = `<div style="padding:30px;color:var(--text-secondary);text-align:center;width:100%;font-size:0.85rem">${emptyMsg || '暂无内容'}</div>`;
                return;
            }
            const container = document.createElement('div');
            container.className = 'fav-columns';
            order.forEach(type => {
                const arr = groups[type];
                const col = document.createElement('div');
                col.className = 'fav-col fav-col-' + type;
                const header = document.createElement('div');
                header.className = 'fav-col-header';
                header.innerHTML = `<span>${labels[type]}</span><span class="fav-group-count">${arr.length}</span>`;
                col.appendChild(header);
                if (!arr.length) {
                    const empty = document.createElement('div');
                    empty.className = 'fav-col-empty';
                    empty.textContent = '暂无';
                    col.appendChild(empty);
                } else {
                    const grid = document.createElement('div');
                    grid.className = 'fav-col-grid fav-col-grid-' + type;
                    arr.forEach(tag => {
                        const div = document.createElement('div');
                        const isSelected = selected.has(tag.t);
                        const weight = this.getTagWeight(tag.t);
                        const hasThumb = !!tag.th;
                        const isFav = FavManager.has(tag.t);
                        const useCount = tag._count || UsageTracker.getCount(tag.t);
                        const isArtist = type === 'artist';
                        div.className = 'tag-item fav-mini' + (isSelected ? ' selected' : '') + (hasThumb ? ' tag-char' : '') + (!hasThumb && isArtist ? ' tag-artist' : '');
                        div.dataset.tag = tag.t;
                        const favStar = `<span class="tag-fav-star ${isFav ? 'fav-active' : ''}" title="${isFav ? '取消收藏' : '收藏'}">★</span>`;
                        const useBadge = showUsageBadge && useCount > 0 ? `<span class="tag-use-count" title="使用${useCount}次">${useCount}次</span>` : '';
                        if (hasThumb) {
                            div.innerHTML = `<img class="tag-thumb" src="${tag.th}" alt="${tag.d}" loading="lazy" onerror="this.style.display='none'">${favStar}<span class="tag-desc">${tag.d}</span><span class="tag-text">${tag.t.split(',')[0]}</span>${useBadge}<span class="tag-weight">${weight.toFixed(1)}</span>`;
                            div.addEventListener('click', (e) => {
                                if (e.target.classList.contains('tag-fav-star')) { e.stopPropagation(); FavManager.toggle(tag); this.renderGrid(); return; }
                                e.stopPropagation();
                                if (isArtist) showArtistPreview(tag);
                                else showCharPreview(tag);
                            });
                        } else if (isArtist) {
                            const displayName = tag.t.replace(/_/g, ' ');
                            div.innerHTML = `${favStar}<span class="tag-text">${displayName}</span>${useBadge}<span class="tag-weight">${weight.toFixed(1)}</span>`;
                        } else {
                            div.innerHTML = `${favStar}<span class="tag-desc">${tag.d}</span><span class="tag-text">${tag.t}</span>${useBadge}<span class="tag-weight">${weight.toFixed(1)}</span>`;
                        }
                        if (!hasThumb) {
                            div.addEventListener('click', (e) => {
                                if (e.target.classList.contains('tag-fav-star')) { e.stopPropagation(); FavManager.toggle(tag); this.renderGrid(); return; }
                                if (e.shiftKey && isSelected) this.adjustWeight(tag.t, 0.1);
                                else if (e.ctrlKey && isSelected) this.adjustWeight(tag.t, -0.1);
                                else this.toggleTag(tag.t, tag.d, tag.th);
                                this.renderGrid();
                            });
                        }
                        div.title = hasThumb ? '点击查看详情' : '点击添加/移除';
                        grid.appendChild(div);
                    });
                    col.appendChild(grid);
                }
                container.appendChild(col);
            });
            this.gridEl.appendChild(container);
            this._updateMobileCharLayout();
        }

        getSelectedTags() {
            const parts = this.textarea.value.split(',').map(s => s.trim()).filter(Boolean);
            const set = new Set();
            parts.forEach(p => {
                const m = p.match(/^\((.+?):([\d.]+)\)$/);
                const name = m ? m[1] : p;
                set.add(name);
                if (name.startsWith('@')) set.add(name.slice(1).replace(/ /g, '_'));
                if (!name.startsWith('@')) {
                    set.add(name.replace(/ /g, '_'));
                    set.add(name.replace(/_/g, ' '));
                }
            });
            return set;
        }

        getTagWeight(tagText) {
            const parts = this.textarea.value.split(',').map(s => s.trim());
            for (const p of parts) {
                const m = p.match(/^\((.+?):([\d.]+)\)$/);
                if (m && m[1] === tagText) return parseFloat(m[2]);
                if (p === tagText) return 1.0;
            }
            return 1.0;
        }

        toggleTag(tagText, tagDesc, tagThumb, tagType) {
            const isArtist = !this._virtualMode && tagData[this.groupIdx]?.name?.includes('画师');
            let formatted = tagText;
            if (isAnimaMode()) {
                formatted = isArtist ? formatAnimaArtistTag(tagText) : formatAnimaTag(tagText);
            }
            const resolvedType = tagType || (isArtist ? 'artist' : (tagThumb ? 'character' : 'tag'));

            let parts = this.textarea.value.split(',').map(s => s.trim()).filter(Boolean);
            const idx = parts.findIndex(p => {
                const m = p.match(/^\((.+?):([\d.]+)\)$/);
                const name = m ? m[1] : p;
                return name === tagText || name === formatted;
            });
            if (idx >= 0) {
                parts.splice(idx, 1);
            } else {
                parts.push(formatted);
                UsageTracker.record(tagText, tagDesc, tagThumb, resolvedType);
            }
            this.textarea.value = parts.join(', ');
            this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }

        adjustWeight(tagText, delta) {
            let parts = this.textarea.value.split(',').map(s => s.trim()).filter(Boolean);
            parts = parts.map(p => {
                const m = p.match(/^\((.+?):([\d.]+)\)$/);
                const name = m ? m[1] : p;
                if (name !== tagText) return p;
                let w = m ? parseFloat(m[2]) : 1.0;
                w = Math.max(0.1, Math.min(2.0, +(w + delta).toFixed(1)));
                return w === 1.0 ? tagText : `(${tagText}:${w.toFixed(1)})`;
            });
            this.textarea.value = parts.join(', ');
            this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function loadImageWithFade(imgEl, url) {
        imgEl.style.opacity = '0.3';
        imgEl.onload = () => { imgEl.style.opacity = '1'; };
        imgEl.onerror = () => { imgEl.style.opacity = '1'; };
        imgEl.src = url;
    }

    function showCharPreview(tag) {
        const imgUrl = tag.th ? tag.th.replace('/thumbs/', '/').replace('.webp', '.png') : '';
        if (!imgUrl) return;
        let overlay = document.getElementById('char-preview-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'char-preview-overlay';
            overlay.className = 'char-preview-overlay';
            overlay.innerHTML = `
                <div class="char-preview-card">
                    <img class="char-preview-img" alt="">
                    <div class="char-preview-info">
                        <div class="char-preview-name"></div>
                        <div class="char-preview-trigger"></div>
                        <div class="char-preview-tags"></div>
                        <div class="char-preview-lora"></div>
                        <div class="char-preview-actions">
                            <button class="char-preview-btn" data-action="trigger">填入触发词</button>
                            <button class="char-preview-btn" data-action="trigger-tags">触发词 + 特征标签</button>
                            <button class="char-preview-btn char-preview-btn-fav" data-action="fav">☆ 收藏</button>
                        </div>
                    </div>
                    <button class="char-preview-close">✕</button>
                </div>`;
            document.body.appendChild(overlay);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay || e.target.classList.contains('char-preview-close')) {
                    overlay.classList.add('hidden');
                }
                if (e.target.dataset.action === 'fav') {
                    const storedTag = overlay._currentTag;
                    if (!storedTag) return;
                    FavManager.toggle(storedTag);
                    const btn = e.target;
                    const isFav = FavManager.has(storedTag.t);
                    btn.textContent = isFav ? '★ 已收藏' : '☆ 收藏';
                    btn.classList.toggle('char-preview-btn-fav-active', isFav);
                    return;
                }
                if (e.target.dataset.action) {
                    const storedTag = overlay._currentTag;
                    if (!storedTag) return;
                    let text = storedTag.t;
                    if (e.target.dataset.action === 'trigger-tags' && storedTag.tags && storedTag.tags.length > 0) {
                        text = text + ', ' + storedTag.tags.join(', ');
                    }
                    UsageTracker.record(storedTag.t, storedTag.d, storedTag.th, 'character');
                    const ta = dom.txtPositive;
                    const cur = ta.value.trim();
                    ta.value = cur ? cur + ', ' + text : text;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    overlay.classList.add('hidden');
                }
            });
        }
        overlay._currentTag = tag;
        const previewImg = overlay.querySelector('.char-preview-img');
        previewImg.alt = tag.d;
        loadImageWithFade(previewImg, imgUrl);
        overlay.querySelector('.char-preview-name').textContent = tag.d;
        overlay.querySelector('.char-preview-trigger').innerHTML = `<span style="color:var(--text-secondary);font-size:0.7rem">触发词：</span>${tag.t}`;
        const tagsEl = overlay.querySelector('.char-preview-tags');
        if (tag.tags && tag.tags.length > 0) {
            tagsEl.innerHTML = tag.tags.map(t => `<span class="char-tag-pill">${t}</span>`).join('');
            tagsEl.classList.remove('hidden');
        } else {
            tagsEl.innerHTML = '';
            tagsEl.classList.add('hidden');
        }
        const loraEl = overlay.querySelector('.char-preview-lora');
        if (tag.lora) {
            loraEl.innerHTML = `<a href="${tag.lora}" target="_blank" rel="noopener">CivitAI LoRA 模型下载</a>`;
            loraEl.classList.remove('hidden');
        } else {
            loraEl.classList.add('hidden');
        }
        const favBtn = overlay.querySelector('[data-action="fav"]');
        if (favBtn) {
            const isFav = FavManager.has(tag.t);
            favBtn.textContent = isFav ? '★ 已收藏' : '☆ 收藏';
            favBtn.classList.toggle('char-preview-btn-fav-active', isFav);
        }
        overlay.classList.remove('hidden');
    }

    function showArtistPreview(tag) {
        const imgUrl = tag.img || (tag.th ? tag.th.replace('/thumbs/', '/').replace('.webp', '.png') : '');
        if (!imgUrl) return;
        let overlay = document.getElementById('artist-preview-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'artist-preview-overlay';
            overlay.className = 'char-preview-overlay';
            overlay.innerHTML = `
                <div class="char-preview-card">
                    <img class="char-preview-img" alt="">
                    <div class="char-preview-info">
                        <div class="char-preview-name"></div>
                        <div class="char-preview-trigger"></div>
                        <div class="char-preview-tags"></div>
                        <div class="char-preview-actions">
                            <button class="char-preview-btn" data-action="trigger">填入画师触发词</button>
                            <button class="char-preview-btn char-preview-btn-fav" data-action="fav">☆ 收藏</button>
                        </div>
                    </div>
                    <button class="char-preview-close">✕</button>
                </div>`;
            document.body.appendChild(overlay);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay || e.target.classList.contains('char-preview-close')) {
                    overlay.classList.add('hidden');
                }
                if (e.target.dataset.action === 'fav') {
                    const storedTag = overlay._currentTag;
                    if (!storedTag) return;
                    const artTag = { ...storedTag, type: 'artist' };
                    if (storedTag.img) artTag.img = storedTag.img;
                    FavManager.toggle(artTag);
                    const isFav = FavManager.has(storedTag.t);
                    e.target.textContent = isFav ? '★ 已收藏' : '☆ 收藏';
                    e.target.classList.toggle('char-preview-btn-fav-active', isFav);
                    return;
                }
                if (e.target.dataset.action === 'trigger') {
                    const storedTag = overlay._currentTag;
                    if (!storedTag) return;
                    UsageTracker.record(storedTag.t, storedTag.d, storedTag.th, 'artist');
                    const formatted = isAnimaMode() ? formatAnimaArtistTag(storedTag.t) : storedTag.t;
                    const ta = dom.txtPositive;
                    const cur = ta.value.trim();
                    ta.value = cur ? cur + ', ' + formatted : formatted;
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                    overlay.classList.add('hidden');
                }
            });
        }
        overlay._currentTag = tag;
        const previewImg2 = overlay.querySelector('.char-preview-img');
        previewImg2.alt = tag.d;
        loadImageWithFade(previewImg2, imgUrl);
        overlay.querySelector('.char-preview-name').textContent = tag.d;
        overlay.querySelector('.char-preview-trigger').innerHTML = `<span style="color:var(--text-secondary);font-size:0.7rem">触发词：</span>${tag.t}`;
        const tagsEl = overlay.querySelector('.char-preview-tags');
        if (tag.count) {
            tagsEl.innerHTML = `<span class="char-tag-pill">Danbooru ${tag.count.toLocaleString()} 作品</span>`;
            tagsEl.classList.remove('hidden');
        } else {
            tagsEl.classList.add('hidden');
        }
        const favBtn = overlay.querySelector('[data-action="fav"]');
        if (favBtn) {
            const isFav = FavManager.has(tag.t);
            favBtn.textContent = isFav ? '★ 已收藏' : '☆ 收藏';
            favBtn.classList.toggle('char-preview-btn-fav-active', isFav);
        }
        overlay.classList.remove('hidden');
    }

    function setupTagPickers() {
        if (tagData.length === 0) return;
        posTagPicker = new TagPicker('pos', dom.txtPositive);
        negTagPicker = new TagPicker('neg', dom.txtNegative);

        // Collapse toggle for positive
        const posToggle = document.getElementById('pos-collapse-toggle');
        const posBody = document.getElementById('tag-picker-pos');
        posToggle.addEventListener('click', () => {
            const hidden = posBody.classList.toggle('hidden');
            posToggle.textContent = hidden ? '▶ 展开标签选择器' : '▼ 收起标签选择器';
            posToggle.classList.toggle('expanded', !hidden);
        });

        // Collapse toggle for negative
        const toggle = document.getElementById('neg-collapse-toggle');
        const body = document.getElementById('tag-picker-neg');
        toggle.addEventListener('click', () => {
            const hidden = body.classList.toggle('hidden');
            toggle.textContent = hidden ? '▶ 展开标签选择器' : '▼ 收起标签选择器';
            toggle.classList.toggle('expanded', !hidden);
        });

        // Clear buttons
        document.querySelectorAll('.btn-clear-prompt').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const textarea = document.getElementById(btn.dataset.target);
                if (!textarea) return;
                textarea.value = '';
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                btn.textContent = '✓ 已清空';
                setTimeout(() => btn.textContent = '🗑️ 清空', 1500);
            });
        });

        // Copy buttons
        document.querySelectorAll('.btn-copy-prompt:not(.btn-clear-prompt)').forEach(btn => {
            if (!btn.dataset.target) return;
            btn.addEventListener('click', () => {
                const textarea = document.getElementById(btn.dataset.target);
                if (!textarea) return;
                navigator.clipboard.writeText(textarea.value).then(() => {
                    btn.textContent = '✓ 已复制';
                    setTimeout(() => btn.textContent = '📋 复制', 1500);
                });
            });
        });
    }

    // ==================== 初始化 ====================
    async function init() {
        await loadTags();
        renderHistory();
        setupTagPickers();
        setupMobileTagsMount();
        setupMobileArtistNav();
        setupMobileCharBrowser();
        renderMobileSeriesList('');

        Promise.all([
            loadCheckpoints(),
            loadSamplers(),
            loadVAEs(),
            loadLoRAs(),
            loadControlNets(),
            loadIPAdapterModels(),
            loadAnimaModels(),
        ]).then(() => updateArchAwarePanels());
    }

    // ==================== 手机端角色全屏浏览 ====================
    const _charBrowserState = { seriesId: null, seriesName: '', page: 1, query: '', allTags: [] };
    const _seriesListState = { page: 1, filter: '' };
    const _SERIES_PAGE_SIZE = 120;
    const _SERIES_RECENT_MAX = 8;

    function _rememberRecentSeries(seriesId) {
        try {
            const key = 'comfyui_recent_series';
            let list = JSON.parse(localStorage.getItem(key) || '[]');
            list = list.filter(id => id !== seriesId);
            list.unshift(seriesId);
            if (list.length > _SERIES_RECENT_MAX) list.length = _SERIES_RECENT_MAX;
            localStorage.setItem(key, JSON.stringify(list));
        } catch { /* ignore */ }
    }

    function openCharBrowser(seriesId, seriesName) {
        if (!seriesId) return;
        _charBrowserState.seriesId = seriesId;
        _charBrowserState.seriesName = seriesName || seriesId;
        _charBrowserState.page = 1;
        _charBrowserState.query = '';
        _rememberRecentSeries(seriesId);

        const overlay = document.getElementById('char-browser-overlay');
        const title = document.getElementById('char-browser-title');
        const search = document.getElementById('char-browser-search');
        if (!overlay) return;

        if (title) title.textContent = _charBrowserState.seriesName;
        if (search) search.value = '';
        overlay.classList.remove('hidden');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('char-browser-open');
        _renderCharBrowserGrid(true);
    }

    function closeCharBrowser() {
        const overlay = document.getElementById('char-browser-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.setAttribute('aria-hidden', 'true');
        }
        document.body.classList.remove('char-browser-open');
    }

    function _getCharBrowserPageItems() {
        const q = _charBrowserState.query.toLowerCase().trim();
        let items = _charBrowserState.allTags;
        if (q) {
            items = items.filter(t =>
                t.t.toLowerCase().includes(q) || (t.d || '').toLowerCase().includes(q)
            );
        }
        const totalPages = Math.max(1, Math.ceil(items.length / CHAR_BROWSER_PER_PAGE));
        if (_charBrowserState.page > totalPages) _charBrowserState.page = totalPages;
        if (_charBrowserState.page < 1) _charBrowserState.page = 1;
        const start = (_charBrowserState.page - 1) * CHAR_BROWSER_PER_PAGE;
        return { items: items.slice(start, start + CHAR_BROWSER_PER_PAGE), total: items.length, totalPages };
    }

    function _renderCharBrowserPagination(total, totalPages) {
        const nav = document.getElementById('char-browser-pagination');
        if (!nav) return;
        nav.innerHTML = '';
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.textContent = '← 上一页';
        prevBtn.disabled = _charBrowserState.page <= 1;
        prevBtn.addEventListener('click', () => { _charBrowserState.page--; _renderCharBrowserGrid(false); });

        const info = document.createElement('span');
        info.className = 'page-info';
        info.textContent = `第 ${_charBrowserState.page} / ${totalPages} 页（共 ${total} 个角色）`;

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.textContent = '下一页 →';
        nextBtn.disabled = _charBrowserState.page >= totalPages;
        nextBtn.addEventListener('click', () => { _charBrowserState.page++; _renderCharBrowserGrid(false); });

        nav.append(prevBtn, info, nextBtn);
    }

    function _createCharBrowserCard(tag, isSelected, isFav) {
        const div = document.createElement('div');
        div.className = 'char-browser-card' + (isSelected ? ' selected' : '');
        div.dataset.tag = tag.t;

        const thumb = document.createElement('div');
        thumb.className = 'char-browser-thumb';

        const skel = document.createElement('div');
        skel.className = 'thumb-skeleton';
        thumb.appendChild(skel);

        const img = document.createElement('img');
        img.className = 'char-browser-img img-loading';
        if (tag.th) img.dataset.src = tag.th;
        img.alt = tag.d || tag.t.split(',')[0];
        thumb.appendChild(img);

        const star = document.createElement('span');
        star.className = 'char-browser-fav' + (isFav ? ' fav-active' : '');
        star.title = '收藏';
        star.textContent = '★';
        thumb.appendChild(star);

        const info = document.createElement('div');
        info.className = 'char-browser-info';

        const desc = document.createElement('span');
        desc.className = 'char-browser-name';
        desc.textContent = tag.d || tag.t.split(',')[0];

        const text = document.createElement('span');
        text.className = 'char-browser-trigger';
        text.textContent = tag.t.split(',')[0];

        info.append(desc, text);
        div.append(thumb, info);
        return div;
    }

    async function _renderCharBrowserGrid(showLoading) {
        const grid = document.getElementById('char-browser-grid');
        if (!grid) return;
        if (showLoading) {
            grid.innerHTML = Array(6).fill('<div class="char-browser-card char-browser-skeleton"><div class="char-browser-thumb"></div><div class="char-browser-info"><span class="char-browser-name">&nbsp;</span><span class="char-browser-trigger">&nbsp;</span></div></div>').join('');
        }

        const tags = await _fetchSeriesChars(_charBrowserState.seriesId);
        _charBrowserState.allTags = tags;

        const { items, total, totalPages } = _getCharBrowserPageItems();
        grid.innerHTML = '';
        if (!items.length) {
            grid.innerHTML = '<div class="char-browser-empty">暂无匹配角色</div>';
            _renderCharBrowserPagination(0, 1);
            return;
        }

        const selected = posTagPicker ? posTagPicker.getSelectedTags() : new Set();
        const lazyImages = [];
        items.forEach(tag => {
            const isSelected = selected.has(tag.t);
            const isFav = FavManager.has(tag.t);
            const div = _createCharBrowserCard(tag, isSelected, isFav);
            const img = div.querySelector('img.char-browser-img');
            if (img) lazyImages.push(img);
            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('char-browser-fav')) {
                    e.stopPropagation();
                    FavManager.toggle(tag);
                    _renderCharBrowserGrid(false);
                    return;
                }
                showCharPreview(tag);
            });
            grid.appendChild(div);
        });
        if (lazyImages.length) _observeCharBrowserImages(lazyImages);
        _renderCharBrowserPagination(total, totalPages);
    }

    let _seriesCoverObserver = null;
    function _observeSeriesCoverImages(imgList) {
        if (!imgList.length) return;
        if (!_seriesCoverObserver) {
            _seriesCoverObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (!src) return;
                    _seriesCoverObserver.unobserve(img);
                    img.onload = () => {
                        img.classList.remove('img-loading');
                        img.classList.add('img-loaded');
                        img.parentElement?.querySelector('.char-series-cover-skel')?.classList.add('hide');
                    };
                    img.onerror = () => {
                        img.style.display = 'none';
                        const fb = img.parentElement?.querySelector('.char-series-cover-fallback');
                        if (fb) fb.style.display = 'flex';
                        img.parentElement?.querySelector('.char-series-cover-skel')?.classList.add('hide');
                    };
                    img.src = src;
                });
            }, { root: null, rootMargin: '200px' });
        }
        imgList.forEach(img => { if (img) _seriesCoverObserver.observe(img); });
    }

    function _renderSeriesPagination(total, totalPages) {
        const nav = document.getElementById('char-series-pagination');
        if (!nav) return;
        nav.innerHTML = '';
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.textContent = '← 上一页';
        prevBtn.disabled = _seriesListState.page <= 1;
        prevBtn.addEventListener('click', () => {
            _seriesListState.page--;
            renderMobileSeriesList(_seriesListState.filter, { keepPage: true });
        });

        const info = document.createElement('span');
        info.className = 'page-info';
        info.textContent = `第 ${_seriesListState.page} / ${totalPages} 页（共 ${total} 个作品）`;

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.textContent = '下一页 →';
        nextBtn.disabled = _seriesListState.page >= totalPages;
        nextBtn.addEventListener('click', () => {
            _seriesListState.page++;
            renderMobileSeriesList(_seriesListState.filter, { keepPage: true });
        });

        nav.append(prevBtn, info, nextBtn);
    }

    function _createSeriesCard(series) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'char-series-card';
        const count = series._seriesCount || 0;
        const countText = count > 0 ? `${count} 角色` : '';
        const cover = series._coverUrl || '';

        const coverEl = document.createElement('div');
        coverEl.className = 'char-series-cover';
        coverEl.innerHTML = '<div class="char-series-cover-skel"></div>';
        if (cover) {
            const img = document.createElement('img');
            img.className = 'char-series-cover-img img-loading';
            img.dataset.src = cover;
            img.alt = series.name;
            coverEl.appendChild(img);
        } else {
            const fb = document.createElement('div');
            fb.className = 'char-series-cover-fallback';
            fb.style.display = 'flex';
            fb.textContent = '📁';
            coverEl.appendChild(fb);
        }

        const nameEl = document.createElement('span');
        nameEl.className = 'char-series-name';
        nameEl.textContent = series.name;

        const countEl = document.createElement('span');
        countEl.className = 'char-series-count';
        countEl.textContent = countText;

        btn.append(coverEl, nameEl, countEl);
        btn.addEventListener('click', () => openCharBrowser(series._seriesId, series.name));
        return btn;
    }

    function _appendSeriesGrid(container, seriesList, lazyImages) {
        const grid = document.createElement('div');
        grid.className = 'char-series-grid';
        seriesList.forEach(s => {
            const card = _createSeriesCard(s);
            const img = card.querySelector('img.char-series-cover-img');
            if (img) lazyImages.push(img);
            grid.appendChild(card);
        });
        container.appendChild(grid);
    }

    function renderMobileSeriesList(filter, options = {}) {
        const scroll = document.getElementById('char-series-scroll');
        if (!scroll) return;

        if (_charGroupIdx < 0) {
            _charGroupIdx = tagData.findIndex(g => g.name === '人物');
        }

        const q = (filter ?? _seriesListState.filter ?? '').toLowerCase().trim();
        if (!options.keepPage && q !== _seriesListState.filter) {
            _seriesListState.page = 1;
        }
        _seriesListState.filter = q;

        let subs = (_charGroupIdx >= 0 ? tagData[_charGroupIdx]?.subgroups : []) || [];
        subs = subs.filter(s => s && s._seriesId);

        if (!subs.length) {
            scroll.innerHTML = '<div class="char-browser-empty">正在加载作品列表…<br><small>共 800+ 个作品，请稍候</small></div>';
            _renderSeriesPagination(0, 1);
            _loadSeriesFromApi().then(ok => {
                if (ok) renderMobileSeriesList(q, options);
                else scroll.innerHTML = '<div class="char-browser-empty">作品列表加载失败<br><small>请检查网络后刷新页面；线上版需访问已部署站点</small></div>';
            });
            return;
        }

        if (!subs.every(s => s._coverUrl !== undefined)) {
            scroll.innerHTML = '<div class="char-browser-empty">正在加载作品封面…</div>';
            _renderSeriesPagination(0, 1);
            _loadSeriesFromApi().then(ok => {
                if (ok) renderMobileSeriesList(q, options);
            });
            return;
        }

        let list = subs;
        if (q) list = subs.filter(s => s.name.toLowerCase().includes(q));

        const totalPages = Math.max(1, Math.ceil(list.length / _SERIES_PAGE_SIZE));
        if (_seriesListState.page > totalPages) _seriesListState.page = totalPages;
        if (_seriesListState.page < 1) _seriesListState.page = 1;
        const pageStart = (_seriesListState.page - 1) * _SERIES_PAGE_SIZE;
        const pageList = list.slice(pageStart, pageStart + _SERIES_PAGE_SIZE);

        let recentIds = [];
        try { recentIds = JSON.parse(localStorage.getItem('comfyui_recent_series') || '[]'); } catch { /* ignore */ }
        recentIds = recentIds.slice(0, _SERIES_RECENT_MAX);

        scroll.innerHTML = '';
        const lazyImages = [];

        if (!q && _seriesListState.page === 1 && recentIds.length) {
            const recentLabel = document.createElement('div');
            recentLabel.className = 'char-series-section-label';
            recentLabel.textContent = '最近浏览';
            scroll.appendChild(recentLabel);
            const recentList = [];
            recentIds.forEach(id => {
                const s = subs.find(x => x._seriesId === id);
                if (s) recentList.push(s);
            });
            if (recentList.length) {
                const recentWrap = document.createElement('div');
                recentWrap.className = 'char-series-recent-scroll';
                const recentGrid = document.createElement('div');
                recentGrid.className = 'char-series-grid char-series-grid-recent';
                recentList.forEach(s => {
                    const card = _createSeriesCard(s);
                    const img = card.querySelector('img.char-series-cover-img');
                    if (img) lazyImages.push(img);
                    recentGrid.appendChild(card);
                });
                recentWrap.appendChild(recentGrid);
                scroll.appendChild(recentWrap);
            }
        }

        const allLabel = document.createElement('div');
        allLabel.className = 'char-series-section-label';
        allLabel.textContent = q
            ? `搜索结果（${list.length}）`
            : `全部作品（${list.length}）· 第 ${_seriesListState.page}/${totalPages} 页`;
        scroll.appendChild(allLabel);

        if (!pageList.length) {
            const empty = document.createElement('div');
            empty.className = 'char-browser-empty';
            empty.textContent = '未找到匹配作品';
            scroll.appendChild(empty);
            _renderSeriesPagination(list.length, totalPages);
            if (lazyImages.length) _observeSeriesCoverImages(lazyImages);
            return;
        }

        _appendSeriesGrid(scroll, pageList, lazyImages);
        if (lazyImages.length) _observeSeriesCoverImages(lazyImages);
        _renderSeriesPagination(list.length, totalPages);

        if (options.keepPage) scroll.scrollTop = 0;
    }

    function setupMobileCharBrowser() {
        document.getElementById('char-browser-back')?.addEventListener('click', closeCharBrowser);
        document.getElementById('char-browser-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'char-browser-overlay') closeCharBrowser();
        });

        const search = document.getElementById('char-browser-search');
        if (search) {
            let debounce;
            search.addEventListener('input', () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    _charBrowserState.query = search.value;
                    _charBrowserState.page = 1;
                    _renderCharBrowserGrid(false);
                }, 250);
            });
        }

        const seriesSearch = document.getElementById('char-series-search');
        if (seriesSearch) {
            let debounce;
            seriesSearch.addEventListener('input', () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => renderMobileSeriesList(seriesSearch.value, { keepPage: false }), 200);
            });
        }
    }

    function setupMobileTagsMount() {
        document.getElementById('tag-picker-neg')?.closest('.tag-picker-collapse')?.classList.add('mobile-tags-hidden');

        document.querySelectorAll('.mobile-tags-switch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const pane = btn.dataset.tagsPane;
                document.querySelectorAll('.mobile-tags-switch-btn').forEach(b => {
                    b.classList.toggle('active', b === btn);
                });
                const posCollapse = document.getElementById('tag-picker-pos')?.closest('.tag-picker-collapse');
                const negCollapse = document.getElementById('tag-picker-neg')?.closest('.tag-picker-collapse');
                posCollapse?.classList.toggle('mobile-tags-hidden', pane !== 'pos');
                negCollapse?.classList.toggle('mobile-tags-hidden', pane !== 'neg');
                document.getElementById('tag-picker-pos')?.classList.remove('hidden');
                document.getElementById('tag-picker-neg')?.classList.remove('hidden');
                if (pane === 'pos') posTagPicker?.render();
                if (pane === 'neg') negTagPicker?.render();
            });
        });
    }

    function syncMobileArtistNav(subIdx) {
        document.querySelectorAll('#mobile-artist-nav .mobile-artist-nav-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === subIdx);
        });
    }

    function setupMobileArtistNav() {
        const nav = document.getElementById('mobile-artist-nav');
        if (!nav) return;
        nav.querySelectorAll('.mobile-artist-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = parseInt(btn.dataset.artistMode, 10);
                if (!posTagPicker || _artistGroupIdx < 0 || Number.isNaN(mode)) return;
                _prepareArtistTab(posTagPicker, mode);
                syncMobileArtistNav(mode);
                posTagPicker.render();
            });
        });
    }

    function switchMobileTab(tab, options = {}) {
        const nav = document.getElementById('mobile-nav');
        const main = document.querySelector('.main');
        if (!nav || !main) return;

        const tabs = ['create', 'characters', 'tags', 'artists', 'settings', 'history'];
        main.classList.remove(...tabs.map(t => 'mobile-tab-' + t));
        main.classList.add('mobile-tab-' + tab);
        nav.querySelectorAll('.mobile-nav-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mobileTab === tab);
        });

        document.body.classList.toggle('mobile-artist-nav-visible', tab === 'artists');

        const fab = document.getElementById('btn-generate-fab');
        if (fab) fab.classList.toggle('hidden', tab === 'settings');

        if (tab === 'characters') renderMobileSeriesList(document.getElementById('char-series-search')?.value || '');
        if (tab === 'tags') {
            const focus = options.tagsFocus || 'pos';
            document.querySelectorAll('.mobile-tags-switch-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.tagsPane === focus);
            });
            const posCollapse = document.getElementById('tag-picker-pos')?.closest('.tag-picker-collapse');
            const negCollapse = document.getElementById('tag-picker-neg')?.closest('.tag-picker-collapse');
            posCollapse?.classList.toggle('mobile-tags-hidden', focus !== 'pos');
            negCollapse?.classList.toggle('mobile-tags-hidden', focus !== 'neg');
            document.getElementById('tag-picker-pos')?.classList.remove('hidden');
            document.getElementById('tag-picker-neg')?.classList.remove('hidden');
            posTagPicker?._ensureValidGroupForMobile();
            negTagPicker?._ensureValidGroupForMobile();
            if (focus === 'pos') posTagPicker?.render();
            if (focus === 'neg') negTagPicker?.render();
        }
        if (tab === 'artists') {
            const posCollapse = document.getElementById('tag-picker-pos')?.closest('.tag-picker-collapse');
            const negCollapse = document.getElementById('tag-picker-neg')?.closest('.tag-picker-collapse');
            posCollapse?.classList.remove('mobile-tags-hidden');
            negCollapse?.classList.add('mobile-tags-hidden');
            document.getElementById('tag-picker-pos')?.classList.remove('hidden');
            if (posTagPicker) {
                _prepareArtistTab(posTagPicker, 0);
            }
            syncMobileArtistNav(0);
            posTagPicker?.render();
        }
        if (tab !== 'tags' && tab !== 'artists') {
            posTagPicker?.render();
            negTagPicker?.render();
        }
    }

    function setupGenerateFab() {
        const fab = document.getElementById('btn-generate-fab');
        if (!fab) return;
        fab.addEventListener('click', () => {
            const modeNai = document.querySelector('.mode-tab[data-mode="nai"]')?.classList.contains('active');
            if (modeNai) {
                document.getElementById('btn-nai-generate')?.click();
            } else {
                document.getElementById('btn-generate')?.click();
            }
        });
    }

    // ==================== 手机端导航 & 结果区 ====================
    function updateMobileResultUI(hasResult) {
        const btn = document.getElementById('btn-result-expand');
        const wrapper = document.getElementById('result-wrapper');
        if (!btn || !wrapper) return;
        if (!window.matchMedia('(max-width: 640px)').matches) {
            btn.classList.add('hidden');
            wrapper.classList.remove('expanded');
            return;
        }
        if (hasResult) {
            btn.classList.remove('hidden');
            wrapper.classList.add('expanded');
            btn.textContent = '收起结果 ▲';
            btn.setAttribute('aria-expanded', 'true');
        } else {
            btn.classList.add('hidden');
            wrapper.classList.remove('expanded');
            btn.textContent = '展开结果 ▼';
            btn.setAttribute('aria-expanded', 'false');
        }
    }

    function setupMobileResultExpand() {
        const btn = document.getElementById('btn-result-expand');
        const wrapper = document.getElementById('result-wrapper');
        if (!btn || !wrapper) return;

        btn.addEventListener('click', () => {
            const expanded = wrapper.classList.toggle('expanded');
            btn.textContent = expanded ? '收起结果 ▲' : '展开结果 ▼';
            btn.setAttribute('aria-expanded', String(expanded));
        });
    }

    function setupMobileNav() {
        const nav = document.getElementById('mobile-nav');
        if (!nav) return;

        nav.querySelectorAll('.mobile-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => switchMobileTab(btn.dataset.mobileTab));
        });

        document.querySelectorAll('.mobile-shortcut-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.mobileTab;
                const tagsFocus = btn.dataset.tagsFocus || 'pos';
                switchMobileTab(tab, { tagsFocus });
            });
        });
    }

    // ==================== 折叠组 ====================
    function setupPanelGroups() {
        document.querySelectorAll('.panel-group-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('open');
            });
        });
    }

    // ==================== 面板宽度拖拽 ====================
    function setupSidebarResize() {
        const resizer = document.getElementById('sidebar-resizer');
        const sidebar = document.querySelector('.sidebar');
        if (!resizer || !sidebar) return;

        let startX, startW;

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startX = e.clientX;
            startW = sidebar.getBoundingClientRect().width;
            resizer.classList.add('active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';

            const onMove = (ev) => {
                const w = Math.max(240, Math.min(600, startW + (ev.clientX - startX)));
                sidebar.style.width = w + 'px';
            };
            const onUp = () => {
                resizer.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    // ==================== 自定义工作流模式 ====================
    const WF_STORAGE_KEY = 'comfyui_web_workflows';
    let currentWorkflowData = null;
    let objectInfoCache = null;

    function setupWorkflowMode() {
        const tabs = document.querySelectorAll('.mode-tab');
        const modeSimple = document.getElementById('mode-simple');
        const modeWorkflow = document.getElementById('mode-workflow');
        const modeNai = document.getElementById('mode-nai');
        const btnGenerate = document.getElementById('btn-generate');
        const btnNaiGenerate = document.getElementById('btn-nai-generate');
        const btnDzmm = document.getElementById('btn-dzmm');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const mode = tab.dataset.mode;
                modeSimple.classList.toggle('hidden', mode !== 'simple');
                modeWorkflow.classList.toggle('hidden', mode !== 'workflow');
                if (modeNai) modeNai.classList.toggle('hidden', mode !== 'nai');
                if (btnGenerate) btnGenerate.classList.toggle('hidden', mode === 'nai');
                if (btnNaiGenerate) btnNaiGenerate.classList.toggle('hidden', mode !== 'nai');
                if (btnDzmm) btnDzmm.classList.toggle('hidden', mode === 'nai');
            });
        });

        document.getElementById('btn-wf-import').addEventListener('click', () => {
            document.getElementById('inp-wf-file').click();
        });

        document.getElementById('inp-wf-file').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const name = file.name.replace(/\.json$/i, '');
                importWorkflow(ev.target.result, name);
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        document.getElementById('btn-wf-paste').addEventListener('click', () => {
            document.getElementById('modal-wf-paste').classList.remove('hidden');
            document.getElementById('txt-wf-paste').value = '';
            document.getElementById('inp-wf-name').value = '';
        });

        document.getElementById('btn-wf-paste-ok').addEventListener('click', () => {
            const json = document.getElementById('txt-wf-paste').value.trim();
            const name = document.getElementById('inp-wf-name').value.trim() || '未命名工作流';
            if (!json) return alert('请粘贴工作流 JSON');
            importWorkflow(json, name);
            document.getElementById('modal-wf-paste').classList.add('hidden');
        });

        document.getElementById('btn-wf-paste-cancel').addEventListener('click', () => {
            document.getElementById('modal-wf-paste').classList.add('hidden');
        });

        document.getElementById('sel-workflow').addEventListener('change', (e) => {
            const name = e.target.value;
            if (!name) {
                currentWorkflowData = null;
                renderWorkflowParams(null);
                return;
            }
            const workflows = loadWorkflows();
            const wf = workflows[name];
            if (wf) {
                currentWorkflowData = wf;
                renderWorkflowParams(wf);
            }
        });

        document.getElementById('btn-wf-delete').addEventListener('click', () => {
            const sel = document.getElementById('sel-workflow');
            const name = sel.value;
            if (!name) return;
            if (!confirm(`确定删除工作流「${name}」？`)) return;
            const workflows = loadWorkflows();
            delete workflows[name];
            saveWorkflows(workflows);
            refreshWorkflowList();
            currentWorkflowData = null;
            renderWorkflowParams(null);
        });

        refreshWorkflowList();
    }

    function loadWorkflows() {
        try {
            return JSON.parse(localStorage.getItem(WF_STORAGE_KEY) || '{}');
        } catch { return {}; }
    }

    function saveWorkflows(data) {
        localStorage.setItem(WF_STORAGE_KEY, JSON.stringify(data));
    }

    function refreshWorkflowList() {
        const sel = document.getElementById('sel-workflow');
        const workflows = loadWorkflows();
        sel.innerHTML = '<option value="">-- 选择已保存的工作流 --</option>';
        Object.keys(workflows).forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            sel.appendChild(opt);
        });
    }

    function importWorkflow(jsonStr, name) {
        let data;
        try {
            data = JSON.parse(jsonStr);
        } catch (e) {
            alert('JSON 解析失败: ' + e.message);
            return;
        }

        // Detect format: API format has { "id": { class_type, inputs } }
        // UI format has { nodes: [...], links: [...] } or { workflow: { nodes, links }, prompt: {...} }
        let apiFormat;
        if (data.prompt && typeof data.prompt === 'object' && !Array.isArray(data.prompt)) {
            apiFormat = data.prompt;
        } else if (data.nodes && Array.isArray(data.nodes)) {
            apiFormat = convertUIToAPI(data);
        } else if (data.last_node_id || data.last_link_id) {
            apiFormat = convertUIToAPI(data);
        } else {
            // Assume it's already API format
            const firstVal = Object.values(data)[0];
            if (firstVal && firstVal.class_type) {
                apiFormat = data;
            } else {
                alert('无法识别的工作流格式');
                return;
            }
        }

        const workflows = loadWorkflows();
        workflows[name] = apiFormat;
        saveWorkflows(workflows);
        refreshWorkflowList();

        document.getElementById('sel-workflow').value = name;
        currentWorkflowData = apiFormat;
        renderWorkflowParams(apiFormat);
    }

    function convertUIToAPI(uiData) {
        const nodes = uiData.nodes || [];
        const links = uiData.links || [];
        const linkMap = {};
        links.forEach(link => {
            const [linkId, srcNode, srcSlot] = link;
            linkMap[linkId] = [String(srcNode), srcSlot];
        });

        const api = {};
        nodes.forEach(node => {
            if (!node.type || node.type === 'Reroute') return;
            const entry = { class_type: node.type, inputs: {} };

            if (node.widgets_values && node.inputs) {
                let widgetIdx = 0;
                const inputNames = (node.inputs || []).map(i => i.name);
                // This is a simplified conversion - may not work for all nodes
                if (node.widgets_values) {
                    // We'll store widget values as-is for now
                    // Full conversion would require object_info
                }
            }

            // Map linked inputs
            if (node.inputs) {
                node.inputs.forEach(input => {
                    if (input.link != null && linkMap[input.link]) {
                        entry.inputs[input.name] = linkMap[input.link];
                    }
                });
            }

            // Widget values - try to map using properties or title
            if (node.widgets_values && Array.isArray(node.widgets_values)) {
                entry._widget_values = node.widgets_values;
            }

            api[String(node.id)] = entry;
        });

        return api;
    }

    async function fetchObjectInfo() {
        if (objectInfoCache) return objectInfoCache;
        try {
            objectInfoCache = await apiGet('/object_info');
            return objectInfoCache;
        } catch (e) {
            console.warn('无法获取 object_info:', e);
            return null;
        }
    }

    // Node classification for smart grouping
    const PROMPT_NODES = ['CLIPTextEncode', 'CLIPTextEncodeSDXL', 'ShowText', 'StringFunction',
        'WeiLinPromptUI', 'WeiLinPromptUIWithoutLora', 'PromptSelector'];
    const SAMPLER_NODES = ['KSampler', 'KSamplerAdvanced', 'SamplerCustom', 'SamplerCustomAdvanced',
        'KSampler (Efficient)', 'KSamplerSelect'];
    const LOADER_NODES = ['CheckpointLoaderSimple', 'UNETLoader', 'CLIPLoader', 'VAELoader',
        'LoraLoader', 'LoraLoaderModelOnly', 'Lora Loader (LoraManager)'];
    const SIZE_NODES = ['EmptyLatentImage', 'EmptySD3LatentImage', 'ResolutionMasterSimplify'];
    const IMAGE_INPUT_NODES = ['LoadImage', 'LoadImageMask'];

    const HIDDEN_FIELDS = new Set([
        '__lm_autocomplete_meta_text', '打开提示词编辑器',
        'orinalMessage', 'random_template', '_meta',
        'loras', 'toggle_trigger_words', 'allow_strength_adjustment',
        'text', 'trigger_words'
    ]);

    const WEILIN_REDUNDANT_FIELDS = new Set([
        'positive', 'negative', 'selected_prompts', 'selected_loras'
    ]);

    const SPECIAL_WIDGET_NODES = new Set([
        'Lora Loader (LoraManager)', 'TriggerWord Toggle (LoraManager)',
        'PromptSelector'
    ]);

    function classifyNode(classType) {
        if (PROMPT_NODES.includes(classType)) return 'prompt';
        if (SAMPLER_NODES.includes(classType)) return 'sampler';
        if (LOADER_NODES.includes(classType)) return 'loader';
        if (SIZE_NODES.includes(classType)) return 'size';
        if (IMAGE_INPUT_NODES.includes(classType)) return 'image';
        return 'other';
    }

    function tryParseWeiLinTokens(val) {
        if (typeof val !== 'string' || val.length < 10) return null;
        const trimmed = val.trim();
        if (!trimmed.startsWith('[{') || !trimmed.endsWith('}]')) return null;
        try {
            const arr = JSON.parse(trimmed);
            if (!Array.isArray(arr) || arr.length === 0) return null;
            if (arr[0].text !== undefined && arr[0].id !== undefined) return arr;
            return null;
        } catch { return null; }
    }

    function weiLinTokensToText(tokens) {
        return tokens
            .filter(t => !t.isPunctuation && !t.isHidden)
            .map(t => t.text)
            .join(', ');
    }

    function textToWeiLinTokens(text, originalTokens) {
        const newTexts = text.split(',').map(s => s.trim()).filter(Boolean);
        const result = [];
        const reusable = originalTokens ? [...originalTokens.filter(t => !t.isPunctuation)] : [];
        newTexts.forEach((txt, i) => {
            if (i < reusable.length) {
                result.push({ ...reusable[i], text: txt, translate: txt });
            } else {
                result.push({
                    id: `token_${i + 1}_${Date.now()}`,
                    text: txt, translate: txt,
                    isPunctuation: false, isEditing: false,
                    isHidden: false, color: 'rgba(255, 123, 2, .4)',
                    isLoraTag: false
                });
            }
        });
        return result;
    }

    function isEditableValue(val, key) {
        if (val === null || val === undefined) return false;
        if (Array.isArray(val)) return false;
        if (typeof val === 'object') return false;
        if (HIDDEN_FIELDS.has(key)) return false;
        if (typeof val === 'string' && val === '' && key !== 'text' && key !== 'positive' && key !== 'negative') {
            return false;
        }
        if (typeof val === 'string' && tryParseWeiLinTokens(val)) return true;
        if (typeof val === 'string' && val.length > 500) {
            const trimmed = val.trim();
            if ((trimmed.startsWith('[{') || trimmed.startsWith('{"')) && (trimmed.endsWith('}]') || trimmed.endsWith('}'))) {
                return false;
            }
        }
        return typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean';
    }

    let wfPromptMap = { positiveNodeId: null, negativeNodeId: null };

    function findPromptNodeIds(workflow) {
        const result = { positiveNodeId: null, negativeNodeId: null };
        for (const [nodeId, node] of Object.entries(workflow)) {
            if (!SAMPLER_NODES.includes(node.class_type)) continue;
            const posRef = node.inputs.positive;
            const negRef = node.inputs.negative;
            if (Array.isArray(posRef)) result.positiveNodeId = tracePromptSource(workflow, posRef[0]);
            if (Array.isArray(negRef)) result.negativeNodeId = tracePromptSource(workflow, negRef[0]);
            break;
        }
        return result;
    }

    function tracePromptSource(workflow, nodeId, depth) {
        if ((depth || 0) > 10) return nodeId;
        const node = workflow[nodeId];
        if (!node) return nodeId;
        if (PROMPT_NODES.includes(node.class_type)) return nodeId;
        if (node.class_type === 'CLIPTextEncode') return nodeId;
        for (const val of Object.values(node.inputs || {})) {
            if (Array.isArray(val) && workflow[val[0]]) {
                const found = tracePromptSource(workflow, val[0], (depth || 0) + 1);
                if (found && PROMPT_NODES.includes(workflow[found]?.class_type)) return found;
            }
        }
        return nodeId;
    }

    function extractNodePromptText(node) {
        if (!node) return '';
        const inputs = node.inputs || {};
        for (const [key, val] of Object.entries(inputs)) {
            if (key === 'temp_str') {
                const tokens = tryParseWeiLinTokens(val);
                if (tokens) return weiLinTokensToText(tokens);
            }
        }
        if (inputs.positive && typeof inputs.positive === 'string') return inputs.positive;
        if (inputs.text && typeof inputs.text === 'string') return inputs.text;
        return '';
    }

    function setupPromptBinding(workflow) {
        if (!workflow) return;
        if (!wfPromptMap.positiveNodeId && !wfPromptMap.negativeNodeId) {
            wfPromptMap = findPromptNodeIds(workflow);
        }

        if (wfPromptMap.positiveNodeId) {
            const posText = extractNodePromptText(workflow[wfPromptMap.positiveNodeId]);
            if (posText) dom.txtPositive.value = posText;
        }
        if (wfPromptMap.negativeNodeId) {
            const negText = extractNodePromptText(workflow[wfPromptMap.negativeNodeId]);
            if (negText) dom.txtNegative.value = negText;
        }

        const container = document.getElementById('wf-params');
        if (!container) return;
        container.querySelectorAll('.wf-prompt-bind').forEach(el => {
            const nodeId = el.dataset.node;
            const isPositive = nodeId === wfPromptMap.positiveNodeId;
            const mainTa = isPositive ? dom.txtPositive : dom.txtNegative;
            let syncing = false;
            mainTa.addEventListener('input', () => {
                if (syncing) return;
                syncing = true;
                el.value = mainTa.value;
                syncing = false;
            });
            el.addEventListener('input', () => {
                if (syncing) return;
                syncing = true;
                mainTa.value = el.value;
                syncing = false;
            });
        });
    }

    async function renderWorkflowParams(workflow) {
        const container = document.getElementById('wf-params');
        const infoEl = document.getElementById('wf-info');

        if (!workflow) {
            container.innerHTML = '<div class="wf-placeholder">导入或选择一个工作流以开始</div>';
            infoEl.classList.add('hidden');
            return;
        }

        const nodeCount = Object.keys(workflow).length;
        document.getElementById('wf-node-count').textContent = `${nodeCount} 个节点`;
        infoEl.classList.remove('hidden');

        const objInfo = await fetchObjectInfo();

        wfPromptMap = findPromptNodeIds(workflow);

        const groups = { prompt: [], sampler: [], loader: [], size: [], image: [], other: [] };
        const specialNodes = [];
        for (const [nodeId, node] of Object.entries(workflow)) {
            if (!node.class_type) continue;

            if (SPECIAL_WIDGET_NODES.has(node.class_type)) {
                specialNodes.push({ nodeId, node });
                continue;
            }

            const category = classifyNode(node.class_type);
            const inputs = node.inputs || {};
            const hasWeiLinTokens = Object.values(inputs).some(v => tryParseWeiLinTokens(v));
            const editableParams = [];
            for (const [key, val] of Object.entries(inputs)) {
                if (hasWeiLinTokens && WEILIN_REDUNDANT_FIELDS.has(key)) continue;
                if (isEditableValue(val, key)) {
                    editableParams.push({ key, value: val, nodeId });
                }
            }
            if (editableParams.length > 0) {
                groups[category].push({ nodeId, classType: node.class_type, params: editableParams });
            }
        }

        let html = '';

        if (groups.prompt.length > 0) {
            const posNodes = [];
            const negNodes = [];
            const otherPromptNodes = [];
            groups.prompt.forEach(nodeInfo => {
                if (nodeInfo.nodeId === wfPromptMap.positiveNodeId) posNodes.push(nodeInfo);
                else if (nodeInfo.nodeId === wfPromptMap.negativeNodeId) negNodes.push(nodeInfo);
                else otherPromptNodes.push(nodeInfo);
            });
            const sortedPrompt = [...posNodes, ...negNodes, ...otherPromptNodes];
            html += buildGroup('📝 提示词', sortedPrompt, objInfo, true);
        }

        if (groups.sampler.length > 0) {
            html += buildGroup('🎛️ 采样参数', groups.sampler, objInfo, true);
        }

        if (groups.size.length > 0) {
            html += buildGroup('📐 图片尺寸', groups.size, objInfo, true);
        }

        // Special nodes: PromptSelector, LoRA Manager, TriggerWord Toggle
        for (const { nodeId, node } of specialNodes) {
            if (node.class_type === 'PromptSelector') {
                const title = node._meta?.title || '固定提示词';
                const sp = node.inputs?.selected_prompts;
                if (typeof sp === 'string') {
                    html += `<div class="wf-group open">
                        <div class="wf-group-header"><span>📌 ${escapeHtml(title)}</span><span class="wf-group-toggle">▶</span></div>
                        <div class="wf-group-body">
                            <div class="wf-field">
                                <label>已选提示词</label>
                                <textarea data-node="${nodeId}" data-key="selected_prompts" class="wf-input" rows="2">${escapeHtml(sp)}</textarea>
                            </div>
                        </div>
                    </div>`;
                }
            } else if (node.class_type === 'Lora Loader (LoraManager)') {
                const widget = buildLoraManagerWidget(nodeId, node);
                if (widget) {
                    html += `<div class="wf-group open">
                        <div class="wf-group-header"><span>🎨 LoRA 管理</span><span class="wf-group-toggle">▶</span></div>
                        <div class="wf-group-body">${widget}</div>
                    </div>`;
                }
            } else if (node.class_type === 'TriggerWord Toggle (LoraManager)') {
                const widget = buildTriggerWordWidget(nodeId, node);
                if (widget) {
                    html += `<div class="wf-group open">
                        <div class="wf-group-header"><span>🏷️ 触发词</span><span class="wf-group-toggle">▶</span></div>
                        <div class="wf-group-body">${widget}</div>
                    </div>`;
                }
            }
        }

        if (groups.loader.length > 0) {
            html += buildGroup('📦 模型加载', groups.loader, objInfo, false);
        }

        if (groups.image.length > 0) {
            html += buildGroup('🖼️ 图片输入', groups.image, objInfo, true);
        }

        if (groups.other.length > 0) {
            groups.other.forEach(nodeInfo => {
                const displayName = getNodeDisplayName(nodeInfo.classType, objInfo);
                html += buildGroup(`📦 ${displayName}`, [nodeInfo], objInfo, false);
            });
        }

        if (!html) {
            html = '<div class="wf-placeholder">此工作流没有可编辑的参数（所有值都是节点连接）</div>';
        }

        container.innerHTML = html;

        container.querySelectorAll('.wf-group-header').forEach(header => {
            header.addEventListener('click', () => {
                header.parentElement.classList.toggle('open');
            });
        });

        setupPromptBinding(workflow);

        container.querySelectorAll('.tw-tag').forEach(tag => {
            tag.addEventListener('click', () => tag.classList.toggle('active'));
        });
    }

    function getNodeDisplayName(classType, objInfo) {
        if (objInfo && objInfo[classType] && objInfo[classType].display_name) {
            return objInfo[classType].display_name;
        }
        return classType;
    }

    function buildLoraManagerWidget(nodeId, node) {
        const loras = node.inputs?.loras?.__value__;
        if (!loras || !Array.isArray(loras)) return '';
        let html = '<div class="wf-lora-list">';
        loras.forEach((lora, i) => {
            const name = lora.name.split('/').pop();
            html += `<div class="lora-manager-item" data-node="${nodeId}" data-lora-idx="${i}">
                <label class="lora-active-label">
                    <input type="checkbox" class="lora-active-chk" ${lora.active ? 'checked' : ''}>
                    <span class="lora-name" title="${lora.name}">${name}</span>
                </label>
                <input type="number" class="lora-strength-inp" value="${lora.strength}" min="0" max="2" step="0.05" title="强度">
            </div>`;
        });
        html += '</div>';
        return html;
    }

    function buildTriggerWordWidget(nodeId, node) {
        const tw = node.inputs?.toggle_trigger_words?.__value__;
        if (!tw || !Array.isArray(tw)) return '';
        let html = '<div class="wf-trigger-words">';
        tw.forEach((word, i) => {
            html += `<span class="tw-tag ${word.active ? 'active' : ''}" data-node="${nodeId}" data-tw-idx="${i}" title="点击切换">${word.text}</span>`;
        });
        html += '</div>';
        return html;
    }

    function buildGroup(title, nodes, objInfo, defaultOpen) {
        let fieldsHtml = '';
        const warnings = [];

        nodes.forEach(nodeInfo => {
            const nodeObjInfo = objInfo ? objInfo[nodeInfo.classType] : null;
            if (!nodeObjInfo && objInfo) {
                warnings.push(nodeInfo.classType);
            }

            nodeInfo.params.forEach(param => {
                fieldsHtml += buildField(param, nodeInfo, nodeObjInfo);
            });
        });

        let warningHtml = '';
        if (warnings.length > 0) {
            warningHtml = `<div class="wf-warning">⚠️ 节点未安装: ${warnings.join(', ')}（参数类型为推测值）</div>`;
        }

        return `<div class="wf-group ${defaultOpen ? 'open' : ''}">
            <div class="wf-group-header">
                <span>${title}</span>
                <span class="wf-group-toggle">▶</span>
            </div>
            <div class="wf-group-body">
                ${warningHtml}
                ${fieldsHtml}
            </div>
        </div>`;
    }

    function buildField(param, nodeInfo, nodeObjInfo) {
        const { key, value, nodeId } = param;
        const dataAttr = `data-node="${nodeId}" data-key="${key}"`;
        let inputHtml = '';
        let label = key;

        // WeiLin token array → editable prompt textarea
        const tokens = typeof value === 'string' ? tryParseWeiLinTokens(value) : null;
        if (tokens) {
            const readable = weiLinTokensToText(tokens);
            const isPos = nodeId === wfPromptMap.positiveNodeId;
            const isNeg = nodeId === wfPromptMap.negativeNodeId;
            const direction = isPos ? '正向' : isNeg ? '反向' : '';
            label = direction ? `${direction}提示词 (WeiLin)` : (key === 'temp_str' ? '提示词 (WeiLin)' : key);
            inputHtml = `<textarea ${dataAttr} data-weilin="1" class="wf-input wf-prompt-bind" rows="3"
                placeholder="逗号分隔提示词，如: 1girl, smile, outdoors">${escapeHtml(readable)}</textarea>`;
            if (label) return `<div class="wf-field"><label>${label}</label>${inputHtml}</div>`;
            return `<div class="wf-field">${inputHtml}</div>`;
        }

        let typeInfo = null;
        if (nodeObjInfo) {
            const req = nodeObjInfo.input?.required?.[key];
            const opt = nodeObjInfo.input?.optional?.[key];
            typeInfo = req || opt;
        }

        if (typeInfo) {
            if (Array.isArray(typeInfo[0]) && !Array.isArray(typeInfo[0][0])) {
                const options = typeInfo[0].map(v =>
                    `<option value="${v}" ${v === value ? 'selected' : ''}>${v}</option>`
                ).join('');
                inputHtml = `<select ${dataAttr} class="wf-input">${options}</select>`;
            } else if (typeInfo[0] === 'INT') {
                const meta = typeInfo[1] || {};
                inputHtml = `<input type="number" ${dataAttr} class="wf-input" value="${value}" 
                    ${meta.min != null ? `min="${meta.min}"` : ''} 
                    ${meta.max != null ? `max="${meta.max}"` : ''} 
                    step="1">`;
            } else if (typeInfo[0] === 'FLOAT') {
                const meta = typeInfo[1] || {};
                inputHtml = `<input type="number" ${dataAttr} class="wf-input" value="${value}" 
                    ${meta.min != null ? `min="${meta.min}"` : ''} 
                    ${meta.max != null ? `max="${meta.max}"` : ''} 
                    step="${meta.step || 0.01}">`;
            } else if (typeInfo[0] === 'STRING') {
                const meta = typeInfo[1] || {};
                const isPromptField = key === 'text' || key === 'positive' || key === 'negative';
                const promptBindClass = isPromptField && PROMPT_NODES.includes(nodeInfo.classType) ? ' wf-prompt-bind' : '';
                if (meta.multiline || isPromptField) {
                    inputHtml = `<textarea ${dataAttr} class="wf-input${promptBindClass}" rows="3">${escapeHtml(String(value))}</textarea>`;
                } else {
                    inputHtml = `<input type="text" ${dataAttr} class="wf-input" value="${escapeAttr(String(value))}">`;
                }
            } else if (typeInfo[0] === 'BOOLEAN') {
                inputHtml = `<label style="display:flex;align-items:center;gap:6px">
                    <input type="checkbox" ${dataAttr} class="wf-input" ${value ? 'checked' : ''}>
                    <span>${label}</span>
                </label>`;
                label = '';
            } else {
                inputHtml = buildFallbackInput(key, value, dataAttr, nodeInfo);
            }
        } else {
            inputHtml = buildFallbackInput(key, value, dataAttr, nodeInfo);
        }

        if (label) {
            return `<div class="wf-field"><label>${label}</label>${inputHtml}</div>`;
        }
        return `<div class="wf-field">${inputHtml}</div>`;
    }

    function buildFallbackInput(key, value, dataAttr, nodeInfo) {
        if (typeof value === 'boolean') {
            return `<label style="display:flex;align-items:center;gap:6px">
                <input type="checkbox" ${dataAttr} class="wf-input" ${value ? 'checked' : ''}>
                <span>${key}</span>
            </label>`;
        }
        if (typeof value === 'number') {
            const isFloat = value % 1 !== 0;
            return `<input type="number" ${dataAttr} class="wf-input" value="${value}" step="${isFloat ? 0.01 : 1}">`;
        }
        const str = String(value);
        const isPromptField = key === 'text' || key === 'positive' || key === 'negative';
        const promptBindClass = isPromptField && nodeInfo && PROMPT_NODES.includes(nodeInfo.classType) ? ' wf-prompt-bind' : '';
        if (str.length > 50 || str.includes('\n') || key.toLowerCase().includes('text') || key.toLowerCase().includes('prompt')) {
            return `<textarea ${dataAttr} class="wf-input${promptBindClass}" rows="3">${escapeHtml(str)}</textarea>`;
        }
        return `<input type="text" ${dataAttr} class="wf-input" value="${escapeAttr(str)}">`;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function collectWorkflowFormValues() {
        if (!currentWorkflowData) return null;
        const workflow = JSON.parse(JSON.stringify(currentWorkflowData));

        // Collect LoRA manager toggle states
        document.querySelectorAll('#wf-params .lora-manager-item').forEach(el => {
            const nodeId = el.dataset.node;
            const idx = parseInt(el.dataset.loraIdx);
            if (!nodeId || !workflow[nodeId]) return;
            const loras = workflow[nodeId].inputs.loras?.__value__;
            if (!loras || !loras[idx]) return;
            loras[idx].active = el.querySelector('.lora-active-chk').checked;
            loras[idx].strength = el.querySelector('.lora-strength-inp').value;
            loras[idx].clipStrength = el.querySelector('.lora-strength-inp').value;
        });

        // Rebuild LoRA text from active loras
        for (const node of Object.values(workflow)) {
            if (node.class_type === 'Lora Loader (LoraManager)' && node.inputs.loras?.__value__) {
                const activeLoras = node.inputs.loras.__value__
                    .filter(l => l.active)
                    .map(l => `<lora:${l.name}:${parseFloat(l.strength).toFixed(2)}>`)
                    .join(' ');
                node.inputs.text = activeLoras;
            }
        }

        // Collect trigger word toggle states
        document.querySelectorAll('#wf-params .tw-tag').forEach(el => {
            const nodeId = el.dataset.node;
            const idx = parseInt(el.dataset.twIdx);
            if (!nodeId || !workflow[nodeId]) return;
            const tw = workflow[nodeId].inputs.toggle_trigger_words?.__value__;
            if (!tw || !tw[idx]) return;
            tw[idx].active = el.classList.contains('active');
            if (tw[idx].items?.[0]) tw[idx].items[0].active = tw[idx].active;
        });

        // Rebuild orinalMessage from active trigger words
        for (const node of Object.values(workflow)) {
            if (node.class_type === 'TriggerWord Toggle (LoraManager)' && node.inputs.toggle_trigger_words?.__value__) {
                node.inputs.orinalMessage = node.inputs.toggle_trigger_words.__value__
                    .filter(tw => tw.active)
                    .map(tw => tw.text)
                    .join(',, ');
            }
        }

        // Collect standard form inputs
        document.querySelectorAll('#wf-params .wf-input').forEach(el => {
            const nodeId = el.dataset.node;
            const key = el.dataset.key;
            if (!nodeId || !key || !workflow[nodeId]) return;

            let val;
            if (el.dataset.weilin === '1') {
                const originalTokens = tryParseWeiLinTokens(currentWorkflowData[nodeId]?.inputs?.[key]);
                const newText = el.value;
                val = JSON.stringify(textToWeiLinTokens(newText, originalTokens));
                // Sync the positive/negative field to match edited text
                if (workflow[nodeId].inputs.positive !== undefined) {
                    workflow[nodeId].inputs.positive = newText;
                }
            } else if (el.type === 'checkbox') {
                val = el.checked;
            } else if (el.type === 'number') {
                val = el.value.includes('.') ? parseFloat(el.value) : parseInt(el.value);
            } else {
                val = el.value;
            }
            workflow[nodeId].inputs[key] = val;
        });

        // Inject main area prompts into the correct prompt nodes
        if (wfPromptMap.positiveNodeId && workflow[wfPromptMap.positiveNodeId]) {
            const posNode = workflow[wfPromptMap.positiveNodeId];
            const mainPos = dom.txtPositive.value;
            if (posNode.inputs.positive !== undefined) posNode.inputs.positive = mainPos;
            if (posNode.inputs.text !== undefined && typeof posNode.inputs.text === 'string') posNode.inputs.text = mainPos;
            const origTempStr = currentWorkflowData[wfPromptMap.positiveNodeId]?.inputs?.temp_str;
            if (origTempStr && tryParseWeiLinTokens(origTempStr)) {
                posNode.inputs.temp_str = JSON.stringify(textToWeiLinTokens(mainPos, tryParseWeiLinTokens(origTempStr)));
            }
        }
        if (wfPromptMap.negativeNodeId && workflow[wfPromptMap.negativeNodeId]) {
            const negNode = workflow[wfPromptMap.negativeNodeId];
            const mainNeg = dom.txtNegative.value;
            if (negNode.inputs.positive !== undefined) negNode.inputs.positive = mainNeg;
            if (negNode.inputs.text !== undefined && typeof negNode.inputs.text === 'string') negNode.inputs.text = mainNeg;
            const origTempStr = currentWorkflowData[wfPromptMap.negativeNodeId]?.inputs?.temp_str;
            if (origTempStr && tryParseWeiLinTokens(origTempStr)) {
                negNode.inputs.temp_str = JSON.stringify(textToWeiLinTokens(mainNeg, tryParseWeiLinTokens(origTempStr)));
            }
        }

        for (const node of Object.values(workflow)) {
            if (SAMPLER_NODES.includes(node.class_type) && node.inputs.seed === -1) {
                node.inputs.seed = Math.floor(Math.random() * 2 ** 32);
            }
        }

        return workflow;
    }

    async function generateFromWorkflow() {
        const workflow = collectWorkflowFormValues();
        if (!workflow) {
            alert('请先导入或选择一个工作流');
            return;
        }

        dom.btnGenerate.disabled = true;
        dom.btnGenerate.textContent = '生成中...';
        dom.progressContainer.classList.remove('hidden');
        dom.resultPlaceholder.classList.add('hidden');
        dom.resultImage.classList.add('hidden');
        dom.resultActions.classList.add('hidden');
        updateMobileResultUI(false);
        setProgress(0);

        try {
            // Handle image uploads for LoadImage nodes
            for (const [nodeId, node] of Object.entries(workflow)) {
                if (IMAGE_INPUT_NODES.includes(node.class_type)) {
                    const fileInput = document.querySelector(`.wf-input[data-node="${nodeId}"][data-key="image"]`);
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        const res = await uploadImage(fileInput.files[0]);
                        workflow[nodeId].inputs.image = res.name;
                    }
                }
            }

            const result = await apiPost('/prompt', { prompt: workflow });
            await pollProgress(result.prompt_id);
        } catch (e) {
            alert('生图失败: ' + e.message);
            console.error(e);
        } finally {
            dom.btnGenerate.disabled = false;
            dom.btnGenerate.textContent = '生成图片';
            dom.progressContainer.classList.add('hidden');
        }
    }

    // Override generate to check mode
    const originalGenerate = generate;
    async function generateDispatch() {
        const activeMode = document.querySelector('.mode-tab.active');
        if (activeMode && activeMode.dataset.mode === 'workflow') {
            await generateFromWorkflow();
        } else {
            await originalGenerate();
        }
    }

    // ==================== 主题系统 ====================
    function setupTheme() {
        const saved = localStorage.getItem('comfyui_theme') || 'default';
        applyTheme(saved);

        const btn = document.getElementById('btn-theme');
        const panel = document.getElementById('theme-panel');
        if (!btn || !panel) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            panel.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && e.target !== btn) {
                panel.classList.add('hidden');
            }
        });

        panel.querySelectorAll('.theme-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const theme = dot.dataset.theme;
                applyTheme(theme);
                localStorage.setItem('comfyui_theme', theme);
                panel.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
    }

    function applyTheme(theme) {
        if (theme === 'default') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
        document.querySelectorAll('.theme-dot').forEach(d => {
            d.classList.toggle('active', d.dataset.theme === theme);
        });
    }

    // ==================== 标签翻译服务 ====================
    const TagTranslator = {
        localMap: null,
        cache: JSON.parse(localStorage.getItem('tag_translate_cache') || '{}'),
        showChinese: localStorage.getItem('tag_show_chinese') !== 'false',
        provider: localStorage.getItem('tag_translate_provider') || 'google',
        pendingBatch: [],
        batchTimer: null,

        buildLocalMap() {
            if (this.localMap) return;
            this.localMap = {};
            tagData.forEach(group => {
                (group.subgroups || []).forEach(sub => {
                    if (!sub) return;
                    (sub.tags || []).forEach(tag => {
                        if (tag.t && tag.d) {
                            this.localMap[tag.t.toLowerCase()] = tag.d;
                        }
                    });
                });
            });
        },

        getLocal(tagName) {
            this.buildLocalMap();
            return this.localMap[tagName.toLowerCase()] || this.localMap[tagName.replace(/ /g, '_').toLowerCase()] || null;
        },

        getCached(tagName) {
            return this.cache[tagName.toLowerCase()] || null;
        },

        async translate(tagName) {
            const local = this.getLocal(tagName);
            if (local) return local;

            const cached = this.getCached(tagName);
            if (cached) return cached;

            if (this.provider === 'local') return null;

            return new Promise(resolve => {
                this.pendingBatch.push({ tag: tagName, resolve });
                clearTimeout(this.batchTimer);
                this.batchTimer = setTimeout(() => this.flushBatch(), 300);
            });
        },

        async flushBatch() {
            const batch = this.pendingBatch.splice(0);
            if (batch.length === 0) return;

            const needTranslate = batch.filter(b => !this.getLocal(b.tag) && !this.getCached(b.tag));
            const text = needTranslate.map(b => b.tag.replace(/_/g, ' ')).join('\n');

            if (text && needTranslate.length > 0) {
                try {
                    const results = await this.callAPI(text);
                    const lines = results.split('\n');
                    needTranslate.forEach((b, i) => {
                        const zh = (lines[i] || '').trim();
                        if (zh && zh !== b.tag) {
                            this.cache[b.tag.toLowerCase()] = zh;
                        }
                    });
                    this.saveCache();
                } catch (e) {
                    console.warn('Translation failed:', e);
                }
            }

            batch.forEach(b => {
                const result = this.getLocal(b.tag) || this.getCached(b.tag) || null;
                b.resolve(result);
            });
        },

        async callAPI(text) {
            if (this.provider === 'mymemory') {
                const lines = text.split('\n');
                const results = [];
                for (const line of lines.slice(0, 10)) {
                    try {
                        const resp = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(line)}&langpair=en|zh-CN`);
                        const data = await resp.json();
                        results.push(data.responseData?.translatedText || line);
                    } catch { results.push(line); }
                }
                return results.join('\n');
            }

            const resp = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh&dt=t&q=${encodeURIComponent(text)}`);
            const data = await resp.json();
            return (data[0] || []).map(s => s[0]).join('');
        },

        saveCache() {
            try {
                const entries = Object.entries(this.cache);
                const trimmed = Object.fromEntries(entries.slice(-500));
                localStorage.setItem('tag_translate_cache', JSON.stringify(trimmed));
            } catch {}
        },

        getSync(tagName) {
            return this.getLocal(tagName) || this.getCached(tagName) || null;
        }
    };

    // ==================== 提示词标签可视化编辑器 ====================
    function setupPromptTagEditor() {
        const allEditors = [];
        const editors = [
            { textarea: dom.txtPositive, container: document.getElementById('prompt-tags-pos') },
            { textarea: dom.txtNegative, container: document.getElementById('prompt-tags-neg') },
        ];

        editors.forEach(({ textarea, container }) => {
            if (!textarea || !container) return;
            const editor = new PromptTagEditor(textarea, container);
            textarea._tagEditor = editor;
            allEditors.push(editor);
        });

        const toggleBtn = document.getElementById('btn-translate-toggle');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active', TagTranslator.showChinese);
            toggleBtn.addEventListener('click', () => {
                TagTranslator.showChinese = !TagTranslator.showChinese;
                localStorage.setItem('tag_show_chinese', TagTranslator.showChinese);
                toggleBtn.classList.toggle('active', TagTranslator.showChinese);
                allEditors.forEach(ed => ed.render());
            });
        }

        const providerSel = document.getElementById('sel-translate-provider');
        if (providerSel) {
            providerSel.value = TagTranslator.provider;
            providerSel.addEventListener('change', () => {
                TagTranslator.provider = providerSel.value;
                localStorage.setItem('tag_translate_provider', providerSel.value);
                allEditors.forEach(ed => ed.parseAndRender());
            });
        }
    }

    class PromptTagEditor {
        constructor(textarea, container) {
            this.textarea = textarea;
            this.container = container;
            this.tags = [];
            this.dragIdx = -1;
            this.suppressSync = false;

            this.textarea.addEventListener('blur', (e) => {
                if (this.container.contains(e.relatedTarget)) return;
                this.parseAndRender();
            });

            this.textarea.addEventListener('input', () => {
                if (!this.suppressSync) this.parseAndRender();
            });

            this.container.addEventListener('dragover', (e) => e.preventDefault());
            this.container.addEventListener('drop', (e) => e.preventDefault());

            this.parseAndRender();
        }

        parsePrompt(text) {
            if (!text.trim()) return [];
            return text.split(',').map(s => s.trim()).filter(Boolean).map(raw => {
                const wm = raw.match(/^\((.+?):([\d.]+)\)$/);
                if (wm) return { name: wm[1], weight: parseFloat(wm[2]) };
                return { name: raw, weight: 1.0 };
            });
        }

        tagsToText() {
            return this.tags.map(t => {
                if (t.weight !== 1.0) return `(${t.name}:${t.weight.toFixed(1)})`;
                return t.name;
            }).join(', ');
        }

        syncToTextarea() {
            this.suppressSync = true;
            this.textarea.value = this.tagsToText();
            this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
            this.suppressSync = false;
        }

        parseAndRender() {
            this.tags = this.parsePrompt(this.textarea.value);
            this.render();
        }

        render() {
            this.container.innerHTML = '';
            this.tags.forEach((tag, idx) => {
                const el = this.createTagElement(tag, idx);
                this.container.appendChild(el);
            });
        }

        createTagElement(tag, idx) {
            const el = document.createElement('div');
            el.className = 'prompt-tag';
            el.draggable = true;
            el.dataset.idx = idx;

            const textCol = document.createElement('span');
            textCol.className = 'prompt-tag-text-col';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'prompt-tag-name';
            nameSpan.textContent = tag.name;
            nameSpan.title = tag.name;
            nameSpan.addEventListener('dblclick', () => this.startEdit(el, tag, idx));
            textCol.appendChild(nameSpan);

            if (TagTranslator.showChinese) {
                const zh = TagTranslator.getSync(tag.name);
                if (zh) {
                    const zhSpan = document.createElement('span');
                    zhSpan.className = 'prompt-tag-zh';
                    zhSpan.textContent = zh;
                    textCol.appendChild(zhSpan);
                } else if (TagTranslator.provider !== 'local') {
                    TagTranslator.translate(tag.name).then(zh => {
                        if (zh && el.isConnected) {
                            const zhSpan = document.createElement('span');
                            zhSpan.className = 'prompt-tag-zh';
                            zhSpan.textContent = zh;
                            textCol.appendChild(zhSpan);
                        }
                    });
                }
            }

            el.appendChild(textCol);

            if (tag.weight !== 1.0) {
                const wSpan = document.createElement('span');
                wSpan.className = 'prompt-tag-weight';
                wSpan.textContent = tag.weight.toFixed(1);
                el.appendChild(wSpan);
            }

            const actions = document.createElement('span');
            actions.className = 'prompt-tag-actions';

            const btnUp = this.makeBtn('▲', 'btn-weight-up', () => this.changeWeight(idx, 0.1));
            const btnDown = this.makeBtn('▼', 'btn-weight-down', () => this.changeWeight(idx, -0.1));
            const btnCopy = this.makeBtn('📋', 'btn-tag-copy', () => {
                navigator.clipboard.writeText(tag.weight !== 1.0 ? `(${tag.name}:${tag.weight.toFixed(1)})` : tag.name);
            });
            const btnDel = this.makeBtn('✕', 'btn-tag-delete', () => this.removeTag(idx));

            actions.append(btnUp, btnDown, btnCopy, btnDel);
            el.appendChild(actions);

            el.addEventListener('dragstart', (e) => {
                this.dragIdx = idx;
                el.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            el.addEventListener('dragend', () => {
                el.classList.remove('dragging');
                this.container.querySelectorAll('.prompt-tag').forEach(t => t.classList.remove('drag-over'));
            });

            el.addEventListener('dragover', (e) => {
                e.preventDefault();
                const dragging = this.container.querySelector('.dragging');
                if (dragging && dragging !== el) {
                    el.classList.add('drag-over');
                }
            });

            el.addEventListener('dragleave', () => el.classList.remove('drag-over'));

            el.addEventListener('drop', (e) => {
                e.preventDefault();
                el.classList.remove('drag-over');
                const fromIdx = this.dragIdx;
                const toIdx = idx;
                if (fromIdx === toIdx || fromIdx < 0) return;
                const [moved] = this.tags.splice(fromIdx, 1);
                this.tags.splice(toIdx, 0, moved);
                this.syncToTextarea();
                this.render();
            });

            return el;
        }

        makeBtn(label, cls, onClick) {
            const btn = document.createElement('button');
            btn.className = `prompt-tag-btn ${cls}`;
            btn.textContent = label;
            btn.tabIndex = -1;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onClick();
            });
            return btn;
        }

        changeWeight(idx, delta) {
            const tag = this.tags[idx];
            if (!tag) return;
            tag.weight = Math.max(0.1, Math.round((tag.weight + delta) * 10) / 10);
            this.syncToTextarea();
            this.render();
        }

        removeTag(idx) {
            this.tags.splice(idx, 1);
            this.syncToTextarea();
            this.render();
        }

        startEdit(el, tag, idx) {
            const nameSpan = el.querySelector('.prompt-tag-name');
            const input = document.createElement('input');
            input.className = 'prompt-tag-input';
            input.value = tag.name;

            const finish = () => {
                const newName = input.value.trim();
                if (newName && newName !== tag.name) {
                    this.tags[idx].name = newName;
                    this.syncToTextarea();
                }
                this.render();
            };

            input.addEventListener('blur', finish);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); finish(); }
                if (e.key === 'Escape') { this.render(); }
            });

            nameSpan.replaceWith(input);
            input.focus();
            input.select();
        }
    }

    // ==================== 图片元数据解析 ====================
    const MetaParser = {
        async _inflate(data) {
            try {
                const ds = new DecompressionStream('deflate');
                const writer = ds.writable.getWriter();
                writer.write(data);
                writer.close();
                const reader = ds.readable.getReader();
                const chunks = [];
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                }
                const totalLen = chunks.reduce((s, c) => s + c.length, 0);
                const result = new Uint8Array(totalLen);
                let pos = 0;
                for (const c of chunks) { result.set(c, pos); pos += c.length; }
                return new TextDecoder('utf-8').decode(result);
            } catch { return null; }
        },

        async parsePNG(buffer) {
            const view = new DataView(buffer);
            if (view.getUint32(0) !== 0x89504E47) return null;
            const texts = {};
            let offset = 8;
            while (offset < buffer.byteLength - 4) {
                const len = view.getUint32(offset);
                const typeBytes = new Uint8Array(buffer, offset + 4, 4);
                const type = String.fromCharCode(...typeBytes);
                if (type === 'tEXt') {
                    const data = new Uint8Array(buffer, offset + 8, len);
                    const nullIdx = data.indexOf(0);
                    if (nullIdx > 0) {
                        const key = new TextDecoder().decode(data.slice(0, nullIdx));
                        const val = new TextDecoder().decode(data.slice(nullIdx + 1));
                        texts[key] = val;
                    }
                } else if (type === 'zTXt') {
                    const data = new Uint8Array(buffer, offset + 8, len);
                    const nullIdx = data.indexOf(0);
                    if (nullIdx > 0) {
                        const key = new TextDecoder().decode(data.slice(0, nullIdx));
                        const compMethod = data[nullIdx + 1];
                        const compressed = data.slice(nullIdx + 2);
                        if (compMethod === 0) {
                            const val = await this._inflate(compressed);
                            if (val) texts[key] = val;
                        }
                    }
                } else if (type === 'iTXt') {
                    const data = new Uint8Array(buffer, offset + 8, len);
                    const nullIdx = data.indexOf(0);
                    if (nullIdx > 0) {
                        const key = new TextDecoder().decode(data.slice(0, nullIdx));
                        let rest = nullIdx + 1;
                        const compressionFlag = data[rest]; rest++;
                        rest++;
                        const langEnd = data.indexOf(0, rest); rest = langEnd + 1;
                        const kwEnd = data.indexOf(0, rest); rest = kwEnd + 1;
                        let val;
                        if (compressionFlag === 0) {
                            val = new TextDecoder('utf-8').decode(data.slice(rest));
                        } else {
                            val = await this._inflate(data.slice(rest));
                            if (!val) val = new TextDecoder('utf-8', { fatal: false }).decode(data.slice(rest));
                        }
                        texts[key] = val;
                    }
                } else if (type === 'IEND') {
                    break;
                }
                offset += 12 + len;
            }
            return Object.keys(texts).length ? texts : null;
        },

        parseWebP(buffer) {
            const view = new DataView(buffer);
            if (view.getUint32(0) !== 0x52494646) return null; // 'RIFF'
            if (view.getUint32(8) !== 0x57454250) return null; // 'WEBP'
            const texts = {};
            let offset = 12;
            while (offset < buffer.byteLength - 8) {
                const chunkId = String.fromCharCode(
                    view.getUint8(offset), view.getUint8(offset + 1),
                    view.getUint8(offset + 2), view.getUint8(offset + 3)
                );
                const chunkLen = view.getUint32(offset + 4, true);
                if (chunkId === 'EXIF') {
                    const exifData = new Uint8Array(buffer, offset + 8, chunkLen);
                    const str = new TextDecoder('utf-8', { fatal: false }).decode(exifData);
                    this._extractExifStrings(str, texts, true);
                } else if (chunkId === 'XMP ') {
                    const xmpData = new Uint8Array(buffer, offset + 8, chunkLen);
                    const xmpStr = new TextDecoder('utf-8', { fatal: false }).decode(xmpData);
                    this._extractXmpStrings(xmpStr, texts);
                }
                offset += 8 + chunkLen + (chunkLen % 2);
            }
            return Object.keys(texts).length ? texts : null;
        },

        _extractExifStrings(str, texts, rawBytes) {
            if (rawBytes) {
                const ucMarker = 'UNICODE';
                const markerIdx = str.indexOf(ucMarker);
                if (markerIdx >= 0) {
                    const start = markerIdx + ucMarker.length;
                    const filtered = [];
                    for (let i = start; i < str.length; i++) {
                        const code = str.charCodeAt(i);
                        if (code > 0 && code < 128) filtered.push(String.fromCharCode(code));
                        else if (code === 0x0A) filtered.push('\n');
                    }
                    const decodedText = filtered.join('').trim();
                    if (decodedText.length > 5) {
                        if (decodedText.includes('Steps:') || decodedText.includes('Negative prompt:')) {
                            texts['parameters'] = decodedText;
                        } else {
                            texts['UserComment'] = decodedText;
                        }
                    }
                }
            }
            if (!texts['parameters'] && str.includes('parameters')) {
                const pIdx = str.indexOf('parameters');
                if (pIdx >= 0) texts['parameters'] = str.substring(pIdx + 10).replace(/^\0+/, '').trim();
            }
            if (!texts['UserComment'] && str.includes('UserComment')) {
                const ucIdx = str.indexOf('UserComment');
                if (ucIdx >= 0) {
                    let val = str.substring(ucIdx + 11).replace(/^\0+/, '').trim();
                    if (val.startsWith('UNICODE')) val = val.substring(7).replace(/^\0+/, '');
                    texts['UserComment'] = val;
                }
            }
            const jsonPatterns = [/"prompt"\s*:/, /"uc"\s*:/, /"steps"\s*:/];
            const searchStr = texts['UserComment'] || str;
            if (jsonPatterns.some(p => p.test(searchStr))) {
                const target = jsonPatterns.some(p => p.test(texts['UserComment'] || '')) ? texts['UserComment'] : str;
                const braceStart = target.indexOf('{');
                if (braceStart >= 0) {
                    let depth = 0, end = braceStart;
                    for (let i = braceStart; i < target.length; i++) {
                        if (target[i] === '{') depth++;
                        else if (target[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
                    }
                    const jsonStr = target.substring(braceStart, end);
                    try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.prompt || parsed.uc) texts['Comment'] = jsonStr;
                    } catch {}
                }
            }
        },

        _extractXmpStrings(xmpStr, texts) {
            const descMatch = xmpStr.match(/<dc:description[^>]*>[\s\S]*?<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/);
            if (descMatch) texts['Description'] = descMatch[1].trim();
            const paramMatch = xmpStr.match(/parameters="([^"]*)"/);
            if (paramMatch) texts['parameters'] = paramMatch[1];
            const commentMatch = xmpStr.match(/UserComment="([^"]*)"/);
            if (commentMatch) texts['UserComment'] = commentMatch[1];
        },

        parseJPEG(buffer) {
            const view = new DataView(buffer);
            if (view.getUint16(0) !== 0xFFD8) return null;
            const texts = {};
            let offset = 2;
            while (offset < buffer.byteLength - 2) {
                const marker = view.getUint16(offset);
                if (marker === 0xFFE1) {
                    const segLen = view.getUint16(offset + 2);
                    const segData = new Uint8Array(buffer, offset + 4, segLen - 2);
                    const str = new TextDecoder('utf-8', { fatal: false }).decode(segData);
                    if (str.startsWith('Exif\0\0') || str.includes('parameters') || str.includes('UserComment') || str.includes('UNICODE')) {
                        this._extractExifStrings(str, texts, true);
                    }
                    if (str.startsWith('http://ns.adobe.com/xap/') || str.includes('<x:xmpmeta')) {
                        this._extractXmpStrings(str, texts);
                    }
                    offset += 2 + segLen;
                    continue;
                } else if (marker === 0xFFE0) {
                    const segLen = view.getUint16(offset + 2);
                    offset += 2 + segLen;
                    continue;
                } else if (marker === 0xFFFE) {
                    const segLen = view.getUint16(offset + 2);
                    const data = new Uint8Array(buffer, offset + 4, segLen - 2);
                    const comment = new TextDecoder('utf-8', { fatal: false }).decode(data);
                    if (comment.trim()) texts['Comment'] = comment.trim();
                    offset += 2 + segLen;
                    continue;
                } else if (marker === 0xFFDA) {
                    break;
                } else if ((marker & 0xFF00) === 0xFF00) {
                    const segLen = view.getUint16(offset + 2);
                    offset += 2 + segLen;
                } else {
                    break;
                }
            }
            return Object.keys(texts).length ? texts : null;
        },

        parseA1111(text) {
            const result = { source: 'A1111/Forge' };
            const negIdx = text.indexOf('Negative prompt:');
            const stepsIdx = text.search(/\nSteps:/);
            const paramsStart = stepsIdx >= 0 ? stepsIdx : text.search(/\n[A-Z][a-z]+ *:/);

            if (negIdx >= 0) {
                result.positive = text.substring(0, negIdx).trim();
                const afterNeg = text.substring(negIdx + 16);
                const paramLineIdx = afterNeg.search(/\nSteps:|^Steps:/m);
                if (paramLineIdx >= 0) {
                    result.negative = afterNeg.substring(0, paramLineIdx).trim();
                    const paramStr = afterNeg.substring(paramLineIdx).replace(/^\n/, '');
                    Object.assign(result, this.parseParamLine(paramStr));
                } else {
                    result.negative = afterNeg.trim();
                }
            } else if (paramsStart >= 0) {
                result.positive = text.substring(0, paramsStart).trim();
                const paramStr = text.substring(paramsStart).replace(/^\n/, '');
                Object.assign(result, this.parseParamLine(paramStr));
            } else {
                result.positive = text.trim();
            }

            this.extractLoras(result);
            return result;
        },

        parseParamLine(str) {
            const r = {};
            const extract = (key) => {
                const re = new RegExp(key + '\\s*:\\s*([^,]+)', 'i');
                const m = str.match(re);
                return m ? m[1].trim() : null;
            };
            const steps = extract('Steps'); if (steps) r.steps = parseInt(steps);
            const sampler = extract('Sampler'); if (sampler) r.sampler = sampler;
            const cfg = extract('CFG scale'); if (cfg) r.cfg = parseFloat(cfg);
            const seed = extract('Seed'); if (seed) r.seed = seed;
            const size = extract('Size');
            if (size) { const [w, h] = size.split('x'); r.width = parseInt(w); r.height = parseInt(h); }
            const model = extract('Model'); if (model) r.model = model;
            const modelHash = extract('Model hash'); if (modelHash) r.modelHash = modelHash;
            const clipSkip = extract('Clip skip'); if (clipSkip) r.clipSkip = parseInt(clipSkip);
            const denoise = extract('Denoising strength'); if (denoise) r.denoise = parseFloat(denoise);
            const scheduler = extract('Schedule type'); if (scheduler) r.scheduler = scheduler;
            const refinerModel = extract('Refiner'); if (refinerModel) r.refinerModel = refinerModel;
            const refinerSwitch = extract('Refiner switch at'); if (refinerSwitch) r.refinerSwitch = parseFloat(refinerSwitch);
            const adModel = extract('ADetailer model'); if (adModel) r.adetailerModel = adModel;
            const adPrompt = extract('ADetailer prompt'); if (adPrompt) r.adetailerPrompt = adPrompt;
            const hiresUpscaler = extract('Hires upscaler'); if (hiresUpscaler) r.hiresUpscaler = hiresUpscaler;
            const hiresSteps = extract('Hires steps'); if (hiresSteps) r.hiresSteps = parseInt(hiresSteps);
            const hiresScale = extract('Hires upscale'); if (hiresScale) r.hiresScale = parseFloat(hiresScale);
            return r;
        },

        extractLoras(result) {
            const loraRegex = /<lora:([^:>]+):([\d.]+)>/g;
            const tiRegex = /\b(embedding:)?([a-zA-Z0-9_-]+\.(?:pt|safetensors))\b/g;
            const loras = [];
            for (const field of ['positive', 'negative']) {
                const text = result[field];
                if (!text) continue;
                let match;
                while ((match = loraRegex.exec(text)) !== null) {
                    loras.push({ name: match[1], weight: parseFloat(match[2]) });
                }
                loraRegex.lastIndex = 0;
            }
            if (loras.length > 0) result.loras = loras;
        },

        tokenJsonToText(val) {
            if (typeof val !== 'string') return String(val || '');
            const trimmed = val.trim();
            if (!trimmed.startsWith('[')) return val;
            try {
                const arr = JSON.parse(trimmed);
                if (!Array.isArray(arr) || !arr[0]?.text) return val;
                return arr
                    .filter(t => !t.isPunctuation && t.text && t.text !== '\n')
                    .map(t => t.text)
                    .join(', ');
            } catch { return val; }
        },

        parseComfyUI(promptStr, workflowStr) {
            const result = { source: 'ComfyUI' };
            const loras = [];
            try {
                const prompt = JSON.parse(promptStr);
                for (const [nodeId, node] of Object.entries(prompt)) {
                    const ct = node.class_type;
                    if (ct === 'CLIPTextEncode' || ct === 'WeiLinPromptUIWithoutLora') {
                        let txt = node.inputs?.text || node.inputs?.temp_str || '';
                        txt = this.tokenJsonToText(txt);
                        if (!result.positive) result.positive = txt;
                        else if (!result.negative) result.negative = txt;
                    }
                    if (ct === 'KSampler' || ct === 'KSampler (Efficient)' || ct === 'KSamplerAdvanced') {
                        const seedVal = node.inputs?.seed ?? node.inputs?.noise_seed;
                        if (seedVal != null && !Array.isArray(seedVal)) result.seed = String(seedVal);
                        if (node.inputs?.steps && typeof node.inputs.steps === 'number') result.steps = node.inputs.steps;
                        if (node.inputs?.cfg && typeof node.inputs.cfg === 'number') result.cfg = node.inputs.cfg;
                        if (typeof node.inputs?.sampler_name === 'string') result.sampler = node.inputs.sampler_name;
                        if (typeof node.inputs?.scheduler === 'string') result.scheduler = node.inputs.scheduler;
                        if (node.inputs?.denoise && typeof node.inputs.denoise === 'number') result.denoise = node.inputs.denoise;
                    }
                    if (ct === 'EmptyLatentImage') {
                        if (typeof node.inputs?.width === 'number') result.width = node.inputs.width;
                        if (typeof node.inputs?.height === 'number') result.height = node.inputs.height;
                    }
                    if (ct === 'CheckpointLoaderSimple' || ct === 'UNETLoader') {
                        result.model = node.inputs?.ckpt_name || node.inputs?.unet_name || '';
                    }
                    if (ct === 'LoraLoader' || ct === 'LoraLoaderModelOnly') {
                        const loraName = node.inputs?.lora_name;
                        const strength = node.inputs?.strength_model ?? node.inputs?.strength ?? 1;
                        if (loraName) loras.push({ name: loraName, weight: strength });
                    }
                }
            } catch {}
            if (loras.length > 0) result.loras = loras;
            if (workflowStr) {
                try { result.workflow = JSON.parse(workflowStr); } catch {}
            }
            this.extractLoras(result);
            return result;
        },

        parseNovelAI(text) {
            const result = { source: 'NovelAI' };
            try {
                const data = JSON.parse(text);
                result.positive = data.prompt || '';
                result.negative = data.uc || '';
                if (data.steps) result.steps = data.steps;
                if (data.scale) result.cfg = data.scale;
                if (data.seed) result.seed = String(data.seed);
                if (data.sampler) result.sampler = data.sampler;
                if (data.width) result.width = data.width;
                if (data.height) result.height = data.height;
                if (data.noise_schedule) result.scheduler = data.noise_schedule;
                if (data.sm !== undefined) result.smea = data.sm;
                if (data.sm_dyn !== undefined) result.smeaDyn = data.sm_dyn;
                if (data.strength) result.denoise = data.strength;
            } catch {
                result.positive = text;
            }
            return result;
        },

        parseInvokeAI(text) {
            const result = { source: 'InvokeAI' };
            try {
                const data = JSON.parse(text);
                result.positive = data.positive_prompt || data.prompt || '';
                result.negative = data.negative_prompt || '';
                if (data.steps) result.steps = data.steps;
                if (data.cfg_scale) result.cfg = data.cfg_scale;
                if (data.seed) result.seed = String(data.seed);
                if (data.scheduler) result.sampler = data.scheduler;
                if (data.width) result.width = data.width;
                if (data.height) result.height = data.height;
                if (data.model?.model_name) result.model = data.model.model_name;
                if (data.strength) result.denoise = data.strength;
            } catch {
                result.positive = text;
            }
            return result;
        },

        parseSwarmUI(text) {
            const result = { source: 'SwarmUI' };
            try {
                const data = JSON.parse(text);
                result.positive = data.prompt || '';
                result.negative = data.negativeprompt || data.negative_prompt || '';
                if (data.steps) result.steps = data.steps;
                if (data.cfgscale) result.cfg = data.cfgscale;
                if (data.seed) result.seed = String(data.seed);
                if (data.sampler) result.sampler = data.sampler;
                if (data.width) result.width = data.width;
                if (data.height) result.height = data.height;
                if (data.model) result.model = data.model;
                if (data.scheduler) result.scheduler = data.scheduler;
            } catch {
                result.positive = text;
            }
            return result;
        },

        _detectFormat(buffer) {
            const view = new DataView(buffer);
            const b0 = view.getUint32(0);
            if (b0 === 0x89504E47) return 'png';
            if (b0 === 0x52494646 && view.getUint32(8) === 0x57454250) return 'webp';
            if (view.getUint16(0) === 0xFFD8) return 'jpeg';
            return null;
        },

        async parseFile(file) {
            const buffer = await file.arrayBuffer();
            let texts = null;

            const format = this._detectFormat(buffer);
            if (format === 'png') {
                texts = await this.parsePNG(buffer);
            } else if (format === 'webp') {
                texts = this.parseWebP(buffer);
            } else if (format === 'jpeg') {
                texts = this.parseJPEG(buffer);
            } else if (file.type === 'image/png') {
                texts = await this.parsePNG(buffer);
            } else if (file.type === 'image/webp') {
                texts = this.parseWebP(buffer);
            } else {
                texts = this.parseJPEG(buffer);
            }

            if (!texts) return { source: '未检测到元数据', noData: true };

            // ComfyUI: has "prompt" key with JSON
            if (texts.prompt) {
                try {
                    JSON.parse(texts.prompt);
                    return this.parseComfyUI(texts.prompt, texts.workflow);
                } catch {}
            }

            // A1111/Forge: has "parameters" key
            if (texts.parameters) {
                return this.parseA1111(texts.parameters);
            }

            // InvokeAI: has "invokeai_metadata" key
            if (texts.invokeai_metadata) {
                return this.parseInvokeAI(texts.invokeai_metadata);
            }
            if (texts['sd-metadata']) {
                return this.parseInvokeAI(texts['sd-metadata']);
            }

            // SwarmUI: has "sui_image_params" key
            if (texts.sui_image_params) {
                return this.parseSwarmUI(texts.sui_image_params);
            }

            // NovelAI: has "Comment" or "Description"
            if (texts.Comment) return this.parseNovelAI(texts.Comment);
            if (texts.Description) return this.parseNovelAI(texts.Description);

            // UserComment fallback
            if (texts.UserComment) {
                try {
                    const parsed = JSON.parse(texts.UserComment);
                    if (parsed.prompt || parsed.uc) return this.parseNovelAI(texts.UserComment);
                } catch {}
                if (texts.UserComment.includes('Steps:')) return this.parseA1111(texts.UserComment);
            }

            // Unknown format: return raw texts
            const firstVal = Object.values(texts)[0] || '';
            if (firstVal.includes('Steps:') || firstVal.includes('Negative prompt:')) {
                return this.parseA1111(firstVal);
            }

            return { source: '未知格式', positive: firstVal, raw: texts };
        }
    };

    function setupMetaImport() {
        const btn = document.getElementById('btn-import-meta');
        const inp = document.getElementById('inp-import-meta');
        const modal = document.getElementById('modal-meta');
        if (!btn || !inp || !modal) return;

        let parsedData = null;
        let previewUrl = null;

        btn.addEventListener('click', () => {
            inp.value = '';
            inp.click();
        });

        inp.addEventListener('change', async () => {
            const file = inp.files[0];
            if (!file) return;

            const buffer = await file.arrayBuffer();
            const blob = new Blob([buffer], { type: file.type });
            const parseFile = new File([blob], file.name, { type: file.type });
            inp.value = '';

            parsedData = await MetaParser.parseFile(parseFile);
            previewUrl = URL.createObjectURL(file);

            const img = document.getElementById('meta-preview-img');
            img.src = previewUrl;

            const source = document.getElementById('meta-source');
            source.textContent = parsedData.noData
                ? '⚠️ 该图片未检测到生成参数元数据'
                : `来源: ${parsedData.source || '未知'}`;
            source.className = 'meta-source' + (parsedData.noData ? ' meta-no-data' : '');

            const fields = document.getElementById('meta-fields');
            fields.innerHTML = '';

            if (!parsedData.noData) {
                const loraStr = parsedData.loras?.map(l => `${l.name} (${l.weight})`).join(', ');
                const rows = [
                    ['正面提示词', parsedData.positive, 'positive'],
                    ['负面提示词', parsedData.negative, 'negative'],
                    ['模型', parsedData.model, 'model'],
                    ['采样器', parsedData.sampler, 'sampler'],
                    ['调度器', parsedData.scheduler, 'scheduler'],
                    ['步数', parsedData.steps, 'steps'],
                    ['CFG', parsedData.cfg, 'cfg'],
                    ['种子', parsedData.seed, 'seed'],
                    ['尺寸', parsedData.width && parsedData.height ? `${parsedData.width}×${parsedData.height}` : null, 'size'],
                    ['重绘强度', parsedData.denoise, 'denoise'],
                    ['Clip Skip', parsedData.clipSkip, 'clipSkip'],
                    ['LoRA', loraStr, 'loras'],
                    ['Refiner', parsedData.refinerModel, 'refiner'],
                    ['Refiner 切换', parsedData.refinerSwitch, 'refinerSwitch'],
                    ['ADetailer 模型', parsedData.adetailerModel, 'adetailer'],
                    ['ADetailer 提示词', parsedData.adetailerPrompt, 'adetailerPrompt'],
                    ['Hires 放大器', parsedData.hiresUpscaler, 'hiresUpscaler'],
                    ['Hires 步数', parsedData.hiresSteps, 'hiresSteps'],
                    ['Hires 缩放', parsedData.hiresScale, 'hiresScale'],
                    ['SMEA', parsedData.smea !== undefined ? (parsedData.smea ? '开' : '关') : null, 'smea'],
                    ['SMEA Dyn', parsedData.smeaDyn !== undefined ? (parsedData.smeaDyn ? '开' : '关') : null, 'smeaDyn'],
                ];
                rows.forEach(([label, value, key]) => {
                    if (value == null || value === '') return;
                    const row = document.createElement('div');
                    row.className = 'meta-field';
                    const lbl = document.createElement('span');
                    lbl.className = 'meta-field-label';
                    lbl.textContent = label;
                    const val = document.createElement('span');
                    val.className = 'meta-field-value';
                    val.textContent = String(value).length > 200
                        ? String(value).substring(0, 200) + '...'
                        : String(value);
                    val.title = String(value);
                    row.append(lbl, val);
                    fields.appendChild(row);
                });
            }

            const rawToggle = document.getElementById('meta-raw-toggle');
            const rawContent = document.getElementById('meta-raw-content');
            const rawSection = document.getElementById('meta-raw');
            rawContent.classList.add('hidden');
            rawToggle.textContent = '▶ 原始数据';
            if (parsedData.raw || parsedData.workflow) {
                rawSection.classList.remove('hidden');
                rawContent.textContent = JSON.stringify(parsedData.raw || parsedData.workflow || parsedData, null, 2);
            } else {
                rawSection.classList.add('hidden');
            }

            modal.classList.remove('hidden');
        });

        document.getElementById('meta-raw-toggle').addEventListener('click', () => {
            const content = document.getElementById('meta-raw-content');
            const toggle = document.getElementById('meta-raw-toggle');
            const isHidden = content.classList.toggle('hidden');
            toggle.textContent = isHidden ? '▶ 原始数据' : '▼ 原始数据';
        });

        document.getElementById('btn-meta-apply').addEventListener('click', () => {
            if (!parsedData || parsedData.noData) { modal.classList.add('hidden'); return; }
            if (parsedData.positive) {
                dom.txtPositive.value = parsedData.positive;
                dom.txtPositive.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (parsedData.negative) {
                dom.txtNegative.value = parsedData.negative;
                dom.txtNegative.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (parsedData.seed) {
                const seedVal = String(parsedData.seed).split(',')[0].trim();
                if (/^\d+$/.test(seedVal)) dom.inpSeed.value = seedVal;
            }
            if (parsedData.steps && Number.isFinite(parsedData.steps)) dom.inpSteps.value = parsedData.steps;
            if (parsedData.cfg && Number.isFinite(parsedData.cfg)) dom.inpCfg.value = parsedData.cfg;
            if (parsedData.width && Number.isFinite(parsedData.width)) dom.inpWidth.value = parsedData.width;
            if (parsedData.height && Number.isFinite(parsedData.height)) dom.inpHeight.value = parsedData.height;
            if (parsedData.sampler) {
                const opt = [...dom.selSampler.options].find(o => o.value.toLowerCase() === parsedData.sampler.toLowerCase());
                if (opt) dom.selSampler.value = opt.value;
            }
            if (parsedData.scheduler) {
                const opt = [...dom.selScheduler.options].find(o => o.value.toLowerCase() === parsedData.scheduler.toLowerCase());
                if (opt) dom.selScheduler.value = opt.value;
            }
            modal.classList.add('hidden');
            if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
        });

        document.getElementById('btn-meta-cancel').addEventListener('click', () => {
            modal.classList.add('hidden');
            if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
        });
    }

    function showToast(msg, duration = 3000) {
        let el = document.getElementById('toast-msg');
        if (!el) {
            el = document.createElement('div');
            el.id = 'toast-msg';
            Object.assign(el.style, {
                position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px',
                borderRadius: '8px', fontSize: '14px', zIndex: '99999',
                transition: 'opacity .3s', pointerEvents: 'none'
            });
            document.body.appendChild(el);
        }
        el.textContent = msg;
        el.style.opacity = '1';
        clearTimeout(el._timer);
        el._timer = setTimeout(() => { el.style.opacity = '0'; }, duration);
    }

    function setupDzmm() {
        const btn = document.getElementById('btn-dzmm');
        if (!btn) return;
        const DZMM_URL = 'https://www.dzmm.ai/draw/generate/create';
        btn.addEventListener('click', async () => {
            const positive = document.getElementById('txt-positive').value.trim();
            if (positive) {
                try {
                    await navigator.clipboard.writeText(positive);
                    showToast('正向提示词已复制到剪贴板，请在 dzmm 中粘贴');
                } catch {
                    showToast('复制失败，请手动复制提示词');
                }
            }
            window.open(DZMM_URL, 'dzmm_window', 'width=1280,height=900,menubar=no,toolbar=no,location=yes,status=no');
        });
    }

    // ==================== NAI 在线生图 ====================
    const NAI_API_BASE = 'https://api.idlecloud.cc/api';
    const NAI_STORAGE_KEY = 'nai_api_key';

    function setupNai() {
        const apiKeyInput = document.getElementById('inp-nai-apikey');
        const toggleBtn = document.getElementById('btn-nai-apikey-toggle');
        if (!apiKeyInput) return;

        // Load saved API key
        const savedKey = localStorage.getItem(NAI_STORAGE_KEY);
        if (savedKey) apiKeyInput.value = savedKey;

        apiKeyInput.addEventListener('change', () => {
            localStorage.setItem(NAI_STORAGE_KEY, apiKeyInput.value.trim());
        });

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
            });
        }

        // Size presets
        document.querySelectorAll('.nai-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nai-size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Upscale premium gate
        const chkUpscale = document.getElementById('chk-nai-upscale');
        if (chkUpscale) {
            chkUpscale.addEventListener('change', () => {
                if (chkUpscale.checked) {
                    showToast('大图模式需要高级权限，请加入 Discord 群获取资格');
                    chkUpscale.checked = false;
                }
            });
        }

        // Sliders
        const sliders = [
            ['rng-nai-steps', 'nai-steps-val', v => v],
            ['rng-nai-cfg', 'nai-cfg-val', v => parseFloat(v).toFixed(1)],
            ['rng-nai-rescale', 'nai-rescale-val', v => parseFloat(v).toFixed(2)],
            ['rng-nai-duration', 'nai-duration-val', v => parseFloat(v).toFixed(1)],
            ['rng-nai-video-steps', 'nai-video-steps-val', v => v],
            ['rng-nai-video-guidance', 'nai-video-guidance-val', v => parseFloat(v).toFixed(1)],
        ];
        sliders.forEach(([sliderId, valId, fmt]) => {
            const slider = document.getElementById(sliderId);
            const valEl = document.getElementById(valId);
            if (slider && valEl) {
                slider.addEventListener('input', () => { valEl.textContent = fmt(slider.value); });
            }
        });

        // Random seed
        const btnSeed = document.getElementById('btn-nai-random-seed');
        if (btnSeed) {
            btnSeed.addEventListener('click', () => {
                document.getElementById('inp-nai-seed').value = Math.floor(Math.random() * 4294967295);
            });
        }

        // Video random seed
        const btnVideoSeed = document.getElementById('btn-nai-video-random-seed');
        if (btnVideoSeed) {
            btnVideoSeed.addEventListener('click', () => {
                document.getElementById('inp-nai-video-seed').value = Math.floor(Math.random() * 4294967295);
            });
        }

        // Model switch: show/hide video panel vs image panels
        const selModel = document.getElementById('sel-nai-model');
        if (selModel) {
            const imageOnlyGroups = ['nai-basic', 'nai-img2img', 'nai-vibe', 'nai-director-ref', 'nai-character', 'nai-extra'];
            selModel.addEventListener('change', () => {
                const isVideo = selModel.value.startsWith('wan2');
                const videoPanel = document.getElementById('nai-video-panel');
                if (videoPanel) videoPanel.classList.toggle('hidden', !isVideo);
                // Hide image-specific panels that don't apply to video
                const imageSizePanels = document.querySelectorAll('#mode-nai [data-group="nai-basic"] .panel');
                const sizePanel = imageSizePanels[2]; // image size panel
                const samplingPanel = imageSizePanels[3]; // sampling panel
                const specialPanel = imageSizePanels[4]; // special features panel
                if (sizePanel) sizePanel.style.display = isVideo ? 'none' : '';
                if (samplingPanel) samplingPanel.style.display = isVideo ? 'none' : '';
                if (specialPanel) specialPanel.style.display = isVideo ? 'none' : '';
                // Hide image-only groups for video mode
                ['nai-img2img', 'nai-vibe', 'nai-director-ref', 'nai-character', 'nai-extra'].forEach(g => {
                    const el = document.querySelector(`#mode-nai [data-group="${g}"]`);
                    if (el) el.style.display = isVideo ? 'none' : '';
                });
            });
        }

        // Video frame upload helpers
        setupNaiFrameUpload('nai-start-frame');
        setupNaiFrameUpload('nai-end-frame');

        if (sessionStorage.getItem('_adm')) {
            const vcRow = document.getElementById('nai-videocode-row');
            if (vcRow) vcRow.style.display = 'none';
        }

        // img2img upload
        const img2imgZone = document.getElementById('nai-img2img-zone');
        const img2imgInput = document.getElementById('inp-nai-img2img');
        if (img2imgZone && img2imgInput) {
            img2imgZone.addEventListener('click', () => img2imgInput.click());
            img2imgZone.addEventListener('dragover', e => { e.preventDefault(); img2imgZone.style.borderColor = '#14b8a6'; });
            img2imgZone.addEventListener('dragleave', () => { img2imgZone.style.borderColor = ''; });
            img2imgZone.addEventListener('drop', e => {
                e.preventDefault();
                img2imgZone.style.borderColor = '';
                if (e.dataTransfer.files.length) handleNaiImg2imgFile(e.dataTransfer.files[0]);
            });
            img2imgInput.addEventListener('change', () => {
                if (img2imgInput.files[0]) handleNaiImg2imgFile(img2imgInput.files[0]);
            });
        }

        // Premium zones
        document.querySelectorAll('.nai-premium-zone').forEach(zone => {
            zone.addEventListener('click', () => {
                showToast('该功能需要高级权限，请加入 Discord 群获取资格');
            });
        });

        // Character control
        const btnAddChar = document.getElementById('btn-nai-add-character');
        if (btnAddChar) {
            btnAddChar.addEventListener('click', () => {
                const list = document.getElementById('nai-character-list');
                const count = list.querySelectorAll('.nai-character-item').length;
                if (count >= 6) { showToast('最多支持 6 个角色'); return; }
                const idx = count + 1;
                const item = document.createElement('div');
                item.className = 'nai-character-item';
                item.innerHTML = `<h3>角色 ${idx} <button class="btn-icon btn-sm nai-remove-char" title="删除">🗑️</button></h3>
                    <textarea placeholder="角色正向提示词..." class="nai-char-prompt" rows="2"></textarea>
                    <textarea placeholder="角色反向提示词..." class="nai-char-uc" rows="1" style="margin-top:4px"></textarea>
                    <div class="compact-row" style="margin-top:4px">
                        <label>X <input type="number" class="nai-char-x" value="0.5" min="0" max="1" step="0.1"></label>
                        <label>Y <input type="number" class="nai-char-y" value="0.5" min="0" max="1" step="0.1"></label>
                    </div>`;
                item.querySelector('.nai-remove-char').addEventListener('click', () => {
                    item.remove();
                    updateNaiCharInfo();
                });
                list.appendChild(item);
                updateNaiCharInfo();
            });
        }

        // Reset
        const btnReset = document.getElementById('btn-nai-reset');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                document.getElementById('sel-nai-model').value = 'nai-diffusion-4-5-full';
                document.querySelectorAll('.nai-size-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('.nai-size-btn[data-w="832"]').classList.add('active');
                document.getElementById('inp-nai-seed').value = '-1';
                document.getElementById('sel-nai-sampler').value = 'k_euler';
                const resetSliders = { 'rng-nai-steps': '23', 'rng-nai-cfg': '5', 'rng-nai-rescale': '0' };
                Object.entries(resetSliders).forEach(([id, val]) => {
                    const el = document.getElementById(id);
                    if (el) { el.value = val; el.dispatchEvent(new Event('input')); }
                });
                document.getElementById('sel-nai-noise-schedule').value = 'karras';
                ['chk-nai-smea','chk-nai-dyn','chk-nai-variety','chk-nai-decrisp','chk-nai-legacy','chk-nai-legacy-uc','chk-nai-legacy-v3','chk-nai-auto-smea','chk-nai-euler-bug'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.checked = false;
                });
                document.getElementById('chk-nai-brownian').checked = true;
                document.getElementById('sel-nai-uc-preset').value = '1';
                document.getElementById('nai-character-list').innerHTML = '';
                updateNaiCharInfo();
                showToast('已重置所有参数');
            });
        }

        // Generate button
        const btnNaiGen = document.getElementById('btn-nai-generate');
        if (btnNaiGen) {
            btnNaiGen.addEventListener('click', () => naiGenerate());
        }
    }

    let _naiImg2imgBase64 = null;
    let _naiStartFrameBase64 = null;
    let _naiEndFrameBase64 = null;

    function setupNaiFrameUpload(prefix) {
        const zone = document.getElementById(`${prefix}-zone`);
        const input = document.getElementById(`inp-${prefix}`);
        if (!zone || !input) return;

        zone.addEventListener('click', () => input.click());
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = '#14b8a6'; });
        zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.style.borderColor = '';
            if (e.dataTransfer.files.length) handleNaiFrameFile(prefix, e.dataTransfer.files[0]);
        });
        input.addEventListener('change', () => {
            if (input.files[0]) handleNaiFrameFile(prefix, input.files[0]);
        });

        const removeBtn = document.querySelector(`.nai-remove-img[data-target="${prefix}"]`);
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (prefix === 'nai-start-frame') _naiStartFrameBase64 = null;
                else _naiEndFrameBase64 = null;
                document.getElementById(`${prefix}-preview`).classList.add('hidden');
                zone.classList.remove('hidden');
                document.getElementById(`inp-${prefix}`).value = '';
            });
        }
    }

    function handleNaiFrameFile(prefix, file) {
        if (!file.type.startsWith('image/')) { showToast('请上传图片文件'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            const b64 = e.target.result.split(',')[1];
            if (prefix === 'nai-start-frame') _naiStartFrameBase64 = b64;
            else _naiEndFrameBase64 = b64;
            const preview = document.getElementById(`${prefix}-preview`);
            const img = document.getElementById(`${prefix}-img`);
            img.src = e.target.result;
            preview.classList.remove('hidden');
            document.getElementById(`${prefix}-zone`).classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    function handleNaiImg2imgFile(file) {
        if (!file.type.startsWith('image/')) { showToast('请上传图片文件'); return; }
        const reader = new FileReader();
        reader.onload = (e) => {
            _naiImg2imgBase64 = e.target.result.split(',')[1];
            const preview = document.getElementById('nai-img2img-preview');
            const img = document.getElementById('nai-img2img-img');
            img.src = e.target.result;
            preview.classList.remove('hidden');
            document.getElementById('nai-img2img-zone').classList.add('hidden');
        };
        reader.readAsDataURL(file);

        const removeBtn = document.querySelector('.nai-remove-img[data-target="nai-img2img"]');
        if (removeBtn) {
            removeBtn.onclick = () => {
                _naiImg2imgBase64 = null;
                document.getElementById('nai-img2img-preview').classList.add('hidden');
                document.getElementById('nai-img2img-zone').classList.remove('hidden');
                document.getElementById('inp-nai-img2img').value = '';
            };
        }
    }

    function updateNaiCharInfo() {
        const list = document.getElementById('nai-character-list');
        const info = document.getElementById('nai-character-info');
        if (!list || !info) return;
        const count = list.querySelectorAll('.nai-character-item').length;
        info.textContent = `已配置 ${count}/6 个角色，当前启用 ${count} 个。`;
    }

    function getNaiPayload() {
        const activeSize = document.querySelector('.nai-size-btn.active');
        const w = activeSize ? parseInt(activeSize.dataset.w) : 1024;
        const h = activeSize ? parseInt(activeSize.dataset.h) : 1536;
        let seed = parseInt(document.getElementById('inp-nai-seed').value);
        if (seed < 0) seed = Math.floor(Math.random() * 4294967295);

        const payload = {
            model: document.getElementById('sel-nai-model').value,
            positivePrompt: document.getElementById('txt-positive').value.trim(),
            negativePrompt: document.getElementById('txt-negative').value.trim(),
            width: w,
            height: h,
            steps: parseInt(document.getElementById('rng-nai-steps').value),
            scale: parseFloat(document.getElementById('rng-nai-cfg').value),
            sampler: document.getElementById('sel-nai-sampler').value,
            seed: seed,
            noise_schedule: document.getElementById('sel-nai-noise-schedule').value,
            promptGuidanceRescale: parseFloat(document.getElementById('rng-nai-rescale').value),
            sm: document.getElementById('chk-nai-smea').checked,
            sm_dyn: document.getElementById('chk-nai-dyn').checked,
            decrisp: document.getElementById('chk-nai-decrisp').checked,
            variety: document.getElementById('chk-nai-variety').checked,
            prefer_brownian: document.getElementById('chk-nai-brownian').checked,
            deliberate_euler_ancestral_bug: document.getElementById('chk-nai-euler-bug').checked,
            legacy: document.getElementById('chk-nai-legacy').checked,
            legacy_uc: document.getElementById('chk-nai-legacy-uc').checked,
            legacy_v3_extend: document.getElementById('chk-nai-legacy-v3').checked,
            ucPreset: parseInt(document.getElementById('sel-nai-uc-preset').value),
            autoSmea: document.getElementById('chk-nai-auto-smea').checked,
            use_coords: !(document.getElementById('chk-nai-use-coords')?.checked),
            use_upscale_credits: false,
        };

        // img2img
        if (_naiImg2imgBase64) {
            payload.action = true;
            payload.image = _naiImg2imgBase64;
            payload.strength = parseFloat(document.getElementById('inp-nai-strength').value);
            payload.noise = parseFloat(document.getElementById('inp-nai-noise').value);
        }

        // Character prompts (V4)
        const charItems = document.querySelectorAll('.nai-character-item');
        if (charItems.length > 0) {
            const characterPrompts = [];
            const v4Captions = [];
            const v4NegCaptions = [];
            charItems.forEach(item => {
                const prompt = item.querySelector('.nai-char-prompt').value.trim();
                const uc = item.querySelector('.nai-char-uc').value.trim();
                const x = parseFloat(item.querySelector('.nai-char-x').value) || 0.5;
                const y = parseFloat(item.querySelector('.nai-char-y').value) || 0.5;
                characterPrompts.push({ prompt, uc, center: { x, y } });
                v4Captions.push({ char_caption: prompt, centers: [{ x, y }] });
                v4NegCaptions.push({ char_caption: uc, centers: [{ x, y }] });
            });
            payload.characterPrompts = characterPrompts;
            payload.v4_prompt_char_captions = v4Captions;
            payload.v4_negative_prompt_char_captions = v4NegCaptions;
        }

        return payload;
    }

    function getNaiVideoPayload() {
        let seed = parseInt(document.getElementById('inp-nai-video-seed').value);
        if (seed < 0) seed = Math.floor(Math.random() * 4294967295);

        const images = [];
        if (_naiStartFrameBase64) images.push(_naiStartFrameBase64);
        if (_naiEndFrameBase64) images.push(_naiEndFrameBase64);

        const payload = {
            model: document.getElementById('sel-nai-model').value,
            positivePrompt: document.getElementById('txt-positive').value.trim(),
            negativePrompt: document.getElementById('txt-negative').value.trim(),
            seed: seed,
            inferenceSteps: parseInt(document.getElementById('rng-nai-video-steps').value),
            guidance_scale_high: parseFloat(document.getElementById('rng-nai-video-guidance').value),
            seconds: parseFloat(document.getElementById('rng-nai-duration').value),
            videoFluidity: parseInt(document.getElementById('sel-nai-fps').value),
            image: images,
        };

        const videoCode = document.getElementById('inp-nai-videocode')?.value?.trim();
        if (videoCode) payload.videoCode = videoCode.toUpperCase();

        return payload;
    }

    function getNaiEndpoints(customApiKey, isVideo) {
        if (customApiKey) {
            const apiPath = isVideo ? 'generate_video' : 'generate_image';
            return {
                useProxy: false,
                submitUrl: `${NAI_API_BASE}/${apiPath}`,
                resultUrl: (jobId) => `${NAI_API_BASE}/get_result/${encodeURIComponent(jobId)}`,
                headers: {
                    'Authorization': `Bearer ${customApiKey}`,
                    'Content-Type': 'application/json'
                }
            };
        }
        const proxyBase = '/api/nai';
        const hdrs = { 'Content-Type': 'application/json' };
        const admKey = sessionStorage.getItem('_adm');
        if (admKey) hdrs['X-Admin-Key'] = admKey;
        return {
            useProxy: true,
            submitUrl: `${proxyBase}/generate`,
            resultUrl: (jobId) => `${proxyBase}/status?id=${encodeURIComponent(jobId)}`,
            headers: hdrs
        };
    }

    async function naiGenerate() {
        const customApiKey = document.getElementById('inp-nai-apikey').value.trim();

        const model = document.getElementById('sel-nai-model').value;
        const isVideo = model.startsWith('wan2');
        const endpoints = getNaiEndpoints(customApiKey, isVideo);

        const _log = (tag, ...args) => console.log(`[NAI-${isVideo ? 'Video' : 'Image'}] [${tag}]`, ...args);
        const _startTime = Date.now();
        _log('INIT', 'model:', model, 'isVideo:', isVideo, 'hasApiKey:', !!customApiKey);

        if (isVideo && !_naiStartFrameBase64) {
            showToast('视频生成需要上传首帧图片');
            return;
        }

        const btnGen = document.getElementById('btn-nai-generate');
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');

        btnGen.disabled = true;
        btnGen.textContent = '生成中...';
        progressContainer.classList.remove('hidden');

        try {
            progressBar.style.width = '10%';

            const payload = isVideo ? getNaiVideoPayload() : getNaiPayload();
            _log('PAYLOAD', JSON.stringify({
                model: payload.model,
                seed: payload.seed,
                ...(isVideo ? {
                    seconds: payload.seconds,
                    videoFluidity: payload.videoFluidity,
                    inferenceSteps: payload.inferenceSteps,
                    guidance_scale_high: payload.guidance_scale_high,
                    hasStartFrame: !!(payload.image && payload.image[0]),
                    hasEndFrame: !!(payload.image && payload.image[1]),
                    promptLength: payload.positivePrompt?.length || 0,
                } : {
                    width: payload.width,
                    height: payload.height,
                    steps: payload.steps,
                    cfg: payload.cfg_scale,
                })
            }));

            // Submit with auto-retry queue
            let job_id;
            const maxRetries = 60;
            let queueStartTime = null;
            for (let retry = 0; retry <= maxRetries; retry++) {
                const submitRes = await fetch(endpoints.submitUrl, {
                    method: 'POST',
                    headers: endpoints.headers,
                    body: JSON.stringify(payload)
                });

                _log('SUBMIT', `attempt ${retry}/${maxRetries}, status: ${submitRes.status}, elapsed: ${Date.now() - _startTime}ms`);

                if (submitRes.status === 429) {
                    if (!queueStartTime) queueStartTime = Date.now();
                    const errData = await submitRes.json().catch(() => ({}));
                    _log('QUEUE', 'position:', errData.queue_position, 'total:', errData.queue_total, 'retry_after:', errData.retry_after, 'rate_limited:', errData.rate_limited, 'queue_full:', errData.queue_full);
                    if (errData._debug) console.log('Admin debug:', errData._debug);
                    if (errData.rate_limited || errData.queue_full) {
                        throw new Error(errData.error);
                    }
                    const waitSec = errData.retry_after || 10;
                    if (retry >= maxRetries) {
                        throw new Error('排队超时，请稍后再试');
                    }
                    const pos = errData.queue_position || '?';
                    const total = errData.queue_total || '?';
                    progressText.textContent = `🔄 排队中（第${pos}位 / 共${total}人等待）`;
                    progressBar.style.width = `${Math.min(3 + retry, 15)}%`;
                    await new Promise(r => setTimeout(r, waitSec * 1000));
                    continue;
                }

                if (!submitRes.ok) {
                    const errData = await submitRes.json().catch(() => ({}));
                    _log('SUBMIT_ERROR', 'status:', submitRes.status, 'body:', JSON.stringify(errData));
                    throw new Error(errData.error || `提交失败 (${submitRes.status})`);
                }

                const submitData = await submitRes.json();
                job_id = submitData.job_id;
                _log('SUBMITTED', 'job_id:', job_id, 'queue_wait:', queueStartTime ? `${Date.now() - queueStartTime}ms` : 'none', 'total_elapsed:', `${Date.now() - _startTime}ms`);
                break;
            }
            progressBar.style.width = '30%';
            progressText.textContent = '排队中...';

            // Poll
            let attempts = 0;
            let pollErrors = 0;
            const maxAttempts = 120;
            const maxPollErrors = 5;
            let lastStatus = '';
            const pollStartTime = Date.now();
            while (attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 5000));
                attempts++;

                let resultRes;
                try {
                    resultRes = await fetch(endpoints.resultUrl(job_id), { headers: endpoints.headers });
                } catch (fetchErr) {
                    pollErrors++;
                    _log('POLL_FETCH_ERR', `attempt ${attempts}, error: ${fetchErr.message}, pollErrors: ${pollErrors}/${maxPollErrors}`);
                    if (pollErrors >= maxPollErrors) throw new Error('网络错误，查询多次失败');
                    progressText.textContent = `查询暂时失败，重试中 (${pollErrors}/${maxPollErrors})...`;
                    continue;
                }
                if (!resultRes.ok) {
                    pollErrors++;
                    _log('POLL_HTTP_ERR', `attempt ${attempts}, status: ${resultRes.status}, pollErrors: ${pollErrors}/${maxPollErrors}`);
                    if (pollErrors >= maxPollErrors) throw new Error(`查询失败 (${resultRes.status})，已重试 ${maxPollErrors} 次`);
                    progressText.textContent = `查询暂时失败 (${resultRes.status})，重试中 (${pollErrors}/${maxPollErrors})...`;
                    continue;
                }
                pollErrors = 0;

                const result = await resultRes.json();
                const pct = Math.min(30 + (attempts / maxAttempts) * 60, 90);
                progressBar.style.width = pct + '%';

                if (result._note || result._upstream_status || result._upstream_body) {
                    _log('POLL_RAW_UPSTREAM', `attempt: ${attempts}, _note: ${result._note}, _upstream_status: ${result._upstream_status}, _upstream_body: ${result._upstream_body}, _fetchDuration: ${result._fetchDuration}ms`);
                }
                if (result.status !== lastStatus) {
                    _log('POLL_STATUS_CHANGE', `${lastStatus || '(init)'} -> ${result.status}, attempt: ${attempts}, poll_elapsed: ${Date.now() - pollStartTime}ms, total_elapsed: ${Date.now() - _startTime}ms, full_response: ${JSON.stringify(result)}`);
                    lastStatus = result.status;
                }
                if (attempts % 12 === 0) {
                    _log('POLL_HEARTBEAT', `attempt: ${attempts}/${maxAttempts}, status: ${result.status}, poll_elapsed: ${Date.now() - pollStartTime}ms, total_elapsed: ${Date.now() - _startTime}ms, full_response: ${JSON.stringify(result)}`);
                }

                if (result.status === 'completed') {
                    _log('COMPLETED', `total_elapsed: ${Date.now() - _startTime}ms, poll_elapsed: ${Date.now() - pollStartTime}ms, attempts: ${attempts}, has_video_url: ${!!result.video_url}, has_image_url: ${!!result.image_url}`);
                    progressBar.style.width = '100%';
                    const mediaUrl = result.image_url || result.video_url;
                    if (mediaUrl) {
                        const resultImg = document.getElementById('result-image');
                        const placeholder = document.getElementById('result-placeholder');
                        const actions = document.getElementById('result-actions');

                        if (result.video_url) {
                            let videoEl = document.getElementById('result-video');
                            if (!videoEl) {
                                videoEl = document.createElement('video');
                                videoEl.id = 'result-video';
                                videoEl.className = 'result-image';
                                videoEl.controls = true;
                                videoEl.autoplay = true;
                                videoEl.loop = true;
                                resultImg.parentNode.insertBefore(videoEl, resultImg.nextSibling);
                            }
                            videoEl.src = result.video_url;
                            videoEl.classList.remove('hidden');
                            resultImg.classList.add('hidden');
                            showToast('视频生成完成！');
                        } else {
                            const videoEl = document.getElementById('result-video');
                            if (videoEl) videoEl.classList.add('hidden');
                            resultImg.src = mediaUrl;
                            resultImg.classList.remove('hidden');
                            showToast('图片生成完成！');
                        }
                        placeholder.classList.add('hidden');
                        if (actions) actions.classList.remove('hidden');
                        updateMobileResultUI(true);
                    }
                    break;
                } else if (result.status === 'failed') {
                    _log('FAILED', `error: ${result.error}, total_elapsed: ${Date.now() - _startTime}ms, full_result: ${JSON.stringify(result)}`);
                    throw new Error(`生成失败: ${result.error || '未知错误'}`);
                } else {
                    const statusText = result.status === 'queued' ? '排队中...' : '生成中...';
                    progressText.textContent = statusText;
                }
            }

            if (attempts >= maxAttempts) {
                _log('TIMEOUT', `maxAttempts reached (${maxAttempts}), total_elapsed: ${Date.now() - _startTime}ms, lastStatus: ${lastStatus}`);
                throw new Error('生成超时，请稍后重试');
            }
        } catch (err) {
            _log('ERROR', `message: ${err.message}, total_elapsed: ${Date.now() - _startTime}ms`);
            showToast(`错误: ${err.message}`);
            console.error('NAI generate error:', err);
        } finally {
            btnGen.disabled = false;
            btnGen.textContent = 'NAI 在线生图';
            progressContainer.classList.add('hidden');
            progressBar.style.width = '0%';
        }
    }

    setupTheme();
    setupToggles();
    setupArchSwitch();
    setupIPAdapter();
    setupPanelGroups();
    setupMobileNav();
    setupMobileResultExpand();
    setupGenerateFab();
    setupSidebarResize();
    setupWildcard();
    setupWorkflowMode();
    bindEvents();
    setupPromptTagEditor();
    setupMetaImport();
    setupDzmm();
    setupNai();
    init();
})();
