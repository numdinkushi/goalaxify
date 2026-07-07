import type { BoothContext } from "@/lib/data/types";
import { getBoothAssistantId, getPublicVapiToken } from "@/lib/vapi/config";
import { parseVapiError } from "@/lib/vapi/parse-error";
import { formatKickoffTime } from "@/lib/utils/format";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";

export type BoothCallConfig = {
  context: BoothContext;
  onCallStart?: (callId?: string) => void;
  onCallEnd?: (callId?: string) => void;
  onError?: (error: unknown) => void;
};

type VapiInstance = InstanceType<(typeof import("@vapi-ai/web"))["default"]>;

export class VapiBoothService {
  private static instance: VapiBoothService;
  private currentCall: VapiInstance | null = null;
  private activeCallId: string | null = null;
  private lastCallId: string | null = null;

  private constructor() {}

  static getInstance(): VapiBoothService {
    if (!VapiBoothService.instance) {
      VapiBoothService.instance = new VapiBoothService();
    }
    return VapiBoothService.instance;
  }

  async startCall(config: BoothCallConfig) {
    const assistantId = getBoothAssistantId();
    const apiKey = getPublicVapiToken();

    if (!assistantId) throw new Error("Vapi booth assistant ID is not configured");
    if (!apiKey) throw new Error("NEXT_PUBLIC_VAPI_WEBTOKEN is not configured");

    if (this.currentCall) {
      try {
        await this.currentCall.stop();
      } catch {
        // ignore stale call cleanup errors
      }
      this.currentCall = null;
      this.activeCallId = null;
    }

    const Vapi = (await import("@vapi-ai/web")).default;
    this.currentCall = new Vapi(apiKey);

    this.currentCall.on("call-start", () => {
      config.onCallStart?.(this.activeCallId ?? undefined);
    });

    this.currentCall.on("call-start-success", (event: { callId?: string }) => {
      if (event.callId) {
        this.activeCallId = event.callId;
        this.lastCallId = event.callId;
        config.onCallStart?.(event.callId);
      }
    });

    this.currentCall.on("call-start-failed", (event: { error?: string }) => {
      config.onError?.(new Error(event.error || "Failed to start booth session"));
    });

    this.currentCall.on("call-end", () => {
      this.activeCallId = null;
      config.onCallEnd?.(this.lastCallId ?? undefined);
    });

    this.currentCall.on("error", (error: unknown) => {
      config.onError?.(error);
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      stream.getTracks().forEach((track) => track.stop());
    } catch (micError) {
      throw new Error(
        micError instanceof Error
          ? `Microphone access required: ${micError.message}`
          : "Microphone access is required for the voice booth",
      );
    }

    const { context } = config;
    const kickoffHint = context.kickoffAt
      ? ` Kickoff is ${formatScheduleDayLabel(context.kickoffAt)} at ${formatKickoffTime(context.kickoffAt)}.`
      : "";
    const assistantOverrides = {
      firstMessage: `Welcome to the Goalaxify booth! ${context.homeTeam} vs ${context.awayTeam} — ${context.round}.${kickoffHint} Tell me your match prediction and stake.`,
      metadata: {
        fixtureId: context.fixtureId,
        homeTeam: context.homeTeam,
        awayTeam: context.awayTeam,
        round: context.round,
        kickoffAt: context.kickoffAt,
        market: context.market,
        app: "goalaxify",
      },
      maxDurationSeconds: 300,
    };

    try {
      const call = await this.currentCall.start(assistantId, assistantOverrides);
      if (call?.id) {
        this.activeCallId = call.id;
        this.lastCallId = call.id;
      }
      return call;
    } catch (error) {
      throw new Error(parseVapiError(error));
    }
  }

  async endCall() {
    if (this.currentCall) {
      await this.currentCall.stop();
      this.currentCall = null;
      this.activeCallId = null;
    }
  }

  setMuted(muted: boolean) {
    this.currentCall?.setMuted(muted);
  }

  getActiveCallId() {
    return this.activeCallId;
  }

  getLastCallId() {
    return this.lastCallId;
  }

  isCallActive() {
    return this.currentCall !== null;
  }
}
