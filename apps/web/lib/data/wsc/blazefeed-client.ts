import type { WscPaginatedResponse, WscVideoClip } from "@/lib/data/wsc/types";

const BLAZEFEED_BASE_URL = "https://blazefeed.clipro.tv/v1";

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord | null {
  return value && typeof value === "object" ? (value as RawRecord) : null;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function getWscBlazefeedApiKey(): string | null {
  const apiKey = process.env.WSC_BLAZEFEED_API_KEY?.trim();
  return apiKey ? apiKey : null;
}

export function isWscConfigured(): boolean {
  return getWscBlazefeedApiKey() !== null;
}

function getWscLabelsFilter(): string | undefined {
  return process.env.WSC_LABELS_FILTER?.trim() || undefined;
}

async function blazefeedGet<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const apiKey = getWscBlazefeedApiKey();
  if (!apiKey) {
    throw new Error("WSC BlazeFeed API key is not configured");
  }

  const url = new URL(`${BLAZEFEED_BASE_URL}${endpoint}`);
  url.searchParams.set("ApiKey", apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`WSC BlazeFeed ${endpoint} failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}

function teamsMatch(
  homeTeam: string | undefined,
  awayTeam: string | undefined,
  targetHome: string,
  targetAway: string,
): boolean {
  if (!homeTeam || !awayTeam) return false;

  const normalize = (value: string) => value.trim().toLowerCase();
  const leftHome = normalize(homeTeam);
  const leftAway = normalize(awayTeam);
  const rightHome = normalize(targetHome);
  const rightAway = normalize(targetAway);

  return (
    (leftHome === rightHome && leftAway === rightAway) ||
    (leftHome === rightAway && leftAway === rightHome)
  );
}

function readExtraInfo(record: RawRecord | null): RawRecord | null {
  if (!record) return null;
  return asRecord(record.extraInfo) ?? asRecord(record.ExtraInfo);
}

function matchTeams(record: RawRecord, homeTeam: string, awayTeam: string): boolean {
  const extraInfo = readExtraInfo(record);
  if (
    teamsMatch(
      readString(extraInfo?.homeTeam ?? extraInfo?.HomeTeam),
      readString(extraInfo?.awayTeam ?? extraInfo?.AwayTeam),
      homeTeam,
      awayTeam,
    )
  ) {
    return true;
  }

  const title = readString(record.title ?? record.Title) ?? "";
  const normalizedTitle = title.toLowerCase();
  return (
    normalizedTitle.includes(homeTeam.toLowerCase()) &&
    normalizedTitle.includes(awayTeam.toLowerCase())
  );
}

function extractPosterUrl(page: RawRecord): string | undefined {
  const thumbnails = page.thumbnails ?? page.Thumbnails;
  if (!Array.isArray(thumbnails)) return undefined;

  for (const thumbnail of thumbnails) {
    const entry = asRecord(thumbnail);
    const rendition = asRecord(entry?.rendition ?? entry?.Rendition);
    const url =
      readString(rendition?.url) ??
      readString(rendition?.Url) ??
      readString(entry?.url) ??
      readString(entry?.Url);
    if (url) return url;
  }

  return undefined;
}

function extractVideoUrl(record: RawRecord): string | undefined {
  const baseLayer = asRecord(record.baseLayer ?? record.BaseLayer);
  const content = asRecord(baseLayer?.content ?? baseLayer?.Content);
  const renditions = content?.renditions ?? content?.Renditions;

  if (Array.isArray(renditions)) {
    for (const rendition of renditions) {
      const entry = asRecord(rendition);
      const url = readString(entry?.url) ?? readString(entry?.Url);
      if (url && (url.includes(".mp4") || url.includes(".m3u8"))) {
        return url;
      }
    }
  }

  const directCandidates = [
    record.clipUrl,
    record.ClipUrl,
    record.videoUrl,
    record.VideoUrl,
    record.playbackUrl,
    record.PlaybackUrl,
  ];

  for (const candidate of directCandidates) {
    const url = readString(candidate);
    if (url) return url;
  }

  return undefined;
}

function parseTimestamp(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return Date.now();
}

function clipFromPage(
  page: unknown,
  storyId: string,
  homeTeam: string,
  awayTeam: string,
): WscVideoClip | null {
  const record = asRecord(page);
  if (!record) return null;

  const clipUrl = extractVideoUrl(record);
  if (!clipUrl) return null;

  const duration = readNumber(record.duration ?? record.Duration) ?? 0;
  const extraInfo = readExtraInfo(record);
  const pageId = readString(record.id ?? record.Id) ?? `${storyId}-page`;

  return {
    id: pageId,
    clipUrl,
    posterUrl: extractPosterUrl(record),
    duration,
    title: readString(record.title ?? record.Title),
    homeTeam:
      readString(extraInfo?.homeTeam ?? extraInfo?.HomeTeam) ?? homeTeam,
    awayTeam:
      readString(extraInfo?.awayTeam ?? extraInfo?.AwayTeam) ?? awayTeam,
    teamId: readString(extraInfo?.teamId ?? extraInfo?.TeamId),
    playerId: readString(extraInfo?.playerId ?? extraInfo?.PlayerId),
    createdAt: parseTimestamp(record.createTime ?? record.CreateTime),
    source: "story",
  };
}

function clipFromContentItem(
  item: unknown,
  source: WscVideoClip["source"],
  homeTeam: string,
  awayTeam: string,
): WscVideoClip | null {
  const record = asRecord(item);
  if (!record) return null;

  const clipUrl = extractVideoUrl(record);
  if (!clipUrl) return null;

  const extraInfo = readExtraInfo(record);
  const id = readString(record.id ?? record.Id);
  if (!id) return null;

  return {
    id,
    clipUrl,
    posterUrl: extractPosterUrl(record),
    duration: readNumber(record.duration ?? record.Duration) ?? 0,
    title: readString(record.title ?? record.Title),
    homeTeam:
      readString(extraInfo?.homeTeam ?? extraInfo?.HomeTeam) ?? homeTeam,
    awayTeam:
      readString(extraInfo?.awayTeam ?? extraInfo?.AwayTeam) ?? awayTeam,
    teamId: readString(extraInfo?.teamId ?? extraInfo?.TeamId),
    playerId: readString(extraInfo?.playerId ?? extraInfo?.PlayerId),
    createdAt: parseTimestamp(record.createTime ?? record.CreateTime),
    source,
  };
}

function clipsFromStory(
  story: unknown,
  homeTeam: string,
  awayTeam: string,
): WscVideoClip[] {
  const record = asRecord(story);
  if (!record) return [];

  const storyId = readString(record.id ?? record.Id) ?? "story";
  const pages = record.pages ?? record.Pages;
  if (!Array.isArray(pages)) return [];

  return pages
    .map((page) => clipFromPage(page, storyId, homeTeam, awayTeam))
    .filter((clip): clip is WscVideoClip => clip !== null);
}

function isGoalCandidateClip(clip: WscVideoClip): boolean {
  if (clip.duration < 5 || clip.duration > 45) {
    return false;
  }

  return Boolean(clip.playerId || clip.teamId);
}

async function fetchContentByIds(
  endpoint: "stories" | "moments" | "videos",
  contentIds: string[],
): Promise<unknown[]> {
  if (contentIds.length === 0) return [];

  const params: Record<string, string | number | boolean | undefined> = {
    PageSize: contentIds.length,
    ContentIds: contentIds.join(","),
  };

  const response = await blazefeedGet<WscPaginatedResponse<unknown>>(
    `/${endpoint}/ids`,
    params,
  );

  return response.result ?? [];
}

async function listLiveContent(
  endpoint: "stories" | "moments" | "videos",
  homeTeam: string,
  awayTeam: string,
): Promise<unknown[]> {
  const labelsFilter = getWscLabelsFilter();
  const response = await blazefeedGet<WscPaginatedResponse<unknown>>(
    `/${endpoint}`,
    {
      OnlyLive: endpoint === "stories" ? true : undefined,
      PageNum: 0,
      PageSize: 40,
      LabelsFilterExpression: labelsFilter,
      Title: homeTeam,
    },
  );

  const items = response.result ?? [];
  const matched = items.filter((item) => {
    const record = asRecord(item);
    return record ? matchTeams(record, homeTeam, awayTeam) : false;
  });

  if (matched.length > 0) {
    return matched;
  }

  return items.filter((item) => {
    const record = asRecord(item);
    if (!record) return false;
    const title = readString(record.title ?? record.Title) ?? "";
    const normalizedTitle = title.toLowerCase();
    return (
      normalizedTitle.includes(homeTeam.toLowerCase()) ||
      normalizedTitle.includes(awayTeam.toLowerCase())
    );
  });
}

export async function fetchWscMatchClips(
  homeTeam: string,
  awayTeam: string,
): Promise<WscVideoClip[]> {
  if (!isWscConfigured()) {
    return [];
  }

  try {
    const [stories, moments, videos] = await Promise.all([
      listLiveContent("stories", homeTeam, awayTeam).catch(() => []),
      listLiveContent("moments", homeTeam, awayTeam).catch(() => []),
      listLiveContent("videos", homeTeam, awayTeam).catch(() => []),
    ]);

    const storyIds = stories
      .map((story) => readString(asRecord(story)?.id ?? asRecord(story)?.Id))
      .filter((id): id is string => Boolean(id));

    const momentIds = moments
      .map((moment) => readString(asRecord(moment)?.id ?? asRecord(moment)?.Id))
      .filter((id): id is string => Boolean(id));

    const videoIds = videos
      .map((video) => readString(asRecord(video)?.id ?? asRecord(video)?.Id))
      .filter((id): id is string => Boolean(id));

    const [storyDetails, momentDetails, videoDetails] = await Promise.all([
      fetchContentByIds("stories", storyIds).catch(() => stories),
      fetchContentByIds("moments", momentIds).catch(() => moments),
      fetchContentByIds("videos", videoIds).catch(() => videos),
    ]);

    const clips: WscVideoClip[] = [];

    for (const story of storyDetails) {
      clips.push(...clipsFromStory(story, homeTeam, awayTeam));
    }

    for (const moment of momentDetails) {
      const clip = clipFromContentItem(moment, "moment", homeTeam, awayTeam);
      if (clip) clips.push(clip);
    }

    for (const video of videoDetails) {
      const clip = clipFromContentItem(video, "video", homeTeam, awayTeam);
      if (clip) clips.push(clip);
    }

    const deduped = new Map<string, WscVideoClip>();
    for (const clip of clips) {
      if (!deduped.has(clip.id)) {
        deduped.set(clip.id, clip);
      }
    }

    return [...deduped.values()]
      .filter(isGoalCandidateClip)
      .sort((left, right) => left.createdAt - right.createdAt);
  } catch {
    return [];
  }
}
