# Deploy To GitHub And Render

## 1. GitHub

Create a new GitHub repository, then from this folder run:

```bash
git init
git add .
git commit -m "Prepare Shield Ukraine game for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Do not commit `.env`, `.env.local`, or any file containing a real API key.

## 2. Render Blueprint

This project includes `render.yaml`. In Render:

1. Open **Blueprints**.
2. Connect your GitHub repo.
3. Render will read `render.yaml`.
4. Fill the secret environment variables.
5. Apply the Blueprint.

Required secret:

```text
OPENAI_API_KEY
```

Optional:

```text
GOOGLE_MAPS_API_KEY
OPENAI_MODEL=gpt-5.5
OPENAI_TEMPERATURE=0.93
```

## 3. Render Manual Service

If you do not use Blueprint, create a Node web service manually:

```text
Build Command: npm run build
Start Command: npm start
Health Check Path: /api/ai-status
```

Add these environment variables in Render:

```text
NODE_VERSION=22
OPENAI_API_KEY=your secret key
OPENAI_MODEL=gpt-5.5
OPENAI_TEMPERATURE=0.93
GOOGLE_MAPS_API_KEY=optional
```

## 4. Check Live AI

After deploy, open:

```text
https://YOUR_RENDER_APP.onrender.com/api/ai-status
```

Expected with key:

```json
{"live":true,"source":"openai","model":"gpt-5.5"}
```

Expected without key:

```json
{"live":false,"source":"fallback","model":"offline-fallback"}
```

## 5. Local AI Setup

Copy:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and set:

```text
OPENAI_API_KEY=<paste-your-real-key-here>
```

Run:

```bash
npm run build
npm run dev
```
