# Agent Operating Contract / Agent 操作规范

This is the short operating contract for any AI Agent controlling Adobe Creative MCP.

这是所有控制 Adobe Creative MCP 的 AI Agent 都应遵守的简明操作规范。
English and Chinese are paired in each operational rule. / 每条操作规则均提供英文和中文。

## Connection rules / 连接规则

1. Start or connect to the MCP server named `adobe-creative-mcp`. / 启动或连接名为 `adobe-creative-mcp` 的 MCP 服务。
2. Call `adobe_hosts` before changing anything. / 修改前先调用 `adobe_hosts`。
3. Call `creative_context` before a cross-application task. / 跨 AE 和 Photoshop 的任务先调用 `creative_context`。
4. Use `ae_command` for AE-only work and `ps_command` for Photoshop-only work. / AE 单独操作使用 `ae_command`，Photoshop 单独操作使用 `ps_command`。
5. Use `creative_edit_psd_text` for a PSD edit that must appear in AE. / 要让 PSD 修改出现在 AE 中，使用 `creative_edit_psd_text`。
6. Do not use `run_jsx` when a typed command exists. / 已有结构化命令时不要使用 `run_jsx`。
7. Never assume a layer index from a previous project state. Read the current project or document first. / 不要假设旧工程状态中的图层索引，先读取当前工程或文档。
8. After a write, read the result and perform a visual or structural QA check. / 写入后读取结果，并进行视觉或结构 QA 检查。

## Host availability / 宿主可用性

Photoshop is required for native PSD writes. Read-only PSD inspection uses `psd_probe` and does not require Photoshop.

原生写回 PSD 必须有 Photoshop。只读 PSD 检查使用 `psd_probe`，不需要 Photoshop。

If Photoshop is unavailable, report both facts instead of pretending the write succeeded:

如果 Photoshop 不可用，要同时说明以下两点，不能伪造写入成功：

```text
PSD read-only inspection is available. PSD write-back is blocked until Photoshop MCP is started on port 47392.
PSD 可以只读检查；在 Photoshop MCP 启动于 47392 端口前，PSD 写回被阻止。
```

Do not silently replace a PSD text edit with an AE raster replacement unless the user explicitly asks for that fallback.

除非用户明确要求备用方案，否则不要把 PSD 文字修改静默替换成 AE 位图替换。

## Tool selection / 工具选择

| Intent / 目的 | Tool / 工具 |
| --- | --- |
| See which Adobe hosts are running / 查看 Adobe 宿主状态 | `adobe_hosts` |
| Read both hosts before planning / 规划前读取两个宿主 | `creative_context` |
| Read AE project/comps/layers / 读取 AE 工程、合成、图层 | `ae_command` |
| Read PSD without Photoshop / 不启动 Photoshop 读取 PSD | `psd_probe` |
| Inspect Photoshop layer tree / 检查 Photoshop 图层树 | `ps_command` with `inspect_psd_document` |
| Change PSD text and refresh AE / 修改 PSD 文字并刷新 AE | `creative_edit_psd_text` |
| Replace an AE footage source / 替换 AE 素材源 | `ae_command` with `replace_footage_source` |

## PSD edit payload / PSD 修改参数

Use an absolute path and stable full layer paths. / 使用绝对路径和稳定的完整图层路径。

```json
{
  "path": "H:/project/ui.psd",
  "edits": [
    {"layerPath": ["Dialog", "Title"], "text": "Neue Übersetzung", "font": "MicrosoftYaHei-Bold"}
  ],
  "refreshAe": true,
  "save": true
}
```

The Photoshop adapter uses native Photoshop text layers. It does not rewrite a PSD with a generic image library.

Photoshop 适配器使用原生 Photoshop 文字图层，不会使用普通图像库重写 PSD。

## Reporting / 汇报要求

Every completed task must state the following / 每个完成的任务都必须说明：

- Which host(s) were connected. / 哪些宿主已连接。
- Which files and layers changed. / 哪些文件和图层发生了变化。
- Whether Photoshop write-back and AE reload succeeded. / Photoshop 写回和 AE 刷新是否成功。
- What was rendered or visually checked. / 渲染或视觉检查了什么。
- Any remaining missing font, plugin, or host dependency. / 是否还缺字体、插件或宿主依赖。
