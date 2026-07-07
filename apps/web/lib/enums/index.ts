export enum AppRoute {
  Home = "/",
  Booth = "/booth",
  Live = "/live",
  Wallet = "/wallet",
  Profiles = "/profiles",
  Settings = "/settings",
}

export enum DataSource {
  Mock = "mock",
  Txline = "txline",
  Convex = "convex",
}

export enum OddsSource {
  Mock = "mock",
  Txline = "txline",
}

export enum MatchOutcome {
  Home = "home",
  Draw = "draw",
  Away = "away",
}

export enum MatchStatus {
  Scheduled = "scheduled",
  Live = "live",
  Halftime = "halftime",
  Finished = "finished",
}

export enum MomentEventType {
  Goal = "goal",
  Halftime = "halftime",
  Fulltime = "fulltime",
}

export enum BoothCallStatus {
  Idle = "idle",
  Connecting = "connecting",
  Active = "active",
  Ended = "ended",
  Error = "error",
}
