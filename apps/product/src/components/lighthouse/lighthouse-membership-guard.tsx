import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { RadioTower, RefreshCw } from "lucide-react";
import {
  LIGHTHOUSE_APPLY_FORM_URL,
  type LighthouseAccessRequiredReason,
} from "./lighthouse-access";

const PRIMARY_BUTTON_CLASS =
  "inline-flex rounded-full bg-[#0D3036] px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan";
const SECONDARY_BUTTON_CLASS =
  "inline-flex rounded-full border border-[#CDEBE8] bg-white px-5 py-3 text-sm font-semibold text-[#0D3036] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan";

interface LighthouseAccessRequiredProps {
  // 權限查詢失敗（unavailable）時不能說「僅提供給教學者使用」，有權限的人會以為被拿掉權限（daodao#384）
  reason?: LighthouseAccessRequiredReason;
}

export function LighthouseAccessRequired({ reason = "membership" }: LighthouseAccessRequiredProps) {
  const t = useTranslations("lighthouse");
  const isUnavailable = reason === "unavailable";
  const Icon = isUnavailable ? RefreshCw : RadioTower;
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5FFFD] px-5 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-[#CDEBE8] bg-white p-8 text-center shadow-[0_18px_50px_rgba(13,48,54,0.08)] md:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-xl font-semibold tracking-[-0.035em] text-[#0D3036]">
          {isUnavailable ? t("membership_unavailable_title") : t("membership_required_title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#5A7B79]">
          {isUnavailable
            ? t("membership_unavailable_description")
            : t.rich("membership_required_description", {
                link: (chunks) => (
                  <a
                    href={LIGHTHOUSE_APPLY_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#0D7773] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
                  >
                    {chunks}
                  </a>
                ),
              })}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {isUnavailable && (
            // 重新進入燈塔，middleware 會再查一次權限
            <CustomLink href="/lighthouse" className={PRIMARY_BUTTON_CLASS}>
              {t("membership_unavailable_retry")}
            </CustomLink>
          )}
          <CustomLink
            href="/"
            className={isUnavailable ? SECONDARY_BUTTON_CLASS : PRIMARY_BUTTON_CLASS}
          >
            {t("membership_back_home")}
          </CustomLink>
        </div>
      </section>
    </main>
  );
}
