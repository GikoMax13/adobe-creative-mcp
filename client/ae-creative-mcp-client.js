"use strict";

const http = require("http");

class AdobeCreativeMcpClient {
  constructor(options = {}) {
    this.host = options.host || "127.0.0.1";
    this.port = Number(options.port || 47391);
    this.token = options.token || "";
    this.timeoutMs = Number(options.timeoutMs || 15000);
  }

  request(method, route, body) {
    return new Promise((resolve, reject) => {
      const payload = body === undefined ? "" : JSON.stringify(body);
      const headers = { Accept: "application/json" };
      if (payload) {
        headers["Content-Type"] = "application/json";
        headers["Content-Length"] = Buffer.byteLength(payload);
      }
      if (this.token) headers.Authorization = `Bearer ${this.token}`;
      const req = http.request({ hostname: this.host, port: this.port, method, path: route, headers, timeout: this.timeoutMs }, (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => { text += chunk; });
        res.on("end", () => {
          let parsed;
          try { parsed = JSON.parse(text || "{}"); } catch (_) { parsed = { ok: false, error: text }; }
          if (res.statusCode >= 400) reject(Object.assign(new Error(parsed.error || `HTTP ${res.statusCode}`), { response: parsed, statusCode: res.statusCode }));
          else resolve(parsed);
        });
      });
      req.on("timeout", () => req.destroy(new Error("Adobe Creative MCP request timed out")));
      req.on("error", reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  health() { return this.request("GET", "/health"); }
  capabilities() { return this.request("GET", "/capabilities"); }
  command(type, payload = {}) { return this.request("POST", "/command", { id: `client_${Date.now()}`, schemaVersion: "2.0", type, payload }); }
  hostInfo() { return this.command("get_host_info"); }
  scanPsdSources(path) { return this.command("scan_psd_sources", path ? { path } : {}); }
}

module.exports = { AdobeCreativeMcpClient };
