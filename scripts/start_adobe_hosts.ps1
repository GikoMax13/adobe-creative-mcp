[CmdletBinding()]
param(
    [switch]$AfterEffects,
    [switch]$Photoshop,
    [string]$AfterEffectsExe,
    [string]$PhotoshopExe
)

$ErrorActionPreference = "Stop"
if (-not $AfterEffects -and -not $Photoshop) { $AfterEffects = $true; $Photoshop = $true }

function Find-AdobeExe([string]$pattern, [string]$provided) {
    if ($provided) { return $provided }
    $roots = @($env:ProgramFiles, ${env:ProgramFiles(x86)}) | Where-Object { $_ }
    foreach ($root in $roots) {
        $candidate = Get-ChildItem -LiteralPath $root -Filter $pattern -File -Recurse -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -First 1
        if ($candidate) { return $candidate.FullName }
    }
    return $null
}

if ($AfterEffects) {
    $ae = Find-AdobeExe "AfterFX.exe" $AfterEffectsExe
    if ($ae) { Start-Process -FilePath $ae; Write-Host "Started After Effects: $ae" }
    else { Write-Warning "AfterFX.exe was not found. Pass -AfterEffectsExe explicitly." }
}
if ($Photoshop) {
    $ps = Find-AdobeExe "Photoshop.exe" $PhotoshopExe
    if ($ps) { Start-Process -FilePath $ps; Write-Host "Started Photoshop: $ps" }
    else { Write-Warning "Photoshop.exe was not found. Pass -PhotoshopExe explicitly." }
}

Write-Host "After the applications load, open Window > Extensions > Adobe Creative MCP in each host and click 启动 MCP."
