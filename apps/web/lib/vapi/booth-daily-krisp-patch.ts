/**
 * Vapi Web SDK always enables Daily Krisp noise cancellation after join.
 * Krisp often fails to init in local/dev browsers (KrispInitError), which can
 * break mic setup and abort the booth session. Skip Krisp and use raw mic audio.
 */
let patchApplied = false;

export async function disableDailyKrispNoiseCancellation(): Promise<void> {
  if (patchApplied || typeof window === "undefined") {
    return;
  }

  patchApplied = true;

  const DailyIframe = (await import("@daily-co/daily-js")).default;
  const originalCreate = DailyIframe.createCallObject.bind(DailyIframe);

  DailyIframe.createCallObject = ((options) => {
    const call = originalCreate(options);
    const originalUpdate = call.updateInputSettings.bind(call);

    call.updateInputSettings = (async (settings) => {
      const processorType = readProcessorType(settings);

      if (processorType === "noise-cancellation") {
        return originalUpdate({
          ...(settings ?? {}),
          audio: {
            ...(settings?.audio ?? {}),
            processor: { type: "none" },
          },
        });
      }

      return originalUpdate(settings);
    }) as typeof call.updateInputSettings;

    return call;
  }) as typeof DailyIframe.createCallObject;
}

function readProcessorType(settings: unknown): string | undefined {
  if (!settings || typeof settings !== "object") {
    return undefined;
  }

  const audio = (settings as { audio?: { processor?: { type?: string } } }).audio;
  return audio?.processor?.type;
}
