import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const required = [
  "index.html",
  "CSXS/manifest.xml",
  "js/panel.js",
  "jsx/host.jsx",
  "server/mcp-server.js",
  "scripts/psd_probe.py",
  "README.md",
  "docs/AGENTS.md",
  "docs/DEPLOYMENT.md",
  "docs/PSD_WORKFLOW.md"
];

for (const file of required) await access(resolve(root, file));
const manifest = await readFile(resolve(root, "CSXS/manifest.xml"), "utf8");
if (!manifest.includes('Host Name="AEFT"')) throw new Error("AE host missing from manifest");
if (!manifest.includes('Host Name="PHXS"')) throw new Error("Photoshop host missing from manifest");
const panel = await readFile(resolve(root, "js/panel.js"), "utf8");
const host = await readFile(resolve(root, "jsx/host.jsx"), "utf8");
const server = await readFile(resolve(root, "server/mcp-server.js"), "utf8");
for (const marker of ["get_host_info", "scan_psd_sources", "reload_psd_sources", "apply_psd_text_updates"]) {
  if (!host.includes(marker)) throw new Error(`Host command missing: ${marker}`);
}
for (const marker of ["tools/list", "creative_edit_psd_text", "psd_probe"]) {
  if (!server.includes(marker)) throw new Error(`MCP feature missing: ${marker}`);
}
if (!panel.includes("Adobe Creative MCP") || !panel.includes("hostPorts")) throw new Error("Panel multi-host configuration missing");
for (const file of ["server/mcp-server.js", "client/ae-creative-mcp-client.js"]) {
  const result = spawnSync(process.execPath, ["--check", resolve(root, file)], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${file} syntax error:\n${result.stderr}`);
}
console.log(`Adobe Creative MCP validation passed (${required.length} required files).`);
