// Force all protected pages to use dynamic rendering
// This prevents them from being statically generated at build time
// which would unnecessarily increase the server bundle size
export const dynamic = 'force-dynamic';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
