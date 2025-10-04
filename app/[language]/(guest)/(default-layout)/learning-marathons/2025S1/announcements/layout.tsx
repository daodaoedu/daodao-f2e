import { Navbar } from '@/widgets/marathon';

export default function AnnouncementsLayout({
  children,
}: LayoutProps<'/[language]/learning-marathons/2025S1/announcements'>) {
  return (
    <main className="min-h-screen bg-white pt-16">
      <Navbar />
      {children}
    </main>
  );
}
