import type { ResourceData } from "@daodao/api";
import { ShellSvg } from "@daodao/assets";
import { format } from "date-fns";

interface ResourceIntroductionProps {
  resource: Pick<
    ResourceData,
    "description" | "videoUrl" | "favoriteCount" | "updatedAt" | "createdAt"
  >;
}

export function ResourceIntroduction({ resource }: ResourceIntroductionProps) {
  return (
    <div className="space-y-10">
      <div className="prose max-w-none whitespace-pre-wrap">{resource.description}</div>
      {resource.videoUrl && (
        <div className="aspect-[1120/633]">
          <iframe
            className="size-full rounded-lg"
            width="560"
            height="315"
            src={resource.videoUrl}
            title="YouTube video player"
            frameBorder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-1">
          <ShellSvg />
          <span>{resource.favoriteCount}</span>
        </div>
        <time>{format(new Date(resource.updatedAt ?? resource.createdAt), "yyyy/MM/dd")}</time>
      </div>
    </div>
  );
}
