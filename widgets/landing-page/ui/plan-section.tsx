import Image from 'next/image';
import { cn } from '@/shared/lib/cn';
import { AuthGuardButton } from '@/features/auth';
import { ANCHOR_IDS } from '@/shared/constants';

interface PlanSectionProps {
  className?: string;
}

export function PlanSection({ className }: PlanSectionProps) {
  return (
    <section
      className={cn(
        'relative mt-[60px] flex flex-col items-center justify-center overflow-x-clip pb-[60px]',
        className
      )}
      id={ANCHOR_IDS.PLANS}
    >
      {/* Section Header */}
      <div className="px-6 pb-[60px] text-center text-primary-darker">
        <h2 className="mb-2 text-[28px] font-semibold">加入島島阿學</h2>
        <h3 className="text-sm">
          搶先體驗完整學習平台，與我們一起打造更好的學習體驗
        </h3>
      </div>

      <div className="container">
        <div className="flex w-full flex-col items-center justify-center py-8 md:flex-row md:gap-6">
          {/* 外層容器 - 用於定位裝飾元素 */}
          <div className="relative">
            {/* 裝飾元素 - 半圓 */}
            <Image
              src="/assets/landing-page/deco-semicircle.svg"
              alt="裝飾半圓"
              width={120}
              height={120}
              className="absolute -left-16 -top-10 z-0"
            />

            {/* 內容區塊 */}
            <div className="relative z-10 flex max-w-[400px] flex-col items-center justify-center rounded-[20px] border-2 border-primary-base bg-primary-palest p-6 text-primary-darker">
              <h2 className="text-center text-lg font-semibold">
                探索所有功能，完全免費！
              </h2>
              <p className="mb-6 mt-2 text-center text-[13px]">
                作為早期使用者，你將可以免費使用所有功能
              </p>

              <ul className="mb-3 w-full list-none p-0">
                <li className="text-primary-500 relative border-b border-gray-200 py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  建立學習計劃和主題實踐
                </li>
                <li className="text-primary-500 relative border-b border-gray-200 py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  分享學習想法和資源
                </li>
                <li className="text-primary-500 relative border-b border-gray-200 py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  AI 學習建議和分析
                </li>
                <li className="text-primary-500 relative border-b border-gray-200 py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  成長地圖看見自己的進步和機會
                </li>
                <li className="text-primary-500 relative py-2 pl-10 before:absolute before:left-0 before:top-2 before:size-6 before:bg-[url('/assets/landing-page/icon-bulb.svg')] before:bg-contain before:bg-center before:bg-no-repeat">
                  優先獲得新功能體驗
                </li>
              </ul>

              <AuthGuardButton variant="ctaOrange" size="huge" className="mt-6">
                立即免費註冊
              </AuthGuardButton>
              <p className="mt-2 text-center text-[13px]">
                Beta 期間完全免費 • 無需信用卡
              </p>
            </div>

            {/* 裝飾元素 - 幾何圖形 */}
            <Image
              src="/assets/landing-page/deco-geometries.svg"
              alt="裝飾幾何圖形"
              width={100}
              height={100}
              className="absolute -bottom-10 -right-7 z-20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
