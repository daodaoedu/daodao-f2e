import { ProtectedComponent } from '@/contexts/Auth';

export default function ProtectedLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return <ProtectedComponent>{children}</ProtectedComponent>;
}
