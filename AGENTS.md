# Agent Operating Contract

This document is the instruction sheet to give any AI Agent that controls Adobe Creative MCP.

## Connection rules

1. Start or connect to the MCP server named `adobe-creative-mcp`.
2. Call `adobe_hosts` before changing anything.
3. Call `creative_context` before a cross-application task.
4. Use `ae_command` for AE-only work and `ps_command` for Photoshop-only work.
5. Use `creative_edit_psd_text` for a PSD edit that must appear in AE.
6. Do not use `run_jsx` when a typed command exists.
7. Never assume a layer index from a previous project state. Read the current project or document first.
8. After a write, read the result and perform a visual or structural QA check.

## Host availability

Photoshop is required for PSD writes. A read-only PSD inspection can use `psd_probe` without Photoshop.

If Photoshop is unavailable, report:

```text
PSD read-only inspection is available. PSD write-back is blocked until Photoshop MCP is started on port 47392.
```

Do not silently replace a PSD text edit with an AE raster replacement unless the user explicitly asks for that fallback.

## Tool selection

| Intent | Tool |
| --- | --- |
| See which Adobe hosts are running | `adobe_hosts` |
| Read both hosts before planning | `creative_context` |
| Read AE project/comps/layers | `ae_command` |
| Read PSD without Photoshop | `psd_probe` |
| Inspect Photoshop layer tree | `ps_command` with `inspect_psd_document` |
| Change PSD text and refresh AE | `creative_edit_psd_text` |
| Replace an AE footage source | `ae_command` with `replace_footage_source` |

## PSD edit payload

Use an absolute path and stable layer paths:

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

## Reporting

Every completed task must state:

- which host(s) were connected;
- which files/layers changed;
- whether Photoshop write-back and AE reload succeeded;
- what was rendered or visually checked;
- any remaining missing font, plugin, or host dependency.
