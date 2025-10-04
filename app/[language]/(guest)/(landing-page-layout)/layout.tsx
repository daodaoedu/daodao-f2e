import { HeaderNavbar, BottomNavbar } from '@/widgets/navbar';
import { Footer } from '@/widgets/footer';

export default function LandingPageLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <HeaderNavbar />
      <BottomNavbar />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
