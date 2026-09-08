[CmdletBinding()]
param(
    [switch]$NoBackup,
    [switch]$SkipDebugMode
)

$ErrorActionPreference = "Stop"
$source = (Resolve-Path (Split-Path -Parent $MyInvocation.MyCommand.Path)).Path
$extensionRoot = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$target = Join-Path $extensionRoot "AECodexBridge"
$runtimeRoot = Join-Path $env:APPDATA "Adobe Creative MCP"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"

if (-not (Test-Path -LiteralPath (Join-Path $source "CSXS\manifest.xml"))) {
    throw "CSXS\manifest.xml is missing. Run this script from the Adobe Creative MCP repository."
}

$sourceFull = [IO.Path]::GetFullPath($source).TrimEnd([IO.Path]::DirectorySeparatorChar)
$targetFull = [IO.Path]::GetFullPath($target).TrimEnd([IO.Path]::DirectorySeparatorChar)
if ($sourceFull -eq $targetFull) {
    throw "Run this installer from the repository copy, not from the installed CEP folder."
}

New-Item -ItemType Directory -Path $extensionRoot -Force | Out-Null
if ((Test-Path -LiteralPath $target) -and -not $NoBackup) {
    $backup = "$target.backup-$stamp"
    Move-Item -LiteralPath $target -Destination $backup -Force
    Write-Host "旧扩展已备份到 $backup"
}

New-Item -ItemType Directory -Path $target -Force | Out-Null
$excluded = @(".git", ".gitignore", "node_modules", "backups", "tmp", "runtime", "dist", "release")
Get-ChildItem -LiteralPath $source -Force |
    Where-Object { $excluded -notcontains $_.Name } |
    Copy-Item -Destination $target -Recurse -Force

if (-not $SkipDebugMode) {
    foreach ($version in 9..15) {
        $key = "HKCU:\Software\Adobe\CSXS.$version"
        New-Item -Path $key -Force | Out-Null
        New-ItemProperty -Path $key -Name PlayerDebugMode -PropertyType String -Value 1 -Force | Out-Null
    }
}

$runtimeDirs = @(
    $runtimeRoot,
    (Join-Path $runtimeRoot "hosts"),
    (Join-Path $runtimeRoot "commands\after-effects"),
    (Join-Path $runtimeRoot "commands\photoshop"),
    (Join-Path $runtimeRoot "results\after-effects"),
    (Join-Path $runtimeRoot "results\photoshop"),
    (Join-Path $runtimeRoot "logs")
)
foreach ($dir in $runtimeDirs) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

$configPath = Join-Path $runtimeRoot "config.json"
if (-not (Test-Path -LiteralPath $configPath)) {
    @{
        version = 2
        hostPorts = @{ "after-effects" = 47391; photoshop = 47392 }
        token = ""
        pollMs = 800
        autoStart = $true
        enableHttp = $true
        allowJsx = $true
        maxBodyBytes = 2097152
    } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $configPath -Encoding UTF8
}

Write-Host "Adobe Creative MCP 已安装到 $target"
Write-Host "AE 和 Photoshop 共用此 CEP 扩展；启动后默认端口为 AE 47391、PS 47392。"
Write-Host "请重启 Adobe 宿主，在 Window > Extensions 中打开 Adobe Creative MCP。"
Write-Host "随后由 Agent 启动: node `"$target\server\mcp-server.js`""
