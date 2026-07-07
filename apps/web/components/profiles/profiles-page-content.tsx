"use client";

import { Suspense } from "react";

import { ProfileBetsTab } from "@/components/profiles/profile-bets-tab";
import { ProfileDetailsTab } from "@/components/profiles/profile-details-tab";
import { ProfileTabBar } from "@/components/profiles/profile-tab-bar";
import { ProfileWalletTab } from "@/components/profiles/profile-wallet-tab";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { WalletGate } from "@/components/wallet/wallet-gate";
import { useProfileTab } from "@/hooks/use-profile-tab";
import { useProfileView } from "@/hooks/use-profile-view";
import { ProfileTab } from "@/lib/enums";

function ProfilesPageInner() {
  const { isConnected } = useProfileView();
  const { activeTab, setActiveTab } = useProfileTab();

  if (!isConnected) {
    return (
      <main className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
        <PageHeader
          eyebrow="Identity"
          title="Profile"
          description="Connect your wallet to manage your profile, wallet, and bets."
        />
        <WalletGate
          title="Connect to view your profile"
          description="Your wallet address, username, avatar, balance, and bet history live here once you connect."
        >
          <div />
        </WalletGate>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 px-6 pt-4 pb-8">
      <PageHeader
        eyebrow="Identity"
        title="Profile"
        description="Manage your identity, wallet, and on-chain bets in one place."
      />

      <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === ProfileTab.Details && <ProfileDetailsTab />}
      {activeTab === ProfileTab.Wallet && <ProfileWalletTab />}
      {activeTab === ProfileTab.Bets && <ProfileBetsTab />}
    </main>
  );
}

export function ProfilesPageContent() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ProfilesPageInner />
      </Suspense>
    </AppShell>
  );
}
