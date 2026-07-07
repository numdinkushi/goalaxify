export const VAPI_CONFIG = {
  baseUrl: "https://api.vapi.ai",
  apiKey: process.env.VAPI_API_KEY || "",
  webhookSecret: process.env.VAPI_WEBHOOK_SECRET || "",
} as const;

export function getBoothAssistantId(): string {
  return (
    process.env.NEXT_PUBLIC_VAPI_BOOTH_ASSISTANT_ID ||
    process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ||
    ""
  );
}

export function getPublicVapiToken(): string {
  return process.env.NEXT_PUBLIC_VAPI_WEBTOKEN || "";
}

/** Must match the LLM configured on your Vapi booth assistant. */
export function getVapiModelProvider(): string {
  const provider = process.env.NEXT_PUBLIC_VAPI_MODEL_PROVIDER?.trim();
  if (provider) return provider;
  return "openai";
}

export function getVapiModelName(): string {
  const model = process.env.NEXT_PUBLIC_VAPI_MODEL_NAME?.trim();
  if (model) return model;
  return "gpt-4.1";
}
