import OpenAI from "openai";
import { env } from "@/lib/env";

let client: OpenAI | null = null;

export function getOpenAiClient(): OpenAI | null {
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  client ??= new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  return client;
}
