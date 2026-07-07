import {
  formatVapiUserMessage,
  isVapiSessionInterruptedError,
  parseVapiError,
} from "@/lib/vapi/parse-error";

/** Daily/Vapi SDK noise that should not hit the Next.js console error overlay. */
export function isVapiSdkNoiseMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("meeting has ended") ||
    lower.includes("meeting ended") ||
    lower.includes("ejection") ||
    lower.includes("eject") ||
    lower.includes("already-started") ||
    lower.includes("already started") ||
    lower.includes("krisp") ||
    lower.includes("mic processor") ||
    lower.includes("audio-processor")
  );
}

let suppressionDepth = 0;
let originalConsoleError: typeof console.error | null = null;
let releaseTimer: number | null = null;

function formatConsoleArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === "string") return arg;
      if (arg instanceof Error) return arg.message;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(" ");
}

export function beginVapiSdkNoiseSuppression() {
  if (typeof window === "undefined") return;

  suppressionDepth += 1;
  if (suppressionDepth > 1 || originalConsoleError) {
    return;
  }

  originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const text = formatConsoleArgs(args);
    if (isVapiSdkNoiseMessage(text)) {
      return;
    }
    originalConsoleError?.(...args);
  };
}

export function scheduleEndVapiSdkNoiseSuppression(delayMs = 2_000) {
  if (typeof window === "undefined") return;

  if (releaseTimer !== null) {
    window.clearTimeout(releaseTimer);
  }

  releaseTimer = window.setTimeout(() => {
    releaseTimer = null;
    endVapiSdkNoiseSuppression();
  }, delayMs);
}

export function endVapiSdkNoiseSuppression() {
  if (typeof window === "undefined") return;

  suppressionDepth = Math.max(0, suppressionDepth - 1);
  if (suppressionDepth > 0 || !originalConsoleError) {
    return;
  }

  console.error = originalConsoleError;
  originalConsoleError = null;
}

export async function runWithVapiSdkNoiseSuppressed<T>(
  fn: () => Promise<T>,
): Promise<T> {
  beginVapiSdkNoiseSuppression();
  try {
    return await fn();
  } finally {
    scheduleEndVapiSdkNoiseSuppression();
  }
}

export function installVapiUnhandledRejectionHandler(
  onFailure: (message: string) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: PromiseRejectionEvent) => {
    const message = parseVapiError(event.reason);
    if (!isVapiSdkNoiseMessage(message) && !isVapiSessionInterruptedError(message)) {
      return;
    }

    event.preventDefault();
    onFailure(formatVapiUserMessage(message));
  };

  window.addEventListener("unhandledrejection", handler);
  return () => window.removeEventListener("unhandledrejection", handler);
}
