import { disableDailyKrispNoiseCancellation } from "@/lib/vapi/booth-daily-krisp-patch";

type VapiInstance = InstanceType<(typeof import("@vapi-ai/web"))["default"]>;

let sharedClient: VapiInstance | null = null;
let sharedApiKey: string | null = null;
let vapiModulePromise: Promise<typeof import("@vapi-ai/web")> | null = null;

async function loadVapiModule() {
  await disableDailyKrispNoiseCancellation();
  if (!vapiModulePromise) {
    vapiModulePromise = import("@vapi-ai/web");
  }
  return vapiModulePromise;
}

/** One Vapi Web SDK instance per page — matches Vapi docs and avoids Daily ejection. */
export async function getSharedBoothVapiClient(
  apiKey: string,
): Promise<VapiInstance> {
  if (sharedClient && sharedApiKey === apiKey) {
    return sharedClient;
  }

  if (sharedClient) {
    try {
      await sharedClient.stop();
    } catch {
      // ignore stale client cleanup errors
    }
  }

  const Vapi = (await loadVapiModule()).default;
  sharedClient = new Vapi(apiKey);
  sharedApiKey = apiKey;
  return sharedClient;
}

export async function stopSharedBoothVapiClient(): Promise<void> {
  if (!sharedClient) {
    return;
  }

  try {
    await sharedClient.stop();
  } catch {
    // ignore stop errors during manual end
  }
}

/** Warm Daily Krisp patch before the first booth call. */
export function preloadBoothVapiClient(): void {
  void disableDailyKrispNoiseCancellation();
}
