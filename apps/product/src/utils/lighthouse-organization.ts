/** Resolve an authorized organization; an explicit invalid choice must never fall back. */
export function resolveLighthouseOrganization(
  organizations: ReadonlyArray<{ id: number; status: string }>,
  requested: string | null,
  savedId: number | null,
  resourceId?: number
): { status: "ready"; organizationId: number } | { status: "unavailable" | "empty" } {
  const explicitId =
    resourceId ??
    (requested !== null && /^[1-9]\d*$/.test(requested) ? Number(requested) : undefined);
  if (resourceId !== undefined || requested !== null) {
    const organization = organizations.find(
      (item) => item.id === explicitId && item.status === "active"
    );
    return organization
      ? { status: "ready", organizationId: organization.id }
      : { status: "unavailable" };
  }
  const active = organizations.filter((item) => item.status === "active");
  const organization = active.find((item) => item.id === savedId) ?? active[0];
  return organization ? { status: "ready", organizationId: organization.id } : { status: "empty" };
}

/** Preserve the destination's existing query and hash when carrying organization context. */
export function lighthouseOrganizationHref(href: string, organizationId?: number): string {
  if (!organizationId) return href;
  const url = new URL(href, "https://lighthouse.invalid");
  url.searchParams.set("organizationId", String(organizationId));
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Serialize account preference writes and coalesce rapid changes into the final choice. */
export function createLighthousePreferenceWriter(
  save: (organizationId: number) => Promise<void>,
  onError: (error: unknown) => void = () => {}
) {
  let pending: number | undefined;
  let saved: number | undefined;
  let disposed = false;
  let running: Promise<void> | undefined;
  async function drain() {
    while (!disposed && pending !== undefined) {
      const id = pending;
      pending = undefined;
      if (id === saved) continue;
      try {
        await save(id);
        if (!disposed) saved = id;
      } catch (error) {
        if (!disposed) onError(error);
      }
    }
  }
  return {
    request(id: number) {
      if (disposed) return;
      pending = id;
      if (!running)
        running = drain().finally(() => {
          running = undefined;
        });
    },
    settled: () => running ?? Promise.resolve(),
    dispose() {
      disposed = true;
      pending = undefined;
    },
  };
}

/** Convert a browser URL to the locale-free href expected by next-intl's router. */
export function lighthouseRouterHref(
  href: string,
  locales: readonly string[] = ["zh-TW", "en"]
): string {
  const url = new URL(href, "https://lighthouse.invalid");
  const segments = url.pathname.split("/");
  if (locales.includes(segments[1] ?? "")) segments.splice(1, 1);
  return `${segments.join("/") || "/"}${url.search}${url.hash}`;
}

/** Recover a signed browser traversal distance only from known entry markers. */
export function lighthouseHistoryDelta(current: number, target: unknown): number | null {
  return typeof target === "number" && Number.isSafeInteger(target) && target !== current
    ? target - current
    : null;
}

/** Unknown history entries require source-state restoration, never a guessed traversal. */
export function lighthouseHistoryRestore(
  current: number,
  target: unknown
): { kind: "traverse"; delta: number } | { kind: "replace" } {
  const delta = lighthouseHistoryDelta(current, target);
  return delta === null ? { kind: "replace" } : { kind: "traverse", delta };
}

/** A numeric history index is meaningful only inside the provider instance that tagged it. */
export function lighthouseScopedHistoryRestore(
  current: number,
  scope: string,
  target: unknown
): { kind: "traverse"; delta: number } | { kind: "replace" } {
  if (!target || typeof target !== "object" || !("scope" in target) || target.scope !== scope) {
    return { kind: "replace" };
  }
  return lighthouseHistoryRestore(current, "index" in target ? target.index : undefined);
}

export type LighthouseTraversalEventType = Event & {
  navigationType?: string;
  destination?: { url: string; key: string };
};

/** Cancel a native traversal before Next can unmount dirty forms; only confirmed traversals pass. */
export function interceptLighthouseTraversal(
  event: LighthouseTraversalEventType,
  guard: { dirty: boolean; busy: boolean },
  allowing = false
): { kind: "blocked" } | { kind: "confirm"; href: string; key: string } | null {
  if (
    event.navigationType !== "traverse" ||
    allowing ||
    (!guard.dirty && !guard.busy) ||
    !event.cancelable ||
    !event.destination
  )
    return null;
  event.preventDefault();
  if (guard.busy) return { kind: "blocked" };
  return {
    kind: "confirm",
    href: lighthouseRouterHref(event.destination.url),
    key: event.destination.key,
  };
}
