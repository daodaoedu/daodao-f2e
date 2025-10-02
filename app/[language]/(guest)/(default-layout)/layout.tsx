import { DesktopNavbar } from '@/widgets/navbar';
import { Footer } from '@/widgets/footer';

export default function DefaultLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return (
    <>
      <DesktopNavbar alwaysShow />
      <main className="mt-20 min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
