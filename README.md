# cf_ai_assignment_chat

AI-powered chat application built on Cloudflare Workers.

This project is designed to satisfy the assignment requirements:

- LLM: Uses Workers AI with Llama 3.3 (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`)
- Workflow / coordination: Worker routes + Durable Object coordination for chat sessions
- User input via chat: Browser chat UI served from Worker assets
- Memory/state: Durable Objects persist conversation history per session

## Architecture

- `public/index.html` - simple chat interface
- `src/index.ts` - Worker API (`/api/chat`) and app routing
- `ChatMemory` Durable Object - stores per-session message history

## Prerequisites

- Node.js 18+
- Cloudflare account
- `wrangler` CLI (installed via `npm install`)

## Setup

```bash
npm install
```

Authenticate Wrangler:

```bash
npx wrangler login
```

## Run locally

```bash
npm run dev
```

Open the local URL shown by Wrangler (usually `http://127.0.0.1:8787`).

## Deploy

```bash
npm run deploy
```

## API

### POST `/api/chat`

Request body:

```json
{
  "sessionId": "session-123",
  "message": "Hello"
}
```

Response body:

```json
{
  "reply": "Assistant response"
}
```

## Notes for Submission

- Ensure your repository name starts with `cf_ai_` (this example already does).
- Keep this `README.md` with clear run instructions.
- Include `PROMPTS.md` with AI prompts used during development.

## Additional Cloudflare References

- [Cloudflare Agents](https://agents.cloudflare.com/)
- [Cloudflare Workers AI docs](https://developers.cloudflare.com/workers-ai/)
- [Cloudflare Durable Objects docs](https://developers.cloudflare.com/durable-objects/)
- [Cloudflare Workers docs](https://developers.cloudflare.com/workers/)
