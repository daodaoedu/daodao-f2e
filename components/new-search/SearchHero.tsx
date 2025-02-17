import Image from "@/shared/components/Image";
import LensIcon from "@/public/assets/icons/lens.svg";
import { useRef } from "react";

export const SearchHero = () => {
  const tagList = [1, 2, 3, 4, 5, 6, 7];

  const inputRef = useRef<HTMLInputElement>(null);

  const onClickFocus = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      {/* 圖片 */}
      <div className=" relative h-[17.3125rem] md:absolute md:right-0 md:h-full md:object-cover md:z-[0] md:mt-[-3rem] lg:absolute lg:right-0 lg:h-full lg:object-cover lg:z-[0] lg:mt-[-3rem] ">
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
              "linear-gradient(270.27deg, rgba(243, 252, 252, 0) 16.33%, #F3FCFC 96.08%), rgba(22, 185, 179, 0.3)",
          }}
        />
      </div>

      {/* 搜尋欄 標籤 分享資源 */}
      <div className="relative p-[1.25rem] pb-[2.75rem] flex flex-col gap-[1.25rem] md:p-0 md:gap-[1.5rem]">
        <div>
          <div className="h-[2.8125rem] leading-[2.8rem] font-bold text-[1.75rem] text-basic-black md:text-[2.25rem] md:leading-[3.6rem] md:h-[3.625rem]">
            找資源
          </div>

          <div className="text-basic-500 text-[1.25rem] mt-[0.5rem] md:text-[1.125rem] md:mt-[0.75rem]">
            藉由他人真實的資源使用經驗，找到真正適合自己的學習資源，透過個人化推薦系統，幫助每位學習者在龐大的學習資源中，快速找到最適合自己的內容！
          </div>
        </div>

        {/* 搜尋欄 */}
        <div className="relative">
          <LensIcon
            className="absolute top-[0.625rem] left-[1rem]"
            onClick={onClickFocus}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="想找什麼資源..."
            className="h-[2.5rem] w-full rounded-lg border-[#DBDBDB] border-[1px] flex items-center justify-center p-[0_1rem_0_2.75rem]"
          />
        </div>

        {/* 標籤 */}
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="text-nowrap min-w-[4.5rem] h-[1.875rem] text-[1.25rem] font-bold md:text-[1.125rem] md:leading-[1.6875rem] md:h-[1.6875rem]">
              熱門標籤
            </div>
            <div className="flex flex-wrap gap-[0.25rem] m-[0.5rem_0_1.25rem_0] md:m-[0_0_0_0.75rem] md:gap-[0.5rem]">
              {tagList.map((item) => {
                return (
                  <div
                    key={item}
                    className="h-[2rem] w-[3.75rem] text-primary-base flex items-center justify-center rounded-2xl bg-white md:h-[1.8125rem]"
                    // border-[1px] border-primary-base 沒用
                    style={{ border: "1px solid #16B9B3" }}
                  >
                    <span className="font-bold">#</span>
                    {item}
                  </div>
                );
              })}
            </div>
          </div>

          <button className="w-full h-[2.5rem] text-[1.125rem] bg-primary-base text-white rounded-full flex items-center justify-center md:w-[7.75rem] md:mt-[1.5rem]">
            + 分享資源
          </button>
        </div>
      </div>

      {/* placeholder block - only desktop would be visible*/}
      <div className="hidden md:h-[19.0625rem] lg:block lg:min-w-[28.6875rem]" />
    </>
  );
};
