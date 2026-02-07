import { Footer, Sidebar } from "@/components/layout";

export default async function WithLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <>
      {children}
      <Sidebar />
      <Footer />
    </>
  );
}
