export interface FixtureManifest {
  journeys?: { challengeTemplate: { id: number; title: string } };
  users: { key: string; email: string; id: number }[];
  organization: { id: number };
  programs: { id: number; kind: string; name: string }[];
  practice_templates: { id: number; title: string }[];
}
export function fixtureUser(manifest: FixtureManifest, key: string) {
  const user = manifest.users.find((entry) => entry.key === key);
  if (!user || !user.email || !Number.isInteger(user.id))
    throw new Error(`Missing fixture user: ${key}`);
  return user;
}
export function fixtureProgram(manifest: FixtureManifest, kind: string) {
  const program = manifest.programs.find((entry) => entry.kind === kind);
  if (!program) throw new Error(`Missing fixture program: ${kind}`);
  return program;
}
export function serviceUrl(base: string, path: string) {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

/** In-memory, worker-local credentials only; rejected login attempts must not poison later attempts. */
export function createAsyncCache<T>() {
  const entries = new Map<string, Promise<T>>();
  return (key: string, load: () => Promise<T>): Promise<T> => {
    const existing = entries.get(key);
    if (existing) return existing;
    const pending = load().catch((error) => {
      entries.delete(key);
      throw error;
    });
    entries.set(key, pending);
    return pending;
  };
}

export function readApiData(status: number, body: string): unknown {
  if (status === 204) return undefined;
  return JSON.parse(body).data;
}

/** DATE fixtures follow the server's Asia/Taipei calendar, independent of the runner TZ. */
export function journeyDate(offset = 0, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find((entry) => entry.type === type)?.value);
  const calendar = new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
  calendar.setUTCDate(calendar.getUTCDate() + offset);
  return calendar.toISOString().slice(0, 10);
}
