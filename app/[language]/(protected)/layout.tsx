import { ProtectedComponent } from '@/features/auth';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedComponent>{children}</ProtectedComponent>;
}
