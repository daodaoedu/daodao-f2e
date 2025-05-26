import { useRef } from 'react';
import Image from '@/shared/components/Image';
import LensIcon from '@/public/assets/icons/lens.svg';
import { SEARCH_TAGS } from '@/constants/category';
import Button from '@/shared/components/Button';
import { cn } from '@/utils/cn';
import SectionTitle from './SectionTitle';

interface ResourceBannerProps {
  size?: 'md' | 'lg';
  title: string;
  content: string;
  image: string;
  hotTags?: string[];
  length?: number;
}

export default function ResourceBanner({
  size = 'lg',
  title,
  content,
  image,
  hotTags,
  length,
}: ResourceBannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMediumSize = size === 'md';
  const isLargeSize = size === 'lg';

  const onClickFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <section
      className={cn(
        'relative bg-primary-palest p-5 md:py-12 md:px-24 md:flex',
        isMediumSize && 'rounded-xl overflow-hidden md:px-10'
      )}
    >
      {/* 圖片 */}
      <div className="relative h-[17.3125rem] md:absolute md:right-0 md:h-full md:object-cover md:z-0 md:mt-[-3rem] lg:absolute lg:right-0 lg:h-full lg:object-cover lg:z-0 lg:mt-[-3rem] ">
        <Image src={image} alt={title} borderRadius="0" height="inherit" />

        <div className="absolute inset-0 w-full h-full bg-primary-base opacity-30 block md:hidden" />
        <div
          className="h-full w-[calc(100%+1px)] absolute top-0 right-0 bg-[linear-gradient(270.27deg,_rgba(243,252,252,0)_16.33%,_#F3FCFC_96.08%),_rgba(22,185,179,0.3)] hidden md:block"
          style={{
            background:
              'linear-gradient(270.27deg, rgba(243, 252, 252, 0) 16.33%, #F3FCFC 96.08%), rgba(22, 185, 179, 0.3)',
          }}
        />
      </div>

      {/* 搜尋欄 標籤 分享資源 */}
      <div className="relative p-5 pb-11 md:w-3/5 flex flex-col gap-5 md:p-0 md:gap-6">
        <div>
          <SectionTitle as={isMediumSize ? 'h2' : 'h1'} title={title} />

          <div className="text-basic-500 text-5 mt-2 md:text-[1.125rem] md:mt-3">
            {content}
          </div>
        </div>

        {/* 搜尋欄 */}
        {isLargeSize && (
          <div className="relative">
            <LensIcon
              className="absolute top-[0.625rem] left-4"
              onClick={onClickFocus}
            />
            <input
              ref={inputRef}
              type="search"
              placeholder="想找什麼資源..."
              className="h-10 w-full rounded-lg border-[#DBDBDB] border flex items-center justify-center p-[0_1rem_0_2.75rem]"
            />
          </div>
        )}

        <div className="flex flex-col">
          {/* 標籤 */}
          {isLargeSize && Array.isArray(hotTags) && hotTags.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="text-nowrap min-w-[4.5rem] h-[1.875rem] text-xl font-bold md:text-lg md:leading-[1.6875rem] md:h-[1.6875rem]">
                熱門標籤
              </div>
              <div className="flex flex-wrap gap-1 m-[0.5rem_0_1.25rem_0] md:m-[0_0_0_0.75rem] md:gap-2">
                {SEARCH_TAGS['全部'].map((item) => {
                  return (
                    <button
                      key={item}
                      type="button"
                      className="px-3 py-0.5 text-primary-base bg-white border border-solid border-primary-base rounded-full"
                    >
                      <span className="font-bold">#</span>
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isMediumSize && typeof length === 'number' && (
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="body-lg">
                共 <span className="font-bold">{length}</span> 筆資源
              </div>
            </div>
          )}

          <Button variant="solid" color="primary" className="w-max mt-6">
            + 分享資源
          </Button>
        </div>
      </div>
    </section>
  );
}
