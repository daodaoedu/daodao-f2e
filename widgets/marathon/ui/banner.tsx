import { Image } from '@/shared/ui/image';

import LearningMarathonImgDesktopGroup from '@/public/assets/learning-marathon/2025S1-desktop-group.png';
import LearningMarathonImgDesktopIcon1 from '@/public/assets/learning-marathon/2025S1-desktop-icon-1.png';
import LearningMarathonImgDesktopIcon2 from '@/public/assets/learning-marathon/2025S1-desktop-icon-2.png';
import LearningMarathonImgDesktopIcon3 from '@/public/assets/learning-marathon/2025S1-desktop-icon-3.png';
import LearningMarathonImgDesktopIcon4 from '@/public/assets/learning-marathon/2025S1-desktop-icon-4.png';
import LearningMarathonImgDesktopIcon5 from '@/public/assets/learning-marathon/2025S1-desktop-icon-5.png';
import LearningMarathonImgDesktopIcon6 from '@/public/assets/learning-marathon/2025S1-desktop-icon-6.png';
import LearningMarathonImgDesktopGirl from '@/public/assets/learning-marathon/2025S1-desktop-girl-1.png';
import LearningMarathonImgDesktopBoy from '@/public/assets/learning-marathon/2025S1-desktop-boy-1.png';
import LearningMarathonImgDesktopBg from '@/public/assets/learning-marathon/2025S1-desktop-bg.png';
import LearningMarathonImgMobile from '@/public/assets/learning-marathon/2025S1-mobile@2x.png';

import { cn } from '@/utils/cn';
import { ApplyButton } from './apply-button';

export const Banner = () => {
  return (
    <div
      className={cn('relative aspect-[9/14] overflow-hidden md:aspect-[16/10]')}
    >
      <div className="hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fcfefe] via-[#e0f1f2] to-[#e0f1f2]">
          <Image
            src={LearningMarathonImgDesktopBg.src}
            alt="島島盃 - 學習馬拉松 2025 春季賽"
            fill
            className="object-cover"
          />
        </div>
        <div
          className={cn(
            'absolute bottom-0 left-1/2 aspect-[433/427] w-[30%] -translate-x-1/2',
            'opacity-0 animate-delay-200 animate-duration-700 animate-fade-in'
          )}
        >
          <div className="relative size-full">
            <Image
              src={LearningMarathonImgDesktopGroup.src}
              alt="揪團"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div
          className={cn(
            'absolute -left-[2.8%] top-[39%] aspect-[271/404] w-[18%]',
            '-translate-x-full animate-delay-500 animate-duration-1100 -animate-distance-full animate-slide-x-in'
          )}
        >
          <div className="relative size-full">
            <Image
              src={LearningMarathonImgDesktopBoy.src}
              alt="男角色"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div
          className={cn(
            'absolute -right-[1.6%] top-[33%] aspect-[256/351] w-[18%]',
            'translate-x-full animate-delay-1100 animate-duration-1100 animate-slide-x-in'
          )}
        >
          <div className="relative size-full">
            <Image
              src={LearningMarathonImgDesktopGirl.src}
              alt="女角色"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div
          className={cn(
            'absolute left-[27.5%] top-[14%] aspect-[75/77] w-[5%]',
            'opacity-0 animate-delay-200 animate-duration-500 animate-fade-in'
          )}
        >
          <div className="animate-delay-200 animate-oscillate">
            <div className="relative size-full">
              <Image
                src={LearningMarathonImgDesktopIcon5.src}
                alt="icon5"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            'absolute left-[21%] top-[19.5%] aspect-[91/131] w-[6%]',
            'opacity-0 animate-delay-1700 animate-duration-500 animate-fade-in'
          )}
        >
          <div className="animate-delay-1700 animate-oscillate">
            <div className="relative size-full">
              <Image
                src={LearningMarathonImgDesktopIcon3.src}
                alt="icon3"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            'absolute left-[27.5%] top-[45.5%] aspect-[70/39] w-[4.8%]',
            'opacity-0 animate-delay-500 animate-duration-500 animate-fade-in'
          )}
        >
          <div className="animate-delay-1100 animate-oscillate">
            <div className="relative size-full">
              <Image
                src={LearningMarathonImgDesktopIcon1.src}
                alt="icon1"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            'absolute right-[24.5%] top-[16.5%] aspect-[68/112] w-[4.7%]',
            'opacity-0 animate-delay-1300 animate-duration-500 animate-fade-in'
          )}
        >
          <div className="animate-delay-1900 animate-oscillate">
            <div className="relative size-full">
              <Image
                src={LearningMarathonImgDesktopIcon4.src}
                alt="icon4"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            'absolute right-[18.5%] top-[29%] aspect-[85/72] w-[5.9%]',
            'opacity-0 animate-delay-500 animate-duration-500 animate-fade-in'
          )}
        >
          <div className="animate-delay-300 animate-oscillate">
            <div className="relative size-full">
              <Image
                src={LearningMarathonImgDesktopIcon2.src}
                alt="icon2"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            'absolute right-[20.5%] top-[40%] aspect-[160/153] w-[11%]',
            'opacity-0 animate-delay-1900 animate-duration-500 animate-fade-in'
          )}
        >
          <div className="animate-delay-1300 animate-oscillate">
            <div className="relative size-full">
              <Image
                src={LearningMarathonImgDesktopIcon6.src}
                alt="icon6"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 md:hidden">
        <div className="relative size-full bg-gradient-to-b from-[#fcfefe] via-[#e0f1f2] to-[#e0f1f2]">
          <Image
            src={LearningMarathonImgMobile.src}
            alt="島島盃 - 學習馬拉松 2025 春季賽"
            fill
            className="object-cover"
          />
        </div>
      </div>
      <ApplyButton className="absolute left-1/2 top-[calc(100vw/3.6)] flex h-[50px] w-[124px] shrink-0 -translate-x-1/2 items-center justify-center gap-2.5 rounded-[40px] bg-[#FFA10B] px-5 py-1.5 text-center text-lg font-normal leading-[140%] text-white hover:bg-[#FFA10B] hover:shadow-[0px_4px_10px_0px_rgba(255,161,11,0.50)] max-md:top-[calc(100vw/1.25)]">
        立即申請
      </ApplyButton>
    </div>
  );
};
