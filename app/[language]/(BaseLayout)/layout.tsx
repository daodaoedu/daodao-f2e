// import Header from '@/layout/components/Header';
// import Footer from '@/layout/components/Footer';
import './styles/All.css';


export default function BaseLayout({ children }: LayoutProps<'/[language]'>) {
  return (
    <>
      {/* <Header /> */}
      <main className="min-h-screen bg-white w-full">{children}</main>
      {/* <Footer /> */}
    </>
  );
}
