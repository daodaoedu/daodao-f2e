import Header from '@/layout/components/Header';
import Footer from '@/layout/components/Footer';

export default function withBaseLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
