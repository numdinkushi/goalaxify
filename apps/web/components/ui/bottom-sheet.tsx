"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

import { cn } from "@/lib/utils";

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
}: BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl border border-border/80 bg-card shadow-2xl",
        )}
      >
        <div className="flex shrink-0 justify-center pt-3 pb-2">
          <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {title ? (
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-6 py-4">
            <h2 className="text-lg font-semibold text-brand-coral">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-5 text-foreground" />
            </button>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto overscroll-contain p-6 pb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
