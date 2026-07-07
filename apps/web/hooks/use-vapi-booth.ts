"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { BoothContext } from "@/lib/data/types";
import type { BoothManageBet } from "@/lib/data/types";
import { BoothCallStatus, BoothSessionMode } from "@/lib/enums";
import { preloadBoothVapiClient } from "@/lib/vapi/booth-vapi-client";
import { isVapiCallsEnabled, VAPI_DISABLED_REASON } from "@/lib/vapi/feature-flags";
import {
  formatVapiUserMessage,
  isMicPermissionError,
  isVapiBillingError,
  isVapiSessionInterruptedError,
  parseVapiError,
} from "@/lib/vapi/parse-error";
import type { BoothToolAction } from "@/lib/vapi/parse-tool-call";
import { installVapiUnhandledRejectionHandler } from "@/lib/vapi/vapi-sdk-noise";
import { VapiBoothService } from "@/lib/vapi/vapi-booth-service";

type UseVapiBoothOptions = {
  context: BoothContext;
  walletPubkey?: string | null;
  mode?: BoothSessionMode;
  manageBet?: BoothManageBet | null;
  onSessionEnded?: (callId?: string) => void;
  onVoiceAction?: (action: BoothToolAction) => void;
};

export function useVapiBooth({
  context,
  walletPubkey,
  mode = BoothSessionMode.Stake,
  manageBet,
  onSessionEnded,
  onVoiceAction,
}: UseVapiBoothOptions) {
  const [status, setStatus] = useState<BoothCallStatus>(BoothCallStatus.Idle);
  const [callId, setCallId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const actionCapturedRef = useRef(false);
  const callConnectedRef = useRef(false);
  const lastFailureRef = useRef<string | null>(null);
  const userEndedRef = useRef(false);
  const onVoiceActionRef = useRef(onVoiceAction);
  const onSessionEndedRef = useRef(onSessionEnded);

  onVoiceActionRef.current = onVoiceAction;
  onSessionEndedRef.current = onSessionEnded;

  const vapiEnabled = isVapiCallsEnabled();

  useEffect(() => {
    preloadBoothVapiClient();
  }, []);

  const reportFailure = useCallback((rawMessage: string) => {
    const message = formatVapiUserMessage(rawMessage);
    lastFailureRef.current = message;
    setError(message);
    setStatus(BoothCallStatus.Error);
    if (!callConnectedRef.current) {
      setCallId(null);
    }
  }, []);

  useEffect(() => {
    return installVapiUnhandledRejectionHandler((message) => {
      reportFailure(message);
    });
  }, [reportFailure]);

  const startSession = useCallback(async () => {
    if (!vapiEnabled) {
      reportFailure(VAPI_DISABLED_REASON);
      return false;
    }

    setStatus(BoothCallStatus.Connecting);
    setError(null);
    setCallId(null);
    actionCapturedRef.current = false;
    callConnectedRef.current = false;
    lastFailureRef.current = null;
    VapiBoothService.getInstance().resetSessionState();

    const service = VapiBoothService.getInstance();

    try {
      await service.startCall({
        context,
        walletPubkey,
        mode,
        manageBet,
        onCallStart: (id) => {
          callConnectedRef.current = true;
          if (id) setCallId(id);
          setStatus(BoothCallStatus.Active);
          setError(null);
        },
        onVoiceAction: (action) => {
          actionCapturedRef.current = true;
          onVoiceActionRef.current?.(action);
        },
        onCallEnd: (result) => {
          if (userEndedRef.current) {
            userEndedRef.current = false;
            setStatus(BoothCallStatus.Ended);
            onSessionEndedRef.current?.(result.callId);
            return;
          }

          if (result.actionCaptured || (result.connected && !lastFailureRef.current)) {
            setStatus(BoothCallStatus.Ended);
            onSessionEndedRef.current?.(result.callId);
            return;
          }

          reportFailure(
            lastFailureRef.current ??
              "Voice session ended before connecting. Try again in a moment.",
          );
          onSessionEndedRef.current?.(result.callId);
        },
        onError: (err) => {
          reportFailure(parseVapiError(err));
        },
      });

      if (service.isCallActive() || callConnectedRef.current) {
        return true;
      }

      return false;
    } catch (err) {
      reportFailure(parseVapiError(err));
      return false;
    }
  }, [
    context,
    manageBet,
    mode,
    reportFailure,
    vapiEnabled,
    walletPubkey,
  ]);

  const endSession = useCallback(async () => {
    userEndedRef.current = true;
    try {
      await VapiBoothService.getInstance().endCall();
    } catch {
      // surfaced via reportFailure / UI state
    }
    setStatus(BoothCallStatus.Ended);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((current) => {
      const next = !current;
      VapiBoothService.getInstance().setMuted(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStatus(BoothCallStatus.Idle);
    setCallId(null);
    setError(null);
    setIsMuted(false);
    actionCapturedRef.current = false;
    callConnectedRef.current = false;
    lastFailureRef.current = null;
    VapiBoothService.getInstance().resetSessionState();
  }, []);

  const isMicError = error ? isMicPermissionError(error) : false;
  const isBillingError = error ? isVapiBillingError(error) : false;
  const isInterruptedError = error ? isVapiSessionInterruptedError(error) : false;

  return {
    status,
    callId,
    error,
    isMuted,
    wasActionCaptured: actionCapturedRef.current,
    vapiEnabled,
    isMicError,
    isBillingError,
    isInterruptedError,
    isActive: status === BoothCallStatus.Active,
    isConnecting: status === BoothCallStatus.Connecting,
    startSession,
    endSession,
    toggleMute,
    reset,
  };
};
