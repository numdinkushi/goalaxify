"use client";

import { CheckCircle2, Download, Smartphone, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PWA_NAME } from "@/lib/pwa/constants";
import { toast } from "@/lib/toast";

const DISMISS_KEY = "goalaxify-pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function isAppInstalled() {
  if (typeof window === "undefined") {
    return false;
  }

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const isIosStandalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true;

  return isStandalone || isIosStandalone;
}

function canUsePwaInstall() {
  if (typeof window === "undefined") {
    return false;
  }

  const hasManifest = Boolean(document.querySelector('link[rel="manifest"]'));
  const hasServiceWorker = "serviceWorker" in navigator;
  const isSecure =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost";

  return hasManifest && hasServiceWorker && isSecure;
}

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
    sessionStorage.setItem(DISMISS_KEY, "true");
  }, []);

  useEffect(() => {
    if (isAppInstalled()) {
      setIsInstalled(true);
      return;
    }

    if (!canUsePwaInstall()) {
      return;
    }

    setCanInstall(true);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);

      if (sessionStorage.getItem(DISMISS_KEY)) {
        return;
      }

      window.setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      toast.success(`${PWA_NAME} installed`, {
        description: "Open Goalaxify from your home screen anytime.",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error("Install unavailable", {
        description: "Refresh the page and try again.",
      });
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        toast.success("Installation started");
        setShowPrompt(false);
      } else {
        toast.info("Installation cancelled");
      }

      setDeferredPrompt(null);
    } catch {
      toast.error("Installation failed", {
        description: "Please try again in a moment.",
      });
    }
  };

  if (isInstalled || !canInstall || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 z-[110] md:inset-x-auto md:right-4 md:w-80 bottom-[calc(var(--bottom-nav-height)+1rem+env(safe-area-inset-bottom,0px))]">
      <Card className="goalaxify-card-shadow border-brand-coral/30 bg-card/95 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Smartphone className="size-5 text-brand-coral" />
              <CardTitle className="text-lg">Install {PWA_NAME}</CardTitle>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={dismissPrompt}
              aria-label="Dismiss install prompt"
            >
              <X className="size-4" />
            </Button>
          </div>
          <CardDescription>
            Add Goalaxify to your home screen for a native app feel and faster
            launch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-brand-mint" />
              <span>Quick access to booth and live moments</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-brand-mint" />
              <span>Full-screen experience without the browser bar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-brand-mint" />
              <span>Cached shell for faster repeat visits</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" className="flex-1" onClick={handleInstallClick}>
              <Download className="size-4" />
              Install App
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={dismissPrompt}
            >
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
