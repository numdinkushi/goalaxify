import type { MomentView } from "@/lib/data/types";
import type { WscVideoClip } from "@/lib/data/wsc/types";

const FALLBACK_CLIP_URL = "/assets/video/goals.mp4";

export function enrichMomentsWithWscClips(
  moments: MomentView[],
  clips: WscVideoClip[],
): MomentView[] {
  if (clips.length === 0) {
    return moments.map((moment) =>
      moment.eventType === "goal" && !moment.clipUrl
        ? { ...moment, clipUrl: FALLBACK_CLIP_URL }
        : moment,
    );
  }

  const goalMoments = moments
    .filter((moment) => moment.eventType === "goal")
    .sort((left, right) => (left.createdAt ?? 0) - (right.createdAt ?? 0));

  const clipQueue = [...clips];
  const clipByGoalId = new Map<string, WscVideoClip>();

  for (const goal of goalMoments) {
    const clip = clipQueue.shift();
    if (clip) {
      clipByGoalId.set(goal.id, clip);
    }
  }

  return moments.map((moment) => {
    if (moment.eventType !== "goal") {
      return moment;
    }

    const clip = clipByGoalId.get(moment.id);
    if (!clip) {
      return {
        ...moment,
        clipUrl: moment.clipUrl ?? FALLBACK_CLIP_URL,
      };
    }

    return {
      ...moment,
      clipUrl: clip.clipUrl,
      posterUrl: clip.posterUrl ?? moment.posterUrl,
      wscContentId: clip.id,
      summary: moment.summary ?? clip.title,
    };
  });
}
