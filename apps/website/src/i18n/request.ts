import { hasLocale, loadMessages } from "@daodao/i18n";
import { routing } from "@daodao/i18n/routing";
import { getRequestConfig } from "@daodao/i18n/server";

export default getRequestConfig(async ({ requestLocale, locale: explicitLocale }) => {
  // If an explicit locale is provided (e.g., from getTranslations({locale: 'en'})),
  // use it to avoid calling headers() during static generation
  let locale: string | undefined = explicitLocale;

  if (!locale) {
    // Fallback to requestLocale for dynamic rendering
    // Note: requestLocale may use headers() internally, which prevents static generation
    const requested = await requestLocale;
    locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  }

  // Validate locale
  const finalLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  return {
    locale: finalLocale,
    messages: await loadMessages(finalLocale),
  };
});
