(function () {
  const cs = window.__adobe_cep__;
  const fs = require("fs");
  const path = require("path");
  const http = require("http");
  const childProcess = require("child_process");

  const PRODUCT = "Adobe Creative MCP";
  const VERSION = "2.0.0";
  const PROTOCOL = "2.0";
  const DEFAULT_AE_PORT = 47391;
  const DEFAULT_PS_PORT = 47392;
  const DEFAULT_POLL_MS = 800;
  const appData = process.env.APPDATA || process.env.USERPROFILE || ".";
  const bridgeRoot = path.join(appData, "Adobe Creative MCP");
  const legacyRoot = path.join(appData, "AE Codex Bridge");
  const hostsDir = path.join(bridgeRoot, "hosts");
  const configPath = path.join(bridgeRoot, "config.json");
  const hostRole = detectHostRole();
  const hostKey = hostRole === "photoshop" ? "photoshop" : "after-effects";
  const commandsDir = path.join(bridgeRoot, "commands", hostKey);
  const resultsDir = path.join(bridgeRoot, "results", hostKey);
  const logsDir = path.join(bridgeRoot, "logs");
  const hostRegistrationPath = path.join(hostsDir, `${hostKey}.json`);

  let running = false;
  let server = null;
  let pollTimer = null;
  let processing = false;
  let config = null;
  let currentPort = hostRole === "photoshop" ? DEFAULT_PS_PORT : DEFAULT_AE_PORT;
  let executionChain = Promise.resolve();

  const status = document.getElementById("status");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const fileState = document.getElementById("fileState");
  const httpState = document.getElementById("httpState");
  const httpUrl = document.getElementById("httpUrl");
  const tokenState = document.getElementById("tokenState");
  const bridgePath = document.getElementById("bridgePath");
  const lastCommand = document.getElementById("lastCommand");
  const lastResult = document.getElementById("lastResult");
  const hostRoleNode = document.getElementById("hostRole");
  const bridgeVersionNode = document.getElementById("bridgeVersion");

  function detectHostRole() {
    try {
      const raw = cs && cs.getHostEnvironment ? cs.getHostEnvironment() : "";
      const env = raw ? JSON.parse(raw) : {};
      const name = String(env.appName || env.appVersion || "").toLowerCase();
      return name.indexOf("photoshop") >= 0 ? "photoshop" : "after-effects";
    } catch (_) {
      return "after-effects";
    }
  }

  function setStatus(message) { status.textContent = message; }

  function ensureDirs() {
    [bridgeRoot, hostsDir, commandsDir, resultsDir, logsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  function defaultConfig() {
    return {
      version: 2,
      hostPorts: { "after-effects": DEFAULT_AE_PORT, photoshop: DEFAULT_PS_PORT },
      port: hostRole === "photoshop" ? DEFAULT_PS_PORT : DEFAULT_AE_PORT,
      token: "",
      pollMs: DEFAULT_POLL_MS,
      autoStart: true,
      enableHttp: true,
      allowJsx: true,
      maxBodyBytes: 2 * 1024 * 1024,
    };
  }

  function readConfig() {
    ensureDirs();
    if (!fs.existsSync(configPath) && fs.existsSync(path.join(legacyRoot, "config.json"))) {
      try { fs.copyFileSync(path.join(legacyRoot, "config.json"), configPath); } catch (_) {}
    }
    if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify(defaultConfig(), null, 2), "utf8");
    const loaded = JSON.parse(fs.readFileSync(configPath, "utf8").replace(/^\uFEFF/, ""));
    return Object.assign(defaultConfig(), loaded || {});
  }

  function resolvePort(loaded) {
    const mapped = loaded.hostPorts && Number(loaded.hostPorts[hostRole]);
    if (mapped) return mapped;
    if (hostRole === "photoshop" && Number(loaded.port) === DEFAULT_AE_PORT) return DEFAULT_PS_PORT;
    return Number(loaded.port) || (hostRole === "photoshop" ? DEFAULT_PS_PORT : DEFAULT_AE_PORT);
  }

  function logLine(entry) {
    ensureDirs();
    fs.appendFileSync(path.join(logsDir, "bridge.log"), JSON.stringify(Object.assign({ time: new Date().toISOString(), product: PRODUCT, version: VERSION, hostRole }, entry)) + "\n", "utf8");
  }

  function jsonForEval(value) { return JSON.stringify(String(value)); }

  function evalScript(script) {
    return new Promise((resolve, reject) => {
      if (!cs || !cs.evalScript) { reject(new Error("请在 Adobe CEP 面板中运行。")); return; }
      cs.evalScript(script, (result) => {
        if (result === "EvalScript error.") { reject(new Error("宿主脚本执行失败。")); return; }
        resolve(result);
      });
    });
  }

  function commandId(command) { return String(command.id || `cmd_${Date.now()}`); }

  function normalizeCommand(command) {
    return Object.assign({ id: commandId(command), schemaVersion: PROTOCOL, type: "ping", payload: {} }, command || {});
  }

  async function executeCommandInternal(command, source) {
    const normalized = normalizeCommand(command);
    lastCommand.textContent = JSON.stringify(normalized, null, 2);
    logLine({ event: "command", source, id: normalized.id, type: normalized.type });
    const startedAt = Date.now();
    try {
      if (normalized.type === "run_jsx" && config && config.allowJsx === false) throw new Error("run_jsx is disabled by config.allowJsx");
      const raw = await evalScript(`AdobeCreativeMCP.execute(${jsonForEval(JSON.stringify(normalized))})`);
      const hostResult = JSON.parse(raw);
      const result = { id: normalized.id, schemaVersion: PROTOCOL, type: normalized.type, hostRole, ok: !!hostResult.ok, message: hostResult.message || "", data: hostResult.data || null, error: hostResult.error || "", code: hostResult.code || "", elapsedMs: Date.now() - startedAt };
      lastResult.textContent = JSON.stringify(result, null, 2);
      logLine({ event: "result", source, id: normalized.id, ok: result.ok, elapsedMs: result.elapsedMs });
      return result;
    } catch (error) {
      const result = { id: normalized.id, schemaVersion: PROTOCOL, type: normalized.type, hostRole, ok: false, error: error.message || String(error), code: "PANEL_EXECUTION_ERROR", elapsedMs: Date.now() - startedAt };
      lastResult.textContent = JSON.stringify(result, null, 2);
      logLine({ event: "error", source, id: normalized.id, error: result.error });
      return result;
    }
  }

  function executeCommand(command, source) {
    const run = executionChain.then(() => executeCommandInternal(command, source));
    executionChain = run.catch(() => undefined);
    return run;
  }

  function writeResult(commandFile, result) {
    const resultPath = path.join(resultsDir, `${path.basename(commandFile, path.extname(commandFile))}.result.json`);
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2), "utf8");
  }

  async function pollCommands() {
    if (!running || processing) return;
    processing = true;
    try {
      const files = fs.readdirSync(commandsDir).filter((name) => name.toLowerCase().endsWith(".json")).sort();
      for (const name of files) {
        const commandPath = path.join(commandsDir, name);
        const processingPath = commandPath + ".processing";
        try {
          fs.renameSync(commandPath, processingPath);
          const command = JSON.parse(fs.readFileSync(processingPath, "utf8").replace(/^\uFEFF/, ""));
          const result = await executeCommand(command, "file");
          writeResult(commandPath, result);
          fs.unlinkSync(processingPath);
        } catch (error) {
          writeResult(commandPath, { id: name, schemaVersion: PROTOCOL, hostRole, ok: false, error: error.message || String(error), code: "FILE_COMMAND_ERROR" });
          try { if (fs.existsSync(processingPath)) fs.unlinkSync(processingPath); } catch (_) {}
        }
      }
    } finally {
      processing = false;
    }
  }

  function tokenFromRequest(req, bodyCommand) {
    const auth = String(req.headers.authorization || "");
    if (auth.indexOf("Bearer ") === 0) return auth.substring("Bearer ".length);
    return bodyCommand && bodyCommand.token ? String(bodyCommand.token) : "";
  }

  function sendJson(res, statusCode, payload) {
    const body = JSON.stringify(payload, null, 2);
    res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body), "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" });
    res.end(body);
  }

  function publicCapabilities() {
    return { product: PRODUCT, version: VERSION, protocolVersion: PROTOCOL, hostRole, port: currentPort, endpoints: ["GET /health", "GET /capabilities", "POST /command"], commandTransport: ["http", "file"], mcpBroker: true, features: ["host_info", "psd_recognition", "psd_text_editing", "ae_project_control", "photoshop_document_control", "serialized_multi_agent_execution"] };
  }

  function startHttp() {
    if (!config.enableHttp) { httpState.textContent = "已关闭"; return Promise.resolve(); }
    return new Promise((resolve, reject) => {
      server = http.createServer((req, res) => {
        if (req.method === "OPTIONS") { sendJson(res, 204, {}); return; }
        if (req.method === "GET" && req.url === "/health") { sendJson(res, 200, { ok: true, product: PRODUCT, version: VERSION, protocolVersion: PROTOCOL, running, hostRole, bridgeRoot, commandsDir, port: currentPort, tokenRequired: !!config.token }); return; }
        if (req.method === "GET" && req.url === "/capabilities") { sendJson(res, 200, publicCapabilities()); return; }
        if (req.method !== "POST" || req.url !== "/command") { sendJson(res, 404, { ok: false, error: "not found" }); return; }
        const maxBody = Number(config.maxBodyBytes) || 2 * 1024 * 1024;
        if (Number(req.headers["content-length"] || 0) > maxBody) { sendJson(res, 413, { ok: false, error: "request too large" }); req.destroy(); return; }
        let body = "";
        req.on("data", (chunk) => { body += chunk; if (body.length > maxBody) req.destroy(); });
        req.on("end", async () => {
          let command = null;
          try { command = JSON.parse(body || "{}"); } catch (_) { sendJson(res, 400, { ok: false, error: "invalid json" }); return; }
          if (config.token && tokenFromRequest(req, command) !== config.token) { sendJson(res, 401, { ok: false, error: "invalid token" }); return; }
          const result = await executeCommand(command, "http");
          sendJson(res, result.ok ? 200 : 500, result);
        });
      });
      server.on("error", reject);
      server.listen(currentPort, "127.0.0.1", () => { httpState.textContent = "运行中"; httpUrl.textContent = `http://127.0.0.1:${currentPort}`; resolve(); });
    });
  }

  function registerHost() {
    ensureDirs();
    fs.writeFileSync(hostRegistrationPath, JSON.stringify({ product: PRODUCT, version: VERSION, protocolVersion: PROTOCOL, hostRole, port: currentPort, pid: process.pid, startedAt: new Date().toISOString() }, null, 2), "utf8");
  }

  function unregisterHost() { try { if (fs.existsSync(hostRegistrationPath)) fs.unlinkSync(hostRegistrationPath); } catch (_) {} }

  async function startBridge() {
    if (running) return;
    ensureDirs();
    config = readConfig();
    currentPort = resolvePort(config);
    await startHttp();
    running = true;
    registerHost();
    pollTimer = setInterval(pollCommands, Number(config.pollMs) || DEFAULT_POLL_MS);
    fileState.textContent = "运行中";
    tokenState.textContent = config.token ? "已设置" : "未设置";
    startBtn.disabled = true;
    stopBtn.disabled = false;
    setStatus(`${hostRole === "photoshop" ? "Photoshop" : "After Effects"} 端已连接，MCP 可调用。`);
    logLine({ event: "started", port: currentPort, http: !!config.enableHttp });
  }

  function stopBridge() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (server) { server.close(); server = null; }
    unregisterHost();
    running = false;
    fileState.textContent = "未启动";
    httpState.textContent = "未启动";
    startBtn.disabled = false;
    stopBtn.disabled = true;
    setStatus("桥接已停止。");
    logLine({ event: "stopped" });
  }

  function copyPath() {
    const textarea = document.createElement("textarea");
    textarea.value = bridgeRoot;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setStatus("共享桥接目录已复制。");
  }

  function openPath() { ensureDirs(); childProcess.exec(`explorer "${bridgeRoot}"`); }

  function init() {
    ensureDirs();
    config = readConfig();
    currentPort = resolvePort(config);
    bridgePath.textContent = bridgeRoot;
    httpUrl.textContent = `http://127.0.0.1:${currentPort}`;
    tokenState.textContent = config.token ? "已设置" : "未设置";
    if (hostRoleNode) hostRoleNode.textContent = hostRole === "photoshop" ? "Photoshop" : "After Effects";
    if (bridgeVersionNode) bridgeVersionNode.textContent = `${PRODUCT} ${VERSION} / MCP ${PROTOCOL}`;
    if (config.autoStart !== false) setTimeout(() => startBridge().catch((error) => setStatus(error.message || String(error))), 0);
  }

  window.AdobeCreativeMCPStart = () => startBridge().catch((error) => setStatus(error.message || String(error)));
  window.AdobeCreativeMCPStop = stopBridge;
  window.AdobeCreativeMCPCopyPath = copyPath;
  window.AdobeCreativeMCPOpenPath = openPath;
  window.addEventListener("beforeunload", stopBridge);
  init();
}());
