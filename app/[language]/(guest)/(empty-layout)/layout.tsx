export default async function EmptyLayout({
  children,
}: LayoutProps<'/[language]'>) {
  return <main className="min-h-screen bg-white">{children}</main>;
}
