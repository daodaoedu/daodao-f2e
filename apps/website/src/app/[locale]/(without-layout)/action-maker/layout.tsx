import { ActionMakerProvider } from "@daodao/features-action-maker";

export default async function ActionMakerLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <ActionMakerProvider>
      <div className="relative z-10">{children}</div>
    </ActionMakerProvider>
  );
}
