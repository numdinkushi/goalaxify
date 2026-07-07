"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

import { formatSolAmount } from "@/lib/solana/format";
import { cn } from "@/lib/utils";

const BALANCE_VISIBLE_KEY = "goalaxify.wallet.balanceVisible";

type WalletBalanceCardProps = {
  amount: number | null;
  loading?: boolean;
  error?: string | null;
  label: string;
  className?: string;
};

export function WalletBalanceCard({
  amount,
  loading = false,
  error = null,
  label,
  className,
}: WalletBalanceCardProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(BALANCE_VISIBLE_KEY);
    if (stored !== null) {
      setVisible(stored === "true");
    }
  }, []);

  const toggleVisibility = () => {
    setVisible((current) => {
      const next = !current;
      localStorage.setItem(BALANCE_VISIBLE_KEY, String(next));
      return next;
    });
  };

  const displayAmount =
    amount !== null ? formatSolAmount(amount) : null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-brand-dusty-blue/20 bg-brand-dusty-blue/10 px-4 py-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <button
          type="button"
          aria-label={visible ? "Hide balance" : "Show balance"}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          onClick={toggleVisibility}
        >
          {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      </div>

      <div className="mt-1 flex min-h-10 items-baseline gap-2">
        {loading && displayAmount === null ? (
          <p className="text-3xl font-semibold tracking-tight text-muted-foreground">
            —
          </p>
        ) : visible ? (
          <>
            <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {displayAmount ?? "—"}
            </span>
            <span className="text-sm font-medium tracking-wide text-muted-foreground">
              SOL
            </span>
          </>
        ) : (
          <>
            <span
              aria-hidden
              className="text-3xl font-semibold tracking-tight text-foreground"
            >
              ••••••
            </span>
            <span className="text-sm font-medium tracking-wide text-muted-foreground">
              SOL
            </span>
          </>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
