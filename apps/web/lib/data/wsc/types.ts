export type WscVideoClip = {
  id: string;
  clipUrl: string;
  posterUrl?: string;
  duration: number;
  title?: string;
  homeTeam?: string;
  awayTeam?: string;
  teamId?: string;
  playerId?: string;
  createdAt: number;
  source: "story" | "moment" | "video";
};

export type WscPaginatedResponse<T> = {
  totalItems: number;
  result: T[];
};
