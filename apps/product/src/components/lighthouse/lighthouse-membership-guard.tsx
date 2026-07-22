import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { RadioTower } from "lucide-react";

export function LighthouseAccessRequired() {
  const t = useTranslations("lighthouse");
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5FFFD] px-5 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-[#CDEBE8] bg-white p-8 text-center shadow-[0_18px_50px_rgba(13,48,54,0.08)] md:p-12">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
          <RadioTower className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-xl font-semibold tracking-[-0.035em] text-[#0D3036]">
          {t("membership_required_title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#5A7B79]">
          {t("membership_required_description")}
        </p>
        <CustomLink
          href="/"
          className="mt-8 inline-flex rounded-full bg-[#0D3036] px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
        >
          {t("membership_back_home")}
        </CustomLink>
      </section>
    </main>
  );
}
