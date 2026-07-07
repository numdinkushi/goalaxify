export function parseVapiError(error: unknown): string {
  if (!error) return "Call failed";

  if (typeof error === "string") return error;

  if (error instanceof Error) {
    return parseVapiError(error.message);
  }

  if (typeof error === "object") {
    const obj = error as Record<string, unknown>;

    if (obj.error !== undefined) {
      const nested = parseVapiError(obj.error);
      if (nested !== "Call failed") {
        return nested;
      }
    }

    if (Array.isArray(obj.message) && obj.message.length > 0) {
      return obj.message.map(String).join(" ");
    }

    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.errorMsg === "string") return obj.errorMsg;
  }

  return "Call failed";
}

export function formatVapiUserMessage(message: string): string {
  const lower = message.toLowerCase();

  if (
    lower.includes("bad request") ||
    lower.includes("assistantoverrides.model.provider")
  ) {
    return "Voice booth model config is invalid. Set NEXT_PUBLIC_VAPI_MODEL_PROVIDER=openai and NEXT_PUBLIC_VAPI_MODEL_NAME=gpt-4.1 in your env.";
  }

  if (lower.includes("ejection") || lower.includes("eject")) {
    return "Voice session was interrupted before it connected. Close other Goalaxify tabs, wait a few seconds, then tap Manage bet by voice again.";
  }

  if (isMicPermissionError(message)) {
    return "Microphone access is required. Allow mic permission in your browser, then try again.";
  }

  if (isVapiBillingError(message)) {
    return "Voice booth credits are exhausted. Add credits at dashboard.vapi.ai, then try again.";
  }

  if (
    lower.includes("next_public_vapi") ||
    lower.includes("not configured") ||
    lower.includes("assistant id")
  ) {
    return "Voice booth is not configured on this environment.";
  }

  if (lower.includes("already-started") || lower.includes("already started")) {
    return "A voice session is already starting. Wait a moment, then try again.";
  }

  if (lower.includes("meeting has ended") || lower.includes("meeting ended")) {
    return "Voice session ended before connecting. Wait a few seconds, then try again.";
  }

  if (message.length > 180) {
    return "Voice session failed to connect. Try again in a moment.";
  }

  return message;
}

export function isMicPermissionError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("permission denied") ||
    lower.includes("not-allowed") ||
    lower.includes("microphone permission") ||
    lower.includes("microphone access required")
  );
}

export function isVapiBillingError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("wallet balance") ||
    lower.includes("balance is 0") ||
    lower.includes("purchase credits") ||
    lower.includes("insufficient credits")
  );
}

export function isVapiSessionInterruptedError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("ejection") || lower.includes("eject");
}

/** Only suppress errors we intentionally caused while replacing a call. */
export function isIntentionalVapiTeardownError(
  message: string,
  intentionalStop: boolean,
): boolean {
  if (!intentionalStop) {
    return false;
  }

  const lower = message.toLowerCase();
  return (
    lower.includes("meeting has ended") ||
    lower.includes("meeting ended")
  );
}
