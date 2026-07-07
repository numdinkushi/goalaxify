"use client";

import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Gavel,
  Scale,
  XCircle,
} from "lucide-react";

export function TermsOfServiceContent() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6 pb-2 text-sm text-foreground">
      <div className="space-y-2">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="size-5 text-brand-coral" />
          <h3 className="text-lg font-semibold text-brand-coral">
            Terms of Service
          </h3>
        </div>
        <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <CheckCircle className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              1. Acceptance of Terms
            </h4>
            <p className="text-muted-foreground">
              By using Goalaxify, you agree to these Terms of Service. If you
              disagree, please do not use the platform.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <Scale className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              2. Service Description
            </h4>
            <p className="mb-2 text-muted-foreground">
              Goalaxify is a World Cup prediction platform that provides:
            </p>
            <ul className="ml-4 list-disc space-y-2 text-muted-foreground">
              <li>Voice-driven match predictions through The Booth</li>
              <li>SOL/USDC staking on Solana prediction pools</li>
              <li>Live match moments and fan-facing match data</li>
              <li>Settlement against TxODDS TxLINE oracle results</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              3. User Responsibilities
            </h4>
            <ul className="ml-4 list-disc space-y-2 text-muted-foreground">
              <li>Maintain control and security of your wallet</li>
              <li>Use the service only where legally permitted</li>
              <li>Confirm predictions and stake amounts before submitting</li>
              <li>Do not attempt to manipulate pools or settlement</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <XCircle className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              4. Prohibited Activities
            </h4>
            <ul className="ml-4 list-disc space-y-2 text-muted-foreground">
              <li>Using bots or automated tools to place predictions</li>
              <li>Exploiting bugs, refunds, or settlement flows</li>
              <li>Creating multiple wallets to game leaderboards</li>
              <li>Reverse engineering or attacking platform infrastructure</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <Scale className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              5. Stakes & Settlement
            </h4>
            <ul className="ml-4 list-disc space-y-2 text-muted-foreground">
              <li>Stakes are locked on-chain until match settlement</li>
              <li>Payouts follow parimutuel pool rules after kickoff</li>
              <li>Confirmed blockchain transactions are final</li>
              <li>Network fees are your responsibility</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-start gap-2">
          <Gavel className="mt-1 size-4 shrink-0 text-brand-coral" />
          <div>
            <h4 className="mb-2 font-semibold text-brand-coral">
              6. Limitation of Liability
            </h4>
            <p className="text-muted-foreground">
              Goalaxify is provided as-is. We are not liable for wallet losses,
              network failures, oracle delays, or indirect damages arising from
              use of the service.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
