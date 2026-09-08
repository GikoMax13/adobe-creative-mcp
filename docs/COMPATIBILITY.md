# Compatibility

## Adobe hosts

The CEP manifest registers both host types:

- `AEFT`: After Effects 2022+
- `PHXS`: Photoshop 2021+

The panel detects the current host at runtime. It selects the AE adapter or Photoshop adapter and registers a different local port:

| Host | Port | Adapter |
| --- | ---: | --- |
| After Effects | 47391 | AE ExtendScript |
| Photoshop | 47392 | Photoshop ExtendScript |

## Version adaptation

Agents must call `get_host_info` and `get_capabilities` instead of hard-coding a version-specific behavior. The result includes Adobe application name, version, locale, supported commands, and bridge protocol.

The adapters use conservative APIs available across the supported versions:

- AE project, composition, layer, footage, text, `replaceSource`, and footage reload APIs.
- Photoshop document, layer, `textItem`, save, and close APIs.

Unsupported features return a typed error rather than being silently approximated.

## Protocol compatibility

The bridge protocol is versioned as `schemaVersion: "2.0"`. Agents should preserve unknown response fields and check `ok`, `code`, and `hostRole`.

The old extension ID `com.leyo.ae.codexbridge` remains in the manifest so upgrading does not create a second incompatible panel registration. The display name is Adobe Creative MCP.

## Python PSD reader

`psd_probe.py` is optional. If `psd-tools` is not available, native Photoshop inspection and editing still work while the read-only `psd_probe` tool reports `PSD_TOOLS_MISSING`.
