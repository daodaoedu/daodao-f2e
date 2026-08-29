import { redirect } from "next/navigation";

/** 主頁 sidebar 的「管理」入口：燈塔就是管理模組（FRD 3.0），舊 /manage 網址一律導過去 */
export default async function ManagePage({ params }: PageProps<"/[locale]/manage">) {
  const { locale } = await params;
  redirect(`/${locale}/lighthouse`);
}
