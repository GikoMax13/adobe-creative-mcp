# Deployment / 部署

This document is written for both human operators and AI Agents. The English and Chinese sections describe the same workflow.

本文档同时面向人类使用者和 AI Agent。中英文内容描述的是同一套部署流程。

## 1. What this project is / 项目是什么

Adobe Creative MCP is a local MCP bridge connecting After Effects, Photoshop, and an AI Agent. It supports three modes:

Adobe Creative MCP 是一个本机 MCP 桥接插件，把 After Effects、Photoshop 和 AI Agent 连接起来，支持三种模式：

- After Effects only / 只控制 AE
- Photoshop only / 只控制 Photoshop
- Photoshop edit followed by After Effects refresh / Photoshop 修改 PSD 后刷新 AE

The MCP server is a Node.js stdio process. Each Adobe application runs a CEP panel and exposes a loopback HTTP adapter:

MCP 服务端是 Node.js stdio 进程。每个 Adobe 软件运行一个 CEP 面板，并提供本机回环 HTTP 适配器：

| Host / 宿主 | Default endpoint / 默认地址 | Required for / 用于 |
| --- | --- | --- |
| After Effects | `http://127.0.0.1:47391` | AE projects, compositions, footage, PSD reload / AE 工程、合成、素材、刷新 PSD |
| Photoshop | `http://127.0.0.1:47392` | Native PSD document and text-layer edits / 原生 PSD 文档和文字图层修改 |

## 2. Requirements / 环境要求

### Human checklist / 人类检查清单

- Windows 10 or Windows 11 / Windows 10 或 Windows 11
- After Effects 2022 or newer / After Effects 2022 或更新版本
- Photoshop 2021 or newer for native PSD editing / 需要原生修改 PSD 时使用 Photoshop 2021 或更新版本
- Node.js 18 or newer / Node.js 18 或更新版本
- Python 3.10 or newer for `psd_probe` / `psd_probe` 需要 Python 3.10 或更新版本
- CEP debug mode enabled by the installer / 安装脚本会开启常用版本的 CEP 调试模式

### Optional PSD probe dependency / 可选 PSD 读取依赖

`psd_probe` is read-only and can inspect a PSD without Photoshop. Install its Python dependencies once:

`psd_probe` 只读解析 PSD，不需要启动 Photoshop。首次使用时安装 Python 依赖：

```powershell
python -m pip install psd-tools Pillow
```

Photoshop is still required when the PSD must be edited and saved. / 但如果要修改并保存 PSD，仍然必须启动 Photoshop。

## 3. Install the Adobe extension / 安装 Adobe 插件

Run the following commands from the repository root. Replace the path with the actual checkout path on the workstation.

在仓库根目录运行下面的命令。请把路径替换成当前电脑实际的仓库路径。

```powershell
$Repo = "C:\path\to\adobe-creative-mcp"
Set-Location $Repo
powershell -ExecutionPolicy Bypass -File .\install_windows.ps1
```

The installer does the following / 安装脚本会完成以下工作：

1. Back up the existing CEP extension before replacement. / 替换前备份原有 CEP 插件。
2. Install one extension that supports both AE (`AEFT`) and Photoshop (`PHXS`). / 安装同时支持 AE（`AEFT`）和 Photoshop（`PHXS`）的同一插件。
3. Create separate host ports and runtime folders. / 创建 AE、Photoshop 各自独立的端口和运行目录。
4. Enable CEP debug mode for common Adobe versions. / 为常见 Adobe 版本开启 CEP 调试模式。

Restart After Effects and Photoshop after installation. In each application open:

安装后请重启 After Effects 和 Photoshop，然后分别打开：

```text
Window > Extensions > Adobe Creative MCP
窗口 > 扩展 > Adobe Creative MCP
```

The panel auto-starts its host service by default. The **启动 MCP** button is available for a manual restart. Set `autoStart` to `false` in `%APPDATA%\Adobe Creative MCP\config.json` if manual startup is preferred.

面板打开后默认自动启动对应宿主服务。界面仍保留 **启动 MCP** 按钮用于手动重启。如果希望手动启动，可在 `%APPDATA%\Adobe Creative MCP\config.json` 中将 `autoStart` 改为 `false`。

## 4. Start the MCP server / 启动 MCP 服务端

The Agent normally starts this process from its MCP configuration. For a manual smoke test:

通常由 Agent 根据 MCP 配置启动该进程。手动测试时可以运行：

```powershell
Set-Location "C:\path\to\adobe-creative-mcp"
node .\server\mcp-server.js
```

Check host availability without opening an MCP client:

不打开 MCP 客户端时，可以先检查宿主是否在线：

```powershell
node .\server\mcp-server.js --check
```

Expected behavior / 预期结果：

- AE online: port `47391` reports `ok: true`. / AE 在线时，`47391` 返回 `ok: true`。
- Photoshop online: port `47392` reports `ok: true`. / Photoshop 在线时，`47392` 返回 `ok: true`。
- One host may be offline; the other host remains usable. / 一个宿主离线时，另一个宿主仍然可以使用。

## 5. Configure an AI Agent / 配置 AI Agent

Any Agent that supports stdio MCP can use this entry. Replace `<REPO_ROOT>` with an absolute path; do not keep the angle brackets in the actual configuration.

任何支持 stdio MCP 的 Agent 都可以使用下面的配置。请把 `<REPO_ROOT>` 替换为绝对路径，实际配置中不要保留尖括号。

```json
{
  "mcpServers": {
    "adobe-creative-mcp": {
      "command": "node",
      "args": ["<REPO_ROOT>/server/mcp-server.js"]
    }
  }
}
```

Recommended first prompt / 推荐 Agent 的第一条指令：

```text
Call adobe_hosts first. Then read the current After Effects project and Photoshop document state before making changes.
先调用 adobe_hosts，再读取当前 AE 工程和 Photoshop 文档状态，确认宿主在线后再修改。
```

For Codex, Claude, ZCode, Antigravity, or another Agent, the same MCP `command` and `args` can be used. If an Agent only supports HTTP, use the host endpoints directly or use [`client/ae-creative-mcp-client.ps1`](../client/ae-creative-mcp-client.ps1).

Codex、Claude、ZCode、Antigravity 或其他 Agent 都可以使用相同的 MCP `command` 和 `args`。如果某个 Agent 只支持 HTTP，可以直接调用宿主端点，也可以使用 [`client/ae-creative-mcp-client.ps1`](../client/ae-creative-mcp-client.ps1)。

## 6. PSD dependency rules / PSD 依赖规则

| Operation / 操作 | Photoshop needed? / 需要 Photoshop？ | After Effects needed? / 需要 AE？ | Tool / 工具 |
| --- | --- | --- | --- |
| Read PSD layers and text / 读取 PSD 图层和文字 | No / 不需要 | No / 不需要 | `psd_probe` |
| Inspect the open PSD in Photoshop / 检查 Photoshop 中打开的 PSD | Yes / 需要 | No / 不需要 | `ps_command` + `inspect_psd_document` |
| Edit and save native PSD text / 修改并保存 PSD 文字 | Yes / 需要 | No, unless AE refresh is requested / 不需要，除非要求刷新 AE | `creative_edit_psd_text` |
| Refresh the PSD used by AE / 刷新 AE 使用的 PSD | No / 不需要 Photoshop | Yes / 需要 | `ae_command` + `reload_psd_sources` |
| Edit AE text layers / 修改 AE 文字图层 | No / 不需要 | Yes / 需要 | `ae_command` + `apply_text_updates` |

Important: `creative_edit_psd_text` requires Photoshop to be running with its Adobe Creative MCP panel active. The MCP server does not fake a successful PSD write when Photoshop is unavailable.

重点：`creative_edit_psd_text` 要求 Photoshop 正在运行，并且 Photoshop 中的 Adobe Creative MCP 面板已启动。Photoshop 不在线时，MCP 服务不会伪造成功的 PSD 写入结果。

## 7. Standard PSD workflow / 标准 PSD 工作流

1. Call `adobe_hosts`. / 调用 `adobe_hosts`。
2. Call `psd_probe` for read-only planning if Photoshop is not needed. / 如果暂时不需要 Photoshop，使用 `psd_probe` 做只读分析。
3. Call AE `scan_psd_sources` to see which project layers use the PSD. / 调用 AE 的 `scan_psd_sources`，确认工程中哪些图层使用该 PSD。
4. Prefer a copy of the PSD when the original must be preserved. / 如果需要保护原文件，先复制 PSD。
5. Call `creative_edit_psd_text` with an absolute path and full `layerPath` values. / 使用绝对路径和完整 `layerPath` 调用 `creative_edit_psd_text`。
6. Confirm Photoshop write-back and AE reload results. / 检查 Photoshop 写回和 AE 刷新的结果。
7. Render or inspect a QA frame before delivery. / 交付前渲染或检查一帧 QA 画面。

Example / 示例：

```json
{
  "path": "H:/project/assets/dialog.psd",
  "edits": [
    {
      "layerPath": ["Dialog", "Title"],
      "text": "Neue Übersetzung",
      "font": "MicrosoftYaHei-Bold"
    }
  ],
  "refreshAe": true,
  "save": true
}
```

## 8. Runtime files and ports / 运行目录和端口

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

Both HTTP listeners bind to `127.0.0.1` only. A bearer token can be set in `config.json` for additional local-process protection.

两个 HTTP 监听器只绑定到 `127.0.0.1`。如需增加本机进程之间的保护，可以在 `config.json` 中设置 bearer token。

## 9. Troubleshooting / 故障排查

### `photoshop is unavailable on port 47392`

English: Start Photoshop, open the Adobe Creative MCP panel, and check that the panel reports Photoshop online. The read-only `psd_probe` tool can still be used without Photoshop.

中文：启动 Photoshop，打开 Adobe Creative MCP 面板，确认面板显示 Photoshop 在线。即使 Photoshop 未启动，仍然可以使用只读工具 `psd_probe`。

### AE still shows the old bridge

English: Restart AE and reopen the extension. Adobe CEP panels keep the old JavaScript in memory until the host or panel is reloaded.

中文：重启 AE 并重新打开插件。Adobe CEP 面板会把旧 JavaScript 保留在内存中，必须重启宿主或重新加载面板才会切换到新版本。

### A font is missing

English: Install the exact required font and verify it in the Adobe host. The bridge does not silently substitute an unrelated font.

中文：安装工程要求的准确字体，并在 Adobe 宿主中确认字体可用。插件不会静默替换成不相关的字体。

### The MCP server starts but no host is online

English: The Node MCP process is only the broker. AE and Photoshop must be running with their CEP panels open. Use `node server/mcp-server.js --check` to see each host separately.

中文：Node MCP 进程只是中间调度器。AE 和 Photoshop 必须运行，并且分别打开 CEP 面板。使用 `node server/mcp-server.js --check` 可以分别查看两个宿主状态。

## 10. Security and public-repository rules / 安全和公开仓库规则

- Do not commit `.aep`, `.psd`, `.psb`, videos, credentials, tokens, or local runtime logs. / 不要提交 `.aep`、`.psd`、`.psb`、视频、凭据、token 或本机运行日志。
- Keep HTTP bound to loopback unless a deliberate network design has been reviewed. / 除非经过明确的网络方案评审，否则保持 HTTP 只监听本机回环地址。
- Disable `run_jsx` with `allowJsx: false` when an Agent should use only typed commands. / 如果 Agent 只能使用结构化命令，将 `allowJsx` 设为 `false` 关闭 `run_jsx`。
- Keep the repository public-safe: source code and docs are public; user projects and production assets stay local. / 保持仓库可公开：公开源码和文档，用户工程和生产素材留在本机。

## 11. GitHub CLI publishing / 使用 GitHub CLI 发布

Install GitHub CLI on Windows with the official package manager:

Windows 可以使用官方包管理器安装 GitHub CLI：

```powershell
winget install --id GitHub.cli --source winget --accept-source-agreements --accept-package-agreements
gh auth login --hostname github.com --git-protocol https --web
```

Create and push a new public repository from an existing local checkout:

从已有本地仓库创建并推送公开仓库：

```powershell
Set-Location "C:\path\to\adobe-creative-mcp"
gh repo create <OWNER>/<REPOSITORY> `
  --public `
  --source . `
  --remote origin `
  --push `
  --description "Local MCP bridge connecting After Effects and Photoshop for AI agents"
```

For this project, the public repository is:

本项目当前的公开仓库是：

`https://github.com/GikoMax13/adobe-creative-mcp`

After changing source code or documentation, run `npm test`, inspect `git diff --check`, commit the change, and push `git push origin main`.

修改源码或文档后，先运行 `npm test`，检查 `git diff --check`，再提交并执行 `git push origin main`。
