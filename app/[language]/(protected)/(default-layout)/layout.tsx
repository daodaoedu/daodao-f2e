import Header from '@/layout/components/Header';
import Footer from '@/layout/components/Footer';

export default function ProtectedBaseLayout({ children }: LayoutProps<'/[language]'>) {
  return (
    <>
      <Header />
      <main className="min-h-screen w-full bg-white">{children}</main>
      <Footer />
    </>
  );
}