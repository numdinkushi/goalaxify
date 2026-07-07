import type { PredictionDraft } from "@goalaxify/domain";

import type { BoothContext } from "@/lib/data/types";
import {
  buildBoothFirstMessage,
} from "@/lib/vapi/booth-prompt";
import { buildBoothModelOverride } from "@/lib/vapi/booth-model";
import {
  BOOTH_CLIENT_MESSAGES,
} from "@/lib/vapi/booth-tools";
import { parseVapiError } from "@/lib/vapi/parse-error";
import { extractSubmitPredictionDraft } from "@/lib/vapi/parse-tool-call";
import { getBoothAssistantId, getPublicVapiToken } from "@/lib/vapi/config";

export type BoothCallConfig = {
  context: BoothContext;
  walletPubkey?: string | null;
  onCallStart?: (callId?: string) => void;
  onCallEnd?: (callId?: string) => void;
  onPredictionSubmit?: (draft: PredictionDraft) => void;
  onError?: (error: unknown) => void;
};

type VapiInstance = InstanceType<(typeof import("@vapi-ai/web"))["default"]>;

export class VapiBoothService {
  private static instance: VapiBoothService;
  private currentCall: VapiInstance | null = null;
  private activeCallId: string | null = null;
  private lastCallId: string | null = null;
  private predictionCaptured = false;
  private messageHandler: ((message: unknown) => void) | null = null;

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
      this.detachMessageHandler();
      this.currentCall = null;
      this.activeCallId = null;
    }

    this.predictionCaptured = false;

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
      this.detachMessageHandler();
      config.onCallEnd?.(this.lastCallId ?? undefined);
    });

    this.currentCall.on("error", (error: unknown) => {
      config.onError?.(error);
    });

    this.messageHandler = (message: unknown) => {
      if (this.predictionCaptured) return;

      const draft = extractSubmitPredictionDraft(
        message,
        config.context,
        this.activeCallId ?? this.lastCallId,
      );

      if (!draft) return;

      this.predictionCaptured = true;
      config.onPredictionSubmit?.(draft);

      // End the call shortly after capture so the assistant can finish its goodbye.
      window.setTimeout(() => {
        void this.endCall();
      }, 1200);
    };

    this.currentCall.on("message", this.messageHandler);

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
    const assistantOverrides = {
      firstMessage: buildBoothFirstMessage(context),
      clientMessages: [...BOOTH_CLIENT_MESSAGES],
      model: buildBoothModelOverride(context),
      metadata: {
        fixtureId: context.fixtureId,
        homeTeam: context.homeTeam,
        awayTeam: context.awayTeam,
        round: context.round,
        kickoffAt: context.kickoffAt,
        market: context.market,
        walletPubkey: config.walletPubkey ?? undefined,
        app: "goalaxify",
      },
      maxDurationSeconds: 180,
    };

    try {
      const call = await this.currentCall.start(
        assistantId,
        assistantOverrides as unknown as Parameters<VapiInstance["start"]>[1],
      );
      if (call?.id) {
        this.activeCallId = call.id;
        this.lastCallId = call.id;
      }
      return call;
    } catch (error) {
      throw new Error(parseVapiError(error));
    }
  }

  private detachMessageHandler() {
    if (this.currentCall && this.messageHandler) {
      this.currentCall.removeListener("message", this.messageHandler);
      this.messageHandler = null;
    }
  }

  async endCall() {
    if (this.currentCall) {
      this.detachMessageHandler();
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

  wasPredictionCaptured() {
    return this.predictionCaptured;
  }

  resetSessionState() {
    this.predictionCaptured = false;
    this.lastCallId = null;
  }
}
