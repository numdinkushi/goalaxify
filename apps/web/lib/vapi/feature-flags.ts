export function isVapiCallsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_VAPI_ENABLED === "true";
}

export const VAPI_DISABLED_REASON =
  "Voice booth is offline. Enable Vapi in your environment to start a session.";
