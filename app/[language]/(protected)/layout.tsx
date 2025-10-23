import { ProtectedComponent } from '@/features/auth';

export default function ProtectedLayout({ children }: React.PropsWithChildren) {
  return <ProtectedComponent>{children}</ProtectedComponent>;
}
