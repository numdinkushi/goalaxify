"use client";

import { useCallback, useState } from "react";

import { appToast } from "@/lib/toast";

type UseCopyToClipboardOptions = {
  resetMs?: number;
  notify?: boolean;
  onCopied?: () => void;
};

export function useCopyToClipboard({
  resetMs = 2000,
  notify = true,
  onCopied,
}: UseCopyToClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (value: string) => {
      if (!value) {
        return false;
      }

      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), resetMs);

        if (notify) {
          appToast.addressCopied();
        }

        onCopied?.();
        return true;
      } catch {
        if (notify) {
          appToast.copyFailed();
        }
        return false;
      }
    },
    [notify, onCopied, resetMs],
  );

  return { copied, copy };
}
