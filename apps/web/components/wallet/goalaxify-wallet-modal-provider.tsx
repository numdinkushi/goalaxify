"use client";

import { WalletReadyState } from "@solana/wallet-adapter-base";
import type { Wallet } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalContext,
  useWalletModal,
  type WalletModalContextState,
} from "@solana/wallet-adapter-react-ui";
import { X } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useWalletConnect } from "@/components/wallet/wallet-connect-provider";
import { WalletInstallPanel } from "@/components/wallet/wallet-install-panel";
import { cn } from "@/lib/utils";
import {
  DEFAULT_WALLET_NAME,
  isSupportedWalletName,
  sortSupportedWallets,
} from "@/lib/wallet/supported-wallets";

type ModalStep = "picker" | "install";

type GoalaxifyWalletModalProviderProps = {
  children: ReactNode;
};

export function GoalaxifyWalletModalProvider({
  children,
}: GoalaxifyWalletModalProviderProps) {
  const [visible, setVisible] = useState(false);

  const contextValue = useMemo<WalletModalContextState>(
    () => ({
      visible,
      setVisible,
    }),
    [visible],
  );

  return (
    <WalletModalContext.Provider value={contextValue}>
      {children}
      {visible ? <GoalaxifyWalletModal /> : null}
    </WalletModalContext.Provider>
  );
}

function GoalaxifyWalletModal() {
  const ref = useRef<HTMLDivElement>(null);
  const { wallets, connected, connecting } = useWallet();
  const { setVisible, visible } = useWalletModal();
  const { connectWallet } = useWalletConnect();
  const [fadeIn, setFadeIn] = useState(false);
  const [portal, setPortal] = useState<Element | null>(null);
  const [step, setStep] = useState<ModalStep>("picker");
  const [installWallet, setInstallWallet] = useState<Wallet | null>(null);
  const [selectedWalletName, setSelectedWalletName] = useState<string | null>(
    null,
  );

  const supportedWallets = useMemo(
    () =>
      sortSupportedWallets(
        wallets.filter((wallet) => {
          if (wallet.adapter.name === DEFAULT_WALLET_NAME) {
            return true;
          }

          return isSupportedWalletName(wallet.adapter.name);
        }),
      ),
    [wallets],
  );

  const resetModalState = useCallback(() => {
    setStep("picker");
    setInstallWallet(null);
    setSelectedWalletName(null);
  }, []);

  const hideModal = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => {
      setVisible(false);
      resetModalState();
    }, 150);
  }, [resetModalState, setVisible]);

  const handleClose = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      hideModal();
    },
    [hideModal],
  );

  const handleWalletClick = useCallback(
    (event: MouseEvent, wallet: Wallet) => {
      event.preventDefault();

      if (wallet.readyState === WalletReadyState.Installed) {
        setSelectedWalletName(wallet.adapter.name);
        void connectWallet(wallet.adapter.name);
        return;
      }

      setInstallWallet(wallet);
      setStep("install");
    },
    [connectWallet],
  );

  useEffect(() => {
    if (connected && visible) {
      hideModal();
    }
  }, [connected, hideModal, visible]);

  useEffect(() => {
    if (!connecting) {
      setSelectedWalletName(null);
    }
  }, [connecting]);

  const handleBackToPicker = useCallback(() => {
    setStep("picker");
    setInstallWallet(null);
  }, []);

  useLayoutEffect(() => {
    setPortal(document.body);
    setTimeout(() => setFadeIn(true), 0);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (step === "install") {
          handleBackToPicker();
          return;
        }
        hideModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown, false);
    };
  }, [handleBackToPicker, hideModal, step]);

  if (!portal) {
    return null;
  }

  return createPortal(
    <div
      aria-labelledby="goalaxify-wallet-modal-title"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-150",
        fadeIn ? "opacity-100" : "opacity-0",
      )}
      ref={ref}
      role="dialog"
    >
      <button
        type="button"
        aria-label="Close wallet modal"
        className="absolute inset-0 cursor-pointer bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="goalaxify-card-shadow goalaxify-soft-ring relative z-10 w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl">
        {step === "picker" ? (
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}

        {step === "picker" ? (
          <>
            <div className="space-y-2 pr-8">
              <h2
                id="goalaxify-wallet-modal-title"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                Choose a wallet
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Phantom is recommended. Pick a wallet when you are ready to
                connect.
              </p>
            </div>

            {supportedWallets.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {supportedWallets.map((wallet) => {
                  const isPending =
                    connecting && selectedWalletName === wallet.adapter.name;

                  return (
                    <li key={wallet.adapter.name}>
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-muted/40 px-4 py-3.5 text-left transition-colors hover:border-border hover:bg-muted/70 disabled:cursor-wait disabled:opacity-70"
                        disabled={isPending}
                        onClick={(event) => handleWalletClick(event, wallet)}
                      >
                        {wallet.adapter.icon ? (
                          <img
                            src={wallet.adapter.icon}
                            alt=""
                            width={32}
                            height={32}
                            className="size-8 shrink-0 rounded-lg"
                          />
                        ) : (
                          <span className="size-8 shrink-0 rounded-lg bg-muted" />
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {isPending
                              ? `Connecting to ${wallet.adapter.name}…`
                              : wallet.adapter.name}
                          </span>
                          {wallet.adapter.name === DEFAULT_WALLET_NAME &&
                          !isPending ? (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              Recommended for Goalaxify
                            </span>
                          ) : wallet.readyState !== WalletReadyState.Installed &&
                            !isPending ? (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              Install to connect
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                Install Phantom to continue.
              </p>
            )}
          </>
        ) : installWallet ? (
          <WalletInstallPanel
            wallet={installWallet}
            onBack={handleBackToPicker}
          />
        ) : null}
      </div>
    </div>,
    portal,
  );
}
