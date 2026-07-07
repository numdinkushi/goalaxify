import type { MomentEvent } from "@goalaxify/domain";
import type { MomentView } from "@/lib/data/types";
import { MomentClip } from "@/components/live/moment-clip";
import {
  formatMatchTitle,
  formatRelativeTime,
  formatScoreline,
} from "@/lib/utils/format";

type MomentFeedProps = {
  moments: MomentView[];
  homeTeam?: string;
  awayTeam?: string;
};

const EVENT_LABELS: Record<MomentEvent["eventType"], string> = {
  goal: "Goal",
  halftime: "Halftime",
  fulltime: "Full time",
};

export function MomentFeed({ moments, homeTeam, awayTeam }: MomentFeedProps) {
  if (moments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
        No moments yet. Goal clips will appear here as the match unfolds.
      </div>
    );
  }

  const matchLabel =
    homeTeam && awayTeam ? formatMatchTitle(homeTeam, awayTeam) : "Live match";

  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold tracking-[0.18em] text-brand-pastel-pink uppercase">
        {matchLabel}
      </p>

      <div className="space-y-2">
        {moments.map((moment) => (
          <article
            key={moment.id}
            className="rounded-2xl border border-border/80 bg-card/80 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-wide text-brand-coral uppercase">
                {EVENT_LABELS[moment.eventType]} · {moment.minute}&apos;
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(moment.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-lg font-bold">
              {formatScoreline(moment.homeScore, moment.awayScore)}
            </p>
            {moment.summary && (
              <p className="mt-1 text-sm text-muted-foreground">{moment.summary}</p>
            )}
            {moment.eventType === "goal" && moment.clipUrl && (
              <MomentClip
                clipUrl={moment.clipUrl}
                label={`${EVENT_LABELS.goal} at ${moment.minute} minutes`}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
