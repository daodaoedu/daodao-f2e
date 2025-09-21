import { Navbar, MobileMenu, Footer } from './_layout';

export default function BaseLayout({ children }: LayoutProps<'/[language]'>) {
  return (
    <>
      <Navbar />
      <MobileMenu />
      <main className="min-h-screen w-full bg-white">{children}</main>
      <Footer />
    </>
  );
}
