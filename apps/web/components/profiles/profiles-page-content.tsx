"use client";

import {
  Camera,
  Copy,
  Loader2,
  UserRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { WalletGate } from "@/components/wallet/wallet-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useProfileEditor, useProfileView } from "@/hooks/use-profile-view";
import { getSolanaNetwork } from "@/lib/solana/config";
import { formatFriendlyDate } from "@/lib/utils/format";
import { shortWalletAddress } from "@/lib/wallet/utils";

function ProfileEditor() {
  const { profile, walletPubkey, wallet, displayLabel, isRestoring } =
    useProfileView();
  const {
    displayName,
    setDisplayName,
    saveProfile,
    saving,
    uploadingAvatar,
    error,
    fileInputRef,
    openFilePicker,
    handleFileChange,
  } = useProfileEditor();

  const { copied, copy } = useCopyToClipboard();

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
      <PageHeader
        eyebrow="Identity"
        title="Profile"
        description="Your Goalaxify identity is tied to your Solana wallet. Add a name and photo so the booth and leaderboard know who you are."
      />

      {isRestoring ? (
        <p className="-mt-2 text-sm text-muted-foreground">
          Restoring your wallet session…
        </p>
      ) : null}

      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploadingAvatar}
              className="group relative size-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-border/70 bg-muted/40"
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-muted-foreground">
                  <UserRound className="size-10" />
                </span>
              )}

              <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                {uploadingAvatar ? (
                  <Loader2 className="size-5 animate-spin text-white" />
                ) : (
                  <Camera className="size-5 text-white" />
                )}
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-lg font-semibold text-foreground">
                {displayLabel}
              </p>
              <p className="font-mono text-sm text-muted-foreground">
                {walletPubkey ? shortWalletAddress(walletPubkey, 6) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Tap the avatar to upload a profile image
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="display-name"
              className="text-sm font-medium text-foreground"
            >
              Username
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Choose a display name"
              maxLength={32}
              className="h-11 w-full rounded-xl border border-border/70 bg-muted/30 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-coral/50"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Wallet address</p>
            <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-3">
              <p className="min-w-0 flex-1 break-all font-mono text-xs leading-relaxed text-muted-foreground">
                {walletPubkey}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 cursor-pointer"
                onClick={() => walletPubkey && void copy(walletPubkey)}
              >
                <Copy className="size-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl bg-muted/40 p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Wallet app</span>
              <span className="font-medium">{wallet?.adapter.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Network</span>
              <span className="font-medium capitalize">{getSolanaNetwork()}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">
                {formatFriendlyDate(profile?.createdAt)}
              </span>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}

          <Button
            type="button"
            className="w-full cursor-pointer"
            disabled={saving || uploadingAvatar}
            onClick={() => void saveProfile()}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export function ProfilesPageContent() {
  const { isConnected } = useProfileView();

  return (
    <AppShell>
      {isConnected ? (
        <ProfileEditor />
      ) : (
        <main className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
          <PageHeader
            eyebrow="Identity"
            title="Profile"
            description="Connect your wallet to create your Goalaxify profile."
          />
          <WalletGate
            title="Connect to view your profile"
            description="Your wallet address, username, and avatar live here once you connect."
          >
            <div />
          </WalletGate>
        </main>
      )}
    </AppShell>
  );
}
