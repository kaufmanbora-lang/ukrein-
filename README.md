# Shield Ukraine Game

2D browser strategy game about defending Ukraine on a tactical map. The game includes economy, PVO, factories, finite equipment stocks, 2-minute resupply orders, aircraft-based rocket resupply with cargo plane markers, tanks, BTR, drones, missiles, NATO aid flights, missions, upgrades, commanders, sea-only naval units, saving, and diplomacy.

## Run Locally

```bash
npm install
npm run build
npm run dev
```

Default local URL:

```text
http://127.0.0.1:5173/
```

To use port 8787 locally:

```powershell
$env:PORT="8787"
npm run dev
```

## AI Diplomacy

The diplomacy chat uses the OpenAI API when `OPENAI_API_KEY` is set. Without the key, the game still works with an offline fallback.

Local setup:

1. Copy `.env.example` to `.env.local`.
2. Put your real key into `.env.local`:

```env
OPENAI_API_KEY=<paste-your-real-key-here>
OPENAI_MODEL=gpt-5.5
OPENAI_TEMPERATURE=0.93
```

The real `.env.local` file is ignored by Git and should not be uploaded to GitHub.

The AI is configured to answer like a human negotiator and avoid repeating the same replies, phrases, and distinctive words inside one match.

## Google Maps

Google Maps is optional. If no key is provided, the built-in tactical map is used.

To enable it:

1. Create a Google Maps JavaScript API browser key.
2. Set `GOOGLE_MAPS_API_KEY` locally or in Render.
3. Restrict the key to your Render/GitHub Pages domain.

## Render

This repo is ready for Render with `render.yaml`.

Required Render environment variable for live AI:

```text
OPENAI_API_KEY
```

Optional Render environment variables:

```text
OPENAI_MODEL=gpt-5.5
OPENAI_TEMPERATURE=0.93
GOOGLE_MAPS_API_KEY=
```

Build command:

```bash
npm run build
```

Start command:

```bash
npm start
```

Health check:

```text
/api/ai-status
```

## GitHub Pages

GitHub Pages can host the static files, but it cannot run `/api/diplomacy`. For live AI diplomacy, deploy to Render or another Node server.

## Checks

```bash
npm run check
```

This verifies JavaScript syntax for the app and server files.
