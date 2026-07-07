import {
  getTxlineNetworkConfig,
  type TxlineNetwork,
  WORLD_CUP_FREE_TIERS,
} from "@goalaxify/config";

export interface TxlineCredentials {
  guestJwt: string;
  apiToken: string;
}

export interface TxlineClientOptions {
  network?: TxlineNetwork;
  credentials: TxlineCredentials;
}

export class TxlineClient {
  readonly network: TxlineNetwork;
  readonly config: ReturnType<typeof getTxlineNetworkConfig>;
  readonly credentials: TxlineCredentials;

  constructor(options: TxlineClientOptions) {
    this.network = options.network ?? "devnet";
    this.config = getTxlineNetworkConfig(this.network);
    this.credentials = options.credentials;
  }

  private authHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.credentials.guestJwt}`,
      "X-Api-Token": this.credentials.apiToken,
      "Content-Type": "application/json",
    };
  }

  async getJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.config.apiBaseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        ...this.authHeaders(),
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`TxLINE ${path} failed (${response.status}): ${body}`);
    }

    return response.json() as Promise<T>;
  }

  async listFixtures() {
    return this.getJson<unknown>("/fixtures/snapshot");
  }

  async getOddsSnapshot(fixtureId: number, asOf = Date.now()) {
    return this.getJson<unknown>(`/odds/snapshot/${fixtureId}?asOf=${asOf}`);
  }

  async getScoresSnapshot(fixtureId: number, asOf = Date.now()) {
    return this.getJson<unknown>(`/scores/snapshot/${fixtureId}?asOf=${asOf}`);
  }
}

export { WORLD_CUP_FREE_TIERS };
