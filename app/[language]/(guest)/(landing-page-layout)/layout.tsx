import { DesktopNavbar, MobileNavbar } from '@/widgets/navbar';
import { Footer } from '@/widgets/footer';

export default function LandingPageLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <DesktopNavbar />
      <MobileNavbar />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
