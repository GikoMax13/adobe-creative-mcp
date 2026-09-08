/**
 * Adobe Creative MCP Showcase Interactive Script
 * Canvas background, Interactive Simulator, Timeline Scrubber, Tool Inspector, Config Copy, and i18n
 */

// --- Bilingual Dictionary ---
const i18nData = {
  en: {
    navFeatures: "Features",
    navArch: "Architecture",
    navPlayground: "Simulator",
    navTools: "MCP Tools",
    navInstall: "Quickstart",
    heroPill: "Production-Ready Local MCP Bridge",
    heroTitle: "Supercharge <span class=\"nowrap\">After Effects</span> & Photoshop<br>with Local AI Agents",
    heroDesc: "The local-first Model Context Protocol bridge connecting After Effects and Photoshop for Claude, Antigravity, Codex, and Cursor. Automate motion graphics, PSD localization, and multi-app production with zero cloud lock-in.",
    btnGetStarted: "Get Started Now",
    btnSimulator: "Launch Live Simulator",
    statusAE: "AE Host: Port 47391",
    statusPS: "PS Host: Port 47392",
    statusMCP: "MCP: Stdio Active",
    
    archTag: "System Overview",
    archTitle: "Local-First Bidirectional Pipeline",
    archSubtitle: "One unified MCP server bridging your local AI agents to Adobe ExtendScript runtimes over zero-latency localhost daemons.",
    nodeAgentDesc: "Claude, Antigravity, Codex, Cursor",
    nodeMcpDesc: "Stdio JSON-RPC 2.0 Router",
    nodeAeDesc: "Port 47391 • ExtendScript Host",
    nodePsDesc: "Port 47392 • DOM Layer Engine",
    
    simTag: "Interactive Lab",
    simTitle: "Experience Coordinated Cross-App Automation",
    simSubtitle: "Click a scenario below to watch the Agent modify Photoshop layers, trigger AE footage reload, and animate keyframes in real time.",
    scenario1: "PSD Text Localization & AE Reload",
    scenario2: "Headless PSD Probing",
    scenario3: "Batch Keyframe Replacement",
    scenario4: "Host Handshake & Capability Check",
    
    toolsTag: "API Reference",
    toolsTitle: "7 Precision MCP Tools for Creative Workflows",
    toolsSubtitle: "Engineered specifically for high-reliability agentic manipulation of complex design documents and video compositions.",
    
    featuresTag: "Capabilities",
    featuresTitle: "Why Adobe Creative MCP?",
    featuresSubtitle: "Built by motion designers and engineers to bridge the gap between Large Language Models and Adobe Creative Cloud.",
    
    f1Title: "Dual-Host Architecture",
    f1Desc: "Unified CEP panel installer and runtime supporting both After Effects 2022+ and Photoshop 2021+ with automatic host discovery.",
    f2Title: "Coordinated Cross-App Flow",
    f2Desc: "Modify PSD text in Photoshop and automatically signal After Effects to reload the linked asset with zero manual refresh steps.",
    f3Title: "Headless PSD Probing",
    f3Desc: "Read layer trees, bounds, canvas sizes, and text content directly via Python psd-tools without even launching Photoshop.",
    f4Title: "100% Local & Private",
    f4Desc: "Zero cloud dependencies. High-resolution raw PSDs, project aep files, and footage never leave your workstation.",
    f5Title: "Reversible & Safe Workflows",
    f5Desc: "Copy-first safeguards, explicit layer path addressing, and typed commands prevent accidental corruption of production masters.",
    f6Title: "Universal Agent Support",
    f6Desc: "Seamlessly plug into Claude Desktop, Google Antigravity, OpenAI Codex, Cursor, Zed, Windsurf, or custom Node.js agents.",
    
    quickTag: "Setup Guide",
    quickTitle: "Get Running in Under 2 Minutes",
    quickSubtitle: "Simple PowerShell installation, automatic panel deployment, and standardized MCP agent configuration.",
    step1Num: "STEP 01",
    step1Title: "Run Windows Installer",
    step1Desc: "Run install_windows.ps1 in PowerShell to register CEP panels for both AE and Photoshop.",
    step2Num: "STEP 02",
    step2Title: "Open Extension Panels",
    step2Desc: "In AE and Photoshop: Window > Extensions > Adobe Creative MCP. Host daemons auto-start.",
    step3Num: "STEP 03",
    step3Title: "Add Agent MCP Config",
    step3Desc: "Copy the JSON configuration below into your AI Agent's MCP settings file.",
    step4Num: "STEP 04",
    step4Title: "Command Your Agent",
    step4Desc: "Ask your agent: 'Probe dialog.psd, change the title to Japanese, and refresh AE!'",
    
    btnCopyConfig: "Copy Config",
    copiedToast: "Configuration copied to clipboard!",
    footerDesc: "Open source local MCP bridge for After Effects and Photoshop. Released under MIT License.",
    
    aiIngestTitle: "For AI Agents & LLM Ingestion",
    btnCopyPrompt: "Copy Agent Prompt",
    promptCopied: "AI Agent Prompt copied to clipboard!",
    cloneCopied: "git clone command copied to clipboard!",
    aiPromptText: "Please read the repository https://github.com/GikoMax13/adobe-creative-mcp and connect to the local After Effects & Photoshop MCP bridge to help me automate creative workflows."
  },
  zh: {
    navFeatures: "核心特性",
    navArch: "系统架构",
    navPlayground: "在线模拟器",
    navTools: "MCP 工具集",
    navInstall: "快速开始",
    heroPill: "生产级本地 MCP 创意工作流桥接器",
    heroTitle: "让 AI Agent 深度驱动<br><span class=\"nowrap\">After Effects</span> 与 Photoshop",
    heroDesc: "专为 Claude、Antigravity、Codex、Cursor 等 AI 打造的本地优先 Model Context Protocol 桥接套件。打通动效合成、PSD 多图层本地化、跨软件联动与渲染管线，零云端依赖，数据完全本地隔离。",
    btnGetStarted: "立即快速部署",
    btnSimulator: "进入交互模拟器",
    statusAE: "AE 宿主: 端口 47391",
    statusPS: "PS 宿主: 端口 47392",
    statusMCP: "MCP: Stdio 已就绪",
    
    archTag: "架构设计",
    archTitle: "本地双向低延迟管线",
    archSubtitle: "单体 MCP 服务通过标准 stdio 协议连接 Agent，基于本地 HTTP 守护进程瞬时调度 AE 与 PS ExtendScript 引擎。",
    nodeAgentDesc: "Claude, Antigravity, Codex, Cursor 等",
    nodeMcpDesc: "Stdio JSON-RPC 2.0 路由服务器",
    nodeAeDesc: "端口 47391 • ExtendScript 合成宿主",
    nodePsDesc: "端口 47392 • DOM 图层渲染引擎",
    
    simTag: "交互模拟",
    simTitle: "跨软件协同自动化实时演示",
    simSubtitle: "点击下方场景，观察 Agent 如何在后台修改 Photoshop 图层、触发 AE 素材重载并同步变换关键帧时间轴。",
    scenario1: "PSD 文字本地化并触发 AE 重载",
    scenario2: "免 PS 后台探查 PSD 图层",
    scenario3: "批量关键帧与图层属性置换",
    scenario4: "宿主握手与能力列表探测",
    
    toolsTag: "工具规范",
    toolsTitle: "7 大核心 MCP 工具定义",
    toolsSubtitle: "专为 Agent 设计的高可靠性强类型命令集，精准操控复杂的设计文档与视频工程。",
    
    featuresTag: "特性亮点",
    featuresTitle: "为什么选择 Adobe Creative MCP？",
    featuresSubtitle: "由动效设计师与核心工程师联手打造，彻底打通大语言模型与 Adobe Creative Cloud 的交互壁垒。",
    
    f1Title: "双宿主协同架构",
    f1Desc: "单一 CEP 扩展包同时兼容 After Effects 2022+ 与 Photoshop 2021+，运行期自动探测宿主并提供适配器。",
    f2Title: "跨应用联动工作流",
    f2Desc: "在 Photoshop 中编辑 PSD 文档，无需人工切换，自动同步重载 After Effects 合成所引用的对应图层并更新时间轴。",
    f3Title: "离线免启动快速探查",
    f3Desc: "内置 Python psd-tools 轻量探针，无需开启庞大的 Photoshop 即可高速读取图层树、文字、坐标与尺寸。",
    f4Title: "100% 本地隐私安全",
    f4Desc: "所有工程文件（aep/psd）、高清素材与渲染序列全留在工作站本地磁盘，HTTP 严格绑定 127.0.0.1 本地回环。",
    f5Title: "安全可逆操作机制",
    f5Desc: "规范副本优先（copy-first）与 outputPath 策略，图层采用绝对路径寻址，杜绝破坏生产级主工程风险。",
    f6Title: "主流 Agent 全面适配",
    f6Desc: "无缝接入 Claude Desktop、Google Antigravity、OpenAI Codex、Cursor、Zed、Windsurf 等各类 MCP 客户端。",
    
    quickTag: "快速部署",
    quickTitle: "两分钟完成部署接入",
    quickSubtitle: "一行 PowerShell 脚本自动化安装，面板即开即用，开箱即享极速 MCP 创意自动化。",
    step1Num: "第 1 步",
    step1Title: "运行 Windows 安装脚本",
    step1Desc: "在终端中运行 install_windows.ps1，自动完成 AE 和 PS 的 CEP 扩展注册与调试配置。",
    step2Num: "第 2 步",
    step2Title: "在 Adobe 软件中打开面板",
    step2Desc: "打开 AE 与 PS：窗口 > 扩展 > Adobe Creative MCP。守护端口自动侦听运行。",
    step3Num: "第 3 步",
    step3Title: "配置 Agent MCP 路由",
    step3Desc: "复制下方的 JSON 配置文件粘贴至对应 AI Agent 的 MCP 设置中。",
    step4Num: "第 4 步",
    step4Title: "向 Agent 下达创意指令",
    step4Desc: "对 Agent 说：'检查 dialog.psd，把标题翻译成日语并自动刷新 AE 合成素材！'",
    
    btnCopyConfig: "复制配置",
    copiedToast: "MCP 配置已成功复制到剪贴板！",
    footerDesc: "基于 MIT 许可证开源的 After Effects 与 Photoshop 本地 MCP 桥接器。",
    
    aiIngestTitle: "供 AI 智能体与大模型秒懂接入 (LLM Ingestion)",
    btnCopyPrompt: "复制 Agent 提示词",
    promptCopied: "Agent 接入提示词已复制到剪贴板！",
    cloneCopied: "git clone 命令已复制到剪贴板！",
    aiPromptText: "请阅读仓库 https://github.com/GikoMax13/adobe-creative-mcp 并连接本机 After Effects 与 Photoshop 的 MCP 服务协助我自动化制图"
  }
};

let currentLang = localStorage.getItem("acmcp_lang") || "zh";

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("acmcp_lang", lang);
  const t = i18nData[lang];
  
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) {
      if (t[key].includes("<")) {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  const promptEl = document.getElementById("aiPromptText");
  if (promptEl && t.aiPromptText) {
    promptEl.textContent = t.aiPromptText;
  }

  const langBtn = document.getElementById("langToggleBtn");
  if (langBtn) {
    langBtn.textContent = lang === "zh" ? "English" : "中文";
  }
}

// --- Background Particle & Motion Spline Grid Canvas ---
function initMotionCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  let width, height;
  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Nodes for keyframe bezier curves
  const curves = [
    { p0: { x: 0.1, y: 0.2 }, p1: { x: 0.3, y: 0.7 }, p2: { x: 0.7, y: 0.1 }, p3: { x: 0.9, y: 0.8 }, speed: 0.0008, color: "rgba(157, 78, 221, 0.25)" },
    { p0: { x: 0.05, y: 0.8 }, p1: { x: 0.4, y: 0.3 }, p2: { x: 0.6, y: 0.9 }, p3: { x: 0.95, y: 0.3 }, speed: 0.0006, color: "rgba(0, 180, 216, 0.22)" },
    { p0: { x: 0.2, y: 0.9 }, p1: { x: 0.5, y: 0.5 }, p2: { x: 0.5, y: 0.2 }, p3: { x: 0.85, y: 0.6 }, speed: 0.0009, color: "rgba(16, 185, 129, 0.18)" }
  ];

  let tick = 0;

  function render() {
    tick++;
    ctx.clearRect(0, 0, width, height);

    // Draw subtle grid points
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    const spacing = 50;
    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // Render animated motion spline paths (After Effects Graph Editor style)
    curves.forEach(c => {
      const offset1 = Math.sin(tick * c.speed * 1.5) * 60;
      const offset2 = Math.cos(tick * c.speed * 1.2) * 50;

      const x0 = c.p0.x * width;
      const y0 = c.p0.y * height + offset1;
      const x1 = c.p1.x * width + offset2;
      const y1 = c.p1.y * height - offset1;
      const x2 = c.p2.x * width - offset2;
      const y2 = c.p2.y * height + offset2;
      const x3 = c.p3.x * width;
      const y3 = c.p3.y * height - offset2;

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Keyframe diamonds at control points
      [ {x: x0, y: y0}, {x: x3, y: y3} ].forEach(pt => {
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
      });

      // Spatial tangent handles
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.moveTo(x3, y3);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    requestAnimationFrame(render);
  }
  render();
}

// --- Interactive Playground Simulator ---
const scenarios = {
  1: {
    name: "PSD Text Localization & AE Reload",
    psdText: "タイトル: ライフコーチング",
    psdSub: "Font: YuGothic-Bold | Layer: [Life Coaching]",
    aeTitle: "ライフコーチング",
    aeSub: "Render Comp 1080x1080 • PSD Reloaded",
    logs: [
      { text: "[AGENT] Calling creative_context to inspect AE & Photoshop status...", type: "agent" },
      { text: "[MCP] -> {\"tool\":\"creative_context\"}", type: "mcp" },
      { text: "[AE :47391] Project 'Promo2026.aep' loaded. 1 PSD source mapped.", type: "ae" },
      { text: "[PS :47392] Document 'dialog.psd' opened. 4 layers found.", type: "ps" },
      { text: "[AGENT] Calling creative_edit_psd_text with layerPath=['Life Coaching']", type: "agent" },
      { text: "[MCP] -> apply_psd_text_updates: 'ライフコーチング' (YuGothic-Bold)", type: "json" },
      { text: "[PS :47392] Layer text updated successfully. Document saved.", type: "ps" },
      { text: "[MCP] Triggering AE footage reload for 'dialog.psd'...", type: "mcp" },
      { text: "[AE :47391] Footage item 'dialog.psd' reloaded into 3 comps. Cache purged.", type: "ae" },
      { text: "[SUCCESS] Pipeline completed in 142ms. Zero frame drop.", type: "success" }
    ]
  },
  2: {
    name: "Headless PSD Probing",
    psdText: "Hero_Banner_2026.psb",
    psdSub: "12 Layers | 3840x2160 | No Photoshop Needed",
    aeTitle: "Layer Tree Inspected",
    aeSub: "Headless Python psd-tools response",
    logs: [
      { text: "[AGENT] Executing psd_probe on 'H:/assets/Hero_Banner_2026.psb'...", type: "agent" },
      { text: "[MCP] Spawning Python psd-tools headless inspect daemon...", type: "mcp" },
      { text: "[PROBE] Dimensions: 3840x2160 | ColorMode: RGB (8-bit)", type: "json" },
      { text: "[PROBE] TextLayer ['Heading'] -> 'Summer Sale 50% OFF'", type: "ps" },
      { text: "[PROBE] TextLayer ['Button', 'CTA'] -> 'Shop Now'", type: "ps" },
      { text: "[PROBE] Bounds: x=420, y=890, w=1200, h=180", type: "json" },
      { text: "[SUCCESS] Parsed PSB structure in 38ms without Photoshop instance.", type: "success" }
    ]
  },
  3: {
    name: "Batch Keyframe Replacement",
    psdText: "Layer Transform Matrix",
    psdSub: "Keyframe Index #4 • Ease In/Out 85%",
    aeTitle: "Position [960, 540] @ 02:15",
    aeSub: "Dynamic Bezier Keyframe Generated",
    logs: [
      { text: "[AGENT] Calling ae_command: 'scan_comp_layers' for activeComp...", type: "agent" },
      { text: "[AE :47391] Found 14 layers in Comp 'Main_Sequence'.", type: "ae" },
      { text: "[AGENT] Setting Position keyframes with cubic-bezier ease...", type: "agent" },
      { text: "[MCP] -> ae_command: apply_keyframe_batch", type: "json" },
      { text: "[AE :47391] Keyframes set at t=0.0s [960, 1080], t=2.5s [960, 540]", type: "ae" },
      { text: "[SUCCESS] Comp render timeline updated and synced.", type: "success" }
    ]
  },
  4: {
    name: "Host Handshake & Capability Check",
    psdText: "Photoshop 2024 (v25.5)",
    psdSub: "DOM Layer Engine • Port 47392",
    aeTitle: "After Effects 2024 (v24.2)",
    aeSub: "Render Engine • Port 47391",
    logs: [
      { text: "[AGENT] Probing adobe_hosts handshake...", type: "agent" },
      { text: "[MCP] Connecting to 127.0.0.1:47391 and 127.0.0.1:47392...", type: "mcp" },
      { text: "[HOST AE] Connected. Host: AEFT, Version: 24.2.0, CEP: 11.2", type: "ae" },
      { text: "[HOST PS] Connected. Host: PHXS, Version: 25.5.0, CEP: 11.2", type: "ps" },
      { text: "[CAPABILITIES] scan_psd_sources=true, apply_text_updates=true, run_jsx=true", type: "json" },
      { text: "[SUCCESS] Dual-host ecosystem authenticated and ready for Agent control.", type: "success" }
    ]
  }
};

let currentScenarioTimer = null;

function runScenario(id) {
  const scenario = scenarios[id];
  if (!scenario) return;

  // Highlight button
  document.querySelectorAll(".scenario-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-scenario") === String(id));
  });

  // Reset & prepare displays
  const psdTextBox = document.getElementById("simPsdBox");
  const psdMainText = document.getElementById("simPsdMain");
  const psdSubText = document.getElementById("simPsdSub");
  const aeTitle = document.getElementById("simAeTitle");
  const aeSub = document.getElementById("simAeSub");
  const terminal = document.getElementById("simTerminal");
  const playhead = document.getElementById("simPlayhead");
  const timecode = document.getElementById("simTimecode");
  const compElement = document.getElementById("simCompElement");

  if (!terminal) return;

  terminal.innerHTML = "";
  if (psdTextBox) psdTextBox.classList.remove("active-pulse");

  if (currentScenarioTimer) clearInterval(currentScenarioTimer);

  let logIndex = 0;
  let progress = 0;

  currentScenarioTimer = setInterval(() => {
    if (logIndex < scenario.logs.length) {
      const log = scenario.logs[logIndex];
      const p = document.createElement("div");
      p.className = `term-line term-${log.type}`;
      p.textContent = log.text;
      terminal.appendChild(p);
      terminal.scrollTop = terminal.scrollHeight;

      // Visual updates halfway
      if (logIndex === 3) {
        if (psdTextBox) psdTextBox.classList.add("active-pulse");
        if (psdMainText) psdMainText.textContent = scenario.psdText;
        if (psdSubText) psdSubText.textContent = scenario.psdSub;
      }

      if (logIndex === 6) {
        if (aeTitle) aeTitle.textContent = scenario.aeTitle;
        if (aeSub) aeSub.textContent = scenario.aeSub;
        if (compElement) {
          compElement.style.transform = `scale(${1 + (id * 0.05)}) rotate(${id % 2 === 0 ? -2 : 2}deg)`;
          setTimeout(() => {
            compElement.style.transform = "scale(1) rotate(0deg)";
          }, 300);
        }
      }

      // Animate playhead
      progress = (logIndex / scenario.logs.length) * 100;
      if (playhead) playhead.style.left = `${Math.min(90, 10 + progress * 0.8)}%`;
      if (timecode) {
        const sec = Math.floor(logIndex * 0.6);
        const frame = Math.floor((logIndex * 7) % 30);
        timecode.textContent = `00:00:0${sec}:${frame < 10 ? '0' + frame : frame}`;
      }

      logIndex++;
    } else {
      clearInterval(currentScenarioTimer);
    }
  }, 320);
}

// --- Interactive Timeline Scrubber ---
function initTimelineScrubber() {
  const trackContainer = document.getElementById("simTrackContainer");
  const playhead = document.getElementById("simPlayhead");
  const timecode = document.getElementById("simTimecode");
  const compElement = document.getElementById("simCompElement");

  if (!trackContainer || !playhead) return;

  let isDragging = false;

  function updateScrub(e) {
    const rect = trackContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    playhead.style.left = `${percent}%`;

    const totalFrames = Math.floor((percent / 100) * 150); // 5 sec @ 30fps
    const sec = Math.floor(totalFrames / 30);
    const frame = totalFrames % 30;
    if (timecode) {
      timecode.textContent = `00:00:0${sec}:${frame < 10 ? '0' + frame : frame}`;
    }

    if (compElement) {
      const scale = 0.95 + (percent / 100) * 0.15;
      const angle = (percent / 100 - 0.5) * 8;
      compElement.style.transform = `scale(${scale}) rotate(${angle}deg)`;
    }
  }

  trackContainer.addEventListener("mousedown", e => {
    isDragging = true;
    updateScrub(e);
  });

  window.addEventListener("mousemove", e => {
    if (isDragging) updateScrub(e);
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

// --- Tools Explorer Tabs ---
const toolsData = {
  adobe_hosts: {
    desc: "Check online status, host product name (AEFT or PHXS), software version, and port connectivity for both After Effects and Photoshop.",
    params: [],
    exampleInput: "{}",
    exampleOutput: `{
  "ae": {
    "status": "online",
    "host": "AEFT",
    "version": "24.2.0",
    "port": 47391
  },
  "ps": {
    "status": "online",
    "host": "PHXS",
    "version": "25.5.0",
    "port": 47392
  }
}`
  },
  creative_context: {
    desc: "Read current creative context across both applications: active AE compositions, imported PSD footage, and active Photoshop PSD documents and layers.",
    params: [],
    exampleInput: "{}",
    exampleOutput: `{
  "ae": {
    "project": "H:/AE工程/SummerPromo.aep",
    "activeComp": "Main_1080x1080",
    "psdSources": ["H:/AE工程/Assets/dialog.psd"]
  },
  "ps": {
    "activeDocument": "H:/AE工程/Assets/dialog.psd",
    "layersCount": 8,
    "topLayer": "Title_Text"
  }
}`
  },
  ae_command: {
    desc: "Send a typed command exclusively to After Effects (e.g. scan_comp_layers, replace_footage_source, reload_psd_sources, run_jsx).",
    params: [
      { name: "command", type: "string", desc: "Command identifier (e.g. 'reload_psd_sources')" },
      { name: "args", type: "object", desc: "Arguments passed to ExtendScript host" }
    ],
    exampleInput: `{
  "command": "reload_psd_sources",
  "args": {
    "path": "H:/project/assets/dialog.psd"
  }
}`,
    exampleOutput: `{
  "success": true,
  "reloadedItems": 1,
  "affectedComps": ["Intro", "Card_Outro"]
}`
  },
  ps_command: {
    desc: "Send a typed command exclusively to Photoshop (e.g. apply_psd_text_updates, save_document, export_layer).",
    params: [
      { name: "command", type: "string", desc: "Command identifier (e.g. 'apply_psd_text_updates')" },
      { name: "args", type: "object", desc: "Arguments passed to Photoshop DOM" }
    ],
    exampleInput: `{
  "command": "apply_psd_text_updates",
  "args": {
    "path": "H:/project/assets/dialog.psd",
    "layerPath": ["Heading", "Title"],
    "text": "Cyberpunk 2077 Promo"
  }
}`,
    exampleOutput: `{
  "success": true,
  "layerFound": true,
  "updatedText": "Cyberpunk 2077 Promo"
}`
  },
  adobe_command: {
    desc: "Broadcast a command to one or both Adobe applications simultaneously with unified error handling and status aggregation.",
    params: [
      { name: "target", type: "string", desc: "'ae', 'ps', or 'both'" },
      { name: "command", type: "string", desc: "Target command name" }
    ],
    exampleInput: `{
  "target": "both",
  "command": "get_host_info"
}`,
    exampleOutput: `{
  "ae": { "status": "ok", "host": "AEFT" },
  "ps": { "status": "ok", "host": "PHXS" }
}`
  },
  psd_probe: {
    desc: "Lightweight, headless inspection of PSD/PSB files using Python psd-tools. Reads layer hierarchies, text content, bounds, and color modes without launching Photoshop.",
    params: [
      { name: "path", type: "string", desc: "Absolute file path to .psd or .psb" }
    ],
    exampleInput: `{
  "path": "H:/project/banner.psd"
}`,
    exampleOutput: `{
  "width": 1920,
  "height": 1080,
  "colorMode": "RGB",
  "layers": [
    { "name": "Background", "kind": "pixel" },
    { "name": "Title", "kind": "type", "text": "Summer Sale" }
  ]
}`
  },
  creative_edit_psd_text: {
    desc: "High-level coordinated macro: edit text inside Photoshop PSD, save changes, and immediately trigger AE to reload the updated PSD footage asset.",
    params: [
      { name: "path", type: "string", desc: "Absolute path to PSD" },
      { name: "edits", type: "array", desc: "Array of {layerPath, text, font}" },
      { name: "refreshAe", type: "boolean", desc: "Whether to reload PSD in After Effects" },
      { name: "save", type: "boolean", desc: "Save PSD document after edit" }
    ],
    exampleInput: `{
  "path": "H:/project/assets/dialog.psd",
  "edits": [
    {
      "layerPath": ["Life Coaching"],
      "text": "ライフコーチング",
      "font": "YuGothic-Bold"
    }
  ],
  "refreshAe": true,
  "save": true
}`,
    exampleOutput: `{
  "success": true,
  "psdModified": true,
  "aeRefreshed": true,
  "saved": true
}`
  }
};

function selectTool(name) {
  const tool = toolsData[name];
  if (!tool) return;

  document.querySelectorAll(".tool-tab").forEach(tab => {
    tab.classList.toggle("active", tab.getAttribute("data-tool") === name);
  });

  const nameEl = document.getElementById("toolName");
  const descEl = document.getElementById("toolDesc");
  const paramsEl = document.getElementById("toolParams");
  const codeEl = document.getElementById("toolCodePreview");

  if (nameEl) nameEl.textContent = name;
  if (descEl) descEl.textContent = tool.desc;

  if (paramsEl) {
    if (tool.params.length === 0) {
      paramsEl.innerHTML = "<tr><td colspan='3' style='color:var(--text-dim)'>No arguments required.</td></tr>";
    } else {
      paramsEl.innerHTML = tool.params.map(p => `
        <tr>
          <td class="param-name">${p.name}</td>
          <td class="param-type">${p.type}</td>
          <td>${p.desc}</td>
        </tr>
      `).join("");
    }
  }

  if (codeEl) {
    codeEl.textContent = `// Tool Call Example:\n${tool.exampleInput}\n\n// Expected Response:\n${tool.exampleOutput}`;
  }
}

// --- Config Switcher & One-Click Copy ---
const configs = {
  claude: `{
  "mcpServers": {
    "adobe-creative-mcp": {
      "command": "node",
      "args": ["H:/AE工程/adobe-creative-mcp/server/mcp-server.js"]
    }
  }
}`,
  antigravity: `{
  "mcp": {
    "servers": {
      "adobe-creative-mcp": {
        "command": "node",
        "args": ["H:/AE工程/adobe-creative-mcp/server/mcp-server.js"]
      }
    }
  }
}`,
  cursor: `{
  "mcpServers": {
    "adobe-creative-mcp": {
      "command": "node",
      "args": ["H:/AE工程/adobe-creative-mcp/server/mcp-server.js"]
    }
  }
}`,
  cli: `# Direct test via node
node H:/AE工程/adobe-creative-mcp/server/mcp-server.js --check`
};

let currentConfigKey = "claude";

function selectConfig(key) {
  currentConfigKey = key;
  document.querySelectorAll(".config-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-cfg") === key);
  });
  const codeEl = document.getElementById("configCode");
  if (codeEl) {
    codeEl.textContent = configs[key];
  }
}

function showToast(msg) {
  let toast = document.getElementById("toastMsg");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastMsg";
    toast.className = "toast-msg";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function copyConfig() {
  const code = configs[currentConfigKey];
  navigator.clipboard.writeText(code).then(() => {
    const t = i18nData[currentLang];
    showToast(t.copiedToast || "Copied to clipboard!");
  }).catch(() => {
    showToast("Copy failed, please copy manually.");
  });
}

// --- DOM Ready Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  setLanguage(currentLang);
  initMotionCanvas();
  initTimelineScrubber();
  selectTool("creative_edit_psd_text");
  selectConfig("claude");
  runScenario(1);

  // Scenario Buttons
  document.querySelectorAll(".scenario-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const scId = parseInt(btn.getAttribute("data-scenario"), 10);
      runScenario(scId);
    });
  });

  // Tool Tabs
  document.querySelectorAll(".tool-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const toolName = tab.getAttribute("data-tool");
      selectTool(toolName);
    });
  });

  // Config Tabs
  document.querySelectorAll(".config-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const cfg = btn.getAttribute("data-cfg");
      selectConfig(cfg);
    });
  });

  // Copy Config Button
  const copyBtn = document.getElementById("copyConfigBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyConfig);
  }

  // Copy Clone Command Button
  const copyCloneBtn = document.getElementById("copyCloneBtn");
  if (copyCloneBtn) {
    copyCloneBtn.addEventListener("click", () => {
      navigator.clipboard.writeText("git clone https://github.com/GikoMax13/adobe-creative-mcp.git").then(() => {
        const t = i18nData[currentLang];
        showToast(t.cloneCopied || "Clone command copied!");
      }).catch(() => {
        showToast("git clone https://github.com/GikoMax13/adobe-creative-mcp.git");
      });
    });
  }

  // Copy AI Prompt Button
  const copyAiPromptBtn = document.getElementById("copyAiPromptBtn");
  if (copyAiPromptBtn) {
    copyAiPromptBtn.addEventListener("click", () => {
      const promptEl = document.getElementById("aiPromptText");
      const text = promptEl ? promptEl.textContent.trim() : "https://github.com/GikoMax13/adobe-creative-mcp";
      navigator.clipboard.writeText(text).then(() => {
        const t = i18nData[currentLang];
        showToast(t.promptCopied || "Prompt copied!");
      }).catch(() => {
        showToast("Copied!");
      });
    });
  }

  // Language Switcher Button
  const langToggleBtn = document.getElementById("langToggleBtn");
  if (langToggleBtn) {
    langToggleBtn.addEventListener("click", () => {
      setLanguage(currentLang === "zh" ? "en" : "zh");
    });
  }
});
