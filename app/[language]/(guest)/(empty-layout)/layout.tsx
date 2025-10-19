export default async function EmptyLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
