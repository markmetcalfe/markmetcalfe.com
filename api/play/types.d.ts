// See api/countries/types.d.ts for why this isn't `declare global`.
export interface CountriesSeedPayload {
  roomId: string;
  hostId: string;
  hostName: string;
}

export interface DoodleSeedPayload {
  roomId: string;
  hostId: string;
  hostName: string;
  suggestedWords: Record<string, string>;
}

export interface Env {
  LOBBY_ROOMS: DurableObjectNamespace;
  COUNTRIES: {
    seedRoom(payload: CountriesSeedPayload): Promise<void>;
  };
  DOODLE: { seedRoom(payload: DoodleSeedPayload): Promise<void> };
  ENVIRONMENT: string;
  IS_PLAYWRIGHT?: string;
}
