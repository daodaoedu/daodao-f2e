import { getTranslations } from "@daodao/i18n/server";

export default async function HomePage() {
  const t = await getTranslations("common");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-lg">{t("description")}</p>
      </div>
    </main>
  );
}
