"use client";

import { Check, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  SolanaNetworkBadge,
  SolanaNetworkToggle,
} from "@/components/wallet/solana-network-toggle";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { appToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { shortWalletAddress } from "@/lib/wallet/utils";

type ConnectedWalletMenuProps = {
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function ConnectedWalletMenu({
  size = "default",
  className,
}: ConnectedWalletMenuProps) {
  const { walletPubkey, disconnect, wallet } = useWalletSession();
  const { copied, copy } = useCopyToClipboard();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDisconnect = useCallback(() => {
    setOpen(false);
    void disconnect();
    appToast.walletDisconnected();
  }, [disconnect]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!walletPubkey) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size={size}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn("cursor-pointer gap-1.5", className)}
        onClick={() => setOpen((current) => !current)}
      >
        <Wallet className="size-4" />
        {shortWalletAddress(walletPubkey)}
        <SolanaNetworkBadge />
        <ChevronDown
          className={cn(
            "size-3.5 opacity-70 transition-transform",
            open && "rotate-180",
          )}
        />
      </Button>

      {open ? (
        <div
          role="menu"
          className="goalaxify-card-shadow absolute top-[calc(100%+0.5rem)] right-0 z-50 min-w-56 rounded-xl border border-border/70 bg-card p-2 shadow-xl"
        >
          <div className="border-b border-border/60 px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Connected wallet</p>
            <div className="mt-1 flex items-center gap-1.5">
              <p className="min-w-0 flex-1 font-mono text-sm text-foreground">
                {shortWalletAddress(walletPubkey, 6)}
              </p>
              <button
                type="button"
                aria-label={copied ? "Address copied" : "Copy wallet address"}
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => walletPubkey && void copy(walletPubkey)}
              >
                {copied ? (
                  <Check className="size-3.5 text-brand-mint" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
            {wallet?.adapter.name ? (
              <p className="mt-1 text-xs text-muted-foreground">
                via {wallet.adapter.name}
              </p>
            ) : null}
          </div>

          <div className="border-b border-border/60 px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">Network</p>
              <SolanaNetworkBadge />
            </div>
            <div className="mt-2 flex justify-end">
              <SolanaNetworkToggle size="sm" />
            </div>
          </div>

          <button
            type="button"
            role="menuitem"
            className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDisconnect}
          >
            <LogOut className="size-4" />
            Disconnect wallet
          </button>
        </div>
      ) : null}
    </div>
  );
}
