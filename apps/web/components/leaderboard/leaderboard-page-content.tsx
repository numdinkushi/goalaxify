"use client";

import { Medal, Trophy, UserRound } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useTranslation } from "@/hooks/use-translation";
import { formatMatchTitle } from "@/lib/utils/format";
import { formatTokenAmount } from "@/lib/utils/prediction";
import { shortWalletAddress } from "@/lib/wallet/utils";
import { cn } from "@/lib/utils";

function rankLabel(index: number, t: (key: string, params?: Record<string, string | number>) => string) {
  if (index === 0) return t("leaderboard.rank1");
  if (index === 1) return t("leaderboard.rank2");
  if (index === 2) return t("leaderboard.rank3");
  return t("leaderboard.rankNth", { rank: index + 1 });
}

export function LeaderboardPageContent() {
  const { topWinners, recentWins, loading } = useLeaderboard();
  const { t } = useTranslation();

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6 px-6 pt-8 pb-8">
        <PageHeader
          eyebrow={t("leaderboard.eyebrow")}
          title={t("leaderboard.title")}
          description={t("leaderboard.description")}
        />

        <Card className="border-border/80">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-brand-coral" />
              <p className="text-sm font-semibold">{t("leaderboard.topWinners")}</p>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground">{t("leaderboard.loading")}</p>
            ) : topWinners.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("leaderboard.empty")}</p>
            ) : (
              <ul className="space-y-2">
                {topWinners.map((entry, index) => (
                  <li
                    key={entry.walletPubkey}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border border-border/80 px-4 py-3",
                      index < 3 && "border-brand-coral/25 bg-brand-coral/5",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                        index === 0
                          ? "bg-brand-coral text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {index < 3 ? <Medal className="size-4" /> : index + 1}
                    </span>

                    {entry.avatarUrl ? (
                      <img
                        src={entry.avatarUrl}
                        alt=""
                        className="size-10 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <UserRound className="size-5" />
                      </span>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {entry.displayName ??
                          shortWalletAddress(entry.walletPubkey, 6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.wins === 1
                          ? t("leaderboard.wins", { count: entry.wins })
                          : t("leaderboard.winsPlural", { count: entry.wins })}{" "}
                        · {rankLabel(index, t)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold tabular-nums text-brand-mint">
                        {formatTokenAmount(entry.totalWinnings)} SOL
                      </p>
                      <p className="text-xs text-muted-foreground">{t("leaderboard.totalWon")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm font-semibold">{t("leaderboard.recentWins")}</p>

            {loading ? (
              <p className="text-sm text-muted-foreground">{t("leaderboard.loadingRecent")}</p>
            ) : recentWins.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("leaderboard.emptyRecent")}</p>
            ) : (
              <ul className="divide-y divide-border rounded-2xl border border-border/80">
                {recentWins.map((win) => (
                  <li
                    key={win._id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {win.displayName ??
                          shortWalletAddress(win.walletPubkey, 6)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatMatchTitle(win.homeTeam, win.awayTeam)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="mint">
                        +{formatTokenAmount(win.payoutAmount ?? win.estimatedReturn ?? 0)}{" "}
                        {win.stakeToken}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </AppShell>
  );
}
