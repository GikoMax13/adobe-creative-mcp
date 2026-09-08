# Adobe Creative MCP

中文部署入口 / Chinese deployment guide: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

The deployment guide is bilingual and is written for both human operators and AI Agents. / 部署文档为中英双语，同时面向人类使用者和 AI Agent。

Adobe Creative MCP is a local MCP bridge for AI agents that connects **After Effects**, **Photoshop**, and one shared MCP server.

It supports three modes:

1. Drive After Effects only.
2. Drive Photoshop only.
3. Run a coordinated Photoshop -> After Effects workflow, such as editing text in a PSD and refreshing the PSD used by an AE composition.

The bridge is local-first. Project files and PSD content stay on the workstation unless an agent explicitly exports or uploads them.

## Architecture

```text
Agent (Codex / Claude / ZCode / Antigravity)
                    |
          MCP stdio: server/mcp-server.js
             /                         \
  HTTP 127.0.0.1:47391          HTTP 127.0.0.1:47392
       AE CEP panel                   PS CEP panel
      ExtendScript                    ExtendScript
           |                              |
    AE project + comps             PSD documents + layers
```

The internal CEP extension ID remains `com.leyo.ae.codexbridge` so an upgrade does not invalidate existing Adobe panel registration. The user-facing product name is **Adobe Creative MCP**.

## Requirements

- Windows 10/11.
- After Effects 2022 or newer.
- Photoshop 2021 or newer for native PSD editing.
- Node.js 18 or newer for the MCP server.
- Python 3.10+ and `psd-tools` for read-only PSD probing without Photoshop:

```powershell
python -m pip install psd-tools Pillow
```

## Install

From this repository:

```powershell
powershell -ExecutionPolicy Bypass -File .\install_windows.ps1
```

The installer:

- backs up the previous CEP extension;
- installs the panel for both AE (`AEFT`) and Photoshop (`PHXS`);
- enables CEP debug mode for common Adobe versions;
- creates separate runtime folders and ports for AE and Photoshop.

Restart both Adobe applications after installation. In each application open:

```text
Window > Extensions > Adobe Creative MCP
```

The panel auto-starts its host service by default when opened. AE uses port `47391`; Photoshop uses port `47392`. The **启动 MCP** button remains available for a manual restart.

## Start the MCP server

The MCP server uses stdio, so each Agent can start its own process:

```powershell
node .\server\mcp-server.js
```

Optional host check:

```powershell
node .\server\mcp-server.js --check
```

Example MCP configuration:

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

Agent-specific deployment notes are in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md). The neutral operating rules for any Agent are in [`docs/AGENTS.md`](docs/AGENTS.md).

## MCP tools

- `adobe_hosts`: check AE and Photoshop connection status.
- `creative_context`: read both hosts before planning a cross-application edit.
- `ae_command`: send a command to AE only.
- `ps_command`: send a command to Photoshop only.
- `adobe_command`: send a command to one or both hosts.
- `psd_probe`: read PSD/PSB layer names, text, bounds, and canvas without Photoshop.
- `creative_edit_psd_text`: edit PSD text in Photoshop and optionally reload the PSD in AE.

The low-level host commands include `get_host_info`, `get_capabilities`, `scan_psd_sources`, `scan_comp_layers`, `apply_text_updates`, `apply_psd_text_updates`, `replace_footage_source`, and `reload_psd_sources`.

## Typical PSD workflow

1. Call `creative_context`.
2. Call `psd_probe` if Photoshop is not needed yet.
3. Call `ae_command` with `scan_psd_sources` to see which AE layers use the PSD.
4. Call `creative_edit_psd_text` with an absolute PSD path and explicit `layerPath` values.
5. Confirm the Photoshop result and AE reload result.
6. Render a QA frame from AE before final export.

Example tool arguments:

```json
{
  "path": "H:/project/assets/dialog.psd",
  "edits": [
    {
      "layerPath": ["Life Coaching"],
      "text": "ライフコーチング",
      "font": "YuGothic-Bold"
    }
  ],
  "refreshAe": true,
  "save": true
}
```

See [`docs/PSD_WORKFLOW.md`](docs/PSD_WORKFLOW.md) for copy-first and rollback rules.

## Compatibility model

The CEP manifest supports both AE and Photoshop hosts. The panel detects the host at runtime and chooses the correct adapter. It also reports the Adobe version through `get_host_info` and exposes a capability list instead of assuming every version has the same scripting surface.

See [`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md).

## Development checks

```powershell
npm test
```

No Adobe application is modified by `npm test`; it checks manifest hosts, MCP commands, required docs, and Node syntax.

## Security

- HTTP binds only to `127.0.0.1`.
- Set `token` in `%APPDATA%\Adobe Creative MCP\config.json` before allowing other local processes to call the bridge.
- Set `autoStart` to `false` when the panel should wait for a manual start.
- `run_jsx` is powerful and can modify or save projects. Set `allowJsx` to `false` when an Agent should use only typed commands.
- PSD edits are explicit and should use a copy or an `outputPath` workflow when the source must remain untouched.
