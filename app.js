const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

const LDR_NAME_DEFAULT = "Shona";
const LDR_DISTANCE_KM = 138;

// ✅ REQUIRED: Set your WhatsApp number (international, NO "+", NO spaces)
const WHATSAPP_NUMBER = "94770000000"; // <-- CHANGE THIS

// ✅ Optional: your signature name
const CEO_SIGNATURE = "CEO";

// Boot
const bootLines = [
  "Connecting to Heart Network…",
  `Distance detected: ${LDR_DISTANCE_KM} km — still connected.`,
  "Syncing memories…",
  "Verifying respect protocols… passed.",
  "Loading BAE Valentine UI…",
  "Ready. ❤️"
];

// Local storage keys
const LS_PROFILE = "bae_profile_v2";
const LS_FLAGS = "bae_flags_v2";

// Assets
const ASSETS = [
  { pair: "HUG/USDT",   desc: "Support level: her",   base: 124.5, vol: 1.4 },
  { pair: "KISS/USDT",  desc: "Liquidity: goodnight", base: 88.2,  vol: 1.8 },
  { pair: "LAUGH/USDT", desc: "Volatility: adorable", base: 56.7,  vol: 2.6 },
  { pair: "CARE/USDT",  desc: "Trend: consistent",    base: 142.9, vol: 1.2 },
  { pair: "TIME/USDT",  desc: "Always allocate",      base: 103.1, vol: 1.6 },
];

let state = {
  profile: loadProfile(),
  flags: loadFlags(),
  route: "markets",
  selected: ASSETS[0],
  series: [],
  labels: [],
  lastPrice: null,
  chart: null,
  voicePlayed: false,
  portfolioUnlocked: false,
  gameRunning: false,
};

// ✅ Real memories (3–6). Make these specific.
const BASE_MEMORIES = [
  { side: "BUY",  pair: "TIME/USDT",  price: 101.70, memory: "Bought time — that night we talked until late." },
  { side: "BUY",  pair: "CARE/USDT",  price: 141.20, memory: "You checked on me without me asking." },
  { side: "ADD",  pair: "KISS/USDT",  price: 86.90,  memory: "Goodnight call — daily close confirmed." },
  { side: "BUY",  pair: "LAUGH/USDT", price: 55.10,  memory: "Your laugh fixed my mood in seconds 😂" },
  { side: "HOLD", pair: "SHONA/FOREVER", price: 138.00, memory: `Even ${LDR_DISTANCE_KM} km apart, I still choose you — daily.` },
];

function runBoot() {
  const boot = qs("#boot");
  const bootLine = qs("#bootLine");
  const bootBar = qs("#bootBar");

  let p = 0;
  let i = 0;

  const timer = setInterval(() => {
    p += Math.floor(8 + Math.random() * 14);
    if (p > 100) p = 100;
    bootBar.style.width = `${p}%`;

    if (i < bootLines.length && p >= (i + 1) * 18) {
      bootLine.textContent = bootLines[i];
      i++;
    }

    if (p >= 100) {
      clearInterval(timer);
      setTimeout(() => {
        boot.classList.add("hidden");
        startApp();
      }, 250);
    }
  }, 170);
}

// Profile / Flags
function loadProfile() {
  try {
    const raw = localStorage.getItem(LS_PROFILE);
    if (!raw) return { name: "" };
    const obj = JSON.parse(raw);
    return { name: String(obj.name || "") };
  } catch { return { name: "" }; }
}
function saveProfile(profile) {
  localStorage.setItem(LS_PROFILE, JSON.stringify(profile));
}
function loadFlags() {
  try {
    const raw = localStorage.getItem(LS_FLAGS);
    if (!raw) return { sentCount: 0, secretUsed: false };
    const obj = JSON.parse(raw);
    return {
      sentCount: Number(obj.sentCount || 0),
      secretUsed: Boolean(obj.secretUsed || false),
    };
  } catch { return { sentCount: 0, secretUsed: false }; }
}
function saveFlags(flags) {
  localStorage.setItem(LS_FLAGS, JSON.stringify(flags));
}

function startApp() {
  if (!state.profile.name) {
    state.profile.name = LDR_NAME_DEFAULT;
    saveProfile(state.profile);
  }
  mountApp();
}

function mountApp() {
  qs("#app").classList.remove("hidden");

  // Header
  qs("#ldrStatus").textContent = `LDR Mode • ${LDR_DISTANCE_KM} km • Connected`;
  qs("#userChip").textContent = `For: ${state.profile.name}`;
  qs("#settingsName").value = state.profile.name;

  // Portfolio text
  qs("#holdingSymbol").textContent = `${state.profile.name.toUpperCase()}/FOREVER`;
  qs("#killerBigLine").textContent = `${state.profile.name}, you are my only long-term investment.`;

  // Unlock modal info
  qs("#unlockBadge").textContent = `${state.profile.name.toUpperCase()}/FOREVER`;
  qs("#certAsset").textContent = `${state.profile.name.toUpperCase()}/FOREVER`;
  qs("#certDistance").textContent = `${LDR_DISTANCE_KM} km`;
  qs("#certSig").textContent = CEO_SIGNATURE;
  qs("#certQuote").textContent = `“${state.profile.name}, you are my only long-term investment.”`;

  // Secret available?
  refreshSecretSection();

  // Bind controls
  bindNav();
  bindWatchlist();
  bindAudit();
  bindVoice();
  bindValentineActions();
  bindSettings();
  bindCertificate();
  bindPanic();
  bindMood();
  bindSecret();
  bindGame();

  // Init chart + history
  initSeries();
  initChart();
  renderMemories(BASE_MEMORIES);
  updateHeaderForSelected();
  setRoute("markets");

  updateLiveNumbers();
  setInterval(tick, 1800);
}

/** ---------- Routing + Portfolio Unlock ---------- */
function bindNav() {
  qsa(".navBtn").forEach(btn => {
    btn.onclick = () => {
      const route = btn.dataset.route;
      if (route === "portfolio" && !state.portfolioUnlocked) {
        openUnlock(true);
        return;
      }
      setRoute(route);
    };
  });

  qs("#unlockCancelBtn").onclick = () => openUnlock(false);
  qs("#unlockModal .modalBackdrop").onclick = () => openUnlock(false);
  qs("#unlockSkipBtn").onclick = () => runUnlockSequence();
}

function setRoute(route) {
  state.route = route;
  qsa(".navBtn").forEach(b => b.classList.toggle("active", b.dataset.route === route));
  qsa(".view").forEach(v => v.classList.add("hidden"));
  qs(`#view-${route}`).classList.remove("hidden");
}

function openUnlock(open) {
  qs("#unlockModal").classList.toggle("hidden", !open);
  if (open) {
    qs("#unlockBig").textContent = "Unlocking…";
    qs("#unlockSub").textContent = "Initializing secure connection.";
    qs("#unlockBar").style.width = "0%";
    qs("#unlockSteps").innerHTML = "";
    toast("Portfolio requires one-time verification…");
  }
}

function addStep(text, ok=false) {
  const el = document.createElement("div");
  el.className = "step" + (ok ? " ok" : "");
  el.textContent = text;
  qs("#unlockSteps").appendChild(el);
}

function runUnlockSequence() {
  const her = state.profile.name;
  const steps = [
    { t: "Connecting to Heart Network…", ok: false, p: 18 },
    { t: `Distance check: ${LDR_DISTANCE_KM} km • still connected ✅`, ok: true, p: 36 },
    { t: "Verifying loyalty signature… ✅", ok: true, p: 56 },
    { t: "Validating respect protocols… ✅", ok: true, p: 74 },
    { t: `Confirming long-term bias: ${her}/FOREVER ✅`, ok: true, p: 92 },
    { t: "Unlock complete ✅", ok: true, p: 100 },
  ];

  qs("#unlockSteps").innerHTML = "";
  qs("#unlockBig").textContent = "Portfolio Unlock";
  qs("#unlockSub").textContent = "Running verification checks…";

  let idx = 0;
  const timer = setInterval(() => {
    const s = steps[idx];
    addStep(s.t, s.ok);
    qs("#unlockBar").style.width = `${s.p}%`;
    idx++;

    if (idx >= steps.length) {
      clearInterval(timer);
      setTimeout(() => {
        state.portfolioUnlocked = true;
        openUnlock(false);
        setRoute("portfolio");

        toast(`Unlocked ✅  ${her}, open your portfolio… ❤️`);
        confettiBurst(2.2);

        BASE_MEMORIES.push({
          side: "UNLOCK",
          pair: `${her.toUpperCase()}/FOREVER`,
          price: state.lastPrice ?? 138,
          memory: "Portfolio unlocked — the only long-term investment.",
        });
        renderMemories(BASE_MEMORIES);
      }, 520);
    }
  }, 520);
}

/** ---------- Watchlist ---------- */
function bindWatchlist() {
  renderWatchlist();
}

function renderWatchlist() {
  const el = qs("#watchlist");
  el.innerHTML = "";

  ASSETS.forEach(a => {
    const item = document.createElement("div");
    item.className = "wItem" + (a.pair === state.selected.pair ? " active" : "");

    const left = document.createElement("div");
    left.innerHTML = `<div class="wPair">${a.pair}</div><div class="wSub">${a.desc}</div>`;

    const right = document.createElement("div");
    right.innerHTML = `<div class="wPrice" data-wprice="${a.pair}">—</div><div class="wDelta muted" data-wdelta="${a.pair}">—</div>`;

    item.appendChild(left);
    item.appendChild(right);

    item.onclick = () => {
      state.selected = a;
      renderWatchlist();
      updateHeaderForSelected();
      initSeries();
      refreshChart();
      toast(`Switched to ${a.pair}`);
    };

    el.appendChild(item);
  });
}

function updateHeaderForSelected() {
  qs("#pairTitle").textContent = state.selected.pair;
  qs("#pairSub").innerHTML = `Support level: <span class="hl">${escapeHtml(state.profile.name || "you")}</span>`;
}

/** ---------- Chart ---------- */
function initSeries() {
  state.series = [];
  state.labels = [];

  const base = state.selected.base;
  const now = Date.now();

  for (let i = 24; i >= 0; i--) {
    const t = new Date(now - i * 60_000);
    state.labels.push(formatTime(t));

    const drift = (Math.random() - 0.5) * state.selected.vol;
    const price = (i === 24) ? base : (state.series[state.series.length - 1] + drift);
    state.series.push(round2(price));
  }
  state.lastPrice = state.series[state.series.length - 1];
}

function initChart() {
  const ctx = qs("#chart");
  state.chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: state.labels,
      datasets: [{
        label: state.selected.pair,
        data: state.series,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "rgba(154,167,189,.75)", maxTicksLimit: 6 }, grid: { color: "rgba(31,42,58,.35)" } },
        y: { ticks: { color: "rgba(154,167,189,.75)" }, grid: { color: "rgba(31,42,58,.35)" } }
      }
    }
  });
}

function refreshChart() {
  state.chart.data.labels = state.labels;
  state.chart.data.datasets[0].data = state.series;
  state.chart.data.datasets[0].label = state.selected.pair;
  state.chart.update();
}

function tick() {
  const last = state.lastPrice ?? state.selected.base;
  const shock = (Math.random() - 0.5) * state.selected.vol;
  let next = last + shock;

  const min = state.selected.base * 0.75;
  const max = state.selected.base * 1.35;
  if (next < min) next = min + Math.random();
  if (next > max) next = max - Math.random();

  state.lastPrice = round2(next);

  state.series.push(state.lastPrice);
  state.series.shift();

  const t = new Date();
  state.labels.push(formatTime(t));
  state.labels.shift();

  refreshChart();
  updateLiveNumbers();
}

function updateLiveNumbers() {
  const price = state.lastPrice;
  const prev = state.series[state.series.length - 2] ?? price;
  const delta = price - prev;
  const pct = prev ? (delta / prev) * 100 : 0;

  qs("#pairPrice").textContent = price.toFixed(2);

  const dEl = qs("#pairDelta");
  dEl.textContent = `${delta >= 0 ? "+" : ""}${delta.toFixed(2)} (${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%)`;
  dEl.classList.toggle("green", delta >= 0);
  dEl.classList.toggle("red", delta < 0);

  const hugIndex = clamp(80 + Math.sin(Date.now() / 3500) * 10 + Math.random() * 6, 60, 110);
  const kissLiq  = clamp(900 + Math.cos(Date.now() / 4000) * 120 + Math.random() * 60, 600, 1400);
  const laughVol = clamp(1.2 + Math.random() * 2.8, 0.6, 4.5);
  const attention= clamp(62 + Math.sin(Date.now() / 5000) * 12 + Math.random() * 4, 35, 90);
  const rsi      = calcRSI(state.series, 14);

  qs("#mHug").textContent = hugIndex.toFixed(1);
  qs("#mKiss").textContent = kissLiq.toFixed(0);
  qs("#mLaugh").textContent = laughVol.toFixed(2);
  qs("#mAttention").textContent = attention.toFixed(1) + "%";
  qs("#mRsi").textContent = Math.round(rsi);

  ASSETS.forEach(a => {
    const wP = document.querySelector(`[data-wprice="${a.pair}"]`);
    const wD = document.querySelector(`[data-wdelta="${a.pair}"]`);
    if (!wP || !wD) return;

    const p = (a.pair === state.selected.pair)
      ? price
      : round2(a.base + (Math.random() - 0.5) * a.vol * 3);

    const dd = (Math.random() - 0.5) * 0.9;
    wP.textContent = p.toFixed(2);
    wD.textContent = `${dd >= 0 ? "+" : ""}${dd.toFixed(2)}%`;
    wD.classList.toggle("green", dd >= 0);
    wD.classList.toggle("red", dd < 0);
  });

  const footer = qs("#chartFooter");
  const her = state.profile.name;
  const lines = [
    `“Even ${LDR_DISTANCE_KM} km can’t change the trend: choosing you.”`,
    "“I don’t chase pumps. I protect what’s real.”",
    "“The only thing I want to compound is us.”",
    `“${her} is my favorite signal.”`
  ];
  footer.textContent = lines[Math.floor(Date.now() / 7000) % lines.length];
}

/** ---------- Memory Ledger ---------- */
function renderMemories(list) {
  const tb = qs("#historyTbody");
  tb.innerHTML = "";
  const rows = [...list].reverse();

  rows.forEach((m) => {
    const tr = document.createElement("tr");
    const time = formatTime(new Date());
    const sideClass = (m.side === "BUY" || m.side === "ADD") ? "green" : (m.side === "SELL" ? "red" : "");
    tr.innerHTML = `
      <td class="muted">${time}</td>
      <td class="${sideClass}" style="font-weight:900">${escapeHtml(m.side)}</td>
      <td style="font-weight:900">${escapeHtml(m.pair)}</td>
      <td>${Number(m.price).toFixed(2)}</td>
      <td>${escapeHtml(m.memory)}</td>
    `;
    tb.appendChild(tr);
  });
}

/** ---------- WhatsApp Helpers ---------- */
function openWhatsApp(number, message) {
  if (!number || number.includes("000000")) {
    toast("Set your WhatsApp number in app.js first.");
    return;
  }
  // IMPORTANT: WhatsApp cannot be auto-sent; user taps Send. That's the intended surprise.
  const url = `https://wa.me/${encodeURIComponent(number)}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function markSentAndMaybeUnlockSecret() {
  state.flags.sentCount += 1;
  saveFlags(state.flags);
  refreshSecretSection();
}

function refreshSecretSection() {
  const unlocked = state.flags.sentCount >= 1;
  qs("#secretSection").style.display = unlocked ? "" : "none";
}

/** ---------- Valentine Actions (Hug/Kiss/Love) ---------- */
function bindValentineActions() {
  qs("#btnHug").onclick = () => sendValentine("HUG");
  qs("#btnKiss").onclick = () => sendValentine("KISS");
  qs("#btnLove").onclick = () => sendValentine("LOVE");
}

function sendValentine(type) {
  const her = state.profile.name || "Shona";

  const templates = {
    HUG: `🤗 *Hug Delivered*\n\nI wish I could hug you for real… but until then, take this one.\n\n— ${her}`,
    KISS: `💋 *Kiss Delivered*\n\nA soft kiss from far away… just to remind you you’re loved.\n\n— ${her}`,
    LOVE: `❤️ *Message from my heart*\n\nI love you. Not casually. Not temporarily.\n\nEven ${LDR_DISTANCE_KM} km can’t change that.\n\n— ${her}`
  };

  const pair = type === "HUG" ? "HUG/USDT" : type === "KISS" ? "KISS/USDT" : "CARE/USDT";
  const memory = type === "LOVE"
    ? "WhatsApp love message prepared (tap Send) ❤️"
    : `WhatsApp surprise prepared: ${type} (tap Send)`;

  BASE_MEMORIES.push({ side: "SEND", pair, price: state.lastPrice ?? 100, memory });
  renderMemories(BASE_MEMORIES);

  toast("Opening WhatsApp with your message…");
  if (type === "LOVE") confettiBurst(1.4);

  openWhatsApp(WHATSAPP_NUMBER, templates[type] || templates.LOVE);

  markSentAndMaybeUnlockSecret();
}

/** ---------- Panic Button (Need You Now) ---------- */
function bindPanic() {
  qs("#panicBtn").onclick = () => {
    const her = state.profile.name || "Shona";
    const msg = `🚨 *Need You Now*\n\nI’m not okay right now. Can you talk to me?\n\n— ${her}`;
    BASE_MEMORIES.push({ side: "ALERT", pair: "CARE/USDT", price: state.lastPrice ?? 100, memory: "Emergency message prepared (Need You Now)" });
    renderMemories(BASE_MEMORIES);
    toast("Opening WhatsApp emergency message…");
    openWhatsApp(WHATSAPP_NUMBER, msg);
  };
}

/** ---------- Mood Buttons ---------- */
function bindMood() {
  qs("#moodMiss").onclick = () => moodAction("MISS");
  qs("#moodStress").onclick = () => moodAction("STRESS");
  qs("#moodHappy").onclick = () => moodAction("HAPPY");
}

function moodAction(kind) {
  const her = state.profile.name || "Shona";

  const moodCopy = {
    MISS: {
      toast: "Signal received: Miss You 🥺",
      msg: `🥺 *I miss you*\n\nJust wanted to tell you… I miss you a lot.\n\nEven ${LDR_DISTANCE_KM} km can’t stop me from choosing you.\n\n— ${her}`,
      ledger: "Mood mode: I miss you"
    },
    STRESS: {
      toast: "Signal received: Stress 😵",
      msg: `😵 *I’m stressed*\n\nCan you give me a calm minute with you?\n\nYour voice is my safest place.\n\n— ${her}`,
      ledger: "Mood mode: I’m stressed"
    },
    HAPPY: {
      toast: "Signal received: Happy 😊",
      msg: `😊 *I’m happy*\n\nI’m smiling because of you.\n\nThank you for existing in my life.\n\n— ${her}`,
      ledger: "Mood mode: I’m happy"
    }
  };

  const c = moodCopy[kind] || moodCopy.MISS;

  BASE_MEMORIES.push({ side: "SIGNAL", pair: "LAUGH/USDT", price: state.lastPrice ?? 100, memory: c.ledger });
  renderMemories(BASE_MEMORIES);

  toast(c.toast);
  openWhatsApp(WHATSAPP_NUMBER, c.msg);

  markSentAndMaybeUnlockSecret();
}

/** ---------- Secret Button ---------- */
function bindSecret() {
  qs("#secretBtn").onclick = () => openSecret(true);
  qs("#secretCloseBtn").onclick = () => openSecret(false);
  qs("#secretModal .modalBackdrop").onclick = () => openSecret(false);
  qs("#secretConfettiBtn").onclick = () => confettiBurst(2.6);
}

function openSecret(open) {
  qs("#secretModal").classList.toggle("hidden", !open);
  if (open) {
    const her = state.profile.name || "Shona";
    qs("#secretBig").textContent = "You just proved it.";
    qs("#secretMid").textContent = `${her}, you are my home — even from ${LDR_DISTANCE_KM} km away.`;
    qs("#secretSmall").textContent = "Not a temporary feeling. A decision — daily.";
    toast("Hidden gift opened 🔓");
    confettiBurst(1.8);

    if (!state.flags.secretUsed) {
      state.flags.secretUsed = true;
      saveFlags(state.flags);
      BASE_MEMORIES.push({ side: "REVEAL", pair: `${her.toUpperCase()}/FOREVER`, price: 138, memory: "Hidden gift revealed — “You are my home.”" });
      renderMemories(BASE_MEMORIES);
    }
  }
}

/** ---------- Certificate ---------- */
function bindCertificate() {
  qs("#certificateBtn").onclick = () => openCert(true);
  qs("#certCloseBtn").onclick = () => openCert(false);
  qs("#certModal .modalBackdrop").onclick = () => openCert(false);

  qs("#certFullscreenBtn").onclick = () => {
    // Fullscreen the certificate card only
    const card = qs("#certCard");
    if (card.requestFullscreen) card.requestFullscreen();
    toast("Fullscreen opened. Take a screenshot to keep it.");
  };
}

function openCert(open) {
  qs("#certModal").classList.toggle("hidden", !open);
  if (open) {
    const her = state.profile.name || "Shona";
    qs("#certAsset").textContent = `${her.toUpperCase()}/FOREVER`;
    qs("#certQuote").textContent = `“${her}, you are my only long-term investment.”`;
    qs("#certSig").textContent = CEO_SIGNATURE;
    toast("Certificate ready. Screenshot-worthy ✅");
  }
}

/** ---------- Mini Game: Catch the Hearts ---------- */
function bindGame() {
  qs("#gameBtn").onclick = () => openGame(true);
  qs("#gameCloseBtn").onclick = () => openGame(false);
  qs("#gameModal .modalBackdrop").onclick = () => openGame(false);
  qs("#gameStartBtn").onclick = () => startGame();
}

function openGame(open) {
  qs("#gameModal").classList.toggle("hidden", !open);
  if (open) {
    qs("#gameResult").classList.add("hidden");
    qs("#gameScore").textContent = "0";
    qs("#gameTime").textContent = "10";
    toast("Game ready: catch hearts for 10 seconds.");
  } else {
    state.gameRunning = false;
  }
}

function startGame() {
  if (state.gameRunning) return;

  const canvas = qs("#gameCanvas");
  const ctx = canvas.getContext("2d");

  // fit logic (keeps internal resolution)
  const W = canvas.width;
  const H = canvas.height;

  let basketX = W / 2;
  const basketW = 110;
  const basketH = 16;

  let hearts = [];
  let score = 0;
  let timeLeft = 10.0;
  state.gameRunning = true;

  // Input
  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    basketX = clamp(x * (W / rect.width), basketW/2, W - basketW/2);
  };

  canvas.onmousemove = onMove;
  canvas.ontouchmove = (e) => { e.preventDefault(); onMove(e); };

  // spawn hearts
  function spawn() {
    hearts.push({
      x: Math.random() * (W - 20) + 10,
      y: -20,
      vy: 120 + Math.random() * 140,
      r: 10 + Math.random() * 6
    });
  }

  // loop
  let last = performance.now();
  let spawnAcc = 0;

  function draw(dt) {
    ctx.clearRect(0,0,W,H);

    // background glow
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0,0,W,H);

    // basket
    ctx.fillStyle = "rgba(240,185,11,0.85)";
    ctx.fillRect(basketX - basketW/2, H - 40, basketW, basketH);
    ctx.fillStyle = "rgba(71,215,255,0.65)";
    ctx.fillRect(basketX - basketW/2, H - 36, basketW, 6);

    // hearts
    ctx.font = "20px Inter, sans-serif";
    hearts.forEach(h => {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText("❤️", -10, 8);
      ctx.restore();
    });

    // update
    hearts.forEach(h => { h.y += h.vy * dt; });

    // collisions
    const basketY = H - 40;
    hearts = hearts.filter(h => {
      const hit = h.y >= basketY - 10 && h.y <= basketY + basketH + 10 &&
                  h.x >= (basketX - basketW/2) && h.x <= (basketX + basketW/2);

      if (hit) {
        score += 1;
        qs("#gameScore").textContent = String(score);
        return false;
      }
      return h.y < H + 30;
    });

    // timer
    timeLeft -= dt;
    qs("#gameTime").textContent = String(Math.max(0, Math.ceil(timeLeft)));
  }

  function loop(now) {
    if (!state.gameRunning) return;
    const dt = Math.min(0.03, (now - last) / 1000);
    last = now;

    spawnAcc += dt;
    if (spawnAcc > 0.32) {
      spawnAcc = 0;
      spawn();
    }

    draw(dt);

    if (timeLeft <= 0) {
      state.gameRunning = false;

      // Result reveal
      const her = state.profile.name || "Shona";
      const result = qs("#gameResult");
      const big = qs("#gameBig");
      const small = qs("#gameSmall");

      result.classList.remove("hidden");

      if (score >= 14) {
        big.textContent = "Happy Valentine’s Day ❤️";
        small.textContent = `Score ${score}. ${her}, you’re the best signal I’ve ever followed.`;
        confettiBurst(2.0);
      } else {
        big.textContent = "Valentine Mode: Still Winning ❤️";
        small.textContent = `Score ${score}. ${her}, I’d still choose you — every time.`;
      }

      BASE_MEMORIES.push({ side: "GAME", pair: "LAUGH/USDT", price: 55, memory: `Caught hearts score: ${score}` });
      renderMemories(BASE_MEMORIES);

      return;
    }

    requestAnimationFrame(loop);
  }

  toast("Go! Catch hearts ❤️");
  requestAnimationFrame(loop);
}

/** ---------- Audit + Voice ---------- */
function bindAudit() {
  qs("#auditBtn").onclick = () => openAudit(true);
  qs("#closeAuditBtn").onclick = () => openAudit(false);
  qs("#auditModal .modalBackdrop").onclick = () => openAudit(false);
}
function openAudit(open) {
  qs("#auditModal").classList.toggle("hidden", !open);
  if (open) toast("Audit opened: verifying the best asset on this exchange…");
}

function bindVoice() {
  const voice = new Audio("voice.mp3"); // optional file in same folder
  const playBtn = qs("#playVoiceBtn");

  playBtn.onclick = async () => {
    try {
      await voice.play();
      state.voicePlayed = true;
      playBtn.textContent = "Played ✅";
      toast(`I’m proud of you, ${state.profile.name}.`);
      BASE_MEMORIES.push({ side: "VOICE", pair: "CARE/USDT", price: 140, memory: "Voice note played ✅" });
      renderMemories(BASE_MEMORIES);
    } catch {
      toast("Tap again to allow audio playback.");
    }
  };
}

/** ---------- Settings ---------- */
function bindSettings() {
  qs("#saveNameBtn").onclick = () => {
    const n = qs("#settingsName").value.trim();
    if (!n) return toast("Name cannot be empty.");

    state.profile.name = n;
    saveProfile(state.profile);

    qs("#userChip").textContent = `For: ${state.profile.name}`;
    qs("#holdingSymbol").textContent = `${state.profile.name.toUpperCase()}/FOREVER`;
    qs("#killerBigLine").textContent = `${state.profile.name}, you are my only long-term investment.`;

    qs("#unlockBadge").textContent = `${state.profile.name.toUpperCase()}/FOREVER`;
    qs("#certAsset").textContent = `${state.profile.name.toUpperCase()}/FOREVER`;
    qs("#certQuote").textContent = `“${state.profile.name}, you are my only long-term investment.”`;

    updateHeaderForSelected();
    toast("Name updated.");
  };

  qs("#resetBtn").onclick = () => {
    localStorage.removeItem(LS_PROFILE);
    localStorage.removeItem(LS_FLAGS);
    location.reload();
  };
}

/** ---------- Confetti (simple local canvas) ---------- */
function confettiBurst(seconds=1.6) {
  const canvas = qs("#confetti");
  const ctx = canvas.getContext("2d");
  canvas.classList.remove("hidden");

  // resize
  canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * devicePixelRatio);

  const W = canvas.width;
  const H = canvas.height;

  const parts = [];
  const N = 160;

  for (let i=0;i<N;i++){
    parts.push({
      x: Math.random() * W,
      y: -Math.random() * H * 0.2,
      vx: (Math.random()-0.5) * 200,
      vy: 220 + Math.random() * 360,
      r: 3 + Math.random() * 6,
      a: 0.7 + Math.random() * 0.3,
      spin: (Math.random()-0.5) * 8,
      rot: Math.random() * Math.PI * 2
    });
  }

  let t = 0;
  let last = performance.now();

  function frame(now){
    const dt = Math.min(0.03, (now-last)/1000);
    last = now;
    t += dt;

    ctx.clearRect(0,0,W,H);

    parts.forEach(p => {
      p.x += p.vx * dt * devicePixelRatio;
      p.y += p.vy * dt * devicePixelRatio;
      p.vy += 40 * dt * devicePixelRatio;
      p.rot += p.spin * dt;

      // draw (no fixed colors required; use white-ish)
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(-p.r, -p.r, p.r*2, p.r*2);
      ctx.restore();
    });

    if (t < seconds) requestAnimationFrame(frame);
    else canvas.classList.add("hidden");
  }

  requestAnimationFrame(frame);
}

/** ---------- Helpers ---------- */
let toastTimer = null;
function toast(msg) {
  const t = qs("#toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 2400);
}
function round2(n){ return Math.round(n * 100) / 100; }
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function formatTime(d){
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${hh}:${mm}`;
}
function calcRSI(series, period=14){
  if (!series || series.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = series.length - period; i < series.length; i++){
    const diff = series[i] - series[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return clamp(rsi, 0, 100);
}
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/** ---------- Kickoff ---------- */
runBoot();
