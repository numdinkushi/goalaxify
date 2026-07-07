import type { PredictionDraft } from "@goalaxify/domain";

import type { BoothContext, BoothManageBet } from "@/lib/data/types";
import type { BoothSessionMode } from "@/lib/enums";
import { BoothSessionMode as BoothSessionModeEnum } from "@/lib/enums";
import { buildBoothAssistantOverrides } from "@/lib/vapi/booth-assistant-overrides";
import {
  getSharedBoothVapiClient,
  stopSharedBoothVapiClient,
} from "@/lib/vapi/booth-vapi-client";
import {
  formatVapiUserMessage,
  isIntentionalVapiTeardownError,
  parseVapiError,
} from "@/lib/vapi/parse-error";
import { runWithVapiSdkNoiseSuppressed } from "@/lib/vapi/vapi-sdk-noise";
import {
  extractBoothToolAction,
  type BoothToolAction,
} from "@/lib/vapi/parse-tool-call";
import { getBoothAssistantId, getPublicVapiToken } from "@/lib/vapi/config";

export type BoothCallConfig = {
  context: BoothContext;
  walletPubkey?: string | null;
  mode?: BoothSessionMode;
  manageBet?: BoothManageBet | null;
  onCallStart?: (callId?: string) => void;
  onCallEnd?: (result: BoothCallEndResult) => void;
  onVoiceAction?: (action: BoothToolAction) => void;
  onError?: (error: unknown) => void;
};

export type BoothCallEndResult = {
  callId?: string;
  connected: boolean;
  actionCaptured: boolean;
};

type VapiInstance = InstanceType<(typeof import("@vapi-ai/web"))["default"]>;
type VapiEventName = Parameters<VapiInstance["on"]>[0];
type VapiHandler = (...args: unknown[]) => void;

const STOP_SETTLE_MS = 1_200;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export class VapiBoothService {
  private static instance: VapiBoothService;
  private activeCallId: string | null = null;
  private lastCallId: string | null = null;
  private actionCaptured = false;
  private callConnected = false;
  private messageHandler: ((message: unknown) => void) | null = null;
  private startPromise: Promise<unknown> | null = null;
  private startGeneration = 0;
  private stoppingIntentionally = false;
  private lastErrorMessage: string | null = null;
  private boundHandlers: Array<{ event: VapiEventName; handler: VapiHandler }> = [];

  private constructor() {}

  static getInstance(): VapiBoothService {
    if (!VapiBoothService.instance) {
      VapiBoothService.instance = new VapiBoothService();
    }
    return VapiBoothService.instance;
  }

  async startCall(config: BoothCallConfig) {
    if (this.startPromise) {
      return this.startPromise;
    }

    this.startPromise = runWithVapiSdkNoiseSuppressed(() =>
      this.startCallInternal(config),
    ).finally(() => {
      this.startPromise = null;
    });

    return this.startPromise;
  }

  private clearEventHandlers(client: VapiInstance) {
    for (const { event, handler } of this.boundHandlers) {
      client.removeListener(event, handler);
    }
    this.boundHandlers = [];
  }

  private bindEvent(
    client: VapiInstance,
    event: VapiEventName,
    handler: VapiHandler,
  ) {
    client.on(event, handler);
    this.boundHandlers.push({ event, handler });
  }

  private emitError(config: BoothCallConfig, error: unknown) {
    const message = parseVapiError(error);
    if (isIntentionalVapiTeardownError(message, this.stoppingIntentionally)) {
      return;
    }

    this.lastErrorMessage = formatVapiUserMessage(message);
    config.onError?.(error);
  }

  private async stopActiveCall(client: VapiInstance) {
    const hadSession = this.callConnected || this.activeCallId !== null;

    this.stoppingIntentionally = true;
    try {
      await client.stop();
    } catch {
      // ignore stale call cleanup errors
    } finally {
      this.stoppingIntentionally = false;
      this.activeCallId = null;
      this.callConnected = false;
    }

    if (hadSession) {
      await sleep(STOP_SETTLE_MS);
    }
  }

  private async startCallInternal(config: BoothCallConfig) {
    const generation = ++this.startGeneration;
    this.lastErrorMessage = null;

    const assistantId = getBoothAssistantId();
    const apiKey = getPublicVapiToken();

    if (!assistantId) throw new Error("Vapi booth assistant ID is not configured");
    if (!apiKey) throw new Error("NEXT_PUBLIC_VAPI_WEBTOKEN is not configured");

    const client = await getSharedBoothVapiClient(apiKey);

    this.clearEventHandlers(client);
    this.detachMessageHandler(client);
    await this.stopActiveCall(client);

    this.actionCaptured = false;
    this.callConnected = false;
    this.activeCallId = null;

    const mode = config.mode ?? BoothSessionModeEnum.Stake;

    const markConnected = (callId?: string) => {
      if (generation !== this.startGeneration) return;
      if (callId) {
        this.activeCallId = callId;
        this.lastCallId = callId;
      }
      if (this.callConnected) return;
      this.callConnected = true;
      config.onCallStart?.(callId);
    };

    this.bindEvent(client, "call-start", () => {
      markConnected(this.lastCallId ?? undefined);
    });

    this.bindEvent(client, "call-start-success", (event) => {
      const payload = event as { callId?: string };
      markConnected(payload.callId);
    });

    this.bindEvent(client, "call-start-failed", (event) => {
      if (generation !== this.startGeneration) return;
      const payload = event as { error?: string };
      this.emitError(
        config,
        new Error(payload.error || "Failed to start booth session"),
      );
    });

    this.bindEvent(client, "call-end", () => {
      if (generation !== this.startGeneration) return;

      const endResult: BoothCallEndResult = {
        callId: this.lastCallId ?? undefined,
        connected: this.callConnected,
        actionCaptured: this.actionCaptured,
      };

      this.activeCallId = null;
      this.callConnected = false;
      this.detachMessageHandler(client);
      config.onCallEnd?.(endResult);
    });

    this.bindEvent(client, "error", (error) => {
      if (generation !== this.startGeneration) return;
      this.emitError(config, error);
    });

    this.messageHandler = (message: unknown) => {
      if (generation !== this.startGeneration || this.actionCaptured) return;

      const action = extractBoothToolAction(
        message,
        config.context,
        this.activeCallId ?? this.lastCallId,
        mode === BoothSessionModeEnum.Manage,
      );

      if (!action) return;

      this.actionCaptured = true;
      config.onVoiceAction?.(action);

      window.setTimeout(() => {
        void this.endCall().catch(() => undefined);
      }, 1200);
    };

    client.on("message", this.messageHandler);

    const assistantOverrides = buildBoothAssistantOverrides({
      context: config.context,
      mode,
      manageBet: config.manageBet ?? undefined,
      walletPubkey: config.walletPubkey,
      managePredictionId: config.manageBet?.predictionId,
    });

    try {
      const call = await client.start(
        assistantId,
        assistantOverrides as unknown as Parameters<VapiInstance["start"]>[1],
      );

      if (generation !== this.startGeneration) {
        return call;
      }

      if (call?.id) {
        this.lastCallId = call.id;
        this.activeCallId = call.id;
        markConnected(call.id);
      }

      if (!call) {
        throw new Error(
          this.lastErrorMessage ??
            "Voice session failed to connect. Wait a few seconds, then try again.",
        );
      }

      return call;
    } catch (error) {
      if (generation !== this.startGeneration) {
        return null;
      }

      const message = formatVapiUserMessage(parseVapiError(error));
      this.lastErrorMessage = message;
      throw new Error(message);
    }
  }

  private detachMessageHandler(client?: VapiInstance) {
    const target = client;
    if (target && this.messageHandler) {
      target.removeListener("message", this.messageHandler);
      this.messageHandler = null;
    }
  }

  async endCall() {
    await runWithVapiSdkNoiseSuppressed(async () => {
      this.stoppingIntentionally = true;
      const apiKey = getPublicVapiToken();
      const client = apiKey ? await getSharedBoothVapiClient(apiKey) : null;
      this.detachMessageHandler(client ?? undefined);
      try {
        await stopSharedBoothVapiClient();
      } finally {
        this.stoppingIntentionally = false;
        this.activeCallId = null;
        this.callConnected = false;
      }
      await sleep(STOP_SETTLE_MS);
    });
  }

  setMuted(muted: boolean) {
    void getSharedBoothVapiClient(getPublicVapiToken()).then((client) => {
      client.setMuted(muted);
    });
  }

  getActiveCallId() {
    return this.activeCallId;
  }

  getLastCallId() {
    return this.lastCallId;
  }

  isCallActive() {
    return this.callConnected || this.activeCallId !== null;
  }

  wasActionCaptured() {
    return this.actionCaptured;
  }

  resetSessionState() {
    this.actionCaptured = false;
    this.callConnected = false;
    this.lastCallId = null;
    this.lastErrorMessage = null;
  }
}

export type { BoothToolAction, PredictionDraft };
