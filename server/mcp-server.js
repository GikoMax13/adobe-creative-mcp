#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const readline = require("readline");
const { spawn } = require("child_process");

const PRODUCT = "Adobe Creative MCP";
const VERSION = "2.0.0";
const PROTOCOL = "2.0";
const appData = process.env.APPDATA || process.env.USERPROFILE || process.cwd();
const runtimeRoot = path.join(appData, "Adobe Creative MCP");
const configPath = path.join(runtimeRoot, "config.json");
const defaultPorts = { "after-effects": 47391, photoshop: 47392 };
const repoRoot = path.resolve(__dirname, "..");
const psdProbeScript = path.join(repoRoot, "scripts", "psd_probe.py");

function readConfig() {
  const defaults = { hostPorts: defaultPorts, token: "", requestTimeoutMs: 15000 };
  if (!fs.existsSync(configPath)) return defaults;
  try {
    const loaded = JSON.parse(fs.readFileSync(configPath, "utf8").replace(/^\uFEFF/, ""));
    return Object.assign({}, defaults, loaded, { hostPorts: Object.assign({}, defaultPorts, loaded.hostPorts || {}) });
  } catch (error) {
    return defaults;
  }
}

function hostPort(role) {
  const config = readConfig();
  const registration = path.join(runtimeRoot, "hosts", `${role}.json`);
  try {
    const row = JSON.parse(fs.readFileSync(registration, "utf8"));
    if (Number(row.port)) return Number(row.port);
  } catch (_) {}
  return Number(config.hostPorts[role]) || defaultPorts[role];
}

function httpJson(role, method, route, body) {
  const config = readConfig();
  const port = hostPort(role);
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? "" : JSON.stringify(body);
    const headers = { Accept: "application/json" };
    if (payload) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(payload);
    }
    if (config.token) headers.Authorization = `Bearer ${config.token}`;
    const request = http.request({ hostname: "127.0.0.1", port, path: route, method, headers, timeout: Number(config.requestTimeoutMs) || 15000 }, (response) => {
      let text = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { text += chunk; });
      response.on("end", () => {
        let parsed;
        try { parsed = JSON.parse(text || "{}"); } catch (_) { parsed = { ok: false, error: text || "invalid host response" }; }
        if (response.statusCode >= 400) reject(new Error(`${role} returned HTTP ${response.statusCode}: ${parsed.error || text}`));
        else resolve(parsed);
      });
    });
    request.on("timeout", () => request.destroy(new Error(`${role} request timed out on port ${port}`)));
    request.on("error", (error) => reject(new Error(`${role} is unavailable on port ${port}: ${error.message}`)));
    if (payload) request.write(payload);
    request.end();
  });
}

async function hostHealth(role) {
  try { return await httpJson(role, "GET", "/health"); }
  catch (error) { return { ok: false, hostRole: role, port: hostPort(role), error: error.message }; }
}

async function callHost(role, command) {
  const normalized = Object.assign({ id: `${role}_${Date.now()}`, schemaVersion: PROTOCOL, type: "ping", payload: {} }, command || {});
  return httpJson(role, "POST", "/command", normalized);
}

function jsonText(value) { return JSON.stringify(value, null, 2); }

function runProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

async function probePsd(filePath, maxLayers) {
  const args = [psdProbeScript, filePath, "--max-layers", String(maxLayers || 10000)];
  let result;
  try {
    result = await runProcess(process.env.ADOBE_CREATIVE_MCP_PYTHON || "python", args);
  } catch (error) {
    result = await runProcess("py", ["-3", ...args]);
  }
  let parsed;
  try { parsed = JSON.parse(result.stdout || "{}"); } catch (_) { parsed = { ok: false, error: result.stderr || result.stdout || "PSD probe failed", code: "PSD_PROBE_ERROR" }; }
  if (result.code !== 0 && parsed.ok !== false) parsed = { ok: false, error: result.stderr || "PSD probe failed", code: "PSD_PROBE_ERROR" };
  return parsed;
}

function textResult(value, isError = false) {
  return { content: [{ type: "text", text: jsonText(value) }], isError };
}

const tools = [
  {
    name: "adobe_hosts",
    description: "List Adobe host bridge status for After Effects and Photoshop.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "ae_command",
    description: "Send one Adobe Creative MCP command to After Effects.",
    inputSchema: { type: "object", required: ["command"], properties: { command: { type: "object" } } }
  },
  {
    name: "ps_command",
    description: "Send one Adobe Creative MCP command to Photoshop.",
    inputSchema: { type: "object", required: ["command"], properties: { command: { type: "object" } } }
  },
  {
    name: "adobe_command",
    description: "Send a command to After Effects, Photoshop, or both hosts.",
    inputSchema: { type: "object", required: ["target", "command"], properties: { target: { type: "string", enum: ["after-effects", "photoshop", "both"] }, command: { type: "object" } } }
  },
  {
    name: "creative_context",
    description: "Read both Adobe hosts so an agent can plan a cross-application operation.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false }
  },
  {
    name: "psd_probe",
    description: "Read PSD/PSB layer names, text, bounds, and canvas without opening Photoshop or writing the source file.",
    inputSchema: { type: "object", required: ["path"], properties: { path: { type: "string" }, maxLayers: { type: "integer", default: 10000 } } }
  },
  {
    name: "creative_edit_psd_text",
    description: "Edit Photoshop PSD text layers and optionally reload the changed PSD in After Effects.",
    inputSchema: {
      type: "object",
      required: ["path", "edits"],
      properties: {
        path: { type: "string", description: "Absolute PSD or PSB path." },
        edits: { type: "array", description: "Each item uses layerPath (array of group/layer names) and text, optionally font and size." },
        refreshAe: { type: "boolean", default: true },
        save: { type: "boolean", default: true }
      }
    }
  }
];

async function callTool(name, args) {
  args = args || {};
  if (name === "adobe_hosts") return textResult({ product: PRODUCT, version: VERSION, protocolVersion: PROTOCOL, hosts: { "after-effects": await hostHealth("after-effects"), photoshop: await hostHealth("photoshop") } });
  if (name === "ae_command") return textResult(await callHost("after-effects", args.command));
  if (name === "ps_command") return textResult(await callHost("photoshop", args.command));
  if (name === "adobe_command") {
    if (args.target === "both") {
      const [ae, ps] = await Promise.all([callHost("after-effects", args.command), callHost("photoshop", args.command)]);
      return textResult({ "after-effects": ae, photoshop: ps });
    }
    if (args.target !== "after-effects" && args.target !== "photoshop") throw new Error("target must be after-effects, photoshop, or both");
    return textResult(await callHost(args.target, args.command));
  }
  if (name === "creative_context") {
    const [ae, ps] = await Promise.all([
      callHost("after-effects", { type: "get_host_info" }).catch((error) => ({ ok: false, error: error.message })),
      callHost("photoshop", { type: "get_host_info" }).catch((error) => ({ ok: false, error: error.message }))
    ]);
    return textResult({ "after-effects": ae, photoshop: ps });
  }
  if (name === "psd_probe") return textResult(await probePsd(args.path, args.maxLayers));
  if (name === "creative_edit_psd_text") {
    const ps = await callHost("photoshop", { type: "apply_psd_text_updates", payload: { path: args.path, items: args.edits, save: args.save !== false, open: true, closeAfter: true } });
    let ae = null;
    if (args.refreshAe !== false) ae = await callHost("after-effects", { type: "reload_psd_sources", payload: { path: args.path } });
    return textResult({ photoshop: ps, "after-effects": ae, workflow: "Photoshop edit -> After Effects PSD reload" });
  }
  throw new Error(`Unknown tool: ${name}`);
}

async function handleRpc(message) {
  const id = message.id;
  if (message.method === "initialize") {
    return { jsonrpc: "2.0", id, result: { protocolVersion: message.params && message.params.protocolVersion || "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "adobe-creative-mcp", version: VERSION } } };
  }
  if (message.method === "notifications/initialized") return null;
  if (message.method === "ping") return { jsonrpc: "2.0", id, result: {} };
  if (message.method === "tools/list") return { jsonrpc: "2.0", id, result: { tools } };
  if (message.method === "tools/call") {
    try { return { jsonrpc: "2.0", id, result: await callTool(message.params && message.params.name, message.params && message.params.arguments) }; }
    catch (error) { return { jsonrpc: "2.0", id, result: textResult({ ok: false, error: error.message }, true) }; }
  }
  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${message.method}` } };
}

async function check() {
  const result = { product: PRODUCT, version: VERSION, protocolVersion: PROTOCOL, hosts: { "after-effects": await hostHealth("after-effects"), photoshop: await hostHealth("photoshop") } };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv.includes("--check")) {
  check().catch((error) => { process.stderr.write(`${error.stack || error}\n`); process.exitCode = 1; });
} else {
  const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  let queue = Promise.resolve();
  input.on("line", (line) => {
    if (!line.trim()) return;
    queue = queue.then(async () => {
      let message;
      try { message = JSON.parse(line); } catch (error) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } })}\n`); return; }
      const response = await handleRpc(message);
      if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
    }).catch((error) => { process.stderr.write(`${error.stack || error}\n`); });
  });
}
