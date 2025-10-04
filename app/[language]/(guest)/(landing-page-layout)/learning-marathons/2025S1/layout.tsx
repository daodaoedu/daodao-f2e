import { Banner, Navbar } from '@/widgets/marathon';

export default async function LearningMarathonsLayout({
  children,
}: LayoutProps<'/[language]/learning-marathons/2025S1'>) {
  return (
    <>
      <Banner />
      <Navbar />
      {children}
    </>
  );
}
