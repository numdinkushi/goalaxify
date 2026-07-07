"use client";

import { Eye, FileText, Globe, Lock, Shield, Users } from "lucide-react";

export function PrivacyPolicyContent() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 pb-2 text-sm text-foreground">
      <div className="space-y-2">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="size-5 text-brand-coral" />
          <h3 className="text-lg font-semibold text-brand-coral">
            Privacy Policy
          </h3>
        </div>
        <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <Lock className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              1. Information We Collect
            </h4>
            <ul className="ml-4 list-disc space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Wallet address:</strong>{" "}
                Used to place stakes, receive payouts, and show your profile
              </li>
              <li>
                <strong className="text-foreground">Voice sessions:</strong>{" "}
                Booth conversations and prediction choices processed through our
                voice provider
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> How you
                interact with matches, the booth, and settlement flows
              </li>
              <li>
                <strong className="text-foreground">Preferences:</strong> App
                language stored locally on your device
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <Eye className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              2. How We Use Your Information
            </h4>
            <ul className="ml-4 list-disc space-y-2 text-muted-foreground">
              <li>Process stakes and settlements on Solana</li>
              <li>Run voice prediction sessions in your selected language</li>
              <li>Display your bets, leaderboard rank, and match history</li>
              <li>Improve booth accuracy and platform reliability</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <Users className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              3. Data Sharing
            </h4>
            <p className="mb-2 text-muted-foreground">
              We do not sell your personal information. We may share data only
              when:
            </p>
            <ul className="ml-4 list-disc space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">On-chain activity:</strong>{" "}
                Wallet addresses and transactions are public on Solana
              </li>
              <li>
                <strong className="text-foreground">Service providers:</strong>{" "}
                Voice, hosting, and data partners under confidentiality terms
              </li>
              <li>
                <strong className="text-foreground">Legal requirements:</strong>{" "}
                When required to comply with applicable law
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <Globe className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              4. Blockchain & Settlement
            </h4>
            <ul className="ml-4 list-disc space-y-2 text-muted-foreground">
              <li>Stakes and payouts are recorded on Solana</li>
              <li>Match outcomes settle against TxODDS TxLINE oracle data</li>
              <li>Blockchain records cannot be deleted once confirmed</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <FileText className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">5. Contact</h4>
            <p className="text-muted-foreground">
              For privacy questions, reach us through the Support section in
              Settings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
