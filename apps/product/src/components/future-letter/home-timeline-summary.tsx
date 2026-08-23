"use client";

import { useAllMyTimeline } from "@daodao/api";
import { useRouter } from "@daodao/i18n/navigation";
import { useMemo } from "react";
import { CompactTimelineStrip } from "./compact-timeline-strip";
import {
  buildTimelineCoordinates,
  getTimelineSummary,
  type TimelineCoordinate,
} from "./timeline-model";

export function HomeTimelineSummary() {
  const router = useRouter();
  const timelineQuery = useAllMyTimeline();
  const timelineEntries = useMemo(
    () => timelineQuery.data?.flatMap((page) => page.data) ?? [],
    [timelineQuery.data]
  );
  const coordinates = useMemo(
    () => buildTimelineCoordinates(timelineEntries, [], new Date()),
    [timelineEntries]
  );
  const summary = getTimelineSummary(coordinates, undefined, 3);
  const lastPage = timelineQuery.data?.at(-1);
  if (timelineQuery.isLoading || timelineQuery.isValidating || lastPage?.pagination.hasMore)
    return null;
  if (timelineQuery.error) return null;

  const navigate = (node: TimelineCoordinate) => {
    const params = new URLSearchParams({ focusDate: node.date.slice(0, 10) });
    if (node.letterId) params.set("futureLetterId", node.letterId);
    router.push(`/me/footprints?${params.toString()}`);
  };

  return (
    <div className="relative z-[22] -mt-8 flex justify-center md:pl-44">
      <CompactTimelineStrip coordinates={summary} onNodeClick={navigate} />
    </div>
  );
}
