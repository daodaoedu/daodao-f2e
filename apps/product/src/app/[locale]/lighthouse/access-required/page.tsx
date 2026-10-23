import { setRequestLocale } from "@daodao/i18n/server";
import { LighthouseAccessRequired } from "@/components/lighthouse";
import { resolveLighthouseAccessRequiredReason } from "@/components/lighthouse/lighthouse-access";

export default async function LighthouseAccessRequiredPage({
  params,
  searchParams,
}: PageProps<"/[locale]/lighthouse/access-required">) {
  const { locale } = await params;
  setRequestLocale(locale);
  // middleware 查詢權限失敗時帶 reason=unavailable（daodao#384）
  const { reason } = await searchParams;
  return <LighthouseAccessRequired reason={resolveLighthouseAccessRequiredReason(reason)} />;
}
