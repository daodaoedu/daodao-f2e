import { Footer, Header } from "@/components/layout";

export default async function WithLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
