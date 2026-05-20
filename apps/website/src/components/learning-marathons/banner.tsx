import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { ApplyButton } from "./apply-button";

export const Banner = () => {
  const t = useTranslations("learning_marathon");
  return (
    <div className={cn("relative aspect-9/14 overflow-hidden md:aspect-16/10")}>
      <div className="hidden md:block">
        <div className="absolute inset-0 bg-linear-to-b from-[#fcfefe] via-[#e0f1f2] to-[#e0f1f2]">
          <Image
            src="/assets/learning-marathon/2025S1-desktop-bg.png"
            alt={t("banner_alt_main")}
            fill
            className="object-cover"
          />
        </div>
        <div
          className={cn(
            "absolute bottom-0 left-1/2 aspect-433/427 w-[30%] -translate-x-1/2",
            "opacity-0 animate-delay-200 animate-duration-700 animate-fade-in"
          )}
        >
          <div className="relative size-full">
            <Image
              src="/assets/learning-marathon/2025S1-desktop-group.png"
              alt={t("banner_alt_group")}
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div
          className={cn(
            "absolute -left-[2.8%] top-[39%] aspect-271/404 w-[18%]",
            "-translate-x-full animate-delay-500 animate-duration-1100 -animate-distance-full animate-slide-x-in"
          )}
        >
          <div className="relative size-full">
            <Image
              src="/assets/learning-marathon/2025S1-desktop-boy-1.png"
              alt={t("banner_alt_boy")}
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div
          className={cn(
            "absolute -right-[1.6%] top-[33%] aspect-256/351 w-[18%]",
            "translate-x-full animate-delay-1100 animate-duration-1100 animate-slide-x-in"
          )}
        >
          <div className="relative size-full">
            <Image
              src="/assets/learning-marathon/2025S1-desktop-girl-1.png"
              alt={t("banner_alt_girl")}
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div
          className={cn(
            "absolute left-[27.5%] top-[14%] aspect-75/77 w-[5%]",
            "opacity-0 animate-delay-200 animate-duration-500 animate-fade-in"
          )}
        >
          <div className="size-full animate-delay-200 animate-oscillate">
            <div className="relative size-full">
              <Image
                src="/assets/learning-marathon/2025S1-desktop-icon-5.png"
                alt="icon5"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            "absolute left-[21%] top-[19.5%] aspect-91/131 w-[6%]",
            "opacity-0 animate-delay-1700 animate-duration-500 animate-fade-in"
          )}
        >
          <div className="size-full animate-delay-1700 animate-oscillate">
            <div className="relative size-full">
              <Image
                src="/assets/learning-marathon/2025S1-desktop-icon-3.png"
                alt="icon3"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            "absolute left-[27.5%] top-[45.5%] aspect-70/39 w-[4.8%]",
            "opacity-0 animate-delay-500 animate-duration-500 animate-fade-in"
          )}
        >
          <div className="size-full animate-delay-1100 animate-oscillate">
            <div className="relative size-full">
              <Image
                src="/assets/learning-marathon/2025S1-desktop-icon-1.png"
                alt="icon1"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            "absolute right-[24.5%] top-[16.5%] aspect-68/112 w-[4.7%]",
            "opacity-0 animate-delay-1300 animate-duration-500 animate-fade-in"
          )}
        >
          <div className="size-full animate-delay-1900 animate-oscillate">
            <div className="relative size-full">
              <Image
                src="/assets/learning-marathon/2025S1-desktop-icon-4.png"
                alt="icon4"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            "absolute right-[18.5%] top-[29%] aspect-85/72 w-[5.9%]",
            "opacity-0 animate-delay-500 animate-duration-500 animate-fade-in"
          )}
        >
          <div className="size-full animate-delay-300 animate-oscillate">
            <div className="relative size-full">
              <Image
                src="/assets/learning-marathon/2025S1-desktop-icon-2.png"
                alt="icon2"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
        <div
          className={cn(
            "absolute right-[20.5%] top-[40%] aspect-160/153 w-[11%]",
            "opacity-0 animate-delay-1900 animate-duration-500 animate-fade-in"
          )}
        >
          <div className="size-full animate-delay-1300 animate-oscillate">
            <div className="relative size-full">
              <Image
                src="/assets/learning-marathon/2025S1-desktop-icon-6.png"
                alt="icon6"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 md:hidden">
        <div className="relative size-full bg-linear-to-b from-[#fcfefe] via-[#e0f1f2] to-[#e0f1f2]">
          <Image
            src="/assets/learning-marathon/2025S1-mobile@2x.png"
            alt={t("banner_alt_main")}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <ApplyButton className="absolute left-1/2 top-[calc(100vw/3.6)] flex h-[50px] w-[124px] shrink-0 -translate-x-1/2 items-center justify-center gap-2.5 rounded-[40px] bg-[#FFA10B] px-5 py-1.5 text-center text-lg font-normal leading-[140%] text-white hover:bg-[#FFA10B] hover:shadow-[0px_4px_10px_0px_rgba(255,161,11,0.50)] max-md:top-[calc(100vw/1.25)]">
        {t("marathon_apply_button")}
      </ApplyButton>
    </div>
  );
};
