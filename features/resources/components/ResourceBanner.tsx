// import { useRouter } from "next/router";
import Link from 'next/link';
import { StaticImageData } from 'next/image';
import { SearchIcon, SendHorizontalIcon } from 'lucide-react';
import { OptionProps } from '@/components/ui/option';
// import { AuthButton } from "@/contexts/Auth";
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/wrapper';
import { Input } from '@/components/ui';
import { Image } from '@/components/ui/image';
import SectionTitle from './SectionTitle';

interface ResourceBannerProps {
  size?: 'md' | 'lg';
  title: string;
  content: string;
  image: string | StaticImageData;
  hotTags?: OptionProps[];
  length?: number;
  onSearch?: (value: string) => void;
}

export default function ResourceBanner({
  size = 'lg',
  title,
  content,
  image,
  hotTags,
  length,
  onSearch,
}: ResourceBannerProps) {
  // const router = useRouter();
  const isMediumSize = size === 'md';
  const isLargeSize = size === 'lg';

  return (
    <section
      className={cn(
        'relative bg-primary-palest lg:py-12',
        isMediumSize && 'rounded-xl overflow-hidden lg:px-10'
      )}
    >
      {/* 圖片 */}
      <div
        className={cn(
          'relative aspect-video overflow-hidden',
          'lg:aspect-auto lg:w-1/2 lg:absolute lg:top-0 lg:right-0 lg:h-full lg:object-cover'
        )}
      >
        <Image src={image} alt={title} className="min-h-full object-cover" />

        <div className="absolute inset-0 block size-full bg-primary-base opacity-30 lg:hidden" />
        <div className="bg-gradient-primary-palest absolute right-0 top-0 hidden size-full lg:block" />
      </div>

      <Container>
        {/* 搜尋欄 標籤 分享資源 */}
        <div className="relative flex flex-col gap-5 pb-11 pt-5 lg:w-3/5 lg:gap-6 lg:p-0">
          <div>
            <SectionTitle as={isMediumSize ? 'h2' : 'h1'} title={title} />

            <div className="text-5 mt-2 text-basic-500 md:mt-3 md:text-[1.125rem]">
              {content}
            </div>
          </div>

          {/* 搜尋欄 */}
          {isLargeSize && (
            <Input
              inputClassName="bg-white"
              prefixIcon={<SearchIcon />}
              suffixIcon={(v) => v.length > 0 && <SendHorizontalIcon />}
              onSuffixIconClick={onSearch}
              placeholder="想找什麼資源..."
            />
          )}

          <div className="flex flex-col">
            {/* 標籤 */}
            {isLargeSize && Array.isArray(hotTags) && hotTags.length > 0 && (
              <div className="mb-5 flex flex-col gap-2 md:mb-6 md:flex-row md:items-center md:gap-3">
                <div className="h-[1.875rem] min-w-[4.5rem] text-nowrap text-xl font-bold md:h-[1.6875rem] md:text-lg md:leading-[1.6875rem]">
                  熱門標籤
                </div>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {hotTags.map(({ label, value }) => (
                    <Badge
                      key={value}
                      variant="outline"
                      className="px-3 py-0.5 text-primary-base"
                      asChild
                    >
                      <Link href={`/resource/categories/${value}`}>
                        <span className="font-bold">#</span>
                        {label}
                      </Link>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isMediumSize && typeof length === 'number' && (
              <div className="mb-6 flex flex-col md:flex-row md:items-center">
                <div className="body-lg">
                  共
                  {' '}
                  <span className="font-bold">{length}</span>
                  {' '}
                  筆資源
                </div>
              </div>
            )}

            {/* <AuthButton
              className="md:w-max"
              size="lg"
              onClick={() => router.push("/resource/create")}
            >
              + 分享資源
            </AuthButton> */}
          </div>
        </div>
      </Container>
    </section>
  );
}
