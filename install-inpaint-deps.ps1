# ComfyUI Web inpaint deps: check then install missing only. NO pip. Place next to install-inpaint-deps.bat in ComfyUI root.
$ErrorActionPreference = 'Continue'
$StartDir = (Get-Location).Path
$Root = $StartDir
$CustomNodes = Join-Path $Root 'custom_nodes'
$Models = Join-Path $Root 'models'
$Api = if ($env:COMFYUI_URL) { $env:COMFYUI_URL } else { 'http://127.0.0.1:8188' }
$ReportPath = Join-Path $StartDir 'inpaint-deps-report.txt'

function Write-Ok($m) { Write-Host "[OK] $m" -ForegroundColor Green }
function Write-Miss($m) { Write-Host "[--] $m" -ForegroundColor Yellow }
function Write-Warn($m) { Write-Host "[!] $m" -ForegroundColor Red }
function Write-Info($m) { Write-Host "[..] $m" -ForegroundColor Cyan }

function Resolve-ComfyRoot($baseDir) {
    if ((Test-Path (Join-Path $baseDir 'custom_nodes')) -and (Test-Path (Join-Path $baseDir 'models'))) {
        return $baseDir
    }
    $candidate = Join-Path $baseDir 'ComfyUI'
    if ((Test-Path (Join-Path $candidate 'custom_nodes')) -and (Test-Path (Join-Path $candidate 'models'))) {
        return $candidate
    }
    return $null
}

$Plugins = @(
    @{ Id='anima-lllite'; Label='ComfyUI-Anima-LLLite'; Folders=@('ComfyUI-Anima-LLLite'); Git='https://github.com/kohya-ss/ComfyUI-Anima-LLLite.git'; Nodes=@('AnimaLLLiteApply'); Any=$false; Optional=$false }
    @{ Id='controlnet-aux'; Label='comfyui_controlnet_aux'; Folders=@('comfyui_controlnet_aux'); Git='https://github.com/Fannovel16/comfyui_controlnet_aux.git'; Nodes=@('InpaintPreprocessor'); Any=$false; Optional=$false }
    @{ Id='inpaint-crop-stitch'; Label='ComfyUI-Inpaint-CropAndStitch'; Folders=@('ComfyUI-Inpaint-CropAndStitch'); Git='https://github.com/lquesada/ComfyUI-Inpaint-CropAndStitch.git'; Nodes=@('InpaintCropImproved','InpaintStitchImproved'); Any=$true; Optional=$true }
    @{ Id='essentials'; Label='ComfyUI_essentials'; Folders=@('ComfyUI_essentials'); Git='https://github.com/cubiq/ComfyUI_essentials.git'; Nodes=@('MaskFix+'); Any=$false; Optional=$true }
    @{ Id='inpaint-nodes'; Label='comfyui-inpaint-nodes'; Folders=@('comfyui-inpaint-nodes'); Git='https://github.com/Acly/comfyui-inpaint-nodes.git'; Nodes=@('INPAINT_LoadFooocusInpaint'); Any=$false; Optional=$true }
)

$ModelFiles = @(
    @{ Label='anima-lllite-inpainting-v2.safetensors'; Sub='controlnet'; File='anima-lllite-inpainting-v2.safetensors'; Url='https://huggingface.co/kohya-ss/Anima-LLLite/resolve/main/anima-lllite-inpainting-v2.safetensors'; Match='lllite-inpainting'; Req='anima-lllite' }
    @{ Label='inpaint_v26.fooocus.patch'; Sub='inpaint'; File='inpaint_v26.fooocus.patch'; Url='https://huggingface.co/lllyasviel/fooocus_inpaint/resolve/main/inpaint_v26.fooocus.patch'; Match='inpaint_v26'; Req='inpaint-nodes' }
    @{ Label='fooocus_inpaint_head.pth'; Sub='inpaint'; File='fooocus_inpaint_head.pth'; Url='https://huggingface.co/lllyasviel/fooocus_inpaint/resolve/main/fooocus_inpaint_head.pth'; Match='fooocus_inpaint_head'; Req='inpaint-nodes' }
)

function Test-ApiOnline {
    try { Invoke-RestMethod -Uri "$Api/system_stats" -TimeoutSec 5 | Out-Null; return $true } catch { return $false }
}

function Test-NodeApi($name) {
    try {
        $enc = [uri]::EscapeDataString($name)
        $r = Invoke-RestMethod -Uri "$Api/object_info/$enc" -TimeoutSec 8
        return [bool]($r.PSObject.Properties[$name])
    } catch { return $null }
}

function Find-PluginDir($folders) {
    foreach ($f in $folders) {
        $p = Join-Path $CustomNodes $f
        if (Test-Path $p) { return $p }
    }
    return $null
}

function Test-PluginFs($dir, $nodes, $any) {
    if (-not $dir) { return $false }
    $found = @{}
    foreach ($py in (Get-ChildItem -Path $dir -Filter '*.py' -Recurse -ErrorAction SilentlyContinue)) {
        $t = Get-Content $py.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $t) { continue }
        foreach ($n in $nodes) {
            if ($t.Contains($n)) { $found[$n] = $true }
        }
    }
    if ($any) { return $found.Count -gt 0 }
    foreach ($n in $nodes) { if (-not $found[$n]) { return $false } }
    return $true
}

function Test-PluginReady($p, $apiOk) {
    if ($apiOk) {
        $rs = @($p.Nodes | ForEach-Object { Test-NodeApi $_ })
        if ($rs -notcontains $null) {
            if ($p.Any) { return ($rs -contains $true), 'API' }
            return ($rs -notcontains $false), 'API'
        }
    }
    $dir = Find-PluginDir $p.Folders
    if ($dir -and (Test-PluginFs $dir $p.Nodes $p.Any)) { return $true, 'local' }
    return $false, 'missing'
}

function Test-ModelFile($m) {
    $folder = Join-Path $Models $m.Sub
    if (-not (Test-Path $folder)) { return $false }
    $target = Join-Path $folder $m.File
    if ((Test-Path $target) -and ((Get-Item $target).Length -gt 1024)) { return $true }
    foreach ($f in (Get-ChildItem -Path $folder -Recurse -File -ErrorAction SilentlyContinue)) {
        if ($f.Name -match '\.(part|tmp|download)$') { continue }
        if ($f.Length -gt 1024 -and $f.Name -match $m.Match) { return $true }
    }
    return $false
}

function Install-Plugin($p) {
    $dest = Join-Path $CustomNodes $p.Folders[0]
    if (Test-Path $dest) {
        Write-Warn "Folder exists, skip clone: $($p.Folders[0])"
        return $true
    }
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Warn "Git not found, fallback to ZIP download."
        return Install-PluginFromZip $p
    }
    Write-Host "    git clone $($p.Git)"
    & git clone --depth 1 $p.Git $dest
    if ($LASTEXITCODE -ne 0) { return $false }
    if (Test-Path (Join-Path $dest 'requirements.txt')) {
        Write-Warn "Plugin has requirements.txt - use ComfyUI Manager for deps. This script does NOT run pip."
    }
    return $true
}

function Install-PluginFromZip($p) {
    try {
        $zipUrl = $p.Git -replace '\.git$', '/archive/refs/heads/main.zip'
        $tmpRoot = Join-Path $env:TEMP ("comfyui_node_" + [guid]::NewGuid().ToString('N'))
        $zipPath = Join-Path $tmpRoot 'node.zip'
        $extractPath = Join-Path $tmpRoot 'extract'
        New-Item -ItemType Directory -Path $tmpRoot -Force | Out-Null
        New-Item -ItemType Directory -Path $extractPath -Force | Out-Null
        Write-Info "zip download: $zipUrl"
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing -TimeoutSec 120
        Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
        $src = Get-ChildItem -Path $extractPath -Directory | Select-Object -First 1
        if (-not $src) { throw 'zip extract empty' }
        $dest = Join-Path $CustomNodes $p.Folders[0]
        if (Test-Path $dest) { Remove-Item $dest -Recurse -Force -ErrorAction SilentlyContinue }
        Move-Item -Path $src.FullName -Destination $dest -Force
        Remove-Item $tmpRoot -Recurse -Force -ErrorAction SilentlyContinue
        if (Test-Path (Join-Path $dest 'requirements.txt')) {
            Write-Warn "Plugin has requirements.txt - use ComfyUI Manager for deps. This script does NOT run pip."
        }
        return $true
    } catch {
        Write-Warn "zip install failed: $_"
        return $false
    }
}

function Save-ModelFile($m) {
    $dest = Join-Path (Join-Path $Models $m.Sub) $m.File
    $dir = Split-Path $dest -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $tmp = "$dest.part"
    Write-Host "    download $($m.Label)"
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add('User-Agent', 'ComfyUI-Web-Setup/1.0')
        $wc.DownloadFile($m.Url, $tmp)
        if ((Get-Item $tmp).Length -lt 1024) { throw 'file too small' }
        Move-Item -Force $tmp $dest
        return $true
    } catch {
        if (Test-Path $tmp) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
        Write-Warn "download failed: $_"
        return $false
    }
}

Write-Host ""
$resolvedRoot = Resolve-ComfyRoot $StartDir
if (-not $resolvedRoot) {
    Write-Warn "Cannot find ComfyUI root from: $StartDir"
    Write-Warn "Expected either:"
    Write-Warn "  1) current folder contains custom_nodes and models"
    Write-Warn "  2) current folder contains ComfyUI\\custom_nodes and ComfyUI\\models"
    $report = @(
        "ComfyUI Inpaint Dependency Report",
        "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
        "StartDir: $StartDir",
        "Result: failed - comfy root not found"
    )
    $report | Set-Content -Path $ReportPath -Encoding UTF8
    exit 1
}
$Root = $resolvedRoot
$CustomNodes = Join-Path $Root 'custom_nodes'
$Models = Join-Path $Root 'models'
Write-Host "ComfyUI root: $Root"
$report = [System.Collections.Generic.List[string]]::new()
$report.Add("ComfyUI Inpaint Dependency Report")
$report.Add("Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$report.Add("StartDir: $StartDir")
$report.Add("Root: $Root")
$report.Add("API: $Api")
$report.Add("")
$apiOk = Test-ApiOnline
if ($apiOk) { Write-Ok "ComfyUI API online" } else { Write-Warn "ComfyUI offline (OK to continue, restart after install)" }
if (Get-Command git -ErrorAction SilentlyContinue) { Write-Ok "Git found" } else { Write-Warn "Git not installed" }
$report.Add("API online: $apiOk")
$report.Add("Git found: $([bool](Get-Command git -ErrorAction SilentlyContinue))")

Write-Host ""
Write-Host "--- 1. Plugins ---"
$status = @{}; $toInstall = @()
foreach ($p in $Plugins) {
    $ready, $how = Test-PluginReady $p $apiOk
    $status[$p.Id] = @{ Ready = $ready }
    $tag = if ($p.Optional) { 'opt' } else { 'req' }
    if ($ready) { Write-Ok "$($p.Label) [$tag]" } else { Write-Miss "$($p.Label) [$tag]"; $toInstall += $p }
    $report.Add("PLUGIN | $($p.Label) | ready=$ready | optional=$($p.Optional) | via=$how")
}

Write-Host ""
Write-Host "--- 2. Model files ---"
$toDownload = @()
foreach ($m in $ModelFiles) {
    $okPlugin = $status[$m.Req].Ready -or (($toInstall | Where-Object Id -eq $m.Req).Count -gt 0)
    if (-not $okPlugin) {
        Write-Miss "$($m.Label) (skip)"
        $report.Add("MODEL  | $($m.Label) | skipped=true (plugin $($m.Req) not ready)")
        continue
    }
    $hasModel = Test-ModelFile $m
    if ($hasModel) { Write-Ok $m.Label } else { Write-Miss $m.Label; $toDownload += $m }
    $report.Add("MODEL  | $($m.Label) | ready=$hasModel")
}

if ($toInstall.Count -eq 0 -and $toDownload.Count -eq 0) {
    Write-Host ""
    Write-Ok "All ready. Nothing to install."
    $report.Add("")
    $report.Add("Result: all ready, nothing to install")
    $report | Set-Content -Path $ReportPath -Encoding UTF8
    exit 0
}

Write-Host ""
Write-Host "--- 3. Installing missing ---"
$fail = 0
foreach ($p in $toInstall) {
    Write-Host ""
    Write-Host ">> $($p.Label)"
    $ok = Install-Plugin $p
    if (-not $ok) { $fail++ }
    $report.Add("INSTALL | plugin | $($p.Label) | success=$ok")
}
foreach ($m in $toDownload) {
    Write-Host ""
    Write-Host ">> $($m.Label)"
    $ok = Save-ModelFile $m
    if (-not $ok) { $fail++ }
    $report.Add("INSTALL | model  | $($m.Label) | success=$ok")
}

Write-Host ""
if ($fail -eq 0) {
    Write-Ok "Done. Restart ComfyUI."
    $report.Add("")
    $report.Add("Result: success")
    $report | Set-Content -Path $ReportPath -Encoding UTF8
    exit 0
}
Write-Warn "Failed items: $fail. Check network/Git and run again."
$report.Add("")
$report.Add("Result: failed_items=$fail")
$report | Set-Content -Path $ReportPath -Encoding UTF8
exit 1
