/** Merge the pages actually loaded, preserving response metadata and unique records. */
export function mergeCheckInPages<
  T extends { data: { id: number }[]; pagination: { totalItems: number; hasNext: boolean } },
>(pages: T[] | undefined): T | undefined {
  const first = pages?.[0];
  const last = pages?.at(-1);
  if (!first || !last) return undefined;
  const byId = new Map<number, T["data"][number]>();
  for (const page of pages ?? []) {
    for (const item of page.data) {
      if (!byId.has(item.id)) byId.set(item.id, item);
    }
  }
  return {
    ...first,
    data: Array.from(byId.values()),
    pagination: { ...last.pagination, totalItems: first.pagination.totalItems },
  };
}
