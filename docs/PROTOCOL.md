# Protocol

## HTTP

Each Adobe panel exposes:

```text
GET  /health
GET  /capabilities
POST /command
```

Commands use:

```json
{
  "id": "unique-request-id",
  "schemaVersion": "2.0",
  "type": "get_host_info",
  "payload": {}
}
```

Responses use:

```json
{
  "id": "unique-request-id",
  "schemaVersion": "2.0",
  "hostRole": "after-effects",
  "ok": true,
  "message": "host info",
  "data": {},
  "error": "",
  "code": "",
  "elapsedMs": 12
}
```

## Host routing

The MCP server maps `after-effects` to port `47391` and `photoshop` to port `47392`. Active host registration files override the defaults.

## Serialization

Each panel serializes commands before sending them to Adobe's scripting engine. This prevents two Agents from changing the same project or document at the same time.

## Security

All HTTP listeners bind to loopback only. A bearer token can be configured in `%APPDATA%\Adobe Creative MCP\config.json` and is forwarded by the MCP server.
