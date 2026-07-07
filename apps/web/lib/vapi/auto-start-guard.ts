/** Survives React Strict Mode remounts — refs reset, module state does not. */
const consumedAutoStartKeys = new Set<string>();

export function buildBoothAutoStartKey(input: {
  fixtureId: number;
  managePredictionId?: string | null;
}): string {
  if (input.managePredictionId) {
    return `manage:${input.managePredictionId}`;
  }

  return `stake:${input.fixtureId}`;
}

export function claimBoothAutoStart(key: string): boolean {
  if (consumedAutoStartKeys.has(key)) {
    return false;
  }

  consumedAutoStartKeys.add(key);
  return true;
}

export function releaseBoothAutoStart(key: string) {
  consumedAutoStartKeys.delete(key);
}
