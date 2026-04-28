# PROMPTS

This file records AI prompts used during development, as requested by the assignment.

## Prompt 1 - project scaffold

"Create a Cloudflare AI-powered assignment project with:
- Workers AI using Llama 3.3
- Worker + Durable Object for coordination and state
- Chat-based user input
- A simple frontend page that calls `/api/chat`
- Production-ready README and local/deploy instructions."

## Prompt 2 - endpoint behavior

"Implement a POST `/api/chat` API that accepts `sessionId` and `message`, fetches previous conversation history from Durable Objects, calls Workers AI, and stores the new conversation turns."

## Prompt 3 - submission checklist

"Ensure the repo includes:
- `README.md` with clear setup and run steps
- `PROMPTS.md` showing prompts used
- clear mapping of assignment requirements to project components."
