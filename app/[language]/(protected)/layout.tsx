import { ProtectedComponent } from '@/entities/user';

export default function ProtectedLayout({ children }: React.PropsWithChildren) {
  return <ProtectedComponent>{children}</ProtectedComponent>;
}
