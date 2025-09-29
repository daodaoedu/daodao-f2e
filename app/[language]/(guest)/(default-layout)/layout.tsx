import { DesktopNavbar, MobileNavbar } from '@/widgets/menu';
import { Footer } from '@/widgets/footer';

export default function DefaultLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
      <main className="min-h-screen w-full bg-white">{children}</main>
      <Footer />
    </>
  );
}
