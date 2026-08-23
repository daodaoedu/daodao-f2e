import { redirect } from "@daodao/i18n/navigation";
import type { Locale } from "@daodao/i18n/routing";
import { getConnectionsRedirectPath } from "@/utils/connection-redirect";

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ConnectionsRedirectPage({ params, searchParams }: Props) {
  const [{ locale }, sParams] = await Promise.all([params, searchParams]);
  const search = new URLSearchParams(sParams as Record<string, string>).toString();
  const href = search ? `${getConnectionsRedirectPath()}?${search}` : getConnectionsRedirectPath();
  redirect({ href, locale });
}
