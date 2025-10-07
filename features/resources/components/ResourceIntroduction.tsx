import React from 'react';
import { format } from 'date-fns';
import { ResourceDetailResponseSchema } from '@/services/resources/core/schema';
import { MarkdownEditor } from '@/shared/ui/markdown-editor';
import ShellSvg from '@/public/assets/icons/shell.svg';

interface ResourceIntroductionProps {
  resource: ResourceDetailResponseSchema['data'];
}

export default function ResourceIntroduction({
  resource,
}: ResourceIntroductionProps) {
  return (
    <div className="space-y-10">
      <MarkdownEditor value={resource.description} readOnly disabledProse />
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
        <time>
          {format(
            new Date(resource.updatedAt ?? resource.createdAt),
            'yyyy/MM/dd'
          )}
        </time>
      </div>
    </div>
  );
}
