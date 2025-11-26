import { AspectRatio } from '@/shared/ui/aspect-ratio';
import { Badge } from '@/shared/ui/badge';
import { Image } from '@/shared/ui/image';
import { ResultDetail, Theme } from '../model';

interface ResultCardProps {
  detail: ResultDetail;
  theme: Theme;
  className?: string;
}

export const ResultCard = ({ detail, theme, className }: ResultCardProps) => {
  return (
    <section className={className}>
      <div className="flex items-center">
        <div className="flex flex-1 flex-col gap-2">
          <div>我有一個島，它叫...</div>
          <div className="flex gap-1">
            <h1 className="heading-md leading-relaxed text-[var(--color)]">
              {theme.title}
            </h1>
            <div className="flex size-7 items-center justify-center rounded-full rounded-bl-none bg-[var(--secondary-color)] text-white">
              {detail.id.toUpperCase()}
            </div>
          </div>
          <div className="flex gap-2">
            {detail.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="px-2 text-xs text-[var(--color)]"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="relative basis-44">
          <AspectRatio ratio={9 / 7}>
            <Image src={theme.largeImg} alt={theme.title} fill priority />
          </AspectRatio>
        </div>
      </div>
    </section>
  );
};
