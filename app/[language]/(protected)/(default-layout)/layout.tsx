import Header from '@/layout/components/Header';
import Footer from '@/layout/components/Footer';

// Force all protected pages to use dynamic rendering
export const dynamic = 'force-dynamic';

export default function ProtectedBaseLayout({ children }: LayoutProps<'/[language]'>) {
  return (
    <>
      <Header />
      <main className="min-h-screen w-full bg-basic-white">{children}</main>
      <Footer />
    </>
  );
}