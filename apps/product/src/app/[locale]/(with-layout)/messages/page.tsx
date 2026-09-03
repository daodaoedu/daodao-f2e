import { useTranslations } from "@daodao/i18n";

export default function MessagesPage() {
  const t = useTranslations("app_product");
  return (
    <div className="min-h-screen max-w-[640px] mx-auto px-4 pt-[68px] md:pt-8 pb-[72px]">
      <h1 className="text-xl font-semibold text-text-dark">{t("nav_messages")}</h1>
      <p className="mt-2 text-sm text-light-gray">即將推出</p>
    </div>
  );
}
