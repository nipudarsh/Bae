# BAE — Digital Love Stock Market (Valentine One-Time Gift)

BAE is a **Binance-style trading dashboard** built as a **one-time Valentine surprise** for a long-distance relationship (**138 km**).  
It looks like a serious trading UI, but the “assets” are feelings: **Hug Index**, **Kiss Liquidity**, **Laugh Volatility**, **Attention Ratio**, and **Emotional Strength RSI** — with live chart simulation, unlock animations, and heartfelt reveals.

This repo is intentionally **framework-free** (pure **HTML/CSS/JS**) so it runs instantly anywhere: Windows/macOS/Linux.

---

## ⭐ What This Project Demonstrates (Skills)

- **UI/UX engineering** (trading-style layout, spacing, hierarchy)
- **Micro-interactions** (unlock animation, confetti, modals, toasts)
- **State-driven UI logic** (routing, unlock gating, conditional features)
- **Data visualization** (Chart.js live chart simulation)
- **Product storytelling** (emotion + interaction design)
- **Practical integration** (WhatsApp message prefill flows)
- **Clean, deployable static site** (GitHub Pages ready)

---

## 🔥 Features (Everything Included)

### Trading Dashboard Layer
- Binance-inspired UI layout (Markets / Portfolio / History / Settings)
- Live-simulated chart using **Chart.js**
- Live metrics:
  - Hug Index 📈
  - Kiss Liquidity 💋
  - Laugh Volatility 😂
  - Attention Ratio
  - Emotional Strength RSI

### Valentine Surprise Layer
- **Portfolio Unlock** animation (one-time “verification” flow)
- **Memory Trade Ledger** (3–6 real memories shown as trade history)
- **Confetti burst** at key moments (unlock, love send, secret reveal)
- **Valentine Certificate** (screenshot-worthy)
- **Mood Buttons**:
  - “I miss you”
  - “I’m stressed”
  - “I’m happy”
  Each shows in-app feedback + opens WhatsApp prefilled message
- **Emergency “Need You Now”** button (opens WhatsApp prefilled message)
- **Mini-game: Catch the Hearts** (10 seconds, score, Valentine reveal)
- **Secret Gift button** unlocks after first WhatsApp action

### Voice Note (Optional)
- If you add a `voice.mp3` file in the root folder, the Audit modal can play it.

---

## ✅ Quick Start (Local)

### 1) Download / Clone
bash
git clone https://github.com/nipudarsh/Bae.git
cd bae
2) Run a local server (recommended)
Option A — Python (easiest)
python -m http.server 5500
Open:
http://localhost:5500

Option B — VS Code Live Server
Install extension: Live Server

Right-click index.html → Open with Live Server

⚙️ Configuration (Must Do)
Open app.js and update:

1) Your WhatsApp number
const WHATSAPP_NUMBER = "94770000000"; // CHANGE THIS
✅ Format rules:

No +

No spaces

Sri Lanka example: 94xxxxxxxxx

2) Your signature name
const CEO_SIGNATURE = "CEO"; // change to your name/nickname
3) Replace real memories (Most important emotional upgrade)
Edit the BASE_MEMORIES array:

const BASE_MEMORIES = [
  { side: "BUY",  pair: "TIME/USDT",  price: 101.70, memory: "Bought time — that night we talked until late." },
  
  { side: "BUY",  pair: "CARE/USDT",  price: 141.20, memory: "You checked on me without me asking." },
  
  { side: "ADD",  pair: "KISS/USDT",  price: 86.90,  memory: "Goodnight call — daily close confirmed." },
  
  { side: "BUY",  pair: "LAUGH/USDT", price: 55.10,  memory: "Your laugh fixed my mood in seconds 😂" },
  
  { side: "HOLD", pair: "SHONA/FOREVER", price: 138.00, memory: "Even 138 km apart, I still choose you — daily." },
  
];

Tip: Use short + specific moments.
Specific beats poetic.

📲 WhatsApp “Auto Send” Clarification (Important)
This project opens WhatsApp with a prefilled message.

✅ The user must tap Send manually.
This is a WhatsApp limitation (and also makes the surprise more natural: she “chooses to send it” and later sees it as sent).

🎤 Add a Voice Note (Optional, recommended)
Create a file named:

voice.mp3
Place it in the project root (same folder as index.html).

Then:

Open “Audit Report”

Tap Play Voice Note

🧩 Troubleshooting
“WhatsApp link opens but doesn’t show text”
Ensure WHATSAPP_NUMBER is valid

Try without line breaks (WhatsApp sometimes collapses formatting on some devices)

“Audio doesn’t play”
Browsers block auto-play.

User must click Play Voice Note button.

“Page looks weird on mobile”
This UI is desktop-first but responsive.

Test on phone and consider increasing font size in styles.css if needed.

##🔒 Privacy / Safety
Runs locally (no backend)

No analytics

No tracking

No storage except small local settings (name + unlock flags)
