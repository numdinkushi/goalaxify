"use client";

import Link from "next/link";
import { Mic, MicOff, PhoneOff, Radio } from "lucide-react";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVapiBooth } from "@/hooks/use-vapi-booth";
import { useWalletSession } from "@/hooks/use-wallet-session";
import type { BoothContext } from "@/lib/data/types";
import { BoothCallStatus } from "@/lib/enums";
import { AppRoute } from "@/lib/enums";
import { formatKickoffTime, formatMatchTitle } from "@/lib/utils/format";
import { formatScheduleDayLabel } from "@/lib/utils/schedule";
import { cn } from "@/lib/utils";

type VoiceBoothProps = {
  context: BoothContext;
  onSessionActiveChange?: (locked: boolean) => void;
};

const STATUS_LABELS: Record<BoothCallStatus, string> = {
  [BoothCallStatus.Idle]: "Ready",
  [BoothCallStatus.Connecting]: "Connecting…",
  [BoothCallStatus.Active]: "Live",
  [BoothCallStatus.Ended]: "Session ended",
  [BoothCallStatus.Error]: "Unavailable",
};

export function VoiceBooth({ context, onSessionActiveChange }: VoiceBoothProps) {
  const booth = useVapiBooth({ context });
  const { isConnected, walletPubkey } = useWalletSession();
  const kickoffLabel = context.kickoffAt
    ? `${formatScheduleDayLabel(context.kickoffAt)} · ${formatKickoffTime(context.kickoffAt)}`
    : null;

  useEffect(() => {
    onSessionActiveChange?.(booth.isActive || booth.isConnecting);
  }, [booth.isActive, booth.isConnecting, onSessionActiveChange]);

  return (
    <section className="space-y-3">
      <Card className="overflow-hidden border-border/80">
        <div className="h-1.5 bg-gradient-to-r from-brand-coral to-brand-pastel-pink" />
        <CardContent className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                Voice booth
              </p>
              <div className="mt-2 flex items-center gap-2 text-xl">
                <span aria-hidden>{context.homeFlag}</span>
                <span className="text-sm font-semibold text-muted-foreground">vs</span>
                <span aria-hidden>{context.awayFlag}</span>
              </div>
              <h2 className="mt-2 text-xl font-bold">
                {formatMatchTitle(context.homeTeam, context.awayTeam)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{context.round}</p>
              {kickoffLabel ? (
                <p className="mt-1 text-xs text-muted-foreground">{kickoffLabel}</p>
              ) : null}
            </div>
            <Badge variant={booth.isActive ? "live" : "outline"}>
              {STATUS_LABELS[booth.status]}
            </Badge>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Talk your prediction to the stadium announcer. Your pick, market, and
            stake are captured for settlement.
          </p>

          {booth.error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {booth.error}
              {booth.isBillingError && (
                <p className="mt-1 text-xs opacity-80">
                  Add credits at dashboard.vapi.ai to enable voice sessions.
                </p>
              )}
              {booth.isMicError && (
                <p className="mt-1 text-xs opacity-80">
                  Allow microphone access in your browser settings.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!booth.isActive && !booth.isConnecting && (
              <Button
                onClick={booth.startSession}
                disabled={!booth.vapiEnabled || !isConnected}
              >
                <Mic className="size-4" />
                Start voice session
              </Button>
            )}

            {(booth.isActive || booth.isConnecting) && (
              <>
                <Button variant="secondary" onClick={booth.toggleMute}>
                  {booth.isMuted ? (
                    <MicOff className="size-4" />
                  ) : (
                    <Mic className="size-4" />
                  )}
                  {booth.isMuted ? "Unmute" : "Mute"}
                </Button>
                <Button
                  variant="outline"
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={booth.endSession}
                >
                  <PhoneOff className="size-4" />
                  End session
                </Button>
              </>
            )}

            {booth.status === BoothCallStatus.Ended && (
              <Button variant="outline" onClick={booth.reset}>
                New session
              </Button>
            )}
          </div>

          {walletPubkey && (
            <p className="text-xs text-muted-foreground">
              Linked wallet:{" "}
              <span className="font-mono">{walletPubkey}</span>
            </p>
          )}

          {booth.callId && (
            <p className="text-xs text-muted-foreground">
              Call ID: <span className="font-mono">{booth.callId}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <Link
        href={AppRoute.Live}
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        <Radio className="size-4" />
        View live moments
      </Link>
    </section>
  );
}
