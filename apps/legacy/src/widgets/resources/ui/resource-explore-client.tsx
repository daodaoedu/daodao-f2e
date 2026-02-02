"use client";

import { z } from "zod";
import { SectionTitle } from "@/features/resources";
import { cn } from "@/shared/lib/cn";
import useQueryState from "@/shared/lib/use-query-state";

export function ResourceExploreClient() {
  const [filters] = useQueryState(
    z.object({
      query: z.string(),
    })
  );
  const keyword = filters.query;

  return <SectionTitle as="h1" title="所有資源" className={cn(keyword && "hidden")} />;
}
