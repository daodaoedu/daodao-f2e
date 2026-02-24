import { BackgroundAnimation, PageHeader } from "@/components/layout";
import { NotificationList } from "@/components/notifications";

export default function NotificationsPage() {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader title="通知測試" rightAction={null} />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[80px] pt-3 md:pt-6">
        <NotificationList />
      </main>
    </div>
  );
}
