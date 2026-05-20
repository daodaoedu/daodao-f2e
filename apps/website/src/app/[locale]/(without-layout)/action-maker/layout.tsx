import { ActionMakerProvider } from "@daodao/features-action-maker";
import { setRequestLocale } from "@daodao/i18n/server";

export default async function ActionMakerLayout({ children, params }: LayoutProps<"/[locale]/action-maker">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ActionMakerProvider>
      <div className="relative z-10">{children}</div>
    </ActionMakerProvider>
  );
}
