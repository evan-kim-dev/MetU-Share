/**
 * Unified AI chat client (Next + OpenAI via lib/ai/gemini.ts). No FastAPI/Render.
 */

import "server-only";

import type { AiMode } from "@/lib/ai/contracts";
import { AiInputError, runInsight } from "@/lib/ai/insight";

export type AiChatResult = {
  content: string;
  source: string;
  validated: boolean;
  cached: boolean;
};

class AiChatError extends Error {
  readonly code: "unavailable" | "http" | "empty" | "fallback" | "input";

  constructor(code: AiChatError["code"], message: string) {
    super(message);
    this.name = "AiChatError";
    this.code = code;
  }
}

async function aiChat(params: {
  mode: AiMode;
  system?: string;
  prompt: string;
  clientKey?: string;
}): Promise<AiChatResult> {
  // ai_usage_log.user_id 는 uuid — 비로그인/미전달 시 고정 센티널을 써요.
  const raw = params.clientKey?.trim();
  const userId =
    raw &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)
      ? raw
      : "00000000-0000-4000-8000-000000000001";

  try {
    const result = await runInsight({
      mode: params.mode,
      prompt: params.prompt,
      system: params.system,
      userId,
    });
    const content = result.content?.trim();
    if (!content) {
      throw new AiChatError("empty", "ai-chat-empty");
    }
    return {
      content,
      source: result.source,
      validated: result.validated,
      cached: result.cached,
    };
  } catch (error) {
    if (error instanceof AiInputError) {
      throw new AiChatError("input", error.message);
    }
    if (error instanceof AiChatError) throw error;
    const msg = error instanceof Error ? error.message : "ai-error";
    if (msg === "no_api_key" || msg.includes("no_api_key")) {
      throw new AiChatError("unavailable", "openai-key-missing");
    }
    throw new AiChatError("http", msg);
  }
}

/** Soft wrapper — returns null instead of throwing (legacy silent-fallback style). */
export async function aiChatOrNull(params: {
  mode: AiMode;
  system?: string;
  prompt: string;
  clientKey?: string;
}): Promise<AiChatResult | null> {
  try {
    return await aiChat(params);
  } catch (error) {
    if (error instanceof AiChatError) {
      console.error(`[aiChatOrNull] ${params.mode}: ${error.code} ${error.message}`);
      return null;
    }
    console.error(`[aiChatOrNull] ${params.mode}:`, error);
    return null;
  }
}
