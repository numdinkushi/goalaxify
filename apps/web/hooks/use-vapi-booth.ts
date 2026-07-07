"use client";

import { useCallback, useState } from "react";

import type { BoothContext } from "@/lib/data/types";
import { BoothCallStatus } from "@/lib/enums";
import { isVapiCallsEnabled, VAPI_DISABLED_REASON } from "@/lib/vapi/feature-flags";
import {
  isMicPermissionError,
  isVapiBillingError,
  parseVapiError,
} from "@/lib/vapi/parse-error";
import { VapiBoothService } from "@/lib/vapi/vapi-booth-service";

type UseVapiBoothOptions = {
  context: BoothContext;
};

export function useVapiBooth({ context }: UseVapiBoothOptions) {
  const [status, setStatus] = useState<BoothCallStatus>(BoothCallStatus.Idle);
  const [callId, setCallId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const vapiEnabled = isVapiCallsEnabled();

  const startSession = useCallback(async () => {
    if (!vapiEnabled) {
      setError(VAPI_DISABLED_REASON);
      setStatus(BoothCallStatus.Error);
      return;
    }

    setStatus(BoothCallStatus.Connecting);
    setError(null);

    const service = VapiBoothService.getInstance();

    try {
      await service.startCall({
        context,
        onCallStart: (id) => {
          if (id) setCallId(id);
          setStatus(BoothCallStatus.Active);
        },
        onCallEnd: () => {
          setStatus(BoothCallStatus.Ended);
        },
        onError: (err) => {
          const message = parseVapiError(err);
          setError(message);
          setStatus(BoothCallStatus.Error);
        },
      });
    } catch (err) {
      const message = parseVapiError(err);
      setError(message);
      setStatus(BoothCallStatus.Error);
    }
  }, [context, vapiEnabled]);

  const endSession = useCallback(async () => {
    await VapiBoothService.getInstance().endCall();
    setStatus(BoothCallStatus.Ended);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    VapiBoothService.getInstance().setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  const reset = useCallback(() => {
    setStatus(BoothCallStatus.Idle);
    setCallId(null);
    setError(null);
    setIsMuted(false);
  }, []);

  const isMicError = error ? isMicPermissionError(error) : false;
  const isBillingError = error ? isVapiBillingError(error) : false;

  return {
    status,
    callId,
    error,
    isMuted,
    vapiEnabled,
    isMicError,
    isBillingError,
    isActive: status === BoothCallStatus.Active,
    isConnecting: status === BoothCallStatus.Connecting,
    startSession,
    endSession,
    toggleMute,
    reset,
  };
}
