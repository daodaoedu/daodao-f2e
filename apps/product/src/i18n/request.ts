import { hasLocale, loadMessages } from "@daodao/i18n";
import { routing } from "@daodao/i18n/routing";
import { getRequestConfig } from "@daodao/i18n/server";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
