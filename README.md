# Krishi Mitra — Agricultural Intelligence Platform

A voice-and-SMS agricultural intelligence platform for small and marginal
farmers, covering **all 36 Indian states/UTs and 739 districts**, in
**6 languages** (English, Hindi, Telugu, Tamil, Kannada, Marathi).

Three modules:
1. **Crop Recommendation Engine** — rule-based scoring against 19 crops using
   soil type, pH, rainfall, groundwater depth, and season, with a
   district-based regional soil default.
2. **Weather Advisory & Dry-Spell Alerts** — 7-day forecast per district with
   automatic dry-spell detection and irrigation/fertilizer guidance.
3. **AI Crop Health Logging** — photo + voice description → real AI diagnosis
   (via Claude), with escalation to expert follow-up (ticket + SMS preview).

Plus a floating **Voice Help** assistant (AI chat with speech in/out) and
full UI language switching.

---

## Project layout

```
krishi-mitra-app/
├── backend/     Node/Express API (crop engine, advisory, AI diagnosis, chat, tickets)
└── frontend/    React (Vite) UI
```

## 1. Run it locally

### Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit .env and add your ANTHROPIC_API_KEY
npm start                  # listens on http://localhost:4000
```

Get a key at https://console.anthropic.com/ — without it, everything works
**except** AI crop diagnosis and Voice Help, which will show a clear error
telling you the key is missing.

### Frontend (development)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173, proxies /api to :4000
```

### Frontend (production build served by the backend)

```bash
cd frontend
npm install
npm run build                # outputs frontend/dist
cd ../backend
npm start                    # now also serves the built frontend at :4000
```

With this, **a single running process (the backend) serves the whole app** —
useful for the simplest possible deployment.

---

## 2. Deploying it for real

Any host that runs Node 18+ works. Two common paths:

### Option A — one service (simplest)
Deploy the `backend/` folder to a Node host (Render, Railway, Fly.io, a VPS,
etc.), after running `npm run build` inside `frontend/` so `frontend/dist`
exists. Set the `ANTHROPIC_API_KEY` environment variable in your host's
dashboard. The backend serves both the API and the built frontend.

### Option B — split hosting
Deploy `backend/` as an API service (Render/Railway/Fly/EC2) and `frontend/`
as a static site (Vercel/Netlify/Cloudflare Pages, build command
`npm run build`, output dir `dist`). Point the frontend at your API by
changing `BASE` in `frontend/src/api.js` to your backend's public URL, or by
configuring your static host to proxy `/api/*` to it.

### Environment variables (backend)
| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | For AI diagnosis + Voice Help | https://console.anthropic.com/ |
| `PORT` | No (default 4000) | |

### Data persistence
Tickets are stored in `backend/db/tickets.json`, a simple file-backed store —
fine for a demo or small deployment, but it will not survive redeploys on
most serverless/ephemeral platforms. For real production use, swap
`backend/db/store.js` for Postgres/MongoDB — every function in that file is
small enough to reimplement against a real database without touching the
routes that call it.

---

## 3. What's real vs. simulated

| Piece | Status |
|---|---|
| Crop recommendation engine | Real rule-based logic, runs on the server |
| Weather forecast | Seeded/simulated per district — swap for IMD or another weather API for production |
| AI crop diagnosis (photo + voice) | **Real**, calls Claude live via your API key |
| Voice Help assistant | **Real**, calls Claude live via your API key |
| Speech-to-text / text-to-speech | Real, via the browser's Web Speech API (Chrome recommended; support varies by browser) |
| SMS delivery | **Simulated** — shown as an in-app message preview, since real delivery needs a licensed telecom gateway (Twilio, Gupshup, or a government partner) |
| States/districts data | Real district names (739 districts, 36 states/UTs), patched for Telangana, Andhra Pradesh, and the J&K/Ladakh split against official sources — verify against your state portal before relying on it officially |
| Soil type per district | A broad **regional default**, not soil-test data — replace with ICAR/SoilGrids/state soil health card data for real deployments |
| Rythu Seva Kendra / KVK contact | Real national **Kisan Call Centre** number (1800-180-1551); Telangana additionally references its own Rythu Seva Kendra scheme. No per-office phone numbers are fabricated. |

## 4. Production roadmap
- ISRO Bhuvan / SoilGrids for real soil and satellite layers
- IMD or a district-level weather API for real forecasts
- IoT ground-moisture sensors
- A licensed SMS/IVR gateway (Gupshup, Twilio, or a government telecom partner)
- A trained crop-disease vision model, with the Kisan Call Centre / KVK
  network as the human fallback for anything the AI is unsure about
- A real database (Postgres/MongoDB) instead of the file-backed ticket store
