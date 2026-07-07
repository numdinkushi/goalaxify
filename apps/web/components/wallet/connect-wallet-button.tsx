"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";

import { ConnectedWalletMenu } from "@/components/wallet/connected-wallet-menu";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { useTranslation } from "@/hooks/use-translation";
import { useWalletSession } from "@/hooks/use-wallet-session";
import { cn } from "@/lib/utils";

type ConnectWalletButtonProps = {
  size?: "default" | "sm" | "lg";
  className?: string;
  showAddressWhenConnected?: boolean;
  useConnectedMenu?: boolean;
};

export function ConnectWalletButton({
  size = "default",
  className,
  showAddressWhenConnected = true,
  useConnectedMenu = true,
}: ConnectWalletButtonProps) {
  const hydrated = useHydrated();
  const { setVisible } = useWalletModal();
  const { t } = useTranslation();
  const { isConnected, connecting, isRestoring, walletPubkey } =
    useWalletSession();

  const openWalletModal = () => {
    setVisible(true);
  };

  if (hydrated && isConnected && walletPubkey) {
    if (useConnectedMenu && showAddressWhenConnected) {
      return <ConnectedWalletMenu size={size} className={className} />;
    }

    return null;
  }

  return (
    <Button
      type="button"
      size={size}
      className={cn("cursor-pointer", className)}
      onClick={openWalletModal}
    >
      <Wallet className="size-4" />
      {connecting || isRestoring ? t("wallet.reconnecting") : t("wallet.connect")}
    </Button>
  );
}
