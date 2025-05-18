import { useRef } from 'react';
import Image from '@/shared/components/Image';
import LensIcon from '@/public/assets/icons/lens.svg';
import { SEARCH_TAGS } from '@/constants/category';
import Button from '@/shared/components/Button';

export default function SearchHero() {
  const inputRef = useRef<HTMLInputElement>(null);

  const onClickFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      {/* 圖片 */}
      <div className=" relative h-[17.3125rem] md:absolute md:right-0 md:h-full md:object-cover md:z-0 md:mt-[-3rem] lg:absolute lg:right-0 lg:h-full lg:object-cover lg:z-0 lg:mt-[-3rem] ">
        <Image
          src="https://s3-alpha-sig.figma.com/img/286e/253a/fca0a750bc8df12745627d8bcf1120e6?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=tQ2NPRHeQq3Uk-F5uBXhGkWRe0DO2pVQRbRYeAZvYOTxQoLflR3AlaJdLFJi2Qpw-7AkeAeYjcGrne-gkTP2ghhwYRlTGJb4w98CwMs98n0V6s~flgKEFsN5JcII2VTFBCvQhYnTmWQF6akvoX0hTSVgqs~jtuo6rMS5XcKQNm0RIqnxYxFe6jHEdCX2NtvfSTnEk4vkpNMRGXrTEdsf8w-gTOvWLYjpkT0rnSBdXVpfaXi64~bNnr8NHTPWST-L8yiCgXUicVI8YQnOEblZMSiOYCjMY4xYsGmc15KWJqxEKIWiP2FyOn6HzeBrVUUw5Iq3k-CWid7jO1spt2y-JA__"
          alt="找資源"
          borderRadius="0"
          height="inherit"
        />

        <div className="absolute inset-0 w-full h-full bg-primary-base opacity-30 block md:hidden" />
        <div
          className="h-full w-[calc(100%+1px)] absolute top-0 right-0 hidden md:block"
          style={{
            background:
              'linear-gradient(270.27deg, rgba(243, 252, 252, 0) 16.33%, #F3FCFC 96.08%), rgba(22, 185, 179, 0.3)',
          }}
        />
      </div>

      {/* 搜尋欄 標籤 分享資源 */}
      <div className="relative p-5 pb-11 flex flex-col gap-5 md:p-0 md:gap-6">
        <div>
          <div className="h-[2.8125rem] font-bold text-lg leading-[2.8rem] text-basic-black md:text-4xl md:leading-[3.6rem] md:h-[3.625rem]">
            找資源
          </div>

          <div className="text-basic-500 text-5 mt-2 md:text-[1.125rem] md:mt-3">
            藉由他人真實的資源使用經驗，找到真正適合自己的學習資源，透過個人化推薦系統，幫助每位學習者在龐大的學習資源中，快速找到最適合自己的內容！
          </div>
        </div>

        {/* 搜尋欄 */}
        <div className="relative">
          <LensIcon
            className="absolute top-[0.625rem] left-4"
            onClick={onClickFocus}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="想找什麼資源..."
            className="h-10 w-full rounded-lg border-[#DBDBDB] border flex items-center justify-center p-[0_1rem_0_2.75rem]"
          />
        </div>

        {/* 標籤 */}
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="text-nowrap min-w-[4.5rem] h-[1.875rem] text-xl font-bold md:text-lg md:leading-[1.6875rem] md:h-[1.6875rem]">
              熱門標籤
            </div>
            <div className="flex flex-wrap gap-1 m-[0.5rem_0_1.25rem_0] md:m-[0_0_0_0.75rem] md:gap-2">
              {SEARCH_TAGS['全部'].map((item) => {
                return (
                  <button
                    key={item}
                    className="px-3 py-1 text-primary-base bg-white border border-solid border-primary-base rounded-full"
                  >
                    <span className="font-bold">#</span>
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <Button variant="solid" color="primary" className="w-max mt-6">
            + 分享資源
          </Button>
        </div>
      </div>

      {/* placeholder block - only desktop would be visible */}
      <div className="hidden md:h-[19.0625rem] lg:block lg:min-w-[28.6875rem]" />
    </>
  );
}
