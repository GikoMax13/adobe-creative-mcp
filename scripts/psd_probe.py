"""Read-only PSD/PSB layer inspection for Adobe Creative MCP.

This helper deliberately never writes the source file. Editing is performed by
the Photoshop CEP adapter, which preserves Photoshop's native PSD save logic.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def emit(value: dict, code: int = 0) -> None:
    sys.stdout.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    raise SystemExit(code)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    parser.add_argument("--max-layers", type=int, default=10000)
    args = parser.parse_args()
    source = Path(args.path).expanduser()
    if not source.exists():
        emit({"ok": False, "error": f"PSD/PSB not found: {source}", "code": "FILE_NOT_FOUND"}, 2)
    try:
        from psd_tools import PSDImage
    except Exception as exc:
        emit({"ok": False, "error": "psd-tools is not installed for the selected Python", "detail": str(exc), "code": "PSD_TOOLS_MISSING"}, 3)
    try:
        psd = PSDImage.open(source)
        rows = []
        for layer in psd.descendants():
            if len(rows) >= max(0, args.max_layers):
                break
            row = {
                "name": str(layer.name),
                "kind": str(getattr(layer, "kind", "")),
                "bbox": list(layer.bbox) if getattr(layer, "bbox", None) else None,
                "size": list(layer.size) if getattr(layer, "size", None) else None,
                "visible": bool(getattr(layer, "visible", True)),
            }
            if getattr(layer, "kind", None) == "type":
                row["text"] = str(getattr(layer, "text", ""))
            rows.append(row)
        emit({"ok": True, "data": {"path": str(source), "canvas": [psd.width, psd.height], "layerCount": len(rows), "layers": rows}})
    except Exception as exc:
        emit({"ok": False, "error": str(exc), "code": "PSD_READ_ERROR", "path": str(source)}, 4)


if __name__ == "__main__":
    main()
