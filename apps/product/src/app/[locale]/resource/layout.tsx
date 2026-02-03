import { ResourceFooter, ResourceHeader } from "@/components/layout";

export default function ResourceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ResourceHeader />
      <main className="min-h-screen pt-[69px]">{children}</main>
      <ResourceFooter />
    </>
  );
}
