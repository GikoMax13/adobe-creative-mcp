[CmdletBinding()]
param(
    [switch]$Check
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..")).Path
$server = Join-Path $root "server\mcp-server.js"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 18 or newer is required." }
if ($Check) { & node $server --check; exit $LASTEXITCODE }
Write-Host "Starting Adobe Creative MCP stdio server from $server"
& node $server
