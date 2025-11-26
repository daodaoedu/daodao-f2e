'use client';

import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Image } from '@/shared/ui/image';
import { Title } from '@/shared/ui/typography';
import { AspectRatio } from '@/shared/ui/aspect-ratio';
import { Separator } from '@/shared/ui/separator';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/cn';
import { timeDuration } from '@/shared/lib/date';
import { getOptionLabel } from '@/shared/lib/option';
import { OptionProps } from '@/shared/ui/option';
import { ALL_AREAS, TBD_OPTION } from '@/constants/areas';
import { CATEGORIES } from '@/constants/category';
import { EDUCATION } from '@/constants/member';
import type { CircleData } from '@/entities/circle';
import emptyCoverPng from '@/public/assets/images/empty-cover.png';
import { CustomLink } from '@/shared/ui/custom-link';

const MarkdownEditor = dynamic(
  () =>
    import('@/shared/ui/markdown-editor').then((mod) => ({
      default: mod.MarkdownEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="body-sm line-clamp-2 h-10 animate-pulse rounded bg-gray-100" />
    ),
  }
);

interface CircleCardProps {
  data: CircleData;
}

const formatToString = (
  options: OptionProps[],
  values: string[],
  defaultValue = ''
) => {
  const mapping = Object.fromEntries(
    options.map((acc) => [acc.value, acc.label])
  );
  return Array.isArray(values)
    ? values.map((item) => mapping[item] ?? item).join('、')
    : (mapping[values] ?? values ?? defaultValue);
};

export const CircleCard = ({ data }: CircleCardProps) => {
  return (
    <CustomLink
      className={cn(
        'relative block rounded-md bg-white p-2 text-basic-500 transition-[transform,box-shadow]',
        'hover:z-10 hover:scale-105 hover:shadow-md'
      )}
      href={`/circles/${data._id}`}
    >
      <AspectRatio ratio={2 / 1} className="overflow-hidden rounded">
        <Image
          alt={data.photoAlt || '未放封面'}
          src={data.photoURL || emptyCoverPng}
          className="object-cover"
          fill
        />
      </AspectRatio>
      <div className="space-y-2.5 p-2.5">
        <Title size="sm" className="truncate font-bold">
          {data.title}
        </Title>
        <div className="space-y-1 text-xs">
          <div className="flex h-3 items-center gap-1.5">
            <h3 className="shrink-0">學習領域</h3>
            <Separator orientation="vertical" className="bg-basic-500" />
            <p className="truncate">
              {formatToString(CATEGORIES, data.category, '不拘')}
            </p>
          </div>
          <div className="flex h-3 items-center gap-1.5">
            <h3 className="shrink-0">適合階段</h3>
            <Separator orientation="vertical" className="bg-basic-500" />
            <p className="truncate">
              {formatToString(EDUCATION, data.partnerEducationStep, '皆可')}
            </p>
          </div>
        </div>
        <div className="body-sm line-clamp-2 h-10">
          <MarkdownEditor
            value={data.content
              ?.split('\n')
              .filter((item) => item && !item.startsWith('!['))
              .slice(0, 1)
              .join('\n')}
            disabledProse
            suppressLinkDefaultPrevent
            readOnly
          />
        </div>
        <div className="flex items-center gap-1 text-xs">
          <MapPin size={16} className="text-basic-400" />
          <p className="text-basic-300">
            {getOptionLabel(ALL_AREAS, data.area, TBD_OPTION.label)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <time className="text-xs font-light text-basic-300">
            {timeDuration(data.updatedDate)}
          </time>
          <Badge
            className={cn(
              "rounded px-1.5 py-1 text-xs font-bold before:mr-1.5 before:block before:size-1.5 before:rounded-full before:content-['']",
              data.isGrouping
                ? 'bg-primary-lightest text-primary-base before:bg-primary-base'
                : 'bg-basic-100 text-basic-300 before:bg-basic-300'
            )}
          >
            {data.isGrouping ? '揪團中' : '已結束'}
          </Badge>
        </div>
      </div>
    </CustomLink>
  );
};

