# AI Maturity Dashboard

Interactive dashboard for comparing country-level AI maturity across three equally weighted pillars:

- Policy and governance
- Infrastructure
- Digital skills

The frontend is built with React, TypeScript, Vite and Tailwind. The data is generated from Excel files into `src/data/generated/countryProfiles.ts`. The chat page uses a local Express server as a safe proxy to the OpenAI API, so the API key never reaches the browser.

## Requirements

- Node.js 20+
- npm
- An OpenAI API key for the chat feature

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and add your real OpenAI API key:

```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

## Generate data

Run this whenever the Excel files under `data/` change:

```bash
npm run generate:data
```

## Run the dashboard

Terminal 1:

```bash
npm run dev
```

Terminal 2:

```bash
npm run chat:api
```

Then open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The chat page is available from the sidebar under **Data Chat**.

## Verify the chat server

With `npm run chat:api` running, open:

```text
http://localhost:8787/api/health
```

You should receive a JSON response with `ok: true`.

## Build

```bash
npm run build
```

## Security notes

Do not commit or share `.env`. The `.gitignore` file excludes `.env` and `.env.*` while keeping `.env.example` as a safe template.

Do not commit or share `node_modules`. Install dependencies with `npm install` instead.
