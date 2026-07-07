"use client";

import { Check, Copy } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

type CopyClipButtonProps = {
  value: string;
  label?: string;
  className?: string;
  iconClassName?: string;
};

export function CopyClipButton({
  value,
  label = "Copy",
  className,
  iconClassName,
}: CopyClipButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
      onClick={() => void copy(value)}
    >
      {copied ? (
        <Check className={cn("size-3.5 text-brand-mint", iconClassName)} />
      ) : (
        <Copy className={cn("size-3.5", iconClassName)} />
      )}
    </button>
  );
}
