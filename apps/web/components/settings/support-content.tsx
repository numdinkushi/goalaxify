"use client";

import { Check, Copy, ExternalLink, Heart, HelpCircle, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const SUPPORT_EMAIL = "support@goalaxify.app";

export function SupportContent() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    void navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-2 text-sm text-foreground">
      <div className="space-y-2">
        <div className="mb-2 flex items-center gap-2">
          <HelpCircle className="size-5 text-brand-coral" />
          <h3 className="text-lg font-semibold text-brand-coral">Support</h3>
        </div>
        <p className="text-muted-foreground">
          Need help with the booth, your wallet, or a bet? Start here.
        </p>
      </div>

      <section className="space-y-4">
        <h4 className="flex items-center gap-2 font-semibold text-brand-coral">
          <MessageCircle className="size-4" />
          Frequently Asked Questions
        </h4>
        <div className="space-y-3 text-muted-foreground">
          <div>
            <p className="mb-1 font-medium text-foreground">
              How do I place a prediction?
            </p>
            <p>
              Open The Booth, connect your wallet, and talk through your pick
              and stake. The announcer confirms before submitting on-chain.
            </p>
          </div>
          <div>
            <p className="mb-1 font-medium text-foreground">
              Can I bet in my own language?
            </p>
            <p>
              Yes. Go to Settings → Language and pick your language — it applies
              to the app and the voice booth announcer.
            </p>
          </div>
          <div>
            <p className="mb-1 font-medium text-foreground">
              When do I get paid out?
            </p>
            <p>
              After the match settles against TxLINE oracle data, claim
              winnings from your wallet or profile bets tab.
            </p>
          </div>
          <div>
            <p className="mb-1 font-medium text-foreground">
              Can I cancel before kickoff?
            </p>
            <p>
              Yes. Open the bet in The Booth or your profile and request a full
              refund before the match starts.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h4 className="flex items-center gap-2 font-semibold text-brand-coral">
          <Mail className="size-4" />
          Contact Support
        </h4>
        <p className="text-muted-foreground">
          Reach the Goalaxify team by email:
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-xs break-all">
            {SUPPORT_EMAIL}
          </code>
          <Button variant="outline" size="sm" onClick={copyEmail}>
            {copied ? (
              <>
                <Check className="size-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            window.location.href = `mailto:${SUPPORT_EMAIL}`;
          }}
        >
          <ExternalLink className="size-4" />
          Open email app
        </Button>
      </section>

      <section className="space-y-4 border-t border-border/60 pt-4">
        <h4 className="flex items-center gap-2 font-semibold text-brand-coral">
          <Heart className="size-4" />
          Built for the TxODDS World Cup hackathon
        </h4>
        <p className="text-muted-foreground">
          Goalaxify combines voice-native fan UX with on-chain settlement
          powered by TxLINE — so predictions feel human and settle with proof.
        </p>
      </section>
    </div>
  );
}
