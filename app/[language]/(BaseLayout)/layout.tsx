// import Header from '@/layout/components/Header';
// import Footer from '@/layout/components/Footer';

export default function BaseLayout({ children }: LayoutProps<'/[language]'>) {
  return (
    <>
      {/* <Header /> */}
      <main className="min-h-screen bg-white">{children}</main>
      {/* <Footer /> */}
    </>
  );
}
