$ErrorActionPreference = "SilentlyContinue"

$programRoots = @($env:ProgramFiles, ${env:ProgramFiles(x86)}) | Where-Object { $_ }
$afterEffects = @()
$photoshop = @()
foreach ($root in $programRoots) {
    $afterEffects += Get-ChildItem -LiteralPath $root -Directory -Filter "Adobe After Effects *" | ForEach-Object { $_.FullName }
    $photoshop += Get-ChildItem -LiteralPath $root -Directory -Filter "Adobe Photoshop *" | ForEach-Object { $_.FullName }
}

[pscustomobject]@{
    product = "Adobe Creative MCP"
    afterEffects = @($afterEffects | Sort-Object -Unique)
    photoshop = @($photoshop | Sort-Object -Unique)
    node = (Get-Command node -ErrorAction SilentlyContinue).Source
    python = (Get-Command python -ErrorAction SilentlyContinue).Source
} | ConvertTo-Json -Depth 4
