import { redirect } from "@daodao/i18n/navigation";
import type { Locale } from "@daodao/i18n/routing";
import { getConnectionsRedirectPath } from "@/utils/connection-redirect";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function ConnectionsRedirectPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: getConnectionsRedirectPath(), locale });
}
