# PSD Workflow

## Read-only inspection

`psd_probe` reads PSD/PSB layer names, text layers, bounds, visibility, and canvas size with `psd-tools`. It does not open Photoshop and never writes the source file.

This is useful for planning translations, finding missing text, and checking whether a supplied asset contains editable text layers.

## Native editing

Photoshop must be running with Adobe Creative MCP started. The PS adapter uses Photoshop's own ExtendScript DOM to:

- open a PSD when it is not already open;
- find a layer by `layerPath`;
- change `textItem.contents`, `textItem.font`, and `textItem.size`;
- save with Photoshop;
- close a document opened by the operation;
- return changed/skipped counts.

## AE refresh

After Photoshop saves, `creative_edit_psd_text` calls AE's `reload_psd_sources` for the same absolute path. AE then re-reads the PSD footage used by the project.

## Copy-first rule

For user-owned originals:

1. Copy the PSD before editing.
2. Run `psd_probe` on the copy.
3. Use exact `layerPath` values from the probe.
4. Save and inspect the Photoshop result.
5. Refresh AE and render a QA frame.

If a PSD has duplicate layer names, use the full group path. Do not use a bare `layerName` unless the name is unique.

## Failure boundaries

- `psd_probe` works without Photoshop.
- Native PSD write-back requires Photoshop.
- AE reload requires After Effects.
- A missing font remains a font dependency; the bridge does not silently substitute an unrelated font.
- A PSD with unsupported smart-object or adjustment-layer behavior should be edited in Photoshop, not flattened by the bridge.
