import { DurableObject } from "cloudflare:workers";

export interface Env {
  AI: Ai;
  CHAT_MEMORY: DurableObjectNamespace;
  ASSETS: Fetcher;
}

type Role = "system" | "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
};

const SYSTEM_PROMPT =
  "You are a concise, helpful Cloudflare AI assignment assistant. Give practical and short answers.";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/chat") {
      return handleChat(request, env);
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "cf_ai_assignment_chat" });
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleChat(request: Request, env: Env): Promise<Response> {
  let payload: { sessionId?: string; message?: string };
  try {
    payload = (await request.json()) as { sessionId?: string; message?: string };
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const sessionId = payload.sessionId?.trim();
  const userMessage = payload.message?.trim();

  if (!sessionId || !userMessage) {
    return json({ error: "sessionId and message are required" }, 400);
  }

  const id = env.CHAT_MEMORY.idFromName(sessionId);
  const stub = env.CHAT_MEMORY.get(id);

  const historyResponse = await stub.fetch("https://memory/get");
  const history = (await historyResponse.json()) as ChatMessage[];

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userMessage },
  ];

  const model = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  const aiResponse = await env.AI.run(model, { messages });
  const assistantText = extractText(aiResponse);

  await stub.fetch("https://memory/add", {
    method: "POST",
    body: JSON.stringify([
      { role: "user", content: userMessage },
      { role: "assistant", content: assistantText },
    ] satisfies ChatMessage[]),
  });

  return json({ reply: assistantText });
}

function extractText(aiResponse: unknown): string {
  if (
    typeof aiResponse === "object" &&
    aiResponse !== null &&
    "response" in aiResponse &&
    typeof (aiResponse as { response?: unknown }).response === "string"
  ) {
    return (aiResponse as { response: string }).response;
  }

  return "I could not generate a response this time.";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export class ChatMemory extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/get") {
      const history = ((await this.ctx.storage.get("history")) as ChatMessage[]) ?? [];
      return json(history);
    }

    if (request.method === "POST" && url.pathname === "/add") {
      const incoming = (await request.json()) as ChatMessage[];
      const history = ((await this.ctx.storage.get("history")) as ChatMessage[]) ?? [];

      const next = [...history, ...incoming].slice(-20);
      await this.ctx.storage.put("history", next);
      return json({ ok: true, size: next.length });
    }

    if (request.method === "POST" && url.pathname === "/reset") {
      await this.ctx.storage.put("history", []);
      return json({ ok: true });
    }

    return json({ error: "Not found" }, 404);
  }
}
