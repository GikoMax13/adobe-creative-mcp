# Deployment For Agents

Adobe Creative MCP is a local MCP server. The Agent launches the stdio server; opening an Adobe CEP panel auto-starts that host adapter by default. The panel still has a manual start/stop control for recovery.

## One-time workstation setup

```powershell
cd H:\AE工程\adobe-creative-mcp
powershell -ExecutionPolicy Bypass -File .\install_windows.ps1
python -m pip install psd-tools Pillow
```

Restart AE and Photoshop, open the panel in each host, and click **启动 MCP**.

Check both endpoints:

```powershell
Invoke-RestMethod http://127.0.0.1:47391/health
Invoke-RestMethod http://127.0.0.1:47392/health
```

## Codex

Add this MCP server to the local MCP configuration used by Codex:

```json
{
  "mcpServers": {
    "adobe-creative-mcp": {
      "command": "node",
      "args": ["H:/AE工程/adobe-creative-mcp/server/mcp-server.js"]
    }
  }
}
```

Then start a task with: “先调用 adobe_hosts，再读取当前 AE 工程和 Photoshop 文档状态。”

## Claude Desktop / Claude Code

Use the same server entry in the MCP configuration:

```json
"adobe-creative-mcp": {
  "command": "node",
  "args": ["H:/AE工程/adobe-creative-mcp/server/mcp-server.js"]
}
```

## ZCode / Antigravity / other Agents

If the Agent supports stdio MCP, use the same `command` and `args`. If it only supports HTTP tools, call the per-host endpoints directly:

```text
AE: GET http://127.0.0.1:47391/health
PS: GET http://127.0.0.1:47392/health
POST /command with {schemaVersion:"2.0", type, payload}
```

The PowerShell helper in [`client/ae-creative-mcp-client.ps1`](../client/ae-creative-mcp-client.ps1) can be imported by an Agent that cannot speak MCP stdio.

## Startup automation

The MCP server can be started automatically by the Agent's MCP configuration. Adobe applications still need to be running with their panels enabled because Adobe does not expose a reliable headless CEP-panel startup contract across all versions.

For a workstation launcher, use:

```powershell
node H:\AE工程\adobe-creative-mcp\server\mcp-server.js
```

If a host is offline, the MCP server stays usable for the other host and returns a precise unavailable-host error for the missing one.

## Shared runtime files

```text
%APPDATA%\Adobe Creative MCP\
  config.json
  hosts\after-effects.json
  hosts\photoshop.json
  commands\after-effects\
  commands\photoshop\
  results\after-effects\
  results\photoshop\
  logs\bridge.log
```
